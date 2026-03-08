const jwt = require('jsonwebtoken');
const pool = require('../../db.js');
const { redis: r, isRedisAlive } = require('../utils/redisClient');

// Live TTL: how long a bus:live key stays valid after last ping (seconds)
const LIVE_TTL_SECONDS = process.env.LIVE_TTL_SECONDS
    ? parseInt(process.env.LIVE_TTL_SECONDS)
    : 15;

// DB throttle: write to bus_locations at most once per 5 minutes per bus 
const DB_WRITE_INTERVAL_SECONDS = 100;

// In-memory throttle fallback (busId -> lastWriteTs)
const memoryThrottle = new Map();

module.exports = function initSocketServer(io) {
    // ── Auth middleware ───────────────────────────────────────────────────────
    io.use((socket, next) => {
        const token = socket.handshake.auth && socket.handshake.auth.token;
        if (!token) return next(new Error('Authentication error: token missing'));
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            socket.driver = {
                id: payload.id,
                busId: payload.busId,
                routeId: payload.routeId,
            };
            return next();
        } catch (err) {
            return next(new Error('Authentication error: invalid token'));
        }
    });

    // ── Connection handler ────────────────────────────────────────────────────
    io.on('connection', (socket) => {
        const { id: driverId, busId, routeId } = socket.driver || {};

        if (routeId) socket.join(`route:${routeId}`);
        console.log(`[socket] Driver ${driverId} connected | bus=${busId} route=${routeId}`);
        if (!busId) console.warn(`[socket] WARNING: Driver ${driverId} has no busId assigned in JWT. DB writes will be skipped.`);

        socket.on('location:update', async (data) => {
            try {
                const lat = parseFloat(data.lat);
                const lon = parseFloat(data.lon);
                if (Number.isNaN(lat) || Number.isNaN(lon)) return;

                const pos = {
                    driverId: driverId || null,
                    busId: busId || null,
                    routeId: routeId || null,
                    lat,
                    lon,
                    speed: data.speed ?? null,
                    heading: data.heading ?? null,
                    ts: data.timestamp || new Date().toISOString(),
                };

                const redisOk = isRedisAlive();

                // ── 1. Update Redis live snapshot ─────────────────────────────
                if (pos.busId && redisOk) {
                    r.set(`bus:${pos.busId}:live`, JSON.stringify(pos), 'EX', LIVE_TTL_SECONDS)
                        .catch(err => console.error('[Redis] Live update failed:', err.message));
                }

                // ── 2. Update GEO index ───────────────────────────────────────
                if (pos.routeId && pos.busId && redisOk) {
                    r.geoadd(`route:${pos.routeId}:geo`, lon, lat, pos.busId)
                        .catch(err => console.error('[Redis] GEO update failed:', err.message));
                }

                // ── 3. Broadcast to route room ────────────────────────────────
                if (pos.routeId) {
                    io.to(`route:${pos.routeId}`).emit('bus:location', pos);
                }

                // ── 4. Throttled persistent update to PostgreSQL ─────────────
                if (pos.busId) {
                    let shouldWrite = false;

                    if (redisOk) {
                        const throttleKey = `bus:${pos.busId}:db_last_written`;
                        const exists = await r.exists(throttleKey).catch(() => false);
                        if (!exists) {
                            shouldWrite = true;
                            await r.set(throttleKey, '1', 'EX', DB_WRITE_INTERVAL_SECONDS).catch(() => { });
                        }
                    } else {
                        // In-memory throttle fallback
                        const now = Date.now();
                        const last = memoryThrottle.get(pos.busId) || 0;
                        if (now - last > DB_WRITE_INTERVAL_SECONDS * 1000) {
                            shouldWrite = true;
                            memoryThrottle.set(pos.busId, now);
                            if (memoryThrottle.size > 100) memoryThrottle.clear();
                        }
                    }

                    if (shouldWrite) {
                        // UPSERT: Insert or update if bus_id already exists
                        // Note: Assumes bus_id is UNIQUE or a PRIMARY KEY in bus_locations
                        pool.query(
                            `INSERT INTO bus_locations (bus_id, latitude, longitude, speed, recorded_at)
                             VALUES ($1, $2, $3, $4, NOW())
                             ON CONFLICT (bus_id) DO UPDATE 
                             SET latitude = EXCLUDED.latitude, 
                                 longitude = EXCLUDED.longitude, 
                                 speed = EXCLUDED.speed, 
                                 recorded_at = NOW()`,
                            [pos.busId, pos.lat, pos.lon, pos.speed]
                        ).then(() => {
                            console.log(`[db] SUCCESS: bus_locations UPSERT bus_id=${pos.busId} lat=${pos.lat} lon=${pos.lon}`);
                        }).catch((err) => {
                            console.error('[db] ERROR: bus_locations UPSERT failed:', err.message);
                            if (err.message.includes('constraint')) {
                                console.warn('[db] Ensure bus_id has a UNIQUE constraint in bus_locations table!');
                            }
                        });
                    }
                } else {
                    console.warn(`[socket] location:update received but busId is missing from driver session. Skipping SQL.`);
                }

            } catch (err) {
                console.error('[socket] location:update error', err);
            }
        });

        socket.on('disconnect', () => {
            console.log(`[socket] Driver ${driverId} disconnected`);
        });
    });
};

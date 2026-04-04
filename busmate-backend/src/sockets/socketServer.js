const jwt = require('jsonwebtoken');
const pool = require('../../db.js');
const { redis: r, isRedisAlive } = require('../utils/redisClient');

// Live TTL: how long a bus:live key stays valid after last ping (seconds)
const LIVE_TTL_SECONDS = process.env.LIVE_TTL_SECONDS
    ? parseInt(process.env.LIVE_TTL_SECONDS)
    : 15;

// DB throttle: write to bus_locations at most once per 10 seconds per bus 
const DB_WRITE_INTERVAL_SECONDS = 10;

// In-memory throttle fallback (busId -> lastWriteTs)
const memoryThrottle = new Map();

module.exports = function initSocketServer(io) {
    // ── Auth middleware ───────────────────────────────────────────────────────
    io.use((socket, next) => {
        const isAdmin = socket.handshake.auth?.admin || socket.handshake.query?.admin === 'true';
        if (isAdmin) {
            socket.isAdmin = true;
            return next();
        }

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
        if (socket.isAdmin) {
            console.log('[socket] Admin frontend connected');
            socket.join('admin');

            socket.on('disconnect', () => {
                console.log('[socket] Admin frontend disconnected');
            });
            return;
        }

        const { id: driverId, busId, routeId } = socket.driver || {};

        if (routeId) socket.join(`route:${routeId}`);
        console.log(`[socket] Driver ${driverId} connected | bus=${busId} route=${routeId}`);
        if (!busId) console.warn(`[socket] WARNING: Driver ${driverId} has no busId assigned in JWT. DB writes will be skipped.`);

        socket.on('location:update', async (data) => {
            try {
                console.log(`[socket] Received location:update from driver=${driverId}`, data);
                const lat = parseFloat(data.lat);
                const lon = parseFloat(data.lon);
                if (Number.isNaN(lat) || Number.isNaN(lon)) {
                    console.log('[socket] Invalid coordinates, returning.');
                    return;
                }

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

                // ── 3. Broadcast to route room and admin room ─────────────────
                if (pos.routeId) {
                    io.to(`route:${pos.routeId}`).emit('bus:location', pos);
                }
                io.to('admin').emit('bus:location', pos);

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
                        // Standard INSERT: Recorded as a history log. 
                        // The frontend uses DISTINCT ON to find the latest valid location.
                        pool.query(
                            `INSERT INTO bus_locations (bus_id, latitude, longitude, speed, heading, recorded_at)
                             VALUES ($1, $2, $3, $4, $5, NOW())`,
                            [pos.busId, pos.lat, pos.lon, pos.speed, pos.heading]
                        ).then(() => {
                            console.log(`[db] SUCCESS: bus_locations log created for bus_id=${pos.busId}`);
                        }).catch((err) => {
                            console.error('[db] ERROR: bus_locations log failed:', err.message);
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

const jwt = require('jsonwebtoken');
const Redis = require('ioredis');

// live TTL seconds for each bus snapshot
const LIVE_TTL_SECONDS = process.env.LIVE_TTL_SECONDS
    ? parseInt(process.env.LIVE_TTL_SECONDS)
    : 15;

module.exports = function initSocketServer(io, redis) {
    const r = redis || new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

    // simple auth middleware using handshake auth token (JWT)
    io.use((socket, next) => {
        const token = socket.handshake.auth && socket.handshake.auth.token;
        if (!token) return next(new Error('Authentication error: token missing'));
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
            // attach driver info (expected fields: id, busId, routeId)
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

    io.on('connection', (socket) => {
        const { id: driverId, busId, routeId } = socket.driver || {};
        if (routeId) socket.join(`route:${routeId}`);

        socket.on('location:update', async (data) => {
            try {
                // validate minimal shape
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

                // store snapshot with TTL
                if (pos.busId) {
                    await r.set(`bus:${pos.busId}:live`, JSON.stringify(pos), 'EX', LIVE_TTL_SECONDS);
                }

                // update GEO index for the route
                if (pos.routeId && pos.busId) {
                    // GEOADD expects lon lat order
                    await r.geoadd(`route:${pos.routeId}:geo`, lon, lat, pos.busId);
                }

                // broadcast to route room
                if (pos.routeId) {
                    io.to(`route:${pos.routeId}`).emit('bus:location', pos);
                }
            } catch (err) {
                console.error('socket location:update error', err);
            }
        });

        socket.on('disconnect', () => {
            // nothing special for now
        });
    });
};

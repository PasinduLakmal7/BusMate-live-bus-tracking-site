const express = require('express');
const { Server } = require('socket.io');
const helmet = require('helmet');
const app = express();
const server = require('http').createServer(app);
const cors = require("cors");
const authRouter = require("./src/routers/authRouter.js");
const driverRouter = require("./src/routers/driverRouter.js");
require("dotenv").config();
const dgram = require('dgram');
const os = require('os');


//database
const dbSetup = require('./db/db-setup.js')
const Users = require('./db/models/usersModel.js')
dbSetup();



const io = new Server(server, {
    cors: {
        origin: '*',
        credentials: false,
    }
});

const Redis = require('ioredis');
const initSocketServer = require('./src/sockets/socketServer');
const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
    lazyConnect: true,
    maxRetriesPerRequest: 0,
    enableOfflineQueue: false,
    retryStrategy: (times) => {
        if (times > 3) return null; // stop retrying after 3 attempts
        return Math.min(times * 500, 2000);
    },
});
redis.on('error', (err) => {
    // Suppress Redis errors — registration/approval endpoints don't need Redis
    if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️ Redis unavailable (sockets/OTP disabled):', err.message);
    }
});

app.use(helmet());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json());

const siteRouter = require("./src/routers/siteRouter.js");

app.use("/auth", authRouter);
app.use("/drivers", driverRouter);
app.use("/site", siteRouter);

app.get('/', (req, res) => {
    res.json('hi')
})

// initialize socket handlers (authenticated)
initSocketServer(io, redis);

// HTTP endpoint: return all bus stops from DB
app.get('/stops', async (req, res) => {
    try {
        const pool = require('./db.js');
        // Join stops with routes to get the route names/numbers
        const result = await pool.query(`
            SELECT 
                rs.stop_id as id, 
                r.route_number as route, 
                rs.stop_name as name, 
                rs.latitude as lat, 
                rs.longitude as lng 
            FROM route_stops rs 
            JOIN routes r ON rs.route_id = r.route_id
            WHERE rs.latitude IS NOT NULL AND rs.longitude IS NOT NULL
        `);
        return res.json({ success: true, stops: result.rows });
    } catch (err) {
        console.error('stops endpoint error', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// HTTP endpoint: return current positions for a route (reads Redis)
app.get('/routes/:routeId/positions', async (req, res) => {
    try {
        const routeId = req.params.routeId;
        // get members in GEO set
        const members = await redis.zrange(`route:${routeId}:geo`, 0, -1);
        const results = [];
        if (members && members.length) {
            const pipeline = redis.pipeline();
            members.forEach((busId) => pipeline.get(`bus:${busId}:live`));
            const values = await pipeline.exec();
            for (const [, v] of values) {
                if (v) results.push(JSON.parse(v));
            }
        }
        return res.json({ success: true, positions: results });
    } catch (err) {
        console.error('positions endpoint error', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// HTTP endpoint: return ALL current bus positions (reads from DB table bus_locations)
app.get('/buses/locations', async (req, res) => {
    try {
        const pool = require('./db.js');
        // Join with bus_schedules to get the routeId for each bus
        // We use DISTINCT ON (bus_id) to get the latest location for each bus
        // Limit search to the last 15 minutes for speed
        const result = await pool.query(`
            SELECT DISTINCT ON (bl.bus_id)
                bl.bus_id as "id", 
                b.bus_number as "busId",
                bl.latitude as lat, 
                bl.longitude as lon, 
                bl.speed, 
                bl.recorded_at as ts,
                r.route_number as "routeNumber",
                r.route_id as "routeId",
                r.end_location as destination
            FROM bus_locations bl
            JOIN buses b ON bl.bus_id = b.bus_id
            JOIN (
                SELECT DISTINCT ON (bus_id) bus_id, route_id
                FROM bus_schedules
                ORDER BY bus_id, schedule_id DESC
            ) bs ON bl.bus_id = bs.bus_id
            JOIN routes r ON bs.route_id = r.route_id
            WHERE bl.recorded_at > NOW() - INTERVAL '30 minutes'
            ORDER BY bl.bus_id, bl.recorded_at DESC
        `);
        return res.json({ success: true, locations: result.rows });
    } catch (err) {
        console.error('buses locations endpoint error', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

server.listen(4000, '0.0.0.0', () => {
    console.log('Server is running on port 4000 (IPv4 + IPv6)');
});

// 📡 UDP Discovery Broadcast (Every 5 seconds)
// This allows the mobile app to find the server's IP naturally when on the same WiFi.
const udpServer = dgram.createSocket('udp4');
const DISCOVERY_PORT = 4001;
const BROADCAST_INTERVAL = 5000;

function broadcastDiscovery() {
    try {
        const message = Buffer.from(JSON.stringify({
            service: 'busmate-backend',
            port: 4000
        }));

        udpServer.setBroadcast(true);
        udpServer.send(message, 0, message.length, DISCOVERY_PORT, '255.255.255.255', (err) => {
            if (err) console.error('UDP Broadcast error:', err);
        });
    } catch (e) {
        console.error('UDP Broadcast failed:', e);
    }
}

udpServer.bind(() => {
    console.log(`📡 UDP Discovery active on port ${DISCOVERY_PORT}`);
    setInterval(broadcastDiscovery, BROADCAST_INTERVAL);
});

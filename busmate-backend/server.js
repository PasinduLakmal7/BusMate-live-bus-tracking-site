const express = require('express');
const { Server } = require('socket.io');
const helmet = require('helmet');
const app = express();
const server = require('http').createServer(app);
const cors = require("cors");
const authRouter = require("./src/routers/authRouter.js");
const driverRouter = require("./src/routers/driverRouter.js");
require("dotenv").config();


//database
const dbSetup = require('./db/db-setup.js')
const Users = require('./db/models/usersModel.js')
dbSetup();



const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        credentials: true,
    }
});

const Redis = require('ioredis');
const initSocketServer = require('./src/sockets/socketServer');
const redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

app.use(helmet());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(express.json());

app.use("/auth", authRouter);
app.use("/drivers", driverRouter);

app.get('/', (req, res) => {
    res.json('hi')
})

// initialize socket handlers (authenticated)
initSocketServer(io, redis);

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

server.listen(4000, () => {
    console.log('Server is running on port 4000');
});
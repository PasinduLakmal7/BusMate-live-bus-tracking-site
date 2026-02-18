const express = require('express');
const {Server} = require('socket.io');
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

io.on('connection', (socket) => {});

server.listen(4000, () => {
    console.log('Server is running on port 4000');
});



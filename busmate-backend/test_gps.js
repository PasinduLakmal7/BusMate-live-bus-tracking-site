const io = require('socket.io-client');
const jwt = require('jsonwebtoken');

// Create a fake JWT token
const token = jwt.sign(
    { id: 999, phone: '+94770000000', role: 'driver', busId: 1, routeId: 5 },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '1h' }
);

const socket = io('http://localhost:4000', {
    auth: { token }
});

socket.on('connect', () => {
    console.log('Test Driver Connected. Sending fake GPS data...');

    let lat = 6.9271;
    let lon = 79.8612;

    setInterval(() => {
        lat += 0.0001; // simulate moving
        lon += 0.0001;

        console.log(`Emitting GPS: lat=${lat}, lon=${lon}`);
        socket.emit('location:update', {
            lat,
            lon,
            speed: 15.0,
            heading: 90.0,
            timestamp: new Date().toISOString()
        });
    }, 2000);
});

socket.on('disconnect', () => {
    console.log('Test Driver Disconnected');
});

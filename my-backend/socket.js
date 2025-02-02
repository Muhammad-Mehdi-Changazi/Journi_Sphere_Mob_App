// socket.js
let io;

const initSocket = (server) => {
    io = require('socket.io')(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        },
    });

    io.on('connection', (socket) => {
        console.log('Socket.IO connection established:', socket.id);
        socket.on('disconnect', () => {
            console.log('Socket.IO connection closed:', socket.id);
        });
    });
};

const getSocket = () => io;

module.exports = { initSocket, getSocket };

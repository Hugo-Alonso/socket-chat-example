const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

const PORT = 3000;
let socketNumber = 1
const messageHistory = [];
const users = new Map();

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
  });


io.on('connection', (socket) => {
    socketNumber++; // Incrementar el número de sockets al conectar
    console.log(`A user connected. Total users: ${socketNumber}`);

    // Asignar un nombre de usuario único
    const username = `User${Math.floor(Math.random() * 1000)}`;
    users.set(socket.id, username);
    socket.emit('system message', `Welcome, ${username}!`);

    // Enviar historial de mensajes al nuevo usuario
    socket.emit('message history', messageHistory);

    // Escuchar mensajes
    socket.on('chat message', (msg) => {
        const userMessage = `${users.get(socket.id)}: ${msg}`;
        messageHistory.push(userMessage);

        // Limitar historial a los últimos 50 mensajes
        if (messageHistory.length > 50) messageHistory.shift();

        io.emit('chat message', userMessage);
    });

    // Desconexión
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        users.delete(socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

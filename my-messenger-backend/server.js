const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Frontend manzili
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('Yangi foydalanuvchi ulandi:', socket.id);

  // Xabar yuborish
  socket.on('sendMessage', (message) => {
    console.log('Xabar qabul qilindi:', message);
    io.emit('receiveMessage', { id: socket.id, message }); // Xabarni barchaga yuborish
  });

  // Foydalanuvchi uzilganda
  socket.on('disconnect', () => {
    console.log('Foydalanuvchi uzildi:', socket.id);
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server ${PORT} portida ishga tushdi.`);
});

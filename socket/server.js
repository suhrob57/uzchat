import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import Pusher from 'pusher';

// Env o'qish
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

// CORS
app.use(cors());
app.use(express.json());

// Pusher sozlamalari
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

// Socket.io ulanishi
io.on('connection', (socket) => {
  console.log('Foydalanuvchi ulandi:', socket.id);

  socket.on('sendMessage', (data) => {
    io.emit('receiveMessage', data);
    pusher.trigger('chat', 'message', data);
  });

  socket.on('disconnect', () => {
    console.log('Foydalanuvchi chiqib ketdi:', socket.id);
  });
});

// Serverni ishga tushirish
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server ${PORT} portida ishlamoqda...`);
});

import { Server } from 'socket.io';

export const config = {
  runtime: 'edge',
};

const io = new Server();

io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
  });

  socket.on('sendMessage', ({ senderId, receiverId, content }) => {
    io.to(receiverId).emit('receiveMessage', { senderId, content, sent_at: new Date() });
  });

  socket.on('joinGroup', ({ userId, groupId }) => {
    socket.join(`group_${groupId}`);
  });

  socket.on('sendGroupMessage', ({ groupId, senderId, content }) => {
    io.to(`group_${groupId}`).emit('receiveGroupMessage', { senderId, content, sent_at: new Date() });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

export default (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket.io already running');
  } else {
    console.log('Socket.io starting');
    res.socket.server.io = io;
  }
  res.end();
};

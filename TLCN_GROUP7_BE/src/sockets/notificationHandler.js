module.exports = (io, socket) => {
  // Join user to their notification room when they connect
  socket.on('join_notifications', (userId) => {
    socket.join(`user_${userId}`);
  });

  // Leave notification room
  socket.on('leave_notifications', (userId) => {
    socket.leave(`user_${userId}`);
  });
};
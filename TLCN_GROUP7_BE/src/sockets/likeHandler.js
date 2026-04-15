module.exports = (io, socket) => {
  // Join blog room for like updates
  socket.on('join_blog_like_room', ({ blogId }) => {
    try {
      socket.join(`blog_${blogId}_likes`);
    } catch (error) {
      console.error('Error joining blog like room:', error);
    }
  });

  // Leave blog room for like updates
  socket.on('leave_blog_like_room', ({ blogId }) => {
    try {
      socket.leave(`blog_${blogId}_likes`);
      console.log(`Socket ${socket.id} left blog like room: blog_${blogId}_likes`);
    } catch (error) {
      console.error('Error leaving blog like room:', error);
    }
  });

  // Broadcast like toggle to all users viewing the blog
  const broadcastLikeUpdate = (blogId, likeData) => {
    try {
      io.to(`blog_${blogId}_likes`).emit('blog_like_updated', {
        blogId,
        liked: likeData.liked,
        count: likeData.count,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error broadcasting like update:', error);
    }
  };

  // Expose broadcast function so it can be called from services
  socket.broadcastLikeUpdate = broadcastLikeUpdate;
};
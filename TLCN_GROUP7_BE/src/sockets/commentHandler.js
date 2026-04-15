const db = require('../models');

module.exports = (io, socket) => {
  // User join blog room để nhận real-time comments
  socket.on('join_blog', (blogId) => {
    if (!blogId) return;
    
    const roomName = `blog_${blogId}`;
    socket.join(roomName);
  });

  // Leave blog room
  socket.on('leave_blog', (blogId) => {
    if (!blogId) return;
    
    const roomName = `blog_${blogId}`;
    socket.leave(roomName);
  });

  // User join room để nhận notification về comments
  socket.on('joinUserRoom', (userId) => {
    if (!userId) return;
    
    // Check if already in room to avoid duplicate joins
    const rooms = Array.from(socket.rooms);
    const roomName = `user_${userId}`;
    
    if (rooms.includes(roomName)) {
      return;
    }
    
    socket.join(roomName);
  });

  // Emit notification khi có comment mới
  const notifyNewComment = async (comment, blogAuthorId, parentCommentAuthorId) => {
    try {
      // Tạo notification trong DB
      const notifications = [];

      // Notify blog author (nếu không phải chính họ comment)
      if (blogAuthorId && blogAuthorId !== comment.authorId) {
        const blogNotif = await db.Notification.create({
          userId: blogAuthorId,
          type: 'NEW_COMMENT',
          content: `${comment.author?.fullName || 'Ai đó'} đã bình luận vào bài viết của bạn`,
          relatedId: comment.blogId,
          relatedType: 'BLOG',
          isRead: false
        });
        notifications.push({ userId: blogAuthorId, notification: blogNotif });
      }

      // Notify parent comment author (nếu là reply)
      if (comment.parentId && parentCommentAuthorId && parentCommentAuthorId !== comment.authorId) {
        const replyNotif = await db.Notification.create({
          userId: parentCommentAuthorId,
          type: 'COMMENT_REPLY',
          content: `${comment.author?.fullName || 'Ai đó'} đã trả lời bình luận của bạn`,
          relatedId: comment.id,
          relatedType: 'COMMENT',
          isRead: false
        });
        notifications.push({ userId: parentCommentAuthorId, notification: replyNotif });
      }

      // Broadcast notifications
      notifications.forEach(({ userId, notification }) => {
        io.to(`user_${userId}`).emit('newNotification', notification);
      });

    } catch (error) {
      console.error('❌ Error creating comment notifications:', error);
    }
  };

  // Emit qua socket
  const broadcastNewComment = (blogId, comment) => {
    try {
      io.to(`blog_${blogId}`).emit('new_comment', {
        blogId,
        comment
      });
    } catch (error) {
      console.error('❌ Error broadcasting comment:', error);
    }
  };

  // Expose functions
  socket.notifyNewComment = notifyNewComment;
  socket.broadcastNewComment = broadcastNewComment;
};

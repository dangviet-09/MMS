const db = require('../models');
const NotificationService = require('./notificationService');

class LikeService {
  async toggleLikeBlog(userId, blogId) {
    const blog = await db.Blog.findByPk(blogId);
    if (!blog) throw new Error('Blog không tồn tại');

    const existing = await db.Like.findOne({
      where: { userId, postId: blogId, commentId: null }
    });

    let result;
    if (existing) {
      await existing.destroy();
      const count = await db.Like.count({ where: { postId: blogId, commentId: null } });
      result = { liked: false, count };
    } else {
      await db.Like.create({ userId, postId: blogId });
      
      // Create like notification
      try {
        if (blog.authorId && blog.authorId !== userId) {
          await NotificationService.createLikeNotification(blog.authorId, userId, blogId);
        }
      } catch (error) {
        console.error('Error creating like notification:', error);
        // Don't fail the like operation if notification fails
      }
      
      const count = await db.Like.count({ where: { postId: blogId, commentId: null } });
      result = { liked: true, count };
    }

    // Broadcast like update via socket
    try {
      const io = global.io;
      if (io) {
        io.to(`blog_${blogId}_likes`).emit('blog_like_updated', {
          blogId,
          liked: result.liked,
          count: result.count,
          userId,
          timestamp: Date.now()
        });
        console.log(`Broadcasted like update for blog ${blogId}:`, result);
      }
    } catch (error) {
      console.error('Error broadcasting like update:', error);
    }

    return result;
  }

  async getLikesForBlog(blogId, userId) {
    const blog = await db.Blog.findByPk(blogId);
    if (!blog) throw new Error('Blog không tồn tại');

    const count = await db.Like.count({ where: { postId: blogId, commentId: null } });

    let liked = false;
    if (userId) {
      const existing = await db.Like.findOne({
        where: { userId, postId: blogId, commentId: null }
      });
      liked = !!existing;
    }

    return { liked, count };
  }
}

module.exports = new LikeService();
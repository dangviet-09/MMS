const db = require('../models');

class NotificationService {

  static async createNotification(userId, payload) {
    const {
      message,
      type = 'SYSTEM',
      blogId = null,
      commentId = null,
      actorId = null
    } = payload;

    const notif = await db.Notification.create({
      userId,
      message,
      type,
      blogId,
      commentId,
      actorId,
      isRead: false
    });

    // Emit real-time notification
    const io = global.io;
    if (io) {
      const fullNotification = await db.Notification.findByPk(notif.id, {
        include: [
          {
            model: db.User,
            as: 'actor',
            attributes: ['id', 'username', 'fullName', 'avatar']
          },
          {
            model: db.Blog,
            as: 'blog',
            attributes: ['id', 'content']
          }
        ]
      });

      io.to(`user_${userId}`).emit('new_notification', fullNotification);
    }

    return notif;
  }


  static async createLikeNotification(blogAuthorId, likerId, blogId) {
    // Don't notify if user likes their own post
    if (blogAuthorId === likerId) {
      return null;
    }

    const actor = await db.User.findByPk(likerId);
    const blog = await db.Blog.findByPk(blogId);

    if (!actor) {
      return null;
    }

    if (!blog) {
      return null;
    }

    return await this.createNotification(blogAuthorId, {
      message: `${actor.fullName || actor.username} liked your post: "${(blog.content || blog.title || 'your post').substring(0, 50)}..."`,
      type: 'LIKE',
      blogId,
      actorId: likerId
    });
  }

  static async createCommentNotification(blogAuthorId, commenterId, blogId, commentId) {

    // Don't notify if user comments on their own post
    if (blogAuthorId === commenterId) {
      return null;
    }

    const actor = await db.User.findByPk(commenterId);
    const blog = await db.Blog.findByPk(blogId);

    if (!actor) {
      return null;
    }

    if (!blog) {
      return null;
    }

    return await this.createNotification(blogAuthorId, {
      message: `${actor.fullName || actor.username} commented on your post: "${(blog.content || blog.title || 'your post').substring(0, 50)}..."`,
      type: 'COMMENT',
      blogId,
      commentId,
      actorId: commenterId
    });
  }


  static async createReplyNotification(originalCommenterId, replierId, blogId, replyCommentId) {
    // Don't notify if user replies to their own comment
    if (originalCommenterId === replierId) return null;

    const actor = await db.User.findByPk(replierId);
    const blog = await db.Blog.findByPk(blogId);

    if (!actor || !blog) return null;

    const contentPreview = blog.content ? blog.content.substring(0, 50) + "..." : "a post";
    return await this.createNotification(originalCommenterId, {
      message: `${actor.fullName || actor.username} replied to your comment on "${contentPreview}"`,
      type: 'REPLY',
      blogId,
      commentId: replyCommentId,
      actorId: replierId
    });
  }


  static async listNotificationsForUser(userId, limit = 20, offset = 0) {
    const notifications = await db.Notification.findAll({
      where: { userId },
      include: [
        {
          model: db.User,
          as: 'actor',
          attributes: ['id', 'username', 'fullName', 'avatar']
        },
        {
          model: db.Blog,
          as: 'blog',
          attributes: ['id', 'content']
        },
        {
          model: db.Comment,
          as: 'comment',
          attributes: ['id', 'content']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    return notifications;
  }

  static async markAsRead(notificationIds = []) {
    if (!notificationIds || notificationIds.length === 0) return 0;
    const [count] = await db.Notification.update(
      { isRead: true },
      { where: { id: notificationIds } }
    );
    return count;
  }


  static async getUnreadCount(userId) {
    const count = await db.Notification.count({
      where: {
        userId,
        isRead: false
      }
    });
    return count;
  }
}

module.exports = NotificationService;

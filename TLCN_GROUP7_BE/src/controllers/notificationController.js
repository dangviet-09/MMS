const NotificationService = require('../services/notificationService');
const ApiResponse = require('../utils/apiResponse');

class NotificationController {
  async list(req, res) {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 20;
      const offset = parseInt(req.query.offset) || 0;
      
      const notifications = await NotificationService.listNotificationsForUser(userId, limit, offset);
      const unreadCount = await NotificationService.getUnreadCount(userId);
      
      return ApiResponse.success(res, 'OK', {
        notifications,
        unreadCount
      });
    } catch (err) {
      return ApiResponse.error(res, err.message, 400);
    }
  }

  async markRead(req, res) {
    try {
      const userId = req.user.id;
      const { ids } = req.body;
      
      if (!Array.isArray(ids) || ids.length === 0) {
        return ApiResponse.error(res, 'Invalid ids', 400);
      }
      
      const affected = await NotificationService.markAsRead(ids);
      
      // Emit real-time update for unread count
      const io = req.app.get('io');
      if (io) {
        const newUnreadCount = await NotificationService.getUnreadCount(userId);
        io.to(`user_${userId}`).emit('notifications_read', {
          notificationIds: ids,
          newUnreadCount
        });
      }
      
      return ApiResponse.success(res, 'Marked', { affected });
    } catch (err) {
      return ApiResponse.error(res, err.message, 400);
    }
  }

  async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;
      const count = await NotificationService.getUnreadCount(userId);
      
      return ApiResponse.success(res, 'OK', { unreadCount: count });
    } catch (err) {
      return ApiResponse.error(res, err.message, 400);
    }
  }
}

module.exports = new NotificationController();

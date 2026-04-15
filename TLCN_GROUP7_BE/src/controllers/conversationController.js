const ConversationService = require("../services/conversationService");
const ApiResponse = require("../utils/apiResponse");

class ConversationController {

  async getOrCreateConversation(req, res) {
    try {
      const userId = req.user.id;
      const otherUserId = req.params.userId;

      const conversation = await ConversationService.getOrCreateConversation(
        userId,
        otherUserId
      );

      return ApiResponse.success(res, "OK", conversation);
    } catch (err) {
      return ApiResponse.error(res, err.message, 400);
    }
  }

  async getMessages(req, res) {
    try {
      const conversationId = req.params.id;
      const limit = parseInt(req.query.limit) || 20;
      const beforeId = req.query.beforeId || null;

      const messages = await ConversationService.getMessages(
        conversationId,
        limit,
        beforeId
      );

      return ApiResponse.success(res, "OK", messages);
    } catch (err) {
      return ApiResponse.error(res, err.message, 400);
    }
  }

  async listConversations(req, res) {
    try {
      const userId = req.user.id;
      const list = await ConversationService.listConversations(userId);
      return ApiResponse.success(res, 'OK', list);
    } catch (err) {
      return ApiResponse.error(res, err.message, 400);
    }
  }

  async sendMessage(req, res) {
    try {
      const senderId = req.user.id;
      const conversationId = req.params.id;
      const { content } = req.body;
      const io = req.app.get('io');

      // Gọi service để xử lý logic gửi message
      const messageWithSender = await ConversationService.sendMessage(
        conversationId,
        senderId,
        content
      );

      // Emit socket events thông qua service
      await ConversationService.emitNewMessage(io, conversationId, messageWithSender, senderId);

      return ApiResponse.success(res, "Sent", messageWithSender);
    } catch (err) {
      return ApiResponse.error(res, err.message, 400);
    }
  }

  async deleteMessage(req, res) {
    try {
      const userId = req.user.id;
      const messageId = req.params.messageId;
      const io = req.app.get('io');

      // Gọi service để xử lý tất cả logic
      const result = await ConversationService.deleteMessage(messageId, userId);
      const { message: deletedMessage, conversationId } = result;

      // Emit socket event thông qua service
      await ConversationService.emitMessageDeleted(io, conversationId, messageId, deletedMessage);

      return ApiResponse.success(res, "Tin nhắn đã được xóa", deletedMessage);
    } catch (err) {
      return ApiResponse.error(res, err.message, 400);
    }
  }

  async deleteConversation(req, res) {
    try {
      const userId = req.user.id;
      const conversationId = req.params.conversationId;

      // Gọi service để xử lý logic xóa conversation
      await ConversationService.deleteConversation(conversationId, userId);

      return ApiResponse.success(res, "Cuộc hội thoại đã được xóa", null);
    } catch (err) {
      return ApiResponse.error(res, err.message, 400);
    }
  }
}

module.exports = new ConversationController();

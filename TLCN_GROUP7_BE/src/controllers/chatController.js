const ApiResponse = require('../utils/apiResponse');
const ChatService = require('../services/chatService');

class ChatController {

  async getOrCreateSession(req, res) {
    try {
      const userId = req.user.id;
      const data = await ChatService.getOrCreateSession(userId);
      return ApiResponse.success(res, 'Lấy session chat thành công', data);
    } catch (error) {
      console.error('[ChatController.getOrCreateSession]', error);
      return ApiResponse.error(res, error.message || 'Lỗi lấy session', 500);
    }
  }


  async sendMessage(req, res) {
    try {
      const userId = req.user.id;
      const { message } = req.body;
      
      const data = await ChatService.sendMessage(userId, message);
      return ApiResponse.success(res, 'Gửi tin nhắn thành công', data);
    } catch (error) {
      console.error('[ChatController.sendMessage]', error);
      return ApiResponse.error(res, error.message || 'Lỗi gửi tin nhắn', 500);
    }
  }


  async clearHistory(req, res) {
    try {
      const userId = req.user.id;
      await ChatService.clearHistory(userId);
      return ApiResponse.success(res, 'Xóa lịch sử chat thành công');
    } catch (error) {
      console.error('[ChatController.clearHistory]', error);
      return ApiResponse.error(res, error.message || 'Lỗi xóa lịch sử', 500);
    }
  }


  async getAssessment(req, res) {
    try {
      const userId = req.user.id;
      const data = await ChatService.generateAssessment(userId);
      return ApiResponse.success(res, 'Tạo báo cáo đánh giá thành công', data);
    } catch (error) {
      console.error('[ChatController.getAssessment]', error);
      return ApiResponse.error(res, error.message || 'Lỗi tạo đánh giá', 500);
    }
  }
}

module.exports = new ChatController();

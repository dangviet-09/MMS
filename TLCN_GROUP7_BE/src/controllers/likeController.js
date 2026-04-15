const ApiResponse = require('../utils/apiResponse');
const LikeService = require('../services/likeService');

class LikeController {
  async likeBlog(req, res) {
    try {
      const userId = req.user.id;
      const { blogId } = req.params;
      const result = await LikeService.toggleLikeBlog(userId, blogId);
      return ApiResponse.success(res, 'Cập nhật like thành công', result);
    } catch (error) {
      return ApiResponse.error(res, error.message || 'Cập nhật like thất bại', 400);
    }
  }

  async getBlogLikes(req, res) {
    try {
      const userId = req.user?.id;
      const { blogId } = req.params;
      const result = await LikeService.getLikesForBlog(blogId, userId);
      return ApiResponse.success(res, 'Lấy thông tin like thành công', result);
    } catch (error) {
      return ApiResponse.error(res, error.message || 'Không thể lấy thông tin like', 404);
    }
  }
}

module.exports = new LikeController();
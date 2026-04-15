const ChallengeTestService = require('../services/challengeTestService');
const ApiResponse = require('../utils/apiResponse');

class ChallengeTestController {

  async create(req, res) {
    try {
      const userId = req.user.id;
      const body = req.body;
      const files = req.files;

      const result = await ChallengeTestService.create(userId, body, files);
      return ApiResponse.success(res, 'Tạo Challenge Test thành công', result, 201);
    } catch (error) {
      console.error('[ChallengeTestController.create]', error);
      return ApiResponse.error(res, error.message, 400);
    }
  }

  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await ChallengeTestService.getAll(page, limit);

      return ApiResponse.success(res, 'Lấy danh sách Challenge thành công', result);
    } catch (error) {
      console.error('[ChallengeTestController.getAll]', error);
      return ApiResponse.error(res, 'Lỗi server', 500);
    }
  }

  async getById(req, res) {
    try {
      const id = req.params.id;
      const result = await ChallengeTestService.getById(id);

      return ApiResponse.success(res, 'Lấy Challenge Test thành công', result);
    } catch (error) {
      console.error('[ChallengeTestController.getById]', error);
      return ApiResponse.error(res, error.message || 'Không tìm thấy', 404);
    }
  }

  async update(req, res) {
    try {
      // Service will resolve company and check ownership
      const userId = req.user.id;
      const id = req.params.id;
      const data = req.body;
      const files = req.files;

      const result = await ChallengeTestService.update(userId, id, data, files);

      return ApiResponse.success(res, 'Cập nhật Challenge Test thành công', result);
    } catch (error) {
      console.error('[ChallengeTestController.update]', error);
      return ApiResponse.error(res, error.message, 400);
    }
  }

  async delete(req, res) {
    try {
      // Service will resolve company; pass user id and role
      const userId = req.user.id;
      const id = req.params.id;
      await ChallengeTestService.delete(userId, id, req.user.role);

      return ApiResponse.success(res, 'Xóa Challenge Test thành công');
    } catch (error) {
      console.error('[ChallengeTestController.delete]', error);
      return ApiResponse.error(res, error.message, error.statusCode || 400);
    }
  }
}

module.exports = new ChallengeTestController();

const TestService = require("../services/testService");
const ApiResponse = require("../utils/apiResponse");

class TestController {
  async create(req, res) {
    try {
      const result = await TestService.create(req.body);
      return ApiResponse.success(res, "Tạo bài test thành công", result, 201);
    } catch (err) {
      return ApiResponse.error(res, err.message || "Lỗi tạo bài test", 400);
    }
  }
  
   async getById(req, res) {
    try {
      const testId = req.params.id;
      const test = await TestService.getById(testId);
      return ApiResponse.success(res, "Lấy bài test thành công", test);
    } catch (error) {
      return ApiResponse.error(res, error.message || "Không tìm thấy bài test", 404);
    }
  }

  async update(req, res) {
    try {
      const result = await TestService.update(req.params.id, req.body);
      return ApiResponse.success(res, "Cập nhật bài test thành công", result);
    } catch (err) {
      return ApiResponse.error(res, err.message || "Lỗi cập nhật bài test", 400);
    }
  }

  async delete(req, res) {
    try {
      await TestService.delete(req.params.id);
      return ApiResponse.success(res, "Xoá bài test thành công");
    } catch (err) {
      return ApiResponse.error(res, err.message || "Bài test không tồn tại", 404);
    }
  }

  // AI Grading
  async submitTest(req, res) {
    try {
      const userId = req.user.id;
      const testId = req.params.id;
      const { answers } = req.body;

      if (!answers || !Array.isArray(answers)) {
        return ApiResponse.error(res, 'Thiếu answers array', 400);
      }

      const result = await TestService.submitAndGrade(userId, testId, answers);
      return ApiResponse.success(res, 'Nộp bài và chấm điểm thành công', result);
    } catch (error) {
      console.error('[TestController.submitTest]', error);
      return ApiResponse.error(res, error.message || 'Lỗi nộp bài', 500);
    }
  }

  async getTestResults(req, res) {
    try {
      const testId = req.params.id;
      const results = await TestService.getResults(testId);
      return ApiResponse.success(res, 'Lấy kết quả thành công', results);
    } catch (error) {
      console.error('[TestController.getTestResults]', error);
      return ApiResponse.error(res, error.message || 'Lỗi lấy kết quả', 500);
    }
  }
}

module.exports = new TestController();

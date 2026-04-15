// controllers/careerTestController.js
const careerTestService = require('../services/careerTestService');
const CareerTestService = require('../services/careerTestService');
const ApiResponse = require('../utils/apiResponse');

class CareerTestController {
  async getTest(req, res) {
    try {
      const test = await CareerTestService.getCareerTest();
      return ApiResponse.success(res, 'Lấy bài trắc nghiệm thành công', test);
    } catch (error) {
      return ApiResponse.error(res, error.message, 404);
    }
  }

    async submitTest(req, res) {
    try {
      const userId = req.user.id; // lấy từ middleware xác thực
      const answers = req.body.answers; // mảng [{ questionIndex: 1, option: 'A' }, ...]

      const result = await CareerTestService.evaluateCareerTest(userId, answers);
      return ApiResponse.success(res, 'Nộp bài trắc nghiệm thành công', result);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  async updatemajor(req, res) {
        try {
            const studentId = req.user.id;
            const { major } = req.body;
            const result = await careerTestService.updatemajor(studentId, major);
            return ApiResponse.success(res, 'update major success', result);
        } catch (error) {
            return ApiResponse.error(res, error.message, 400);
        }
    }
}

module.exports = new CareerTestController();

const LessonService = require("../services/lessonService");
const TestService = require("../services/testService");
const ApiResponse = require("../utils/apiResponse");

class LessonController {
  async create(req, res) {
    try {
      const { careerPathId } = req.params;
      const lesson = await LessonService.createLesson(careerPathId, req.body);
      return ApiResponse.success(res, "Tạo lesson thành công", lesson, 201);
    } catch (err) {
      console.error(err);
      return ApiResponse.error(res, err.message || "Lỗi tạo lesson", 400);
    }
  }

  async getById(req, res) {
    try {
      const lessonId = req.params.id;
      const lesson = await LessonService.getLessonById(lessonId);

      // Lấy mini tests
      const tests = await TestService.getTestsByLesson(lessonId);

      return ApiResponse.success(res, "Chi tiết lesson", {
        ...lesson.toJSON(),
        tests
      });
    } catch (err) {
      console.error('[LessonController.getById] Error:', err.message, 'lessonId:', req.params.id);
      return ApiResponse.error(res, err.message || "Lesson không tồn tại", 404);
    }
  }

  async update(req, res) {
    try {
      const lessonId = req.params.id;
      const updated = await LessonService.updateLesson(lessonId, req.body);
      return ApiResponse.success(res, "Cập nhật lesson thành công", updated);
    } catch (err) {
      console.error(err);
      return ApiResponse.error(res, err.message || "Lỗi cập nhật lesson", 400);
    }
  }

  async delete(req, res) {
    try {
      const lessonId = req.params.id;
      await LessonService.deleteLesson(lessonId);
      return ApiResponse.success(res, "Xoá lesson thành công");
    } catch (err) {
      console.error(err);
      return ApiResponse.error(res, err.message || "Lesson không tồn tại", 404);
    }
  }
}

module.exports = new LessonController();

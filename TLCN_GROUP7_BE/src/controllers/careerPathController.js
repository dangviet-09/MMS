const CareerPathService = require("../services/careerPathService");
const LessonService = require("../services/lessonService");
const TestService = require("../services/testService");
const ApiResponse = require("../utils/apiResponse");

class CareerPathController {
  async create(req, res) {
    try {
      const companyId = req.user.id;
      const data = req.body;
      const files = req.files;
      const result = await CareerPathService.createCareerPath(companyId, data, files);

      return ApiResponse.success(res, 'Tạo career path thành công', result, 201);
    } catch (error) {
      console.error('[CareerPathController.create]', error);
      return ApiResponse.error(res, error.message || 'Lỗi tạo career path', 400);
    }
  }

  async update(req, res) {
    try {
      const companyId = req.user.id;
      const courseId = req.params.id;
      const data = req.body;
      const course = await CareerPathService.updateCourse(companyId, courseId, data);
      return ApiResponse.success(res, "Cập nhật course thành công", course);
    } catch (err) {
      console.error(err);
      return ApiResponse.error(res, err.message || "Lỗi cập nhật", 400);
    }
  }

  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await CareerPathService.getAllCourses(page, limit);
      return ApiResponse.success(res, "Lấy danh sách course thành công", result);
    } catch (err) {
      console.error(err);
      return ApiResponse.error(res, "Lỗi server", 500);
    }
  }

  async getById(req, res) {
    try {
      const courseId = req.params.id;
      const userId = req.user?.id; // Có thể null nếu chưa login
      const course = await CareerPathService.getCourseById(courseId, userId);

      // Lấy tất cả lessons thuộc careerPath
      const lessons = await LessonService.getAllLessons(courseId);

      // Lấy final test của careerPath
      const finalTest = await TestService.getFinalTestByCareerPath(courseId);

      return ApiResponse.success(res, "Chi tiết course", {
        ...course.toJSON(),
        lessons,
        finalTest
      });
    } catch (err) {
      console.error(err);
      return ApiResponse.error(res, err.message || "Course không tồn tại", 404);
    }
  }

  async delete(req, res) {
    try {
      const companyId = req.user.id;
      const courseId = req.params.id;
      const role = req.user.role;
      await CareerPathService.deleteCourse(companyId, courseId, role);
      return ApiResponse.success(res, "Xoá course thành công");
    } catch (err) {
      console.error(err);
      return ApiResponse.error(res, err.message || "Không tìm thấy course", 404);
    }
  }

  async getMyCourses(req, res) {
    try {
      const companyId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const result = await CareerPathService.getCoursesByCompany(companyId, page, limit);
      return ApiResponse.success(res, "Lấy danh sách course của công ty thành công", result);
    } catch (err) {
      console.error('[CareerPathController.getMyCourses]', err);
      return ApiResponse.error(res, err.message || "Lỗi server", 500);
    }
  }

  async updateStatus(req, res) {
    try {
      const companyId = req.user.id;
      const courseId = req.params.id;
      const { status } = req.body;

      if (!['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(status)) {
        return ApiResponse.error(res, "Status không hợp lệ. Chỉ chấp nhận: DRAFT, PUBLISHED, ARCHIVED", 400);
      }

      const course = await CareerPathService.updateCourseStatus(companyId, courseId, status);
      return ApiResponse.success(res, `Cập nhật status thành ${status} thành công`, course);
    } catch (err) {
      console.error('[CareerPathController.updateStatus]', err);
      return ApiResponse.error(res, err.message || "Lỗi cập nhật status", 400);
    }
  }
}

module.exports = new CareerPathController();

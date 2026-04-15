const BlogService = require('../services/blogService');
const ApiResponse = require('../utils/apiResponse');

class BlogController {
  async create(req, res) {
    try {
      const authorId = req.user.id;
      const blogData = req.body;
      const blogFiles = req.files;

      const result = await BlogService.createBlog(authorId, blogData, blogFiles);
      return ApiResponse.success(res, 'Tạo blog thành công', result, 201);
    } catch (error) {
      console.error('[BlogController.create]', error);
      return ApiResponse.error(res, error.message || 'Lỗi tạo blog', 400);
    }
  }

  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await BlogService.getAllBlogs(page, limit);
      return ApiResponse.success(res, 'Lấy danh sách blog thành công', result);
    } catch (error) {
      console.error('[BlogController.getAll]', error);
      return ApiResponse.error(res, error.message || 'Lỗi server', 500);
    }
  }

  async getById(req, res) {
    try {
      const blogId = req.params.id;
      const result = await BlogService.getBlogById(blogId);
      return ApiResponse.success(res, 'Lấy blog thành công', result);
    } catch (error) {
      console.error('[BlogController.getById]', error);
      return ApiResponse.error(res, error.message || 'Không tìm thấy', 404);
    }
  }

  async update(req, res) {
  try {
    const authorId = req.user.id;
    const blogId = req.params.id;
    const updateData = req.body;
    const updateFiles = req.files;

    const result = await BlogService.updateBlog(authorId, blogId, updateData, updateFiles);
    return ApiResponse.success(res, 'Cập nhật blog thành công', result);
  } catch (error) {
    console.error('[BlogController.update]', error);
    return ApiResponse.error(res, error.message || 'Lỗi cập nhật', 400);
  }
}

  async delete(req, res) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role; // role có trong token
      const blogId = req.params.id;

      await BlogService.deleteBlog(userId, userRole, blogId);

      return ApiResponse.success(res, 'Xóa blog thành công');
    } catch (error) {
      console.error('[BlogController.delete]', error);
      return ApiResponse.error(res, error.message || 'Lỗi hệ thống', error.statusCode || 400);
    }
  }

 
  
}

module.exports = new BlogController();

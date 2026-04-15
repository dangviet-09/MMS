const UserService = require('../services/userService');
const ApiResponse = require('../utils/apiResponse');

class UserController {
  async create(req, res) {
    try {
      const result = await UserService.createUser(req.body);
      return ApiResponse.success(res, 'Tạo user thành công', result);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  async getById(req, res) {
    try {
      const user = await UserService.getUserById(req.params.id);
      return ApiResponse.success(res, 'Lấy user thành công', user);
    } catch (error) {
      return ApiResponse.error(res, error.message, 404);
    }
  }

  async update(req, res) {
    try {
      const updatedUser = await UserService.updateUser(req.params.id, req.body);
      return ApiResponse.success(res, 'Cập nhật user thành công', updatedUser);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  async delete(req, res) {
    try {
      await UserService.deleteUser(req.params.id);
      return ApiResponse.success(res, 'Xoá user thành công');
    } catch (error) {
      return ApiResponse.error(res, error.message, 404);
    }
  }

  async updateRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;



      // Validate role
      const validRoles = ['STUDENT', 'COMPANY'];
      if (!validRoles.includes(role)) {
        return ApiResponse.error(res, 'Invalid role. Must be STUDENT, COMPANY', 400);
      }

      const updatedUser = await UserService.updateRole(id, role);

      return ApiResponse.success(res, 'Role updated successfully', updatedUser);
    } catch (error) {
      console.error('Update role error:', error);
      return ApiResponse.error(res, error.message, 500);
    }
  }
async getAll(req, res) {
  try {
    const { role } = req.query; // STUDENT hoặc COMPANY hoặc null
    const users = await UserService.getAllUsers(role);

    return ApiResponse.success(res, 'Lấy danh sách user thành công', users);
  } catch (error) {
    return ApiResponse.error(res, error.message, error.statusCode || 400);
  }
}

  async updateAvatar(req, res) {
    try {
      if (!req.file) {
        return ApiResponse.error(res, 'Không có file avatar được upload', 400);
      }

      const updatedUser = await UserService.updateAvatar(req.params.id, req.file.buffer);
      
      return ApiResponse.success(res, 'Cập nhật avatar thành công', updatedUser);
    } catch (error) {
      console.error('[UserController.updateAvatar]', error);
      return ApiResponse.error(res, error.message || 'Không thể cập nhật avatar', 400);
    }
  }

}

module.exports = new UserController();

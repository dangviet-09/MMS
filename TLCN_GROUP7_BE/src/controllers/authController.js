const authService = require('../services/authService');
const ApiResponse = require('../utils/apiResponse');

class AuthController {
  async login(req, res) {
    try {
      const { username, password } = req.body;
      const result = await authService.login(username, password);
      return ApiResponse.success(res, 'Đăng nhập thành công', result);
    } catch (error) {
      return ApiResponse.error(res, error.message, 401);
    }
  }

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw new Error("Không có refresh token");

      const result = await authService.refreshToken(refreshToken);
      return ApiResponse.success(res, "Refresh token thành công", result);
    } catch (error) {
      return ApiResponse.error(res, error.message, 401);
    }
  }

  async logout(req, res) {
    try {
      const userId = req.user.id; // req.user có được từ middleware verify access token
      await authService.logout(userId);
      return ApiResponse.success(res, "Đăng xuất thành công");
    } catch (error) {
      return ApiResponse.error(res, error.message, 500);
    }
  }

  async getCurrentUser(req, res) {
    try {
      const userId = req.user.id;
      const user = await authService.getUserById(userId);
      return ApiResponse.success(res, 'Lấy thông tin user thành công', { user });
    } catch (error) {
      return ApiResponse.error(res, error.message, 404);
    }
  }

   async googleCallback(req, res) {
  try {   
    const googleData = req.user;
    
    if (!googleData) {
      throw new Error("No user data from Google");
    }


    const result = await authService.loginWithGoogle(googleData);
 

    if (!process.env.FRONTEND_URL) {
      throw new Error("FRONTEND_URL is not set in environment variables");
    }

    const redirectUrl = `${process.env.FRONTEND_URL}/oauth-success` +
      `?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`;
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error("[googleCallback] FATAL ERROR:", error);
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/?error=oauth_failed`);
  }
}

async verifyUsername(req, res) {
  try {
    const { username } = req.body;
    const result = await authService.verifyUsername(username);
    return ApiResponse.success(res, 'Đã gửi mã xác thực', result);
  } catch (error) {
    return ApiResponse.error(res, error.message, 400);
  }
}
async verifyOTP(req, res) {
    try {
      const { username, otp } = req.body;

      // Gọi xuống service kiểm tra OTP
      const result = await authService.verifyOTP(username, otp );

      return ApiResponse.success(res, 'Xác thực mã OTP thành công.', result);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  async changePassword(req, res) {
    try {
      const { username, newPassword, confirmNewPassword } = req.body;
      const result = await authService.changePassword(username, newPassword, confirmNewPassword);
      return ApiResponse.success(res, 'Đổi mật khẩu thành công', result);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }
  
}

module.exports = new AuthController();

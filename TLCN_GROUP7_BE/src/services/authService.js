const db = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const JwtUtils = require('../utils/jwt');
const mailService = require('./mailService');
const OtpGenerator = require("../utils/otpGenerator");

class AuthService {
  async login(username, password) {
    //  Tìm user theo username và provider LOCAL
    const user = await db.User.findOne({
      where: { username },
      include: [{ model: db.AuthProvider, where: { provider: 'LOCAL' } }]
    });

    if (!user) throw new Error('Người dùng không tồn tại');

    const localProvider = user.AuthProviders[0];
    if (!localProvider.password) throw new Error('Tài khoản không có mật khẩu');

    //  Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, localProvider.password);
    if (!isMatch) throw new Error('Sai mật khẩu');

    //  Tạo access token & refresh token
    const accessToken = JwtUtils.signAccess({ id: user.id, role: user.role });
    const refreshToken = JwtUtils.signRefresh({ id: user.id });

    //  Lưu refresh token vào DB (bảng RefreshToken)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 ngày
    await db.RefreshToken.create({
      userId: user.id,
      token: refreshToken,
      expiresAt
    });

    //  Trả về user an toàn (ẩn password)
    const safeUser = {
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      isActive: user.isActive
    };

    return { accessToken, refreshToken, user: safeUser };
  }

  async refreshToken(oldToken) {
    const decoded = JwtUtils.verifyRefresh(oldToken);

    // Kiểm tra token có trong DB không
    const storedToken = await db.RefreshToken.findOne({
      where: { userId: decoded.id, token: oldToken }
    });

    if (!storedToken) throw new Error('Refresh token không hợp lệ');

    // Lấy thông tin user mới nhất từ DB để đảm bảo role đúng
    const user = await db.User.findByPk(decoded.id);
    if (!user) throw new Error('Người dùng không tồn tại');

    // Tạo access token mới
    const newAccessToken = JwtUtils.signAccess({ id: user.id, role: user.role });

    return { accessToken: newAccessToken };
  }

  async logout(userId) {
    // Xoá tất cả refresh token của user → buộc đăng nhập lại
    await db.RefreshToken.destroy({ where: { userId } });
  }
  async loginWithGoogle(googleData) {
    let user = await db.User.findOne({ where: { email: googleData.email } });
    let isNewUser = false;

    if (!user) {
      user = await db.User.create({
        email: googleData.email,
        fullName: googleData.fullName,
        role: 'STUDENT', // default hoặc để FE chọn role sau
      });
      isNewUser = true;
    }

    // Kiểm tra hoặc tạo AuthProvider
    let provider = await db.AuthProvider.findOne({
      where: { provider: 'GOOGLE', providerId: googleData.providerId }
    });

    if (!provider) {
      await db.AuthProvider.create({
        provider: 'GOOGLE',
        providerId: googleData.providerId,
        userId: user.id
      });
    }

    // Tạo Student record nếu user mới và role là STUDENT
    if (isNewUser && user.role === 'STUDENT') {
      const existingStudent = await db.Student.findOne({ where: { userId: user.id } });
      if (!existingStudent) {
        await db.Student.create({
          userId: user.id,
          major: null,
          school: null
        });
      }
    }

    // Kiểm tra refreshToken hiện tại trong DB (nếu có)
    let existingRefresh = await db.RefreshToken.findOne({
      where: { userId: user.id },
      order: [['createdAt', 'DESC']]
    });

    let refreshToken;
    if (existingRefresh) {
      try {
        // Nếu token cũ vẫn còn hạn → tái sử dụng
        JwtUtils.verifyRefresh(existingRefresh.token);
        refreshToken = existingRefresh.token;
      } catch (err) {
        // Token cũ hết hạn → tạo mới + update DB
        refreshToken = JwtUtils.signRefresh({ id: user.id });
        await existingRefresh.update({
          token: refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
      }
    } else {
      // Chưa có refresh token nào → tạo mới
      refreshToken = JwtUtils.signRefresh({ id: user.id });
      await db.RefreshToken.create({
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
    }

    // Luôn tạo access token mới (ngắn hạn)
    const accessToken = JwtUtils.signAccess({ id: user.id, role: user.role });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        role: user.role
      }
    };
  }

  async verifyUsername(username) {
    //  Tìm user theo username
    const user = await db.User.findOne({ where: { username } });
    if (!user) throw new Error('Người dùng không tồn tại');
    if (!user.isActive) throw new Error('Tài khoản đang bị khóa');
    if (user.verifyStatus !== 'VERIFIED') throw new Error('Tài khoản chưa được xác thực');
    // if (user.AuthProviders[0].provider !== 'LOCAL')
    //   throw new Error('Tài khoản không hỗ trợ đổi mật khẩu');

    // Tạo mã OTP ngẫu nhiên
    const otpCode = OtpGenerator.generate(6);

    // Lưu OTP vào bảng Otp (liên kết với user)
    await db.Otp.create({
      userId: user.id,
      otp: otpCode,
      purpose: 'FORGOT_PASSWORD',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 phút
      used: false,
    });

    // Gửi email OTP cho người dùng
    await mailService.sendOTPEmail(user, otpCode);

    // Trả dữ liệu cơ bản cho controller
    return {
      id: user.id,
      email: user.email,
      username: user.username,
    };
  }

  async verifyOTP(username, otp) {

    // Tìm user
    const user = await db.User.findOne({ where: { username } });
    if (!user) throw new Error('Người dùng không tồn tại');

    // Tìm OTP mới nhất chưa dùng của user
    const otpRecord = await db.Otp.findOne({
      where: {
        userId: user.id,
        otp: otp,
        used: false,
        expiresAt: { [Op.gt]: new Date() } // chưa hết hạn
      },
      order: [['createdAt', 'DESC']]
    });

    if (!otpRecord) throw new Error('Mã OTP không hợp lệ hoặc đã hết hạn');

    // Cập nhật used = true để tránh tái sử dụng
    otpRecord.used = true;
    await otpRecord.save();

    return { message: 'OTP hợp lệ, bạn có thể đổi mật khẩu.', userId: user.id };
  }

  async changePassword(username, newPassword, confirmNewpassword) {
    const user = await db.User.findOne({ where: { username } });
    if (!user) throw new Error('Người dùng không tồn tại');
    if (newPassword !== confirmNewpassword) {
      throw new Error('Mật khẩu mới và xác nhận mật khẩu không khớp');
    }
    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật lại mật khẩu
    await db.AuthProvider.update(
      { password: hashedPassword },
      { where: { userId: user.id, provider: 'LOCAL' } }
    );

    return {
      id: user.id,
      email: user.email,
      username: user.username,
    };
  }

  async getUserById(userId) {
    const user = await db.User.findByPk(userId, {
      attributes: ['id', 'username', 'email', 'fullName', 'avatar', 'role', 'isActive']
    });
    if (!user) throw new Error('Người dùng không tồn tại');
    return user;
  }
}

module.exports = new AuthService();

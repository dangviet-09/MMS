const db = require('../models');
const kafkaModule = require("../kafka");
const bcrypt = require('bcryptjs');
const mailService = require('./mailService');

class UserService {
  async createUser(data) {
    const { email, username, fullName, role, password, provider = 'LOCAL', providerId } = data;

    // Kiểm tra email trùng
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) throw new Error('Email đã tồn tại');

    // Tạo user
    const user = await db.User.create({ email, username, fullName, role, verifyStatus: 'VERIFIED' });

    // Hash password nếu LOCAL
    let hashedPassword = null;
    if (provider === 'LOCAL' && password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Nếu là STUDENT → tạo bản ghi Student
    if (role === 'STUDENT') {
      await db.Student.create({
        userId: user.id,
        major: null,
        school: null,
      });
    }

    // Nếu là COMPANY → tạo bản ghi Company
    if (role === 'COMPANY') {
      await db.Company.create({
        userId: user.id,
        companyName: "Unknown",
        industry: null,
        website: null,
        description: null
      });
    }

    // Tạo AuthProvider
    await db.AuthProvider.create({
      userId: user.id,
      provider,
      providerId: provider === 'GOOGLE' ? providerId : null,
      password: hashedPassword,
    });

    // Gửi email Welcome
    try {
      if (process.env.NODE_ENV === 'production') {
        await kafkaModule.producers.mailProducer.sendWelcomeEmail({
          email: user.email,
          fullName: user.fullName,
          username: user.username
        });
      } else {
        await mailService.sendWelcomeEmail(user);
      }
    } catch (emailError) {
      console.warn('[UserService.createUser] Email gửi thất bại (không ảnh hưởng):', emailError.message);
      // Không throw - email gửi fail không làm fail sign up
    }


    return user;
  }

  // // ---------------- GET ALL USERS ----------------
  // async getUsers() {
  //   return db.User.findAll({
  //     include: [
  //       { model: db.AuthProvider, attributes: ['provider', 'providerId'] },
  //       { model: db.Student, as: 'student' },
  //       { model: db.Company, as: 'company' }
  //     ],
  //     attributes: { exclude: ['deletedAt'] }
  //   });
  // }

  // ---------------- GET USER BY ID ----------------
  async getUserById(id) {
    const user = await db.User.findByPk(id, {
      include: [
        { model: db.AuthProvider, attributes: ['provider', 'providerId'] },
        { model: db.Student, as: 'student' },
        { model: db.Company, as: 'company' }
      ]
    });

    if (!user) throw new Error('Không tìm thấy user');
    return user;
  }

  // ---------------- UPDATE USER ----------------
  async updateUser(id, data) {
    const user = await db.User.findByPk(id);
    if (!user) throw new Error('Không tìm thấy user');

    const updateData = {};
    const allowedFields = ['email', 'username', 'fullName', 'role', 'isActive', 'avatar', 'address'];
    
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });

    if (Object.keys(updateData).length > 0) {
      await user.update(updateData);
    }

    return user;
  }

  async updateAvatar(userId, fileBuffer) {
    const user = await db.User.findByPk(userId);
    if (!user) throw new Error('Không tìm thấy user');

    const cloudinary = require('../configs/cloudinary');
    const streamifier = require('streamifier');

    // Upload to Cloudinary với timeout và optimize
    const uploadPromise = new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Upload timeout'));
      }, 15000); // 15s timeout

      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'avatars',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto:low', fetch_format: 'auto' }
          ],
          resource_type: 'image'
        },
        (error, result) => {
          clearTimeout(timeoutId);
          if (error) reject(error);
          else resolve(result);
        }
      );

      streamifier.createReadStream(fileBuffer).pipe(stream);
    });

    const result = await uploadPromise;
    await user.update({ avatar: result.secure_url });

    return user;
  }

  // ---------------- DELETE USER ----------------
  async deleteUser(id) {
    const user = await db.User.findByPk(id);
    if (!user) throw new Error('Không tìm thấy user');

    await user.destroy(); // soft delete
    return true;
  }

  // ---------------- UPDATE ROLE ----------------
  async updateUserRole(id, role) {
    const user = await db.User.findByPk(id);
    if (!user) throw new Error('Không tìm thấy user');

    const validRoles = ['STUDENT', 'COMPANY', 'ADMIN'];
    if (!validRoles.includes(role)) {
      const error = new Error('Vai trò không hợp lệ');
      error.statusCode = 400;
      throw error;
    }

    await user.update({ role });
    return user;
  }

  // ---------------- FILTER BY ROLE ----------------
  async getAllUsers(role) {
    const where = {};

    if (role) {
      const validRoles = ['STUDENT', 'COMPANY', 'ADMIN'];
      if (!validRoles.includes(role)) {
        const error = new Error('Vai trò không hợp lệ');
        error.statusCode = 400;
        throw error;
      }
      where.role = role;
    }

    // Chuẩn bị include theo role
    let include = [
      { model: db.AuthProvider, attributes: ['provider', 'providerId'] }
    ];

    if (!role || role === 'STUDENT') {
      include.push({ model: db.Student, as: 'student' });
    }

    if (!role || role === 'COMPANY') {
      include.push({ model: db.Company, as: 'company' });
    }

    return db.User.findAll({
      where,
      include,
      attributes: { exclude: ['deletedAt'] }
    });
  }
}

module.exports = new UserService();

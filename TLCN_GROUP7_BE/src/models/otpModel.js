module.exports = (sequelize, DataTypes) => {
  const Otp = sequelize.define('Otp', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE'
    },

    otp: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: 'Mã OTP gửi cho người dùng',
    },

    purpose: {
      type: DataTypes.ENUM('FORGOT_PASSWORD', 'EMAIL_VERIFICATION', 'OTHER'),
      allowNull: false,
      defaultValue: 'FORGOT_PASSWORD',
      comment: 'Mục đích của mã OTP (đặt lại mật khẩu, xác minh email, v.v.)',
    },

    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Thời gian hết hạn của mã OTP',
    },

    used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Đã sử dụng hay chưa',
    },
  }, {
    tableName: 'otps',
    timestamps: true,
    paranoid: true, // nếu muốn soft delete
    indexes: [
      { fields: ['userId'] },
      { fields: ['purpose'] },
      { fields: ['expiresAt'] },
    ],
  });

  // Quan hệ
  Otp.associate = (models) => {
    Otp.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  // Hook tự động dọn OTP cũ
  Otp.addHook('beforeCreate', async (otpInstance, options) => {
    // Khi tạo mới OTP → set tất cả OTP cũ của user cùng purpose về used = true
    await Otp.update(
      { used: true },
      {
        where: {
          userId: otpInstance.userId,
          purpose: otpInstance.purpose,
          used: false,
        },
      }
    );
  });

  return Otp;
};

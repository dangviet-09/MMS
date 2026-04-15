module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: { 
      type: DataTypes.STRING, 
      unique: true, 
      allowNull: false 
    },
    username: { 
      type: DataTypes.STRING, 
      unique: true, 
      allowNull: true
    },
    fullName: DataTypes.STRING,

    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    address: {
      type: DataTypes.STRING(255),
      allowNull: true
    },

    role: { 
      type: DataTypes.ENUM('STUDENT', 'COMPANY', 'ADMIN'),
      allowNull: true 
    },

    isActive: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: true 
    },

    verifyStatus: {
      type: DataTypes.ENUM('INVALID', 'UNVERIFIED', 'VERIFIED'),
      defaultValue: 'UNVERIFIED',
      allowNull: false
    },

    createdDate: { 
      type: DataTypes.DATE, 
      defaultValue: DataTypes.NOW 
    }
  }, {
    tableName: 'users',
    timestamps: true,
    paranoid: true
  });

  User.associate = (models) => {
    User.hasMany(models.AuthProvider, { foreignKey: 'userId' });
    User.hasMany(models.RefreshToken, { foreignKey: 'userId' });

    // Quan trọng: thêm alias để tránh lỗi include
    User.hasOne(models.Student, { 
      foreignKey: 'userId',
      as: 'student'
    });

    User.hasOne(models.Company, { 
      foreignKey: 'userId',
      as: 'company'
    });
  };

  return User;
};

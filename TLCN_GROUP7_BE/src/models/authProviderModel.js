module.exports = (sequelize, DataTypes) => {
  const AuthProvider = sequelize.define('AuthProvider', {
     id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    provider: { 
      type: DataTypes.ENUM('LOCAL', 'GOOGLE'),
      allowNull: false 
    },
    providerId: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    password: { 
      type: DataTypes.STRING, 
      allowNull: true  // chỉ dùng khi provider = LOCAL
    },
  }, {
    tableName: 'auth_providers',
    indexes: [
      {
        unique: true,
        fields: ['provider', 'providerId'] // Mỗi providerId chỉ gắn với 1 user
      }
    ]
  });

  AuthProvider.associate = (models) => {
    AuthProvider.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return AuthProvider;
};

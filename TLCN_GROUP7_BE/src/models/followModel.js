module.exports = (sequelize, DataTypes) => {
  const Follow = sequelize.define('Follow', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    followerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    followingId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users', 
        key: 'id'
      },
      onDelete: 'CASCADE'
    }
  }, {
    tableName: 'follows',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['followerId', 'followingId'],
        name: 'unique_follow'
      }
    ]
  });

  Follow.associate = (models) => {
    // Ai follow ai
    Follow.belongsTo(models.User, { foreignKey: 'followerId', as: 'follower' });
    Follow.belongsTo(models.User, { foreignKey: 'followingId', as: 'following' });
  };

  return Follow;
};

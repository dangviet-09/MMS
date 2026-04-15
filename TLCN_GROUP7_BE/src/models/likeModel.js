module.exports = (sequelize, DataTypes) => {
  const Like = sequelize.define('Like', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    }
  }, {
    tableName: 'likes',
    timestamps: true
  });

  Like.associate = (models) => {
    Like.belongsTo(models.User, { foreignKey: 'userId' });

    // Một like có thể thuộc bài viết hoặc comment
    Like.belongsTo(models.Blog, { foreignKey: 'postId' });
    Like.belongsTo(models.Comment, { foreignKey: 'commentId' });
  };

  return Like;
};

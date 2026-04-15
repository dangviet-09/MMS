module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define('Comment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    content: { type: DataTypes.TEXT, allowNull: false },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE'
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'blogs', key: 'id' }, 
      onDelete: 'CASCADE'
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'comments', key: 'id' },
      onDelete: 'CASCADE'
    }
  }, {
    tableName: 'comments',
    timestamps: true,
    paranoid: true
  });

  Comment.associate = (models) => {
    Comment.belongsTo(models.User, { as: 'author', foreignKey: 'userId' });
    Comment.belongsTo(models.Blog, { foreignKey: 'postId' });

    // self-referencing
    Comment.belongsTo(models.Comment, { as: 'parent', foreignKey: 'parentId' });
    Comment.hasMany(models.Comment, { as: 'replies', foreignKey: 'parentId' });

    Comment.hasMany(models.Like, { foreignKey: 'commentId' });
  };

  return Comment;
};

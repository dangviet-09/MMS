// models/blog.js
module.exports = (sequelize, DataTypes) => {
  const Blog = sequelize.define('Blog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },

    // Nội dung bài viết — có thể là text, emoji, link, v.v.
    content: {
      type: DataTypes.TEXT,
      allowNull: true // Cho phép bài chỉ có ảnh/video
    },

    // Danh mục (tùy chọn, có thể giữ lại nếu muốn phân loại)
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },

    // Trạng thái bài viết (ẩn, nháp, công khai)
    status: {
      type: DataTypes.ENUM('draft', 'published', 'hidden'),
      defaultValue: 'published'
    },

    // Tác giả
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE'
    }
  }, {
    tableName: 'blogs',
    timestamps: true, // Tự động có createdAt, updatedAt
    paranoid: true    // Soft delete (có deletedAt)
  });

  Blog.associate = (models) => {
    Blog.belongsTo(models.User, { foreignKey: 'authorId', as: 'author' });

    Blog.hasMany(models.BlogMedia, {
      foreignKey: 'blogId',
      as: 'media',
      onDelete: 'CASCADE'
    });

    // Nếu sau này có comments / likes
    if (models.Comment) {
      Blog.hasMany(models.Comment, { foreignKey: 'postId', as: 'comments' });
    }
    if (models.Like) {
      Blog.hasMany(models.Like, { foreignKey: 'postId', as: 'likes' });
    }
  };

  return Blog;
};

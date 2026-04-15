// models/blogmedia.js
module.exports = (sequelize, DataTypes) => {
  const BlogMedia = sequelize.define('BlogMedia', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    blogId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'blogs', key: 'id' },
      onDelete: 'CASCADE'
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('image', 'file'),
      allowNull: false
    },
    originalName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending','uploaded','error'),
      defaultValue: 'pending'
    },
    publicId: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'blog_medias',
    timestamps: true,
    paranoid: false
  });

  BlogMedia.associate = (models) => {
    BlogMedia.belongsTo(models.Blog, { foreignKey: 'blogId', as: 'blog' });
  };

  return BlogMedia;
};

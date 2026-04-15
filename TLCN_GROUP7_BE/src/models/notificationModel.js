module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    // Recipient of the notification
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    message: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    type: { 
      type: DataTypes.ENUM('SYSTEM', 'FOLLOW', 'COMMENT', 'LIKE', 'REPLY', 'MESSAGE'), 
      defaultValue: 'SYSTEM' 
    },
    isRead: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: false 
    },
    // Reference data for navigation
    blogId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'blogs',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    commentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'comments',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    // Who triggered the notification (liker, commenter, etc.)
    actorId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    // For message notifications
    conversationId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'conversations',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    messageId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'messages',
        key: 'id'
      },
      onDelete: 'CASCADE'
    }
  }, {
    tableName: 'notifications',
    timestamps: true
  });

  Notification.associate = (models) => {
    // Recipient of notification
    Notification.belongsTo(models.User, { 
      foreignKey: 'userId', 
      as: 'user' 
    });
    
    // Who performed the action
    Notification.belongsTo(models.User, { 
      foreignKey: 'actorId', 
      as: 'actor' 
    });
    
    // Related blog post
    Notification.belongsTo(models.Blog, { 
      foreignKey: 'blogId', 
      as: 'blog' 
    });
    
    // Related comment
    Notification.belongsTo(models.Comment, { 
      foreignKey: 'commentId', 
      as: 'comment' 
    });
  };

  return Notification;
};

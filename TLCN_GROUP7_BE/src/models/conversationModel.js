module.exports = (sequelize, DataTypes) => {
  const Conversation = sequelize.define('Conversation', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    type: { 
      type: DataTypes.ENUM('PRIVATE', 'GROUP'), 
      defaultValue: 'PRIVATE' 
    }
  }, {
    tableName: 'conversations',
    timestamps: true
  });

  Conversation.associate = (models) => {
    // Một conversation có nhiều user tham gia
    Conversation.belongsToMany(models.User, { 
      through: 'ConversationMembers', 
      foreignKey: 'conversationId',
      otherKey: 'userId'
    });

    Conversation.hasMany(models.Message, { foreignKey: 'conversationId' });
  };

  return Conversation;
};

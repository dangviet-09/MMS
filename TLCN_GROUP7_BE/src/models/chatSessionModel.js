module.exports = (sequelize, DataTypes) => {
  const ChatSession = sequelize.define(
    'ChatSession',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      studentId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'students',
          key: 'id'
        },
        onDelete: 'CASCADE',
        unique: true // One session per student
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: 'Trò chuyện với AI'
      },
      messages: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
        // Format: [{role: 'user'|'assistant', content: string, timestamp: Date}]
      },
      studentContext: {
        type: DataTypes.JSON,
        allowNull: true
        // Snapshot of student's learning progress when session created
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    },
    {
      tableName: 'chat_sessions',
      timestamps: true
    }
  );

  ChatSession.associate = (models) => {
    ChatSession.belongsTo(models.Student, {
      foreignKey: 'studentId',
      as: 'student'
    });
  };

  return ChatSession;
};

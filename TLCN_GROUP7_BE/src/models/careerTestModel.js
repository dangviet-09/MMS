// models/CareerTest.js
module.exports = (sequelize, DataTypes) => {
  const CareerTest = sequelize.define('CareerTest', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      defaultValue: 'Bài trắc nghiệm định hướng nghề nghiệp'
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: 'Bài test giúp xác định chuyên ngành phù hợp với sinh viên dựa trên sở thích và năng lực.'
    },
    questions: {
      type: DataTypes.JSON, // Lưu toàn bộ danh sách câu hỏi
      allowNull: false
    }
  }, {
    tableName: 'career_tests',
    timestamps: true
  });

  return CareerTest;
};

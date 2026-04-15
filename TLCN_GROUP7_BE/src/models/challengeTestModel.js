module.exports = (sequelize, DataTypes) => {
  const ChallengeTest = sequelize.define('ChallengeTest', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    image: { type: DataTypes.STRING, allowNull: true },
    fileUrl: { type: DataTypes.STRING, allowNull: true },
    description: { type: DataTypes.TEXT },
    deadline: { type: DataTypes.DATE },
    maxScore: { type: DataTypes.FLOAT, defaultValue: 100 }
  }, {
    tableName: 'challenge_tests',
    timestamps: true
  });

  ChallengeTest.associate = (models) => {
    ChallengeTest.belongsTo(models.Company, { foreignKey: 'companyId' });
    ChallengeTest.hasMany(models.ChallengeSubmission, { foreignKey: 'challengeTestId' });
  };

  return ChallengeTest;
};

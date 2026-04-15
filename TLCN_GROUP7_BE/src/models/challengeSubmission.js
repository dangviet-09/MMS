module.exports = (sequelize, DataTypes) => {
  const ChallengeSubmission = sequelize.define('ChallengeSubmission', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    submittedFile: { type: DataTypes.STRING }, // link file zip upload
    submittedCode: { type: DataTypes.TEXT },   // nếu là coding trực tiếp
    score: { type: DataTypes.FLOAT },
    feedback: { type: DataTypes.TEXT }
  }, {
    tableName: 'challenge_submissions',
    timestamps: true
  });

  ChallengeSubmission.associate = (models) => {
    ChallengeSubmission.belongsTo(models.ChallengeTest, { foreignKey: 'challengeTestId' });
    ChallengeSubmission.belongsTo(models.Student, { foreignKey: 'studentId' });
  };

  return ChallengeSubmission;
};

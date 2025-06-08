module.exports = (sequelize, DataTypes) => {
  const Submission = sequelize.define('Submission', {
    submissionID: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    testID: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'Test',
        key: 'testID',
      },
    },
    studentID: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'User',
        key: 'userID',
      },
    },
    score: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    },
    timeTaken: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    modelName: 'Submission',
    tableName: 'Submission',
    timestamps: true,
  });

  return Submission;
};
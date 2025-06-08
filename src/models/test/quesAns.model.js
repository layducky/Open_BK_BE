
module.exports = (sequelize, DataTypes) => {
  const quesAnswer = sequelize.define('quesAnswer', {
    quesAnswerID: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    submissionID: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Submission',
        key: 'submissionID',
      },
    },
    questionID: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'Question',
        key: 'questionID',
      },
    },
    selectedAnswer: {
      type: DataTypes.ENUM('A', 'B', 'C', 'D'),
      allowNull: false,
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  }, {
    tableName: 'quesAnswer',
    modelName: 'quesAnswer',
    timestamps: true,
  });

  return quesAnswer;
};
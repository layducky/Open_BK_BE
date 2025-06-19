
module.exports = (sequelize, DataTypes) => {
  const quesAns = sequelize.define('quesAns', {
    quesAnsID: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
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
    selectedAns: {
      type: DataTypes.ENUM('A', 'B', 'C', 'D', 'NULL'),
      allowNull: false,
      defaultValue: 'NULL'
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      default: false
    },
  }, {
    tableName: 'quesAns',
    modelName: 'quesAns',
    indexes: [
      {
        unique: true,
        fields: ['submissionID', 'questionID']
      }
    ]
  });

  return quesAns;
};
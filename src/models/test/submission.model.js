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
    numericalOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'submitted', 'graded'),
      allowNull: false,
      defaultValue: 'pending',
    },
    numRightAns: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    totalScore: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: -1.0,
    },
    timeTaken: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    submittedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
  }, {
    modelName: 'Submission',
    tableName: 'Submission',
    timestamps: true,
    hooks: {
      beforeUpdate: (instance, options) => {
        if (instance.status === 'submitted' && instance.changed('status') && !instance.submittedAt) {
          instance.submittedAt = new Date();
        }
      },
    },
  });

  return Submission;
};
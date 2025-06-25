module.exports = (sequelize, DataTypes) => {
  const Submission = sequelize.define('Submission', {
    submissionID: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    userTestID: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'UserTest',
        key: 'userTestID',
      },
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
    },
    status: {
      type: DataTypes.ENUM('ongoing', 'submitted', 'graded', 'failed'),
      allowNull: false,
      defaultValue: 'ongoing',
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
    indexes: [
      {
        unique: true,
        fields: ['userTestID', 'numericalOrder'],
        name: 'unique_user_test_order'
      }
    ],
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
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
    numQuests: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: '15',
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
      beforeCreate: async (instance, options) => {
        const test = await sequelize.models.Test.findByPk(instance.testID);
        if (test) {
          instance.numQuests = test.numQuests;
          instance.duration = test.duration;
        }
      },
      beforeUpdate: (instance, options) => {
        if (instance.status === 'submitted' && instance.changed('status') && !instance.submittedAt) {
          instance.submittedAt = new Date();
        }
      },
    },
  });

  return Submission;
};

module.exports = (sequelize, DataTypes) => {

  return sequelize.define("Question", {
    questionID: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    testID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    numericalOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    explanation: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    correctAns: {
      type: DataTypes.ENUM('A', 'B', 'C', 'D','NULL'),
      allowNull: false,
      defaultValue: 'NULL'
    },
    ansA: {
      type: DataTypes.TEXT,
      allowNull:false,
      defaultValue: ''
    },
    ansB: {
      type: DataTypes.TEXT,
      allowNull:false,
      defaultValue: ''
    },
    ansC: {
      type: DataTypes.TEXT,
      allowNull:false,
      defaultValue: ''
    },
    ansD: {
      type: DataTypes.TEXT,
      allowNull:false,
      defaultValue: ''
    },
  }, {
    modelName: 'Question',
    tableName: 'Question',
    indexes: [{
      unique: true,
      fields: ['testID', 'numericalOrder'],
      msg: 'Question with this order already exists.',
    }]
  });
};

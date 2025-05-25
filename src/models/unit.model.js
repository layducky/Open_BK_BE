const { Sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Unit", {
    unitID: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    courseID: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'Course',
        key: 'courseID',
      },
    },
    numericalOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unitName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    numberOfQuestions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
  }, {
    modelName: 'Unit',
    tableName: 'Units',
    indexes: [{
      unique: true,
      fields: ['courseID', 'numericalOrder'],
      msg: 'Unit with this order already exists.',
    }],
    timestamps: true,
  });
};
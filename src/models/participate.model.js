const { Sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Participate", {
    learnerID: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'User',
        key: 'userID',
      },
    },
    courseID: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'Course',
        key: 'courseID',
      },
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'COMPLETED', 'DROPPED'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
  }, {
    modelName: 'Participate',
    tableName: 'Participate',
    timestamps: true,
  });
};
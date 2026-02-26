'use strict';
const { Sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Course", {
    courseID: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    authorID: {
      type: DataTypes.STRING,
      references:{
        model: 'User',
        key: 'userID'
      },
      allowNull: false
    },
    courseName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
    },
    category: {
      type: DataTypes.ENUM('MATH', 'ENGLISH', 'CODE', 'ART', 'NONE'),
      defaultValue: 'NONE',
      allowNull: false,
    },
    price:{
      type: DataTypes.STRING,
      defaultValue: 'Free',
      allowNull: false
    },
    enrolledStudentsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    contentUpdatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  }, {
    modelName: 'Course',
    tableName: 'Course',
    timestamps: true,
  });
}

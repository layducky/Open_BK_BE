'use strict';
const { Sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {

  return sequelize.define("contQuestion", {
      contQuestionID:{
         type: DataTypes.UUID,
         primaryKey: true,
         defaultValue: DataTypes.UUIDV4,
      },
      content: {
         type: DataTypes.TEXT,
         allowNull:false
      },
      explanation: {
         type: DataTypes.TEXT,
         allowNull: true,
      },
      userID: {
         type: DataTypes.STRING,
         allowNull: false
      },
      courseID: {
         type: DataTypes.STRING,
         references: {
            model: 'Course',
            key: 'courseID',
         },
         allowNull: false
      },
      correctAnswer: {
         type: DataTypes.ENUM('A', 'B', 'C', 'D'),
         allowNull: false,
      },
      answerA: {
         type: DataTypes.TEXT,
         allowNull:false
      },
      answerB: {
         type: DataTypes.TEXT,
         allowNull:false
      },
      answerC: {
         type: DataTypes.TEXT,
         allowNull:false
      },
      answerD: {
         type: DataTypes.TEXT,
         allowNull:false
      },
   },{
   sequelize,
   modelName: 'contQuestion',
   tableName: 'contQuestion',
  });
};
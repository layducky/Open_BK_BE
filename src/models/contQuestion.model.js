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
      correctAns: {
         type: DataTypes.ENUM('A', 'B', 'C', 'D'),
         allowNull: false,
      },
      ansA: {
         type: DataTypes.TEXT,
         allowNull:false
      },
      ansB: {
         type: DataTypes.TEXT,
         allowNull:false
      },
      ansC: {
         type: DataTypes.TEXT,
         allowNull:false
      },
      ansD: {
         type: DataTypes.TEXT,
         allowNull:false
      },
   },{
   sequelize,
   modelName: 'contQuestion',
   tableName: 'contQuestion',
  });
};
'use strict';
const { Sequelize } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Material", {
    id:{
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    data: {
      type: DataTypes.BLOB('long'),
      allowNull:false
    },
    seen: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    userID: {
      type: DataTypes.STRING,
      references:{
        model:'User',
        key:'userID'
      },
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
  },{
    modelName: 'Material',    
    tableName: 'Material',
  });
};
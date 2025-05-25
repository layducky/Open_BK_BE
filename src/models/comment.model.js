const { Sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {

  return sequelize.define("Comment", {
    commentID: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    userID: {
      type: DataTypes.STRING,
      references:{
        model: 'User',
        key: 'userID'
      },
      allowNull: false
    },
    parentID: {
      type: DataTypes.UUID,
      references:{
        model: 'Comment',
        key:'commentID'
      },
      allowNull: true
    }
  }, {
    modelName: 'Comment',
    tableName: 'Comment',
  });
};
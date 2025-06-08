const { Sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {

  return sequelize.define("Preview", {
    previewID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    descriptionHeader: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    descriptionFull: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    objective: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: true,
    },
    courseID: {
      type: DataTypes.STRING,
      references: {
        model: 'Course',
        key: 'courseID',
      },
      allowNull: false,
    },
  }, {
    modelName: 'Preview',
    tableName: 'Preview',
  });
};

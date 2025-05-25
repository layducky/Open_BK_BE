const { Sequelize } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  return sequelize.define("User", {
    userID: {
      type: DataTypes.STRING,
      unique: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('LEARNER', 'COLLAB', 'ADMIN'),
      allowNull: false,
      defaultValue: 'LEARNER',
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
    },
    phoneNumber: {
      type: DataTypes.STRING,
    },
    biography: {
      type: DataTypes.STRING,
    },

  }, {
    modelName: 'User',
    tableName: 'User',
    timestamps: true, 
  });
};


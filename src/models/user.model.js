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
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    biography: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    provider: {
      type: DataTypes.ENUM('credentials', 'google', 'github', 'facebook'),
      allowNull: false,
    },
    providerId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
    },

  }, {
    modelName: 'User',
    tableName: 'User',
    timestamps: true, 
  });
};


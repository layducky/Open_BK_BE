module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Unit", {
    unitID: {
      type: DataTypes.STRING,
      primaryKey: true,
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
      unique: true,
    },

    unitName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    modelName: 'Unit',
    tableName: 'Unit',
    timestamps: true,
  });
};
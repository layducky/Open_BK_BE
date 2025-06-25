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
    indexes: [
      {
        unique: true,
        fields: ['courseID', 'numericalOrder'],
        name: 'unique_course_unit_order'
      }
    ]
  });
};
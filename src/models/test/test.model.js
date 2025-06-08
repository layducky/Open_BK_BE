

module.exports = (sequelize, DataTypes) => {

    return sequelize.define("Test", {
        testID: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        unitID: {
            type: DataTypes.STRING,
            references: {
                model: 'Unit',
                key: 'unitID',
            },
            allowNull: false,
        },
        testName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        numberOfQuestions: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Duration in minutes',
        },
    }, {
        modelName: 'Test',
        tableName: 'Test',
    });
};

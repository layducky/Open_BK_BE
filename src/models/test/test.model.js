

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
        numericalOrder: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        numQuests: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        modelName: 'Test',
        tableName: 'Test',
    });
};

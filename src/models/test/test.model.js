

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
        maxAttempts: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 99999,
        },
        openDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        closeDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        modelName: 'Test',
        tableName: 'Test',
        indexes: [{
            unique: true,
            fields: ['unitID', 'numericalOrder'],
            name: 'unique_unit_test_order'
        }]
    });
};

module.exports = (sequelize, DataTypes) => {

    return sequelize.define("UserTest", {
        userTestID: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        userID: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        testID: {
            type: DataTypes.STRING,
            references: {
                model: 'Test',
                key: 'testID',
            },
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('allow', 'continue', 'closed', 'forbidden'),
            allowNull: false,
            defaultValue: 'allow',
        },
        maxAttempts: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 99999,
        },
    }, {
        modelName: 'UserTest',
        tableName: 'UserTest',
    });
};

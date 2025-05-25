const { Sequelize } = require("sequelize");

module.exports = (sequelize, DataTypes) => {

    return sequelize.define("Test", {
        testID: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        courseID: {
            type: DataTypes.STRING,
            references: {
                model: 'Course',
                key: 'courseID',
            },
            allowNull: false,
        },
        userID: {
            type: DataTypes.STRING,
            references: {
                model: 'User',
                key: 'userID',
            },
            allowNull: false,
        },
        takenDate:{
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.NOW
        },
        correctAnswers: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        numberOfQuestions: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        //seconds
        takenTime: {
            type: DataTypes.INTEGER,
            allowNull:false
        },
        score: {
            type: DataTypes.DECIMAL(1),
            allowNull:false
        },
    }, {
        modelName: 'Test',
        tableName: 'Test',
    });
};

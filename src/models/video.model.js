module.exports = (sequelize, DataTypes) => {
    return sequelize.define("Video", {
        videoID: {
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
        videoName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fileKey: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fileUrl: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fileType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        numericalOrder: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        contentUpdatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW,
        },
    }, {
        modelName: 'Video',
        tableName: 'Video',
        timestamps: true,
        indexes: [{
            unique: true,
            fields: ['unitID', 'numericalOrder'],
            name: 'unique_unit_video_order'
        }]
    });
};

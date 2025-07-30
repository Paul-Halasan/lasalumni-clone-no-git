const { DataTypes } = require('sequelize');
const sequelize = require(".././lib/db");

const Notification = sequelize.define(
    'Notification', 
    {
    notifID: {
        type: DataTypes.STRING(10),
        primaryKey: true,
    },
    message: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    directTo: {
        type: DataTypes.STRING(45),
        allowNull: false
    },
    isRead: {
        type: DataTypes.TINYINT,
        defaultValue: 0,
        allowNull: false
    },
    userID: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    timestamps: false,
    tableName: 'notif',
});

module.exports = Notification;
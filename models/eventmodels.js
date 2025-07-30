const { DataTypes } = require("sequelize");
const sequelize = require(".././lib/db");

const Event = sequelize.define(
    'Event', 
    {
    eventID: {
        type: DataTypes.STRING(10),
        primaryKey: true,
        allowNull: false
    },
    eventTitle: {
        type: DataTypes.STRING(45),
        allowNull: false
    },
    eventImage: {
        type: DataTypes.STRING(2083),
        allowNull: true
    },
    eventStart: {
        type: DataTypes.DATE,
        allowNull: false
    },
    eventEnd: {
        type: DataTypes.DATE,
        allowNull: false
    },
    isFreeEvent: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    eventDesc: {
        type: DataTypes.STRING(2083),
        allowNull: true
    },
    isApproved: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    submittedBy: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    going: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    eventType: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    meetingLink: {
        type: DataTypes.STRING(2083),
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    tableName: 'events',
    timestamps: false
});

module.exports = Event;
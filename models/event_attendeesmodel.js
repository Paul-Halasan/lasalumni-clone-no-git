const { DataTypes } = require("sequelize");
const sequelize = require(".././lib/db");

const EventAttendees = sequelize.define(
    'EventAttendees', 
    {
    eventID: {
        type: DataTypes.STRING(10),
        primaryKey: true,
        allowNull: false
    },
    userID: {
        type: DataTypes.STRING(10),
        primaryKey: true,
        allowNull: false
    },
    saveToUser: {
        type: DataTypes.STRING(2083),
        allowNull: true
    },
    isFacilitator: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    isAttend: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    
}, {
    tableName: 'event_attendees',
    timestamps: false
});

module.exports = EventAttendees;
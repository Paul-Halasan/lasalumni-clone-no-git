const { DataTypes } = require('sequelize');
const sequelize = require(".././lib/db");// Assuming you have a sequelize instance exported in your config

const AlumniEducation = sequelize.define('alumni_educationbg', {
    education_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    degree: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    school: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    userID: {
        type: DataTypes.STRING(10),
        allowNull: false,
        references: {
            model: 'usertable', 
            key: 'userID'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
    tableName: 'alumni_educationbg',
    timestamps: false, 
});

module.exports = AlumniEducation;

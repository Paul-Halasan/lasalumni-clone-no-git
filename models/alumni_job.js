const { DataTypes } = require('sequelize');
const sequelize = require("../lib/db");

const AlumniJobExperience = sequelize.define('AlumniJobExperience', {

  jobexp_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  jobtitle: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  companyname: {
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
    allowNull: true,
    references: {
      model: 'usertable', // Name of the referenced table
      key: 'userID'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
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
  tableName: 'alumni_jobexperience',
  timestamps: false
});

module.exports = AlumniJobExperience;

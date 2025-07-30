const { DataTypes } = require("sequelize");
const sequelize = require("../lib/db");

const JobApplicant = sequelize.define('JobApplicant', {
    application_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    job_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Job', // Name of the Job model
        key: 'job_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    applicant_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      references: {
        model: 'User', // Name of the User model
        key: 'userID',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    resume_path: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
      defaultValue: 'pending',
    },
    applied_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'job_applicants',
    timestamps: false,
  });
  
  module.exports = JobApplicant;
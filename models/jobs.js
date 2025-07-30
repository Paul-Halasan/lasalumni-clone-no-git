const { DataTypes } = require("sequelize");
const sequelize = require("../lib/db");
const PartnerCompany = require("./PartnerCompany");

const Job = sequelize.define(
  "Job",
  {
    job_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    userID: {
      type: DataTypes.STRING(255),
      allowNull: false,
      references: {
        model: "usertable",
        key: "userID",
      },
    },

    company_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    job_title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    job_description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    deadline: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    requirements: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    industry: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    job_status: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    additional_info: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    isApproved: {
      type: DataTypes.ENUM("approved", "pending", "denied"), // Updated to ENUM
      defaultValue: "pending",
      allowNull: true,
    },
    isAccepting: {
      type: DataTypes.BOOLEAN,
      field: "isAccepting",
      defaultValue: true,
      allowNull: true,
    },
  },
  {
    tableName: "jobs",
    timestamps: false, // Disable automatic timestamp management as we are managing created_at and updated_at manually
  }
);

Job.belongsTo(PartnerCompany, { foreignKey: "userID", as: "company" });
PartnerCompany.hasMany(Job, { foreignKey: "userID" });

module.exports = Job;

const { DataTypes } = require("sequelize");
const sequelize = require(".././lib/db");
const User = require("./usermodel");
const { link } = require("fs");

const AlumniProfile = sequelize.define(
  "AlumniProfile",
  {
    profile_ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    userID: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "userID",
      },
      allowNull: false,
    },

    last_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    middle_name: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    mobile_number: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    telephone_number: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    email_address: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    region: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    province: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    profile_picture: {
      type: DataTypes.STRING(2048),
      allowNull: true,
    },

    date_of_birth: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    civil_status: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    nationality: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    batch: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    program: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    resume: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    job_profession: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },

    job_status: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    prof_summary: {
      type: DataTypes.TEXT("long"),
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
    fb_link: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    linkedin_link: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
  },
  {
    tableName: "alumni_profile",
    timestamps: false
  }
);

AlumniProfile.belongsTo(User, { foreignKey: "userID", as: "user" });
User.hasOne(AlumniProfile, { foreignKey: "userID", as: "alumniProfile" });

module.exports = AlumniProfile;

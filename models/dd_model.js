const { DataTypes } = require("sequelize");
const sequelize = require(".././lib/db");

const DonationDrive = sequelize.define(
  "DonationDrive",
  {
    dd_listID: {
      type: DataTypes.STRING(11), // Match VARCHAR(11) in the database
      primaryKey: true,
    },
    dd_title: {
      type: DataTypes.STRING(45),
      allowNull: false,
    },
    dd_image: {
      type: DataTypes.STRING(2048), // Match VARCHAR(2048) in the database
      allowNull: false,
    },
    dd_desc: {
      type: DataTypes.STRING(2048), // Match VARCHAR(2048) in the database
      allowNull: false,
    },
    submitted_by: {
      type: DataTypes.STRING(10), // Match VARCHAR(10) in the database
      allowNull: false,
    },
    isApproved: {
      type: DataTypes.TINYINT, // Match tinyint in the database
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },
  {
    tableName: "dd_list", // Table name in the database
    timestamps: false
  }
);

module.exports = DonationDrive;
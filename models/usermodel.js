const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require(".././lib/db");

const User = sequelize.define(
  "User",
  {
    userID: {
      type: DataTypes.STRING(10), // Match VARCHAR(10) in the database
      primaryKey: true,
    },
    userName: {
      type: DataTypes.STRING(50), // Match VARCHAR(50) in the database
      allowNull: false,
      unique: true, // Add unique constraint
    },
    passWord: {
      type: DataTypes.STRING(255), // Password should typically have larger length for hashing
      allowNull: false,
    },
    userType: {
      type: DataTypes.ENUM("admin", "alumni", "partner"),
      allowNull: false,
    },
    last_login: {
      type: DataTypes.DATE,
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
  },
  {
    tableName: "usertable", // Table name in the database
    timestamps: false
  }
);

module.exports = User;

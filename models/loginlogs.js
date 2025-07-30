// models/loginlog.js
import { DataTypes } from "sequelize";
const sequelize = require("../lib/db");

const LoginLog = sequelize.define(
  "LoginLog",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userID: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    userName: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    userType: {
      type: DataTypes.ENUM("admin", "alumni", "partner"),
      allowNull: true,
    },
    login_time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    success: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "login_logs",
    timestamps: false,
  }
);

export default LoginLog;

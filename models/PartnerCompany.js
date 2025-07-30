const { DataTypes } = require("sequelize");
const sequelize = require("../lib/db");
const User = require("./usermodel");

const PartnerCompany = sequelize.define(
  "PartnerCompany",
  {
    company_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userID: {
      type: DataTypes.STRING(255),
      references: {
        model: User,
        key: "userID",
      },
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    company_logo: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    industry: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    contract: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    effective_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expiry_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    contact_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    contact_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    facebook: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    linkedin: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    account_status: {
      type: DataTypes.STRING(45),
      allowNull: true,
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
    tableName: "partnercompany",
    timestamps: false
  }
);

PartnerCompany.belongsTo(User, { foreignKey: "userID", as: "user" });
User.hasOne(PartnerCompany, { foreignKey: "userID", as: "partnerCompany" });

module.exports = PartnerCompany;

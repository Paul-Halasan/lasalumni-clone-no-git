// db.js
const { Sequelize } = require('sequelize');
// require('./associations');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT, 
  dialect: 'mysql',
  dialectModule: require('mysql2')
});

module.exports = sequelize;

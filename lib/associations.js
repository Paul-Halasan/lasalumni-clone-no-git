const User = require('../models/usermodel');
const AlumniProfile = require('../models/AlumniProfile');

// Define associations
User.hasOne(AlumniProfile, { foreignKey: 'userID' });
AlumniProfile.belongsTo(User, { foreignKey: 'userID' });

module.exports = { User, AlumniProfile };
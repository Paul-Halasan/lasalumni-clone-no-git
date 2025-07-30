const { Op } = require('sequelize');
const sequelize = require('../../lib/db');
const User = require('../../models/usermodel');

module.exports = {
    // Create
    addUser: async (userName, passWord, userType) => {
      try {
        const user = await User.create({ userName, passWord, userType });
        console.log('User added:', user.userName);
      } catch (err) {
        console.error('Error adding user:', err);
      }
    },

    // Read
    getUsers: async () => {
      try {
        const users = await User.findAll();
        console.log('Users:', users);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    },

    // Update
    updateUser: async (userName, newPassWord, newUserType) => {
      try {
        const [updated] = await User.update(
          { passWord: newPassWord, userType: newUserType },
          { where: { userName } }
        );
        if (updated) {
          console.log('User updated:', userName);
        } else {
          console.log('User not found:', userName);
        }
      } catch (err) {
        console.error('Error updating user:', err);
      }
    },

    // Delete
    deleteUser: async (userName) => {
      try {
        const deleted = await User.destroy({ where: { userName } });
        if (deleted) {
          console.log('User deleted:', userName);
        } else {
          console.log('User not found:', userName);
        }
      } catch (err) {
        console.error('Error deleting user:', err);
      }
    },
};

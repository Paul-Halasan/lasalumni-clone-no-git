import fs from 'fs';
import User from '../../models/usermodel'; // Import Sequelize User model
import AlumniProfile from '../../models/AlumniProfile'; // Import Sequelize AlumniProfile model
import LoginLog from '../../models/loginlogs';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Extract userID from the request body
  const { userID } = req.body;

  try {
    // Fetch the user's profile to get the file paths
    const existingProfile = await AlumniProfile.findOne({ where: { userID } });

    if (!existingProfile) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { profile_picture, resume } = existingProfile;

    // Delete all login logs associated with the user
    await LoginLog.destroy({ where: { userID } });

    // Delete the user from usertable and alumni_profile using Sequelize
    await AlumniProfile.destroy({ where: { userID } });
    await User.destroy({ where: { userID } });

    // Remove files from storage if they exist
    if (profile_picture && fs.existsSync(`./public${profile_picture}`)) {
      fs.unlinkSync(`./public${profile_picture}`); // Remove profile picture
    }

    if (resume && fs.existsSync(`./public${resume}`)) {
      fs.unlinkSync(`./public${resume}`); // Remove resume
    }

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

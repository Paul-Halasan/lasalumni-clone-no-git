import User from '../../../models/usermodel';
import { getServerTime } from '../../../utils/getServerTime';

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const { userID, userName, passWord } = req.body;

    // Validate input
    if (!userID || !userName || !passWord) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    try {
      // Find the user by ID
      const user = await User.findByPk(userID);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get authoritative server time
      const serverDateTime = await getServerTime("datetime");
      const now = new Date(serverDateTime);

      // Update user details
      user.userName = userName;
      user.passWord = passWord; // Ensure to hash the password before saving in a real application
      user.updatedAt = now;

      await user.save();

      return res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
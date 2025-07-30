import User from '../../../models/usermodel'; // Import Sequelize User model

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username } = req.body;

    try {
      const existingUser = await User.findOne({ where: { userName: username } });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      return res.status(200).json({ message: 'Username is available' });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
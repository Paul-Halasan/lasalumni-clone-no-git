import { encrypt } from '../../utils/crypto';
import User from '../../models/usermodel';
import sequelize from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  //change para maredeply sa vercel

  try {
    await sequelize.authenticate(); // Ensure DB connection is established

    // Find the user with userName "testupload"
    const user = await User.findOne({ where: { userName: "testupload" } });

    if (!user) {
      return res.status(404).json({ error: 'User "testupload" not found.' });
    }

    // Set the new password (example: userName + '123')
    const plainPassword = user.passWord;
    console.log('Plain password:', plainPassword);

    // Encrypt the password
    const encryptedPassword = encrypt(plainPassword);

    // Update and save the user's password
    user.passWord = encryptedPassword;
    await user.save();

    res.status(200).json({
      message: 'Password for "testupload" has been encrypted and updated.',
      userName: user.userName,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
}
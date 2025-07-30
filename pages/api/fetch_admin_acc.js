import User from "../../models/usermodel";
import { encrypt, decrypt } from "../../utils/crypto"; // Import encrypt and decrypt functions

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const admin = await User.findOne({ where: { userType: "admin" } });
      if (!admin) {
        return res.status(404).json({ message: "Admin account not found" });
      }

      // Decrypt the password if needed (optional, for debugging or admin purposes)
      const decryptedPassword = decrypt(admin.passWord);

      return res.status(200).json({
        userName: admin.userName,
        passWord: decryptedPassword, // Return decrypted password (optional, remove in production)
      });
    } catch (error) {
      console.error("Error fetching admin account:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else if (req.method === "PUT") {
    const { userName, passWord } = req.body;

    if (!userName || !passWord) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    try {
      const admin = await User.findOne({ where: { userType: "admin" } });
      if (!admin) {
        return res.status(404).json({ message: "Admin account not found" });
      }

      // Encrypt the password before saving
      const encryptedPassword = encrypt(passWord);

      // Update admin account
      admin.userName = userName;
      admin.passWord = encryptedPassword;
      await admin.save();

      return res.status(200).json({ message: "Admin account updated successfully" });
    } catch (error) {
      console.error("Error updating admin account:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
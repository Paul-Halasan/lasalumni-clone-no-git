const User = require("../../models/usermodel");
const jwt = require("jsonwebtoken");
const { parseCookies } = require("nookies");
const { encrypt, decrypt } = require("../../utils/crypto"); // Import encrypt and decrypt functions
const { getServerTime } = require("../../utils/getServerTime"); // Import getServerTime

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { userID, currentPassword, newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ message: "New password is required." });
  }

  try {
    // Retrieve access token from cookies
    const cookies = parseCookies({ req });
    const token = cookies["access-token"];
    const secret = process.env.JWT_SECRET;

    if (!token) {
      return res.status(401).json({ message: "Access token is missing or invalid." });
    }

    // Decode the access token
    const decodedToken = jwt.verify(token, secret);
    const userType = decodedToken.userType;

    let user;
    if (userType === "admin") {
      // Admin can bypass userID and current password check
      user = await User.findOne({ where: { userID } });
    } else {
      // Regular user must provide userID and current password
      if (!userID || !currentPassword) {
        return res.status(400).json({ message: "UserID and current password are required for non-admin users." });
      }

      user = await User.findOne({ where: { userID } });

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      // Decrypt the stored password and compare it with the provided current password
      const decryptedPassword = decrypt(user.passWord);
      if (decryptedPassword !== currentPassword) {
        return res.status(401).json({ message: "Current password is incorrect." });
      }
    }

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Encrypt the new password before saving
    user.passWord = encrypt(newPassword);

    // Get authoritative server time and set updatedAt
    const serverDateTime = await getServerTime("datetime");
    user.updatedAt = new Date(serverDateTime);

    await user.save();

    return res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
}
import User from "../../models/usermodel";
import jwt from "jsonwebtoken";
import { parseCookies } from "nookies";
import { getServerTime } from "../../utils/getServerTime";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, newUsername } = req.body;

  if (!username || !newUsername) {
    return res.status(400).json({ error: "Current username and new username are required." });
  }

  try {
    // Retrieve access token from cookies
    const cookies = parseCookies({ req });
    const token = cookies["access-token"];
    const secret = process.env.JWT_SECRET;

    if (!token) {
      return res.status(401).json({ error: "Access token is missing or invalid." });
    }

    // Decode the access token
    const decodedToken = jwt.verify(token, secret);
    const userID = decodedToken.userID;
    const userType = decodedToken.userType;

    let user;
    if (userType === "admin") {
      // Admin can bypass userID check
      user = await User.findOne({ where: { userName: username } });
    } else {
      // Regular user must provide matching userID and username
      user = await User.findOne({ where: { userID, userName: username } });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found or username does not match." });
    }

    // Check if the new username already exists
    const existingUser = await User.findOne({ where: { userName: newUsername } });

    if (existingUser) {
      return res.status(400).json({ error: "Username already exists. Please choose another." });
    }

    // Get authoritative server time
    const serverDateTime = await getServerTime("datetime");
    user.userName = newUsername;
    user.updatedAt = new Date(serverDateTime);

    await user.save();

    return res.status(200).json({ message: "Username updated successfully." });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.log("Token expired, please refresh the token.");
      return res.status(401).json({ error: "Token expired, please refresh the token." });
    } else {
      console.error("Error updating username:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  }
}
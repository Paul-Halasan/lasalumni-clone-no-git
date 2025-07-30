import { serialize } from "cookie";
import { sign, verify } from "jsonwebtoken";
import User from "../../models/usermodel";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Retrieve the token from cookies or headers
    const token =
      req.cookies["access-token"] || req.headers.authorization?.split(" ")[1];
    const secret = process.env.JWT_SECRET;
    const refreshSecret = process.env.REFRESHJWT_SECRET;

    console.log("Access Token (debug only):", token);

    if (!token) {
      return res.status(401).json({ error: "Access token is missing or invalid." });
    }

    // Verify the current access token
    const decoded = verify(token, secret);
    const userID = decoded.userID;

    // Fetch the updated user data from the database
    const user = await User.findOne({ where: { userID } });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Generate new tokens with the updated username
    const newAccessToken = sign(
      { userName: user.userName, userType: user.userType, userID: user.userID },
      secret,
      { expiresIn: "10m" }
    );

    const newRefreshToken = sign(
      { userName: user.userName, userType: user.userType, userID: user.userID },
      refreshSecret,
      { expiresIn: "7d" }
    );

    // Serialize the new tokens into cookies
    const accessTokenSerialized = serialize("access-token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    });

    const refreshTokenSerialized = serialize("refresh-token", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // Set the new cookies
    res.setHeader("Set-Cookie", [accessTokenSerialized, refreshTokenSerialized]);

    return res.status(200).json({ message: "Tokens updated successfully." });
  } catch (error) {
    console.error("Error updating tokens:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
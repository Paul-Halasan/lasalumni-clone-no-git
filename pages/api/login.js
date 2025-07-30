import { serialize } from "cookie";
import { sign } from "jsonwebtoken";
import { decrypt } from "../../utils/crypto";
import User from "../../models/usermodel";
import PartnerCompany from "../../models/PartnerCompany";
import LoginLog from "../../models/loginlogs";
import { getServerTime } from '../../utils/getServerTime';

// Add node-fetch for server time
import fetch from "node-fetch";


export default async function handler(req, res) {
  if (req.method === "POST") {
    const { userName, passWord } = req.body;

    try {
      // Find the user
      const user = await User.findOne({ where: { userName } });

      if (!user) {
        return res.status(401).json({ error: "Invalid username or password." });
      }

      // Decrypt the stored password
      const decryptedPassword = decrypt(user.passWord);

      // Compare the provided password with the decrypted password
      if (decryptedPassword !== passWord) {
        return res.status(401).json({ error: "Invalid username or password." });
      }

      // Use authoritative server date
      const serverDateTime = await getServerTime("datetime");
      const today = new Date(serverDateTime);

      // Check all companies for expired or soon-to-expire contracts
      const companies = await PartnerCompany.findAll();

      for (const company of companies) {
        const effectiveDate = new Date(company.effective_date);
        const expiryDate = new Date(company.expiry_date);

        if (!company.effective_date || !company.expiry_date) {
          continue; // Skip companies with missing dates
        }

        if (today > expiryDate) {
          // Contract is expired
          company.account_status = "Inactive";
          await company.save();
        }
      }

      // Check if the user is associated with a partner company
      const company = await PartnerCompany.findOne({ where: { userID: user.userID } });

      if (company) {
        const expiryDate = new Date(company.expiry_date);

        if (today > expiryDate) {
          // Deny login access for expired companies
          return res.status(403).json({
            error: "Your account is inactive due to an expired or invalid contract. Please coordinate with the DLSU-D Alumni Association to renew your contract.",
          });
        }
      }

      // Generate tokens for active users
      const secret = process.env.JWT_SECRET;
      const refreshSecret = process.env.REFRESHJWT_SECRET;

      const token = sign(
        { userName, userType: user.userType, userID: user.userID },
        secret,
        { expiresIn: "10m" }
      );

      const refreshToken = sign(
        { userName, userType: user.userType, userID: user.userID },
        refreshSecret,
        { expiresIn: "7d" }
      );

      // Set tokens in cookies
      const tokenSerialized = serialize("access-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 10, // 10 minutes
        path: "/",
      });

      const refreshTokenSerialized = serialize("refresh-token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      // Update the last_login field
      user.last_login = today;
      await user.save();

      // Log this login event in the login_logs table
      await LoginLog.create({
        userID: user.userID,
        userName: user.userName,
        userType: user.userType,
        login_time: today,
        success: true,
        ip_address: req.headers["x-forwarded-for"] || req.socket.remoteAddress,
        user_agent: req.headers["user-agent"],
      });

      res.setHeader("Set-Cookie", [tokenSerialized, refreshTokenSerialized]);
      return res.status(200).json({ userType: user.userType });
    } catch (error) {
      console.error("Error in login:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
import { parseCookies } from "nookies";
import jwt from "jsonwebtoken";
import Notification from "../../models/notifmodel";
import { getServerTime } from '../../utils/getServerTime';

// Add node-fetch for server time
import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // Parse cookies to get the access token
      const cookies = parseCookies({ req });
      const accessToken = cookies["access-token"];

      if (!accessToken) {
        return res.status(401).json({ message: "No access token found" });
      }

      // Verify and decode the access token
      const accessTokenSecret = process.env.JWT_SECRET;
      const decoded = jwt.verify(accessToken, accessTokenSecret);

      // Extract the userID from the decoded token
      const DCDuserID = decoded.userID;

      // Use authoritative server date
      const serverDateTime = await getServerTime("datetime");
      const now = new Date(serverDateTime);

      // Update all unread notifications for this user
      await Notification.update(
        {
          isRead: 1,
          updated_at: now,
        },
        {
          where: {
            userID: DCDuserID,
            isRead: 0,
          },
        }
      );

      return res
        .status(200)
        .json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

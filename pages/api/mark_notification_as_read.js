import { parseCookies } from "nookies";
import jwt from "jsonwebtoken";
import Notification from "../../models/notifmodel";
import { getServerTime } from '../../utils/getServerTime';

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

      // Get notification ID from request body
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ message: "Notification ID is required" });
      }

      // Find the notification and ensure it belongs to the current user
      const notification = await Notification.findOne({
        where: {
          notifID: id,
          userID: DCDuserID,
        },
      });

      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      // Use authoritative server date
      const serverDateTime = await getServerTime("datetime");
      const now = new Date(serverDateTime);

      // Update the notification to mark it as read
      await notification.update({
        isRead: 1,
        updated_at: now,
      });

      return res.status(200).json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}

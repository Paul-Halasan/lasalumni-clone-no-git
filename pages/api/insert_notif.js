const Notification = require('../../models/notifmodel');
import { parseCookies } from 'nookies';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { getServerTime } from '../../utils/getServerTime';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { message, directTo, userID, isAdmin } = req.body;

        if (!message || !directTo) {
            return res.status(400).json({ message: 'Message and directTo fields are required' });
        }

        let finalUserID = userID;

        if (!isAdmin) {// If the user is not an admin
            
            // Parse cookies to get the access token
            const cookies = parseCookies({ req });
            const accessToken = cookies['access-token'];

            if (!accessToken) {
                return res.status(401).json({ message: 'No access token found' });
            }

            // Verify and decode the access token
            const accessTokenSecret = process.env.JWT_SECRET;
            const decoded = jwt.verify(accessToken, accessTokenSecret);

            // Extract the userID from the decoded token
            finalUserID = decoded.userID;
        }

        if (!finalUserID) {
            return res.status(400).json({ message: 'UserID is required' });
        }

        try {
            // Get authoritative server time
            const serverDateTime = await getServerTime("datetime");
            const now = new Date(serverDateTime);

            // Create the notification with the userID and server time
            const newNotification = await Notification.create({
                message,
                directTo,
                userID: finalUserID, // Use the finalUserID
                isRead: 0, // Default value for isRead
                created_at: now,
                updated_at: now,
            });

            console.log('Notification created successfully');
            res.status(201).json({ message: 'Notification created successfully', notification: newNotification });
        } catch (error) {
            console.error('Error creating notification:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
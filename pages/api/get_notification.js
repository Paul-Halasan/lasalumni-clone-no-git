import { parseCookies } from 'nookies';
import jwt from 'jsonwebtoken';
import Notification from '../../models/notifmodel';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
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
            const DCDuserID = decoded.userID;

            console.log('USER ID NI BOSS PARA SA NOTIFICATION:', DCDuserID);

            // Fetch notifications for the user
            const notifications = await Notification.findAll({
                where: { userID: DCDuserID },
                order: [['created_at', 'DESC'], ['message', 'ASC'], ['directTo', 'ASC'], ['isRead', 'ASC']],
            });

            return res.status(200).json(notifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
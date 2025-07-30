import { parseCookies, setCookie } from 'nookies';
import jwt from 'jsonwebtoken';

export default function handler(req, res) {
    try {
        const cookies = parseCookies({ req });
        const accessToken = cookies['access-token'];

        if (!accessToken) {
            return res.status(401).json({ error: 'No access token found' });
        } else {
            const accessTokenSecret = process.env.JWT_SECRET;

            // Verify the refresh token
            const decoded = jwt.verify(accessToken, accessTokenSecret);

            return res.status(200).json({ userID: decoded.userID });
        }
    } catch (error) {
        console.error('Error getting user ID:', error);
        return res.status(401).json({ error: 'Invalid refresh token' });
    }
}
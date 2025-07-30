import { parseCookies } from 'nookies';
import jwt from 'jsonwebtoken';
import axios from 'axios';

//decode access token || WORKING AS NEEDED

export default async function handler(req, res) {
    try {
        const cookies = parseCookies({ req });
        const token = cookies['access-token'];
        const secret = process.env.JWT_SECRET;

        console.log('Access Token (debug only):', token);

        if (!token) {
            const response = await axios.post('/api/refresh');

            if (response.status === 200) {
                return res.status(200).json({ error: 'Access token refreshed' });
            } else if (response.status === 401) {
                return res.status(401).json({ error: 'Access token refresh failed' });
            }
        }

        const decoded = jwt.verify(token, secret);

        const user = {
            userName: decoded.userName,
            userType: decoded.userType,
            userID: decoded.userID
        };

        console.log('Decoded User Info from Access token (debug only):', user);

        res.status(200).json(user);

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            console.log('Token expired, attempting to refresh');
            await axios.get('/api/refresh');
            return res.status(401).json({ error: 'Token refreshed, please try again' });
        } else {
            console.error('Error in /api/user:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

import AlumniProfile from '../../models/AlumniProfile';
import { parseCookies } from 'nookies';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';

export default async function handler(req, res) {
    if (req.method === 'GET') {

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

        console.log('USER ID NI BOSS SA PAG GET NG FACILITATORS:', DCDuserID);

        try {
            const alumni = await AlumniProfile.findAll({
                attributes: ['first_name', 'last_name', 'userID'],
                where: {
                    userID: {
                        [Op.ne]: DCDuserID
                    }
                }
            });

            return res.status(200).json({ alumni });
        } catch (error) {
            console.error('Error in get_events:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
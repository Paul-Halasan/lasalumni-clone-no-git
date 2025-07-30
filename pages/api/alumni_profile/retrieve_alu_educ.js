import { verify } from 'jsonwebtoken';
import AlumniEducation from '../../../models/alumni_educ';
import cookie from 'cookie';

// API to get the alumni education records based on the access token or userID query parameter
export default async function handler(req, res) {
    if (req.method === 'GET') {
        // Parse cookies from the request
        const { 'access-token': token } = cookie.parse(req.headers.cookie || '');

        if (!token) {
            return res.status(401).json({ error: 'Access token is missing' });
        }

        try {
            // Verify the token and extract the payload (which contains userID)
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                throw new Error('JWT_SECRET is not defined');
            }
            const decoded = verify(token, secret);
            const { userID: tokenUserID } = decoded;

            // Get userID from query parameters
            const { userID: queryUserID } = req.query;
            const userID = queryUserID || tokenUserID;

            // Fetch all education records from the database using userID
            const userEducation = await AlumniEducation.findAll({
                where: { userID },
                attributes: [
                    'education_id',
                    'degree',
                    'school',
                    'start_date',
                    'end_date',
                ]
            });

            // Return the user education records or an empty array if none are found
            return res.status(200).json(userEducation || []);

        } catch (error) {
            console.error('Error retrieving education records:', error);
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
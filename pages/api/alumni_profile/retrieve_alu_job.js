import { verify } from 'jsonwebtoken';
import AlumniJobExperience from '../../../models/alumni_job';
import cookie from 'cookie';

// API to get the alumni job experience records based on the access token or userID query parameter
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

            // Fetch all job experience records from the database using userID
            const userJobExperience = await AlumniJobExperience.findAll({
                where: { userID },
                attributes: [
                    'jobexp_id',
                    'jobtitle',
                    'companyname',
                    'start_date',
                    'end_date',
                ]
            });

            // Return the user job experience records or an empty array if none are found
            return res.status(200).json(userJobExperience || []);

        } catch (error) {
            console.error('Error retrieving job experience records:', error);
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
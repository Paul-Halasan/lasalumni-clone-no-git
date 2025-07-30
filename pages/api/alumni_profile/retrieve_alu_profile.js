import { verify } from 'jsonwebtoken';
import AlumniProfile from '../../../models/AlumniProfile';
import cookie from 'cookie';

// API to get the alumni profile based on the access token or userID query parameter
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

            // Fetch the user profile from the database using userID
            const userProfile = await AlumniProfile.findOne({
                where: { userID },
                attributes: [
                    'profile_id',
                    'userID',
                    'last_name',
                    'first_name',
                    'middle_name',
                    'mobile_number',
                    'telephone_number',
                    'email_address',
                    'country',
                    'region',
                    'city',
                    'province',
                    'profile_picture',
                    'date_of_birth',
                    'gender',
                    'civil_status',
                    'nationality',
                    'resume',
                    'department',
                    'batch',
                    'created_at',
                    'updated_at',
                    'job_profession',
                    'job_status',
                    'prof_summary',
                    'fb_link',
                    'linkedin_link',
                ]
            });

            if (!userProfile) {
                return res.status(404).json({ error: 'User profile not found' });
            }

            // Return the user profile information
            return res.status(200).json(userProfile);

        } catch (error) {
            console.error('Error retrieving profile:', error);
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
import UserProfile from '../../models/AlumniProfile';
import Event from '../../models/eventmodels';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const { userID, eventID } = req.query;

        if (!userID || !eventID) {
            return res.status(400).json({ error: 'userID and eventID are required' });
        }

        try {
            // Fetch the user profile from the database using userID
            const userProfile = await UserProfile.findOne({
                where: { userID },
                attributes: ['first_name', 'last_name']
            });

            if (!userProfile) {
                return res.status(404).json({ error: 'User profile not found' });
            }

            // Fetch the event details from the database using eventID
            const eventDetails = await Event.findOne({
                where: { eventID },
                attributes: ['eventTitle']
            });

            if (!eventDetails) {
                return res.status(404).json({ error: 'Event not found' });
            }

            // Return the user profile and event details
            return res.status(200).json({
                first_name: userProfile.first_name,
                last_name: userProfile.last_name,
                eventTitle: eventDetails.eventTitle
            });

        } catch (error) {
            console.error('Error retrieving user or event details:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
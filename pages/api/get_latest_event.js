const Event = require('../../models/eventmodels');

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            // Query the latest event based on createdAt timestamp
            const latestEvent = await Event.findOne({
                order: [['created_at', 'DESC']]
            });

            if (latestEvent) {
                res.status(200).json({ eventID: latestEvent.eventID });
            } else {
                res.status(404).json({ message: 'No events found' });
            }
        } catch (error) {
            console.error('Error fetching latest event:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
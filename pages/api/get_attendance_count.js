const EventAttendees = require('../../models/event_attendeesmodel');

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const { eventID } = req.query;

        if (!eventID) {
            return res.status(400).json({ error: 'eventID is required' });
        }

        try {
            const count = await EventAttendees.count({
                where: { eventID, isAttend: 1 }
            });

            console.log('YUNG ATTENDANCE NG EVENT AY:', count);

            return res.status(200).json({ count });
        } catch (error) {
            console.error('Error retrieving attendance count:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
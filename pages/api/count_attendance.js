const EventAttendees = require('../../models/event_attendeesmodel');

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { userID, eventID } = req.body;

        if (!userID || !eventID) {
            return res.status(400).json({ error: 'userID and eventID are required' });
        }

        try {
            const attendee = await EventAttendees.findOne({
                where: { userID, eventID }
            });

            if (!attendee) {
                return res.status(404).json({ error: 'Attendee not found' });
            }

            attendee.isAttend = true;
            await attendee.save();

            return res.status(200).json({ message: 'Attendance counted successfully' });
        } catch (error) {
            console.error('Error counting attendance:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
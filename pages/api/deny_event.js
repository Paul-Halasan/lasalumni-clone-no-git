import Event from '../../models/eventmodels';
import EventAttendees from '../../models/event_attendeesmodel';
import { getServerTime } from '../../utils/getServerTime';

export default async function handler(req, res) {
    if (req.method === 'DELETE') {
        const { eventID } = req.body;

        if (!eventID) {
            return res.status(400).json({ error: 'Event ID is required' });
        }

        try {
            const event = await Event.findOne({ where: { eventID } });

            if (!event) {
                return res.status(404).json({ error: 'Event not found' });
            }

            const serverDateTime = await getServerTime("datetime");
            const now = new Date(serverDateTime);

            //deny the event
            event.isApproved = 2;
            event.updatedAt = now; // Set updatedAt to current time
            await event.save();

            // Delete all attendees for the event
            await EventAttendees.destroy({ where: { eventID } });

            return res.status(200).json({ message: 'Event denied successfully' });
        } catch (error) {
            console.error('Error in deny_event:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
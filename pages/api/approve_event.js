import Event from '../../models/eventmodels';
import { getServerTime } from '../../utils/getServerTime';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { eventID } = req.body;

        if (!eventID) {
            return res.status(400).json({ error: 'Event ID is required' });
        }

        try {
            const event = await Event.findOne({ where: { eventID } });

            if (!event) {
                return res.status(404).json({ error: 'Event not found' });
            }

            // Get authoritative server time
            const serverDateTime = await getServerTime("datetime");
            const now = new Date(serverDateTime);

            event.isApproved = true;
            event.updatedAt = now; // Set updatedAt to server time
            await event.save();

            return res.status(200).json({ message: 'Event approved successfully' });
        } catch (error) {
            console.error('Error in approve_event:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
import Event from '../../models/eventmodels';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const unapprovedEventsCount = await Event.count({
                where: { isApproved: 0 }
            });

            const events = await Event.findAll();

            return res.status(200).json({ unapprovedEventsCount, events });
        } catch (error) {
            console.error('Error in get_events:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
import Event from '../../models/eventmodels';

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const { eventID } = req.query;

    try {
      await Event.destroy({ where: { eventID } });
      return res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
      console.error('Error deleting event:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
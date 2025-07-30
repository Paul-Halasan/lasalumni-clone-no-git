import EventAttendees from '../../models/event_attendeesmodel';

export default async function handler(req, res) {
    if (req.method === 'GET') {
      const { userID } = req.query;

      console.log('userID NI BOSS DEBUG LANG:', userID);
  
      if (!userID) {
        return res.status(400).json({ message: 'userID is required' });
      }
  
      try {
        const events = await EventAttendees.findAll({
          where: { userID },
          attributes: ['eventID', 'isFacilitator'],
        });
  
        // if (events.length === 0) {
        //   return res.status(404).json({ message: 'No events found' });
        // }
  
        const eventIDs = events.map((event) => ({
          eventID: String(event.eventID),
          isFacilitator: event.isFacilitator
        }));
        return res.status(200).json({ eventIDs });
      } catch (error) {
        console.error('Error fetching events:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  }
  
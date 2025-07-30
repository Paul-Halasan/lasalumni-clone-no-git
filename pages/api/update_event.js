import Event from '../../models/eventmodels';
import { getServerTime } from '../../utils/getServerTime';

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const { eventID, eventTitle, eventStart, eventEnd, isFreeEvent, eventDesc, eventType, meetingLink, selectedFacilitators, eventImageFileName } = req.body;

    if (!eventID) {
      return res.status(400).json({ error: 'eventID is required' });
    }

    try {
      // Get authoritative server time
      const serverDateTime = await getServerTime("datetime");
      const now = new Date(serverDateTime);

      await Event.update(
        {
          eventTitle,
          eventStart,
          eventEnd,
          isFreeEvent: isFreeEvent === 'true',
          eventDesc,
          eventType,
          meetingLink,
          selectedFacilitators: selectedFacilitators || [],
          eventImage: eventImageFileName,
          updatedAt: now, // Set updatedAt to server time
        },
        { where: { eventID } }
      );

      return res.status(200).json({ message: 'Event updated successfully' });
    } catch (error) {
      console.error('Error updating event:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

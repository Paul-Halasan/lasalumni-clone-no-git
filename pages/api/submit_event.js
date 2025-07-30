import jwt from 'jsonwebtoken';
import { parseCookies } from 'nookies';
const Event = require('../../models/eventmodels');
import { getServerTime } from '../../utils/getServerTime';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Parse cookies to get the access token
    const cookies = parseCookies({ req });
    const accessToken = cookies['access-token'];

    if (!accessToken) {
      return res.status(401).json({ message: 'No access token found' });
    }

    // Verify and decode the access token
    const accessTokenSecret = process.env.JWT_SECRET;
    const decoded = jwt.verify(accessToken, accessTokenSecret);

    // Extract the userID from the decoded token
    const DCDuserID = decoded.userID;
    console.log('USER ID FOR SUBMITTING EVENT:', DCDuserID);

    // Extract event details from the request body
    const { eventTitle, eventStart, eventEnd, isFreeEvent, eventDesc, eventType, meetingLink, eventImageFileName } = req.body;
    const eventID = ""; // Auto-generated, if applicable
    const isApproved = false;
    const going = 0;
    const eventImage = `public/${eventImageFileName}`; // Use the S3 URL

    try {
      // Get authoritative server time
      const serverDateTime = await getServerTime("datetime");
      const now = new Date(serverDateTime);

      // Create the event
      const newEvent = await Event.create({
        eventID,
        eventTitle,
        eventImage,
        eventStart,
        eventEnd,
        isFreeEvent,
        eventDesc,
        isApproved,
        submittedBy: DCDuserID,
        going,
        eventType,
        meetingLink,
        createdAt: now,
        updatedAt: now,
      });

      console.log('EVENT CREATED SUCCESSFULLY');
      res.status(201).json({ message: 'Event created successfully', event: newEvent });
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

export const config = {
  api: {
    bodyParser: true, // Enable body parsing for JSON
  },
};
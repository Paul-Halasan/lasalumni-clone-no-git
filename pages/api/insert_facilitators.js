const EventAttendees = require('../../models/event_attendeesmodel');
import { parseCookies } from 'nookies';

// This API is used to insert facilitators into the EventAttendees database

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { eventID, facilitator, saveToUser, eventType } = req.body;

        console.log('Received payload:', req.body);

        // Check if facilitator is provided
        if (!facilitator) {
            console.error('Facilitator is not provided:', facilitator);
            return res.status(400).json({ message: 'Facilitator should be provided' });
        }

        //Determine the value of saveToUser based on eventType
        let saveToUserValue = null;
        if (eventType === 'Online') {
            saveToUserValue = saveToUser;
        }

        console.log('SERVER SIDE EVENT ID:', eventID, 'FACILITATOR:', facilitator, 'SAVE TO USER:', saveToUser);

        try {
            // Insert the facilitator into the EventAttendees database
            await EventAttendees.create({
                eventID: eventID,
                userID: facilitator,
                saveToUser: saveToUser,
                isFacilitator: true,
                isAttend: true
            });

            console.log('FACILITATOR INSERTED SUCCESSFULLY');
            res.status(201).json({ message: 'Facilitator inserted successfully' });
        } catch (error) {
            console.error('Error inserting facilitator:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
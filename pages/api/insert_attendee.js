const EventAttendees = require('../../models/event_attendeesmodel');

// This API is used to insert attendees into the EventAttendees database

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { eventID, userID, saveToUser, eventType } = req.body;

        console.log('Received payload:', req.body);

        // Check if userID is provided
        if (!userID) {
            console.error('User ID is not provided:', userID);
            return res.status(400).json({ message: 'User ID should be provided' });
        }

        // Determine the value of saveToUser based on eventType
        let saveToUserValue = null;
        if (eventType === 'Online') {
            saveToUserValue = saveToUser;
        }

        console.log('SERVER SIDE EVENT ID:', eventID, 'USER ID:', userID, 'SAVE TO USER:', saveToUserValue);

        try {
            // Insert the attendee into the EventAttendees database
            await EventAttendees.create({
                eventID: eventID,
                userID: userID,
                saveToUser: saveToUserValue,
                isFacilitator: false,
                isAttend: false
            });

            console.log('ATTENDEE INSERTED SUCCESSFULLY');
            res.status(201).json({ message: 'Attendee inserted successfully' });
        } catch (error) {
            console.error('Error inserting attendee:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
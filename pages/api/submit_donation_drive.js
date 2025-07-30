const DonationDrive = require('../../models/dd_model');
import { parseCookies } from 'nookies';
import jwt from 'jsonwebtoken';
import { getServerTime } from '../../utils/getServerTime';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { dd_title, dd_imageFileName, dd_desc } = req.body;

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
    const submitted_by = decoded.userID;

    // Construct the image URL
    const dd_image = `public/${dd_imageFileName}`; // Use the S3 URL

    try {
      // Get authoritative server time
      const serverDateTime = await getServerTime("datetime");
      const now = new Date(serverDateTime);

      // Create the donation drive request with server time
      const newDonationDrive = await DonationDrive.create({
        dd_title,
        dd_image,
        dd_desc,
        submitted_by,
        isApproved: 0,
        created_at: now,
        updated_at: now,
      });

      res.status(201).json({ message: 'Donation drive request submitted successfully', donationDrive: newDonationDrive });
    } catch (error) {
      console.error('Error creating donation drive request:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
const DonationDrive = require('../../models/dd_model');

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const donationDrives = await DonationDrive.findAll();
      res.status(200).json({ donationDrives });
    } catch (error) {
      console.error('Error fetching donation drives:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
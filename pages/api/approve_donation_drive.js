const DonationDrive = require('../../models/dd_model');
const { getServerTime } = require('../../utils/getServerTime');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { dd_listID } = req.body;

    try {
      const donationDrive = await DonationDrive.findOne({ where: { dd_listID } });

      if (!donationDrive) {
        return res.status(404).json({ error: 'Donation drive not found' });
      }

      // Get authoritative server time
      const serverDateTime = await getServerTime("datetime");
      const now = new Date(serverDateTime);

      donationDrive.isApproved = 1;
      donationDrive.updatedAt = now; // Set updatedAt to server time
      await donationDrive.save();

      res.status(200).json({ message: 'Donation drive approved successfully' });
    } catch (error) {
      console.error('Error approving donation drive:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
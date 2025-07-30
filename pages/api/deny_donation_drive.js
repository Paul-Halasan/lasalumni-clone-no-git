const DonationDrive = require('../../models/dd_model');
import { getServerTime } from '../../utils/getServerTime';

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const { dd_listID } = req.body;

    try {
      const donationDrive = await DonationDrive.findOne({ where: { dd_listID } });

      if (!donationDrive) {
        return res.status(404).json({ error: 'Donation drive not found' });
      }

      const serverDateTime = await getServerTime("datetime");
      const now = new Date(serverDateTime);

      donationDrive.isApproved = 2; // Set isApproved to 2 to indicate denial
      donationDrive.updated_at = now; // Set updatedAt to current time

      await donationDrive.save();

      res.status(200).json({ message: 'Donation drive denied successfully' });
    } catch (error) {
      console.error('Error denying donation drive:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
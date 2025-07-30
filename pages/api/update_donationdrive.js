import DonationDrive from '../../models/dd_model';
import { getServerTime } from '../../utils/getServerTime';

export default async function handler(req, res) {
  if (req.method === 'PUT') {
    const { dd_listID, dd_title, dd_desc, dd_image } = req.body;

    if (!dd_listID) {
      return res.status(400).json({ error: 'dd_listID is required' });
    }

    try {
      // Get authoritative server time
      const serverDateTime = await getServerTime("datetime");
      const now = new Date(serverDateTime);

      await DonationDrive.update(
        {
          dd_title,
          dd_desc,
          dd_image,
          updatedAt: now, // Set updatedAt to server time
        },
        { where: { dd_listID } }
      );

      return res.status(200).json({ message: 'Donation drive updated successfully' });
    } catch (error) {
      console.error('Error updating donation drive:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
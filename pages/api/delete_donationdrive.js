import DonationDrive from '../../models/dd_model';

export default async function handler(req, res) {
  if (req.method === 'DELETE') {
    const { dd_listID } = req.query;

    if (!dd_listID) {
      return res.status(400).json({ error: 'dd_listID is required' });
    }

    try {
      await DonationDrive.destroy({ where: { dd_listID } });
      return res.status(200).json({ message: 'Donation drive deleted successfully' });
    } catch (error) {
      console.error('Error deleting donation drive:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
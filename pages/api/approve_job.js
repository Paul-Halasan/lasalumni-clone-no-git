import Job from '../../models/jobs';
import { getServerTime } from '../../utils/getServerTime';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { job_id } = req.body;

        if (!job_id) {
            return res.status(400).json({ error: 'Job ID is required' });
        }

        try {
            const job = await Job.findOne({ where: { job_id } });

            if (!job) {
                return res.status(404).json({ error: 'Job not found' });
            }

            // Get authoritative server time
            const serverDateTime = await getServerTime("datetime");
            const now = new Date(serverDateTime);

            job.isApproved = 'approved'; // Set approval status
            job.updated_at = now; // Set updatedAt to server time
            await job.save();

            return res.status(200).json({ message: 'Job approved successfully' });
        } catch (error) {
            console.error('Error in approve_job:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

import { parseCookies } from 'nookies';
import jwt from 'jsonwebtoken';
import Job from '../../models/jobs'; // Adjust the path to your Job model
import { getServerTime } from '../../utils/getServerTime';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the cookies to get the access token
    const cookies = parseCookies({ req });
    const accessToken = cookies['access-token'];

    if (!accessToken) {
      return res.status(401).json({ error: 'No access token found' });
    }

    // Verify the token and extract the userID
    const accessTokenSecret = process.env.JWT_SECRET;
    const decoded = jwt.verify(accessToken, accessTokenSecret);
    const { userID, userType } = decoded; // Assuming the token contains the user's role

    // Extract job_id and other fields from the request body
    const { job_id, job_title, job_description, location, deadline, salary, requirements, industry, job_status, additional_info, isApproved, isAccepting } = req.body;

    if (!job_id) {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    // Find the job by job_id
    const job = await Job.findOne({ where: { job_id } });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // If the user is not an admin, ensure the job belongs to the current user
    if (userType !== "admin" && job.userID !== userID) {
      return res.status(403).json({ error: "Not authorized to edit this job" });
    }

    // Automatically sets isApproved to "approved" if the user is an admin
    const updatedIsApproved = userType === 'admin' ? 'approved' : isApproved;

    // Get authoritative server time
    const serverDateTime = await getServerTime("datetime");
    const now = new Date(serverDateTime);

    // Update the job with the new data and updatedAt
    await job.update({
      job_title,
      job_description,
      location,
      deadline,
      salary,
      requirements,
      industry,
      job_status,
      additional_info,
      isApproved: updatedIsApproved,
      isAccepting,
      updatedAt: now, // <-- Use server time for updatedAt
    });

    return res.status(200).json({ message: 'Job updated successfully', job });
  } catch (error) {
    console.error('Error updating job:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

import { parseCookies } from 'nookies';
import jwt from 'jsonwebtoken';
import JobApplicant from '../../models/job_applicants'; // JobApplicant model
import AlumniProfile from '../../models/AlumniProfile'; // AlumniProfile model
import Job from '../../models/jobs'; // Job model
import { getServerTime } from '../../utils/getServerTime';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Parse JWT token from cookies
    const cookies = parseCookies({ req });
    const accessToken = cookies['access-token'];

    if (!accessToken) {
      return res.status(401).json({ error: 'No access token found' });
    }

    const accessTokenSecret = process.env.JWT_SECRET;
    const decoded = jwt.verify(accessToken, accessTokenSecret);
    const { userID } = decoded;

    // Retrieve the job ID from the request body
    const { job_id } = req.body;

    const job = await Job.findOne({
      where: { job_id },
      attributes: ['userID'], // Only fetch the userID of the job creator
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if the applicant is the job creator
    if (job.userID === userID) {
      return res.status(400).json({ error: 'You cannot apply to your own job listing!' });
    }

    // Check if the user has already applied to the job
    const existingApplication = await JobApplicant.findOne({
      where: {
        job_id,
        applicant_id: userID,
      },
    });
    
    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }

    // Find the user's resume path from AlumniProfile
    const alumniProfile = await AlumniProfile.findOne({
      where: { userID },
      attributes: ['resume'],
    });

    if (!alumniProfile || !alumniProfile.resume) {
      return res.status(400).json({ error: 'Please upload a resume first!' });
    }

    // Get authoritative server time
    const serverDateTime = await getServerTime("datetime");
    const now = new Date(serverDateTime);

    // Create the job application entry in the JobApplicant model
    const application = await JobApplicant.create({
      job_id,
      applicant_id: userID,
      resume_path: alumniProfile.resume,
      status: 'pending',
      applied_at: now,
      updated_at: now,
    });

    return res.status(200).json({ message: 'Application submitted successfully', application });
  } catch (error) {
    console.error('Error submitting job application:', error);
    return res.status(500).json({ error: 'Failed to submit job application' });
  }
}

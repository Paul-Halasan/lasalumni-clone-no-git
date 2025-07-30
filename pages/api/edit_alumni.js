import { parseCookies } from 'nookies';
import jwt from 'jsonwebtoken';
import AlumniProfile from '../../models/AlumniProfile'; // Sequelize model for alumni profile
import multer from 'multer';
import { getServerTime } from '../../utils/getServerTime';

const upload = multer();

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  upload.none()(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error parsing form data' });
    }

    try {
      // Extract form data
      const { userID, first_name, middle_name, last_name, gender, date_of_birth, civil_status, nationality, email_address, telephone_number, mobile_number, country, region, city, province, job_profession, job_status, prof_summary, profile_picture, resume, fb_link, linkedin_link } = req.body;

      // Check if required fields are present
      if (!userID || !first_name || !last_name || !email_address || !telephone_number) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Retrieve the existing alumni profile
      const existingProfile = await AlumniProfile.findOne({ where: { userID } });

      if (!existingProfile) {
        return res.status(404).json({ error: 'User profile not found' });
      }

      // Construct file paths if new files are uploaded
      const profilePicturePath = profile_picture
        ? `public/${profile_picture}`
        : existingProfile.profile_picture;
      const resumePath = resume
        ? `public/${resume}`
        : existingProfile.resume;

      // Get authoritative server time
      const serverDateTime = await getServerTime("datetime");
      const now = new Date(serverDateTime);

      // Update alumni profile in the database, including updatedAt
      await AlumniProfile.update({
        first_name,
        middle_name,
        last_name,
        gender,
        date_of_birth,
        civil_status,
        nationality,
        email_address,
        telephone_number,
        mobile_number,
        country,
        region,
        city,
        province,
        job_profession,
        job_status,
        prof_summary,
        profile_picture: profilePicturePath,
        resume: resumePath,
        updatedAt: now, // <-- Set updatedAt to server time
        fb_link,
        linkedin_link,
      }, { where: { userID } });

      return res.status(200).json({ message: 'User profile updated successfully' });
    } catch (error) {
      console.error('Error updating user profile:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
}

export const config = {
  api: {
    bodyParser: false, // Disable body parsing for JSON
  },
};
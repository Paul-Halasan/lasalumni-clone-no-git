import { parseCookies } from "nookies";
import jwt from "jsonwebtoken";
import Job from "../../models/jobs";
import PartnerCompany from "../../models/PartnerCompany";
import AlumniProfile from "../../models/AlumniProfile";
import JobApplicant from "../../models/job_applicants";
import { Sequelize } from "sequelize";

export default async function handler(req, res) {
  try {
    const cookies = parseCookies({ req });
    const accessToken = cookies["access-token"];

    if (!accessToken) {
      return res.status(401).json({ error: "No access token found" });
    }

    const accessTokenSecret = process.env.JWT_SECRET;
    const decoded = jwt.verify(accessToken, accessTokenSecret);

    // Extract search parameters from the request body
    const { jobTitle, industry, approvalStatus, jobStatus } = req.body;

    // Build where conditions for filtering jobs
    const whereConditions = {
      isApproved: "approved", // Default to only approved jobs
      isAccepting: 1, // Add condition to only fetch jobs that are accepting
    };

    if (jobTitle) {
      whereConditions.job_title = { [Sequelize.Op.like]: `%${jobTitle}%` };
    }

    if (industry) {
      whereConditions.industry = { [Sequelize.Op.like]: `%${industry}%` };
    }

    if (jobStatus) {
      whereConditions.job_status = { [Sequelize.Op.like]: `%${jobStatus}%` }; // Corrected variable name to jobStatus
    }

    // Fetch jobs based on filters and associated user details
    const jobs = await Job.findAll({
      where: whereConditions,
      order: [["created_at", "DESC"]],
    });

    const jobsWithDetails = await Promise.all(
      jobs.map(async (job) => {
        let userDetails = null;
    
        const alumniProfile = await AlumniProfile.findOne({
          where: { userID: job.userID },
          attributes: [
            "first_name",
            "last_name",
            "profile_picture",
            "email_address",
            "telephone_number",
          ],
        });
    
        if (alumniProfile) {
          userDetails = {
            type: "alumni",
            name: `${alumniProfile.first_name} ${alumniProfile.last_name}`,
            profile_picture: alumniProfile.profile_picture,
            contact_email: alumniProfile.email_address,
            contact_phone: alumniProfile.telephone_number,
          };
        } else {
          const company = await PartnerCompany.findOne({
            where: { userID: job.userID },
            attributes: [
              "name",
              "company_logo",
              "email",
              "contact_number",
              "contact_name",
            ],
          });
    
          if (company) {
            userDetails = {
              type: "partner",
              name: company.name,
              company_name: company.name,
              company_logo: company.company_logo,
              contact_name: company.contact_name,
              contact_email: company.email,
              contact_phone: company.contact_number,
            };
          }
        }
    
        // Check if the current user has applied for this job
        const isApplied = await JobApplicant.findOne({
          where: {
            job_id: job.job_id,
            applicant_id: decoded.userID, // Use the userID from the decoded JWT
          },
        });
    
        return {
          ...job.toJSON(),
          userDetails: userDetails || null,
          isApplied: !!isApplied, // Add the isApplied field
        };
      })
    );

    console.log("JAHBLESS W DETAILS:", jobsWithDetails);

    return res.status(200).json({ jobs: jobsWithDetails });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return res.status(500).json({ error: "Failed to fetch jobs" });
  }
}

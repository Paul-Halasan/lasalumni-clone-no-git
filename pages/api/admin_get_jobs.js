import { parseCookies } from "nookies";
import jwt from "jsonwebtoken";
import Job from "../../models/jobs"; // Job model
import PartnerCompany from "../../models/PartnerCompany"; // PartnerCompany model
import AlumniProfile from "../../models/AlumniProfile"; // AlumniProfile model
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
    const whereConditions = {};

    // Add approvalStatus filter if provided
    if (approvalStatus && approvalStatus !== "all") {
      whereConditions.isApproved = approvalStatus;
    }

    // Add jobTitle filter if provided
    if (jobTitle) {
      whereConditions.job_title = { [Sequelize.Op.like]: `%${jobTitle}%` };
    }

    // Add industry filter if provided
    if (industry) {
      whereConditions.industry = { [Sequelize.Op.like]: `%${industry}%` };
    }

    // Add jobStatus filter if provided
    if (jobStatus) {
      whereConditions.job_status = { [Sequelize.Op.like]: `%${jobStatus}%` };
    }

    // Fetch jobs based on filters
    const jobs = await Job.findAll({
      where: whereConditions,
      order: [["created_at", "DESC"]],
    });

    // Fetch associated details for each job
    const jobsWithDetails = await Promise.all(
      jobs.map(async (job) => {
        let userDetails = null;

        // Check if the user is an alumni
        const alumniProfile = await AlumniProfile.findOne({
          where: { userID: job.userID },
          attributes: ["first_name", "last_name", "profile_picture"],
        });

        if (alumniProfile) {
          userDetails = {
            type: "alumni",
            first_name: alumniProfile.first_name,
            last_name: alumniProfile.last_name,
            profile_picture: alumniProfile.profile_picture,
          };
        } else {
          // If not alumni, check if they are a partner company
          const company = await PartnerCompany.findOne({
            where: { userID: job.userID },
            attributes: ["name", "company_logo", "contact_name"],
          });

          if (company) {
            userDetails = {
              type: "partner",
              company_name: company.name,
              company_logo: company.company_logo,
              contact_name: company.contact_name,
            };
          }
        }

        // Return the job with associated user or company details
        return {
          ...job.toJSON(), // Convert Sequelize instance to plain object
          userDetails: userDetails || null, // Attach user or company details
        };
      })
    );

    return res.status(200).json({ jobs: jobsWithDetails });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return res.status(500).json({ error: "Failed to fetch jobs" });
  }
}
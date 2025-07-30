import { parseCookies } from "nookies";
import jwt from "jsonwebtoken";
import Job from "../../models/jobs";
import JobApplicant from "../../models/job_applicants";
import PartnerCompany from "../../models/PartnerCompany";
import AlumniProfile from "../../models/AlumniProfile";
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
    const { userID } = decoded;

    // Get filter parameters from request body
    const { jobTitle, industry, approvalStatus, jobStatus } = req.body;

    // Build the `where` condition dynamically for filtering
    const whereConditions = {
      userID: userID,
    };

    if (jobTitle) {
      whereConditions.job_title = { [Sequelize.Op.like]: `%${jobTitle}%` };
    }

    if (industry) {
      whereConditions.industry = { [Sequelize.Op.like]: `%${industry}%` };
    }

    if (approvalStatus) {
      whereConditions.isApproved = approvalStatus;
    }

    if (jobStatus) {
      whereConditions.isAccepting = jobStatus === "1" ? "1" : "0";
    }

    const jobs = await Job.findAll({
      where: whereConditions,
      order: [["created_at", "DESC"]],
    });

    const jobIds = jobs.map((job) => job.job_id);

    // Get applicant counts
    const applicantCounts = await JobApplicant.findAll({
      attributes: [
        "job_id",
        [
          Sequelize.fn("COUNT", Sequelize.col("application_id")),
          "applicant_count",
        ],
      ],
      where: {
        job_id: jobIds,
      },
      group: ["job_id"],
    });

    // Fetch creator details for each job
    const jobsWithDetails = await Promise.all(
      jobs.map(async (job) => {
        // Get applicant count
        const applicantCountEntry = applicantCounts.find(
          (count) => count.job_id === job.job_id
        );
        const applicantCount = applicantCountEntry
          ? applicantCountEntry.getDataValue("applicant_count")
          : 0;

        // Get creator details
        let creatorDetails = null;

        // Check if created by an alumni
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
          creatorDetails = {
            type: "alumni",
            name: `${alumniProfile.first_name} ${alumniProfile.last_name}`,
            profile_picture: alumniProfile.profile_picture,
            contact_email: alumniProfile.email_address,
            contact_phone: alumniProfile.telephone_number,
          };
        } else {
          // Check if created by a partner company
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
            creatorDetails = {
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

        // Return job with counts and creator details
        return {
          ...job.get(),
          applicant_count: applicantCount,
          creatorDetails: creatorDetails || null,
        };
      })
    );

    return res.status(200).json({ jobs: jobsWithDetails });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return res.status(500).json({ error: "Failed to fetch jobs" });
  }
}

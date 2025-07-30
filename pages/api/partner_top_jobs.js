import { parseCookies } from "nookies";
import jwt from "jsonwebtoken";
const Job = require("../../models/jobs");
const JobApplicant = require("../../models/job_applicants");

export default async function handler(req, res) {
  try {
    // Retrieve the access token from cookies
    const cookies = parseCookies({ req });
    const token = cookies["access-token"];
    const secret = process.env.JWT_SECRET;

    if (!token) {
      return res.status(401).json({ error: "Access token is missing" });
    }

    // Decode the token to get the userID
    const decoded = jwt.verify(token, secret);
    const userID = decoded.userID;

    if (!userID) {
      return res.status(400).json({ error: "Invalid access token" });
    }

    // Fetch jobs posted by the user
    const jobs = await Job.findAll({
      where: { userID },
      attributes: ["job_id", "job_title", "company_name", "job_status"],
    });

    // Count applicants for each job using JobApplicant model
    const jobsWithApplicants = await Promise.all(
      jobs.map(async (job) => {
        const applicantsCount = await JobApplicant.count({
          where: { job_id: job.job_id },
        });

        return {
          job_id: job.job_id,
          job_title: job.job_title,
          company_name: job.company_name,
          job_status: job.job_status,
          applicantsCount,
        };
      })
    );

    // Sort jobs by the number of applicants in descending order
    jobsWithApplicants.sort((a, b) => b.applicantsCount - a.applicantsCount);

    // Return the top 3 jobs
    const topJobs = jobsWithApplicants.slice(0, 3);

    res.status(200).json(topJobs);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.log("Token expired");
      return res.status(401).json({ error: "Access token expired" });
    } else {
      console.error("Error fetching top jobs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
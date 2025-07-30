import { parseCookies } from "nookies";
import jwt from "jsonwebtoken";
import Job from "../../models/jobs";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Parse the cookies to get the access token
    const cookies = parseCookies({ req });
    const accessToken = cookies["access-token"];

    if (!accessToken) {
      return res.status(401).json({ error: "No access token found" });
    }

    // Verify the token and extract the userID
    const accessTokenSecret = process.env.JWT_SECRET;
    const decoded = jwt.verify(accessToken, accessTokenSecret);
    const userID = decoded.userID;

    // Extract job_id from the request body
    const { job_id } = req.body;

    if (!job_id) {
      return res.status(400).json({ error: "Job ID is required" });
    }

    // Find the job by job_id and ensure it belongs to the current user
    const job = await Job.findOne({ where: { job_id, userID } });

    if (!job) {
      return res.status(404).json({ error: "Job not found or not authorized" });
    }

    // Delete the job
    await job.destroy();

    return res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error deleting job:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

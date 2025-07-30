import Job from "../../models/jobs"; // Adjust the path to your Job model
import { getServerTime } from "../../utils/getServerTime";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Extract job_id and other fields from the request body
    const {
      job_id,
      job_title,
      job_description,
      location,
      deadline,
      salary,
      requirements,
      industry,
      job_status,
      additional_info,
      isApproved,
      isAccepting,
    } = req.body;

    // Validate required fields
    if (!job_id || !job_title || !job_description || !location || !deadline) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find the job by job_id
    const job = await Job.findByPk(job_id);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

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
      isApproved,
      isAccepting,
      updatedAt: now, // <-- Use server time for updatedAt
    });

    return res.status(200).json({ message: "Job updated successfully", job });
  } catch (error) {
    console.error("Error updating job:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
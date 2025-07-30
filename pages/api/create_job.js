import Job from "../../models/jobs"; // Import Sequelize Job model
import { getServerTime } from "../../utils/getServerTime";

export default async function handler(req, res) {
  if (req.method === "POST") {
    // Extract fields from req.body
    const {
      companyName,
      jobTitle,
      jobDescription,
      location,
      deadline,
      salary,
      requirements,
      industry,
      jobStatus,
      additionalInfo,
      userID,
      userRole, // Added userRole to match what the form sends
    } = req.body;

    // Debug: Log the received data
    console.log("Received form data:", {
      companyName,
      jobTitle,
      jobDescription,
      location,
      deadline,
      salary,
      requirements,
      industry,
      jobStatus,
      additionalInfo,
      userID,
      userRole,
    });

    // Check each field individually and log which ones are missing
    const missingFields = [];
    if (!companyName) missingFields.push("companyName");
    if (!jobTitle) missingFields.push("jobTitle");
    if (!jobDescription) missingFields.push("jobDescription");
    if (!location) missingFields.push("location");
    if (!deadline) missingFields.push("deadline");
    if (salary === undefined || salary === null) missingFields.push("salary");
    if (!requirements) missingFields.push("requirements");
    if (!industry) missingFields.push("industry");
    if (!jobStatus) missingFields.push("jobStatus");

    console.log("Missing fields:", missingFields);

    // Check if required fields are present
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: "All fields are required.",
        missingFields: missingFields,
      });
    }

    try {
      // Get authoritative server time
      const serverDateTime = await getServerTime("datetime");
      const now = new Date(serverDateTime);

      // Create a new job in the database
      const newJob = await Job.create({
        company_name: companyName,
        job_title: jobTitle,
        userID: userID,
        job_description: jobDescription,
        location,
        deadline,
        salary,
        requirements,
        industry,
        job_status: jobStatus,
        additional_info: additionalInfo,
        isApproved: userRole === "admin" ? "approved" : "pending", // Automatically approve admin posts
        isAccepting: 1,
        created_at: now,
        updated_at: now,
      });

      res
        .status(200)
        .json({ message: "Job added successfully", jobId: newJob.job_id });
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({
        error: "Error adding job to the database",
        details: error.message,
      });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};

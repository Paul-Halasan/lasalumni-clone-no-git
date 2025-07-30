import AlumniJobExperience from "../../models/alumni_job";
import { getServerTime } from "../../utils/getServerTime";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { userID, jobtitle, companyname, start_date, end_date } = req.body;

      // Validate required fields
      if (!userID || !jobtitle || !companyname || !start_date || !end_date) {
        return res.status(400).json({ error: "All fields are required." });
      }

      // Get authoritative server time
      const serverDateTime = await getServerTime("datetime");
      const now = new Date(serverDateTime);

      // Save job experience to the database
      const newJobExperience = await AlumniJobExperience.create({
        userID,
        jobtitle,
        companyname,
        start_date,
        end_date,
        createdAt: now,
        updatedAt: now,
      });

      return res.status(201).json({
        message: "Job experience saved successfully.",
        jobExperience: newJobExperience,
      });
    } catch (error) {
      console.error("Error saving job experience:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed." });
  }
}
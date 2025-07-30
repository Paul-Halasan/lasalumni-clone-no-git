import AlumniEducation from "../../models/alumni_educ";
import { getServerTime } from "../../utils/getServerTime"; // Add this import

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { userID, degree, school, start_date, end_date } = req.body;

      // Validate required fields
      if (!userID || !degree || !school || !start_date || !end_date) {
        return res.status(400).json({ error: "All fields are required." });
      }

      // Fetch server time
      const serverDateTime = await getServerTime("datetime");
      const now = new Date(serverDateTime);

      // Save education data to the database
      const newEducation = await AlumniEducation.create({
        userID,
        degree,
        school,
        start_date,
        end_date,
        createdAt: now,
        updatedAt: now,
      });

      return res.status(201).json({
        message: "Education history saved successfully.",
        education: newEducation,
      });
    } catch (error) {
      console.error("Error saving education history:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed." });
  }
}
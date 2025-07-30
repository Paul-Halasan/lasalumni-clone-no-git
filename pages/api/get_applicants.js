import JobApplicant from "../../models/job_applicants";
import AlumniProfile from "../../models/AlumniProfile";

export default async function handler(req, res) {
  const { job_id } = req.query;

  if (!job_id) {
    return res.status(400).json({ error: "Job ID is required" });
  }

  try {
    // Fetch job applicants for the given job ID
    const applicants = await JobApplicant.findAll({
      where: { job_id },
    });

    // Log the fetched applicants
    console.log("Fetched applicants:", applicants);

    // If no applicants found, return an empty array
    if (applicants.length === 0) {
      return res.status(200).json({ applicants: [] });
    }

    // Extract applicant IDs (which are userIDs in the AlumniProfile table)
    const applicantIDs = applicants.map((applicant) => applicant.applicant_id);

    // Log the extracted applicant IDs
    console.log("Extracted applicantIDs (userIDs):", applicantIDs);

    // Fetch alumni profiles using the applicant IDs
    const alumniProfiles = await AlumniProfile.findAll({
      where: {
        userID: applicantIDs, // Search for alumni profiles with matching userIDs (applicant_ids)
      },
      attributes: [
        "userID",
        "first_name",
        "last_name",
        "profile_picture",
        "resume",
      ], // Include userID for mapping
    });

    // Log the fetched alumni profiles
    console.log("Fetched alumni profiles:", alumniProfiles);

    // If no alumni profiles are found, log and return early
    if (alumniProfiles.length === 0) {
      console.log(
        "No matching alumni profiles found for the given applicant IDs"
      );
      return res.status(404).json({ message: "No alumni profiles found." });
    }

    // Create a map of alumni profiles using userID as the key for easy lookup
    const alumniProfileMap = {};
    alumniProfiles.forEach((profile) => {
      alumniProfileMap[profile.userID] = profile;
    });

    // Log the alumni profile map
    console.log("Alumni profile map:", alumniProfileMap);

    // Format the applicant data with alumni profile details
    const formattedApplicants = applicants.map((applicant) => {
      const profile = alumniProfileMap[applicant.applicant_id] || {}; // Use applicant_id to get the profile

      return {
        userID: profile.userID,
        application_id: applicant.application_id,
        applicant_name: `${profile.first_name || ""} ${
          profile.last_name || ""
        }`.trim(),
        profile_picture: profile.profile_picture || null,
        resume_path: profile.resume || null,
        status: applicant.status,
      };
    });

    // Log the formatted applicants
    console.log("Formatted applicants:", formattedApplicants);

    return res.status(200).json({ applicants: formattedApplicants });
  } catch (error) {
    console.error("Error fetching applicants:", error);
    return res.status(500).json({ error: "Failed to fetch applicants" });
  }
}

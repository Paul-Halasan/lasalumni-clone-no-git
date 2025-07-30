const UserProfile = require("../../models/AlumniProfile");

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { userID } = req.query;

    console.log("userID NA NAKUHA:", userID);

    try {
      const userProfile = await UserProfile.findOne({
        where: { userID },
        attributes: [
          "last_name",
          "first_name",
          "middle_name",
          "profile_picture",
        ], // Specify the fields to retrieve
      });

      if (!userProfile) {
        return res.status(404).json({ error: "User profile not found" });
      }

      res.status(200).json({ userProfile });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}

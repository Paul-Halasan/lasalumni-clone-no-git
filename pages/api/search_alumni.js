import User from "../../models/usermodel";
import AlumniProfile from "../../models/AlumniProfile";
import { Sequelize, Op } from "sequelize"; // Make sure to import Op
import { decrypt } from "../../utils/crypto";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, search_term, batch, department } = req.body;
  console.log("info:", req.body);

  try {
    // Build query conditions dynamically
    const whereConditions = {};
    const alumniWhereConditions = {};

    if (username) {
      whereConditions.userName = { [Sequelize.Op.like]: `%${username}%` };
    }

    if (search_term) {
      const searchWords = search_term
        .split(/\s+/)
        .filter((word) => word.length > 0);
      alumniWhereConditions[Op.or] = searchWords.map((word) => ({
        [Op.or]: [
          { first_name: { [Op.like]: `%${word}%` } },
          { last_name: { [Op.like]: `%${word}%` } },
        ],
      }));
    }

    if (batch) {
      alumniWhereConditions.batch = batch;
    }

    if (department) {
      alumniWhereConditions.department = department;
    }

    // Fetch data from the User and AlumniProfile models
    const users = await User.findAll({
      where: whereConditions,
      include: [
        {
          model: AlumniProfile,
          as: "alumniProfile",
          where: alumniWhereConditions,
          attributes: [
            "first_name",
            "last_name",
            "date_of_birth",
            "city",
            "telephone_number",
            "email_address",
            "profile_picture",
            "batch",
            "department",
            "resume",
            "country",
            "program",
            "job_profession",
          ],
        },
      ],
      attributes: ["userID", "passWord", "userName", "userType", "last_login"],
    });

    // Format the data to match the desired output structure
    const formattedUsers = users.map((user) => {
      return {
        userID: user.userID,
        passWord: decrypt(user.passWord),
        userName: user.userName,
        userType: user.userType,
        last_login: user.last_login,
        alumniProfile: user.alumniProfile
          ? {
              first_name: user.alumniProfile.first_name,
              last_name: user.alumniProfile.last_name,
              date_of_birth: user.alumniProfile.date_of_birth,
              city: user.alumniProfile.city,
              telephone_number: user.alumniProfile.telephone_number,
              email_address: user.alumniProfile.email_address,
              profile_picture: user.alumniProfile.profile_picture,
              batch: user.alumniProfile.batch,
              department: user.alumniProfile.department,
              resume: user.alumniProfile.resume,
              country: user.alumniProfile.country,
              program: user.alumniProfile.program,
              job_profession: user.alumniProfile.job_profession,
            }
          : null,
      };
    });

    // Log the formatted data for debugging
    console.log(
      "Formatted Query result:",
      JSON.stringify(formattedUsers, null, 2)
    );

    return res.status(200).json({ users: formattedUsers });
  } catch (error) {
    console.error("Error searching users:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

import User from "../../models/usermodel";
import PartnerCompany from "../../models/PartnerCompany";
import { Sequelize } from "sequelize";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, usertype, industry, company_name } = req.body;
  console.log("Search Parameters:", req.body); // Log request parameters

  try {
    // Build query conditions dynamically for User and PartnerCompany
    const whereConditions = {};
    const partnerCompanyWhereConditions = {};

    if (username) {
      whereConditions.userName = { [Sequelize.Op.like]: `%${username}%` };
    }

    if (usertype) {
      whereConditions.userType = usertype;
    }

    if (industry) {
      partnerCompanyWhereConditions.industry = industry;
    }

    if (company_name) {
      partnerCompanyWhereConditions.name = {
        [Sequelize.Op.like]: `%${company_name}%`,
      };
    }

    // Fetch data from User and PartnerCompany models with all fields
    const users = await User.findAll({
      where: whereConditions,
      include: [
        {
          model: PartnerCompany,
          as: "partnerCompany",
          where: partnerCompanyWhereConditions,
          required: true, // Ensure only users with matching partner companies are returned
        },
      ],
      attributes: ["userID", "userName", "userType"],
    });

    // Log the raw data to check if account_status is present
    console.log(
      "First raw partner company data:",
      users.length > 0
        ? JSON.stringify(users[0].partnerCompany.get({ plain: true }), null, 2)
        : "No users found"
    );

    // Format the data to match the desired output structure
    const formattedUsers = users.map((user) => {
      // Get plain object of partner company
      const partnerCompanyData = user.partnerCompany
        ? user.partnerCompany.get({ plain: true })
        : null;

      return {
        userID: user.userID,
        userName: user.userName,
        userType: user.userType,
        partnerCompany: user.partnerCompany
          ? user.partnerCompany.get({ plain: true })
          : null,
      };
    });

    // Log the formatted data for debugging
    console.log(
      "Formatted Query Result:\n",
      JSON.stringify(formattedUsers, null, 2)
    );

    return res.status(200).json({ users: formattedUsers });
  } catch (error) {
    console.error("Error searching users:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

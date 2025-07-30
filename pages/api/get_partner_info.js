const User = require("../../models/usermodel");
const PartnerCompany = require("../../models/PartnerCompany");
import { parseCookies } from "nookies";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const cookies = parseCookies({ req });
    const accessToken = cookies["access-token"];

    if (!accessToken) {
      return res.status(401).json({ error: "No access token found" });
    }

    const accessTokenSecret = process.env.JWT_SECRET;
    const decoded = jwt.verify(accessToken, accessTokenSecret);
    const userID = decoded.userID;

    const user = await User.findOne({
      where: { userID: userID, userType: "partner" },
      include: [
        {
          model: PartnerCompany,
          as: "partnerCompany",
          attributes: ["name", "address", "industry"], // Added industry to the attributes
        },
      ],
    });

    if (!user) {
      console.log("User not found:", userID);
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.partnerCompany) {
      console.log("Partner company not found for user:", userID);
      return res.status(404).json({ error: "Partner company not found" });
    }

    console.log("Partner info found:", {
      companyName: user.partnerCompany.name,
      location: user.partnerCompany.address,
      industry: user.partnerCompany.industry, // Added industry to the log
    });

    res.status(200).json({
      companyName: user.partnerCompany.name,
      location: user.partnerCompany.address,
      industry: user.partnerCompany.industry, // Added industry to the response
    });
  } catch (error) {
    console.error("Error fetching partner information:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

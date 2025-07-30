import { verify } from "jsonwebtoken";
import PartnerCompany from "../../models/PartnerCompany";
import cookie from "cookie";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const { "access-token": token } = cookie.parse(req.headers.cookie || "");

    if (!token) {
      return res.status(401).json({ error: "Access token is missing" });
    }

    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error("JWT_SECRET is not defined");
      }
      verify(token, secret);

      const partnerCompanies = await PartnerCompany.findAll({
        attributes: [
          "company_id",
          "name",
          "website",
          "company_logo",
          "industry",
          "description",
          // Add other attributes you need
        ],
        where: {
          account_status: "active", // Only fetch active companies
        },

        order: [
          ["industry", "ASC"],
          ["name", "ASC"],
        ],
      });

      return res.status(200).json({ partnerCompanies });
    } catch (error) {
      console.error("Error retrieving partner companies:", error);
      return res.status(403).json({ error: "Invalid or expired token" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

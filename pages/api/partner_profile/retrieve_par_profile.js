import { verify } from "jsonwebtoken";
import PartnerCompany from "../../../models/PartnerCompany";
import cookie from "cookie";

// API to get the partner company data based on the access token or userID query parameter
export default async function handler(req, res) {
  if (req.method === "GET") {
    // Parse cookies from the request
    const { "access-token": token } = cookie.parse(req.headers.cookie || "");

    if (!token) {
      return res.status(401).json({ error: "Access token is missing" });
    }

    try {
      // Verify the token and extract the payload (which contains userID)
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error("JWT_SECRET is not defined");
      }
      const decoded = verify(token, secret);
      const { userID: tokenUserID } = decoded;

      // Get userID or company_id from query parameters
      const { userID: queryUserID, companyId } = req.query;
      const userID = queryUserID || tokenUserID;

      // Set up the query based on provided parameters
      const query = {};

      if (companyId) {
        query.where = { company_id: companyId };
      } else {
        query.where = { userID };
      }

      // Define attributes to return
      query.attributes = [
        "company_id",
        "userID",
        "name",
        "website",
        "company_logo",
        "industry",
        "address",
        "description",
        "contract",
        "effective_date",
        "expiry_date",
        "contact_number",
        "email",
        "contact_name",
        "facebook",
        "linkedin",
        "created_at",
        "updated_at",
        "account_status",
      ];

      // Fetch the partner company data from the database
      const companyProfile = await PartnerCompany.findOne(query);

      if (!companyProfile) {
        return res.status(404).json({ error: "Partner company not found" });
      }

      // Return the company profile information
      return res.status(200).json(companyProfile);
    } catch (error) {
      console.error("Error retrieving partner company:", error);
      return res.status(403).json({ error: "Invalid or expired token" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

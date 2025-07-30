import { parseCookies } from "nookies";
import jwt from "jsonwebtoken";
import User from "../../models/usermodel";
import PartnerCompany from "../../models/PartnerCompany";
import { encrypt } from "../../utils/crypto";
import { getServerTime } from "../../utils/getServerTime"; // <-- Add this import

export default async function handler(req, res) {
  if (req.method === "POST") {
    const {
      username,
      password,
      name,
      website,
      industry,
      address,
      description,
      effectiveDate,
      expiryDate,
      contactNumber,
      email,
      contactName,
      facebook,
      linkedin,
      companyLogoFileName,
      contractFileName,
    } = req.body;

    try {
      // Check if the user already exists
      const existingUser = await User.findOne({
        where: { userName: username },
      });
      if (existingUser) {
        return res.status(400).json({
          error: "Username already in use! Please choose a different username",
        });
      }

      // Encrypt the password before saving
      const encryptedPassword = encrypt(password);

      // Get authoritative server time
      const serverDateTime = await getServerTime("datetime");
      const now = new Date(serverDateTime);

      // Create a new user with server time for createdAt/updatedAt
      const newUser = await User.create({
        userName: username,
        passWord: encryptedPassword,
        userType: "partner",
        last_login: now,
        createdAt: now,
        updatedAt: now,
      });

      // Fetch the newly created user to get the userID
      const fetchedUser = await User.findOne({ where: { userName: username } });

      // Construct new filenames
      const companyLogoPath = companyLogoFileName
        ? `public/${companyLogoFileName}`
        : null;
      const contractPath = contractFileName
        ? `public/${contractFileName}`
        : null;

      // Insert into the partnercompany table with server time
      await PartnerCompany.create({
        userID: fetchedUser.userID,
        name,
        website,
        industry,
        address,
        description,
        company_logo: companyLogoPath,
        contract: contractPath,
        effective_date: effectiveDate,
        expiry_date: expiryDate,
        contact_number: contactNumber,
        email,
        contact_name: contactName,
        facebook,
        linkedin,
        account_status: "Active",
        createdAt: now,
        updatedAt: now,
      });

      // Respond with success
      res.status(200).json({
        message: "Partner company and user added successfully",
        userID: fetchedUser.userID,
      });
    } catch (error) {
      console.error("Database error:", error);
      res
        .status(500)
        .json({ error: "Error adding partner company to the database" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export const config = {
  api: {
    bodyParser: true, // Enable body parsing for JSON
  },
};
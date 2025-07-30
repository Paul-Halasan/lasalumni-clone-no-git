import PartnerCompany from "../../models/PartnerCompany";
import multer from "multer";
import { getServerTime } from "../../utils/getServerTime";

const upload = multer();

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  upload.none()(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ error: "Error parsing form data" });
    }

    try {
      const {
        company_id,
        name,
        website,
        industry,
        address,
        description,
        account_status,
        contact_name,
        contact_number,
        email,
        facebook,
        linkedin,
        effective_date,
        expiry_date,
        company_logo,
        contract,
      } = req.body;

      if (!company_id || !name) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const existingCompany = await PartnerCompany.findOne({
        where: { company_id },
      });

      if (!existingCompany) {
        return res.status(404).json({ error: "Company not found" });
      }

      const updateData = {
        name,
        website: website || "",
        industry: industry || "",
        address: address || "",
        description: description || "",
        account_status: account_status || "active",
        contact_name: contact_name || "",
        contact_number: contact_number || "",
        email: email || "",
        facebook: facebook || "",
        linkedin: linkedin || "",
      };

      if (effective_date) updateData.effective_date = new Date(effective_date);
      if (expiry_date) updateData.expiry_date = new Date(expiry_date);

      // Only update if new S3 filename is provided
      if (company_logo) updateData.company_logo = company_logo;
      if (contract) updateData.contract = contract;

      // Get authoritative server time and set updatedAt
      const serverDateTime = await getServerTime("datetime");
      updateData.updatedAt = new Date(serverDateTime);

      await PartnerCompany.update(updateData, { where: { company_id } });

      return res.status(200).json({
        message: "Company updated successfully",
        company: { company_id, ...updateData },
      });
    } catch (error) {
      console.error("Error updating company:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
}

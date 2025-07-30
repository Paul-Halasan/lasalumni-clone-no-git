import PartnerCompany from '../../models/PartnerCompany';
import multer from 'multer';
import { getServerTime } from '../../utils/getServerTime';

const upload = multer();

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  upload.none()(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error parsing form data' });
    }

    try {
      const {
        company_id,
        name,
        website,
        company_logo,
        industry,
        address,
        description,
        contract,
        effective_date,
        expiry_date,
        contact_number,
        email,
        contact_name,
        facebook,
        linkedin,
        account_status,
      } = req.body;

      if (!company_id || !name || !email) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const existingCompany = await PartnerCompany.findOne({ where: { company_id } });

      if (!existingCompany) {
        return res.status(404).json({ error: 'Partner company not found' });
      }

      // Construct file paths if new files are uploaded
      const companyLogoPath = company_logo
        ? `${company_logo}`
        : existingCompany.company_logo;
      const contractPath = contract
        ? `${contract}`
        : existingCompany.contract;

      // Get authoritative server time
      const serverDateTime = await getServerTime("datetime");
      const now = new Date(serverDateTime);

      await PartnerCompany.update(
        {
          name,
          website,
          company_logo: companyLogoPath,
          industry,
          address,
          description,
          contract: contractPath,
          effective_date,
          expiry_date,
          contact_number,
          email,
          contact_name,
          facebook,
          linkedin,
          account_status,
          updatedAt: now, // <-- Set updatedAt to server time
        },
        { where: { company_id } }
      );

      return res.status(200).json({ message: 'Partner company profile updated successfully' });
    } catch (error) {
      console.error('Error updating partner company profile:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
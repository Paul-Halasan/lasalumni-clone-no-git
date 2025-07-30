import fs from 'fs';
import PartnerCompany from '../../models/PartnerCompany'; // Import Sequelize PartnerCompany model
import User from '../../models/usermodel'; // Import Sequelize User model

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Extract company_id from the request body
  const { company_id } = req.body;

  try {
    // Fetch the company's details to get the file paths
    const existingCompany = await PartnerCompany.findOne({ where: { company_id } });

    if (!existingCompany) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const { company_logo, contract, userID } = existingCompany;

    // Delete the company from the PartnerCompany model using Sequelize
    await PartnerCompany.destroy({ where: { company_id } });

    // Remove associated user from the User model
    if (userID) {
      await User.destroy({ where: { userID } });
    }

    // Remove files from storage if they exist
    if (company_logo && fs.existsSync(`./public${company_logo}`)) {
      fs.unlinkSync(`./public${company_logo}`); // Remove company logo
    }

    if (contract && fs.existsSync(`./public${contract}`)) {
      fs.unlinkSync(`./public${contract}`); // Remove contract
    }

    return res.status(200).json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

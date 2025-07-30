const DonationDrive = require("../../models/dd_model");

export default async function handler(req, res) {
  try {
    const count = await DonationDrive.count({
      where: { isApproved: 0 }, // 0 for not approved
    });

    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching pending donation drives count:", error);
    res.status(500).json({ error: "Failed to fetch pending donation drives count" });
  }
}
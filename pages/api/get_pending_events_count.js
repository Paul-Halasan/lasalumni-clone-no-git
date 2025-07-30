const Event = require("../../models/eventmodels");

export default async function handler(req, res) {
  try {
    const count = await Event.count({
      where: { isApproved: "pending" }, // false for not approved
    });

    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching pending events count:", error);
    res.status(500).json({ error: "Failed to fetch pending events count" });
  }
}
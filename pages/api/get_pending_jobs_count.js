const Job = require("../../models/jobs");

export default async function handler(req, res) {
  try {
    const count = await Job.count({
      where: { isApproved: "pending" }, // "pending" for not yet approved
    });

    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching pending jobs count:", error);
    res.status(500).json({ error: "Failed to fetch pending jobs count" });
  }
}
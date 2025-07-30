// pages/api/analytics/alumni_login_analytics.js
import { Op } from "sequelize";
import sequelize from "../../../lib/db"; // Adjust path to match your DB connection file
import User from "../../../models/usermodel";
import LoginLog from "../../../models/loginlogs";
import { getServerTime } from '../../../utils/getServerTime';

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { startDate, endDate, userType = "alumni" } = req.query;

    // Use authoritative server date for defaults
    const serverDateTime = await getServerTime("datetime");
    const serverNow = new Date(serverDateTime);

    // Parse dates or use defaults
    const end = endDate ? new Date(endDate) : new Date(serverNow);
    end.setHours(23, 59, 59, 999);

    const start = startDate ? new Date(startDate) : new Date(end);
    start.setHours(0, 0, 0, 0);

    if (!startDate) {
      start.setDate(start.getDate() - 30); // Default to 30 days if no start date
    }

    console.log("Date range being queried:", {
      start: start.toISOString(),
      end: end.toISOString(),
    });

    console.log("Date range:", { start, end }); // Debugging

    // Count total login events in the period - with more flexible userType matching
    const totalLogins = await LoginLog.count({
      where: {
        // Try more flexible matching on userType - could be case issues
        [Op.or]: [
          { userType },
          { userType: userType.toUpperCase() },
          { userType: userType.charAt(0).toUpperCase() + userType.slice(1) },
        ],
        success: true,
        login_time: {
          [Op.gte]: start,
          [Op.lte]: end,
        },
      },
      logging: console.log, // Log the SQL query for debugging
    });

    // Count unique users who logged in - check for case insensitivity
    const uniqueUserResults = await LoginLog.findAll({
      attributes: [
        [sequelize.fn("DISTINCT", sequelize.col("userID")), "userID"],
      ],
      where: {
        // Try more flexible matching on userType - could be case issues
        [Op.or]: [
          { userType },
          { userType: userType.toUpperCase() },
          { userType: userType.charAt(0).toUpperCase() + userType.slice(1) },
        ],
        success: true,
        login_time: {
          [Op.gte]: start,
          [Op.lte]: end,
        },
        userID: {
          [Op.ne]: null, // Ensure userID is not null
        },
      },
      raw: true,
      logging: console.log, // Log the SQL query for debugging
    });

    const uniqueUserCount = uniqueUserResults.length;

    // Count total users of this type
    const totalUsers = await User.count({
      where: { userType },
    });

    // Get daily login counts
    const dailyLogins = await getDailyLoginCounts(start, end, userType);

    // Get average logins per user
    const avgLoginsPerUser =
      uniqueUserCount > 0 ? totalLogins / uniqueUserCount : 0;

    // Calculate previous period metrics for comparison
    const periodDuration = end.getTime() - start.getTime();
    const prevEnd = new Date(start);
    const prevStart = new Date(prevEnd);
    prevStart.setTime(prevEnd.getTime() - periodDuration);

    // Count logins from previous period
    const prevTotalLogins = await LoginLog.count({
      where: {
        userType,
        success: true,
        login_time: {
          [Op.gte]: prevStart,
          [Op.lte]: prevEnd,
        },
      },
    });

    // Calculate change percentage
    const loginChange = calculatePercentChange(prevTotalLogins, totalLogins);

    // Return comprehensive analytics
    res.status(200).json({
      totalLogins,
      uniqueUsers: uniqueUserCount,
      activePercentage: (uniqueUserCount / totalUsers) * 100,
      inactiveUsers: totalUsers - uniqueUserCount,
      avgLoginsPerUser,
      loginChange,
      dailyLogins,
    });
  } catch (error) {
    console.error("Error fetching login analytics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Helper function to get daily login counts - IMPROVED VERSION
async function getDailyLoginCounts(startDate, endDate, userType) {
  const result = [];
  const currentDate = new Date(startDate);

  // Ensure we're starting at the beginning of the day
  currentDate.setHours(0, 0, 0, 0);

  // Create a copy of endDate and set to end of day
  const endDateCopy = new Date(endDate);
  endDateCopy.setHours(23, 59, 59, 999);

  while (currentDate <= endDateCopy) {
    const nextDay = new Date(currentDate);
    nextDay.setDate(currentDate.getDate() + 1);

    const count = await LoginLog.count({
      where: {
        userType,
        success: true,
        login_time: {
          [Op.gte]: currentDate,
          [Op.lt]: nextDay,
        },
      },
    });

    result.push({
      date: currentDate.toISOString().split("T")[0],
      logins: count,
    });

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return result;
}

// Helper to calculate percent change
function calculatePercentChange(previous, current) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

import User from '../../models/usermodel';
import AlumniProfile from '../../models/AlumniProfile'; 
import Event from '../../models/eventmodels';
import PartnerCompany from '../../models/PartnerCompany';
import { Op } from 'sequelize';
import { getServerTime } from '../../utils/getServerTime';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Use authoritative server date
      const serverDateTime = await getServerTime("datetime"); // ISO string
      const today = new Date(serverDateTime);
      today.setHours(0, 0, 0, 0);

      // Count total users
      const totalUsers = await User.count();

      // Count alumni users (assuming userType 'alumni' for alumni users)
      const alumniUsers = await User.count({ where: { userType: 'alumni' } });
      const companyUsers = await PartnerCompany.count();
      const totalEvents = await Event.count();

      // Count new signups for today only
      const newSignups = await AlumniProfile.count({
        where: {
          created_at: {
            [Op.gte]: today,
          },
        },
      });

      const newCompanySignups = await PartnerCompany.count({
        where: {
          created_at: {
            [Op.gte]: today,
          },
        },
      });

      // Handle date range if provided
      const { startDate, endDate } = req.query;
      let signupsRange = [];
      let companySignupsRange = [];

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        // To ensure end date covers the whole day
        const adjustedEndDate = new Date(end);
        adjustedEndDate.setHours(23, 59, 59, 999);

        // Iterate over each day between startDate and endDate
        let currentDate = new Date(start);
        while (currentDate <= adjustedEndDate) {
          const dayStart = new Date(currentDate);
          dayStart.setHours(0, 0, 0, 0); // Set time to start of day

          const dayEnd = new Date(dayStart);
          dayEnd.setDate(dayStart.getDate() + 1);

          // Count signups for this specific day (Alumni)
          const signupsCount = await AlumniProfile.count({
            where: {
              created_at: {
                [Op.gte]: dayStart,
                [Op.lt]: dayEnd,
              },
            },
          });

          // Count signups for this specific day (Company)
          const companySignupsCount = await PartnerCompany.count({
            where: {
              created_at: {
                [Op.gte]: dayStart,
                [Op.lt]: dayEnd,
              },
            },
          });

          // Push results to the arrays
          signupsRange.push({
            date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), // Format as 'MMM DD'
            Signups: signupsCount,
          });

          companySignupsRange.push({
            date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), // Format as 'MMM DD'
            Signups: companySignupsCount,
          });

          // Move to the next day
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }

      // Retrieve signups from the last 7 days if no date range is provided
      const last7Days = [];
      const companyLast7Days = [];
      if (!startDate && !endDate) {
        for (let i = 6; i >= 0; i--) {
          const dayStart = new Date(serverDateTime);
          dayStart.setDate(today.getDate() - i);
          dayStart.setHours(0, 0, 0, 0);

          const dayEnd = new Date(dayStart);
          dayEnd.setDate(dayStart.getDate() + 1);

          const signupsCount = await AlumniProfile.count({
            where: {
              created_at: {
                [Op.gte]: dayStart,
                [Op.lt]: dayEnd,
              },
            },
          });

          const companySignupsCount = await PartnerCompany.count({
            where: {
              created_at: {
                [Op.gte]: dayStart,
                [Op.lt]: dayEnd,
              },
            },
          });

          last7Days.push({
            date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), // Format as 'MMM DD'
            Signups: signupsCount,
          });

          companyLast7Days.push({
            date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), // Format as 'MMM DD'
            Signups: companySignupsCount,
          });
        }
      }

      // Get the count of approved and non-approved events
      const approvedEvents = await Event.count({ where: { isApproved: 1 } });
      const notApprovedEvents = await Event.count({ where: { isApproved: 0 } });

      // Return the data as JSON
      res.status(200).json({ 
        totalUsers, 
        companyUsers,
        alumniUsers, 
        newSignups, 
        newCompanySignups,
        companySignupsOver7Days: startDate && endDate ? companySignupsRange : companyLast7Days, // Company signups logic
        signupsOver7Days: startDate && endDate ? signupsRange : last7Days, // Alumni signups logic
        totalEvents, 
        eventsApprovalStatus: [
          { name: 'Approved', value: approvedEvents, color: 'green.6' },
          { name: 'Not Approved', value: notApprovedEvents, color: 'red.6' }
        ]
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({ error: 'Error fetching dashboard data' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
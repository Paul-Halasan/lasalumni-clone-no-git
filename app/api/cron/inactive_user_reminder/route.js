// app/api/cron/inactive_user_reminder/route.js
import axios from 'axios';
import moment from 'moment-timezone';
import User from '../../../../models/usermodel';
import AlumniProfile from '../../../../models/AlumniProfile';
import { Sequelize } from 'sequelize';
import { getServerTime } from '../../../../utils/getServerTime';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Get authoritative server time
    const serverDateTime = await getServerTime("datetime");
    const serverNow = moment(serverDateTime).tz('Asia/Manila');

    // Calculate the date 3 months ago in Asia/Manila timezone using server time
    const threeMonthsAgo = serverNow.clone().subtract(3, 'months').toDate();

    // Find users who haven’t logged in for 3+ months and include their alumni profile
    const inactiveUsers = await User.findAll({
      where: {
        last_login: {
          [Sequelize.Op.lte]: threeMonthsAgo,
        },
      },
      include: [
        {
          model: AlumniProfile,
          as: 'alumniProfile',
          attributes: ['email_address'],
        },
      ],
    });

    console.log("Inactive Users: ", inactiveUsers);

    // Send reminder emails to inactive users
    for (const user of inactiveUsers) {
      if (user.alumniProfile && user.alumniProfile.email_address) {
        await axios.post(`${request.nextUrl.origin}/api/sendmail`, {
          recipient: user.alumniProfile.email_address,
          subject: 'We miss you! Update your profile',
          text: 'Hello! It’s been a while since you logged in. Please update your profile if there is anything new about you.',
        });
      }
    }

    console.log('Reminder emails sent to inactive users');
    return new Response(JSON.stringify({ message: 'Reminder emails sent.' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error sending reminder emails:', error);
    return new Response(JSON.stringify({ message: 'Failed to send reminders.', error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
}

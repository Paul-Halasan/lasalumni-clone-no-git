//TEST LANG TO PARA SA CRON JOB KUNG GUMAGANA BA

//pages/api/crontestcall.js
// import { sendInactiveUserReminders } from './cron/inactive_user_reminder';

// export default async function handler(req, res) {
//   if (req.method !== 'GET') {
//     return res.status(405).json({ message: 'Method Not Allowed' });
//   }

//   try {
//     // Call your cron job logic manually
//     await sendInactiveUserReminders();
//     return res.status(200).json({ message: 'Cron job executed successfully.' });
//   } catch (error) {
//     console.error('Error executing cron job:', error);
//     return res.status(500).json({ message: 'Error executing cron job', error });
//   }
// }


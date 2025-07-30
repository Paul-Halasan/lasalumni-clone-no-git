import { v4 as uuidv4 } from "uuid";
import AlumniProfile from "../../models/AlumniProfile";
import User from "../../models/usermodel";
import { encrypt } from "../../utils/crypto"; // Import encrypt function
import { getServerTime } from "../../utils/getServerTime"; // Import getServerTime

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    let user;
    let recipientEmail = email;

    // Get authoritative server time
    const serverDateTime = await getServerTime("datetime");
    const now = new Date(serverDateTime);

    if (email === "admin") {
      // Handle admin case: Update password for all admin users
      const adminUsers = await User.findAll({ where: { userType: "admin" } });

      if (!adminUsers || adminUsers.length === 0) {
        return res.status(404).json({ message: "No admin users found" });
      }

      // Generate a random password
      const newPassword = uuidv4().slice(0, 8); // Generate an 8-character password

      // Encrypt the new password before saving
      const encryptedPassword = encrypt(newPassword);

      // Update the password and updatedAt for all admin users
      await User.update(
        { passWord: encryptedPassword, updatedAt: now },
        { where: { userType: "admin" } }
      );

      // Use the email defined in .env.local
      recipientEmail = process.env.EMAIL_USER;

      // Send the new password via email
      const subject = "Admin Password Reset Request";
      const text = `The new password for all admin accounts is: ${newPassword}\n\nPlease log in and change your password immediately.`;

      const emailResponse = await fetch(`${process.env.BASE_URL}/api/sendmail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: recipientEmail,
          subject,
          text,
        }),
      });

      if (!emailResponse.ok) {
        throw new Error("Failed to send email");
      }

      return res.status(200).json({ message: "Password reset email sent successfully to admin email" });
    } else {
      // Check if the email exists in the AlumniProfile
      const alumniProfile = await AlumniProfile.findOne({
        where: { email_address: email },
        include: [{ model: User, as: "user" }],
      });

      if (!alumniProfile) {
        return res.status(404).json({ message: "Email not found" });
      }

      user = alumniProfile.user;

      // Generate a random password
      const newPassword = uuidv4().slice(0, 8); // Generate an 8-character password

      // Encrypt the new password before saving
      const encryptedPassword = encrypt(newPassword);

      // Update the user's password and updatedAt in the database
      await User.update(
        { passWord: encryptedPassword, updatedAt: now },
        { where: { userID: user.userID } }
      );

      // Send the new password via email
      const subject = "Password Reset Request";
      const text = `Your new password is: ${newPassword}\n\nPlease log in and change your password immediately.`;

      const emailResponse = await fetch(`${process.env.BASE_URL}/api/sendmail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: recipientEmail,
          subject,
          text,
        }),
      });

      if (!emailResponse.ok) {
        throw new Error("Failed to send email");
      }

      return res.status(200).json({ message: "Password reset email sent successfully" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred. Please try again later." });
  }
}
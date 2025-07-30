import AlumniProfile from "../../models/AlumniProfile";
import User from "../../models/usermodel";
import sequelize from "../../lib/db"; // Import your Sequelize instance
import { encrypt } from "../../utils/crypto";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const transaction = await sequelize.transaction(); // Start a transaction
    try {
      const { data } = req.body;

      if (!Array.isArray(data)) {
        return res.status(400).json({ error: "Invalid data format. Expected an array of objects." });
      }

      const errors = [];
      const successfulInserts = [];

      // Insert each row into the database
      for (const [index, row] of data.entries()) {
        try {
          // Validate required fields for User
          if (!row.userName || !row.passWord || !row.userType) {
            throw new Error(
              `Missing required fields for User in row ${index + 1}. Required fields: userName, passWord, userType.`
            );
          }

          // Validate required fields for AlumniProfile
          if (!row.last_name || !row.first_name || !row.email_address || !row.department || !row.batch || !row.program) {
            throw new Error(
              `Missing required fields for AlumniProfile in row ${index + 1}. Required fields: last_name, first_name, email_address, department, batch, program.`
            );
          }

          // Check for username conflicts
          const existingUser = await User.findOne({ where: { userName: row.userName }, transaction });
          if (existingUser) {
            throw new Error(`Username conflict in row ${index + 1}: The username "${row.userName}" already exists.`);
          }

          // Insert into the User table
          const newUser = await User.create(
            {
              userName: row.userName,
              passWord: encrypt(row.passWord), // Ensure this is hashed if it's a password
              userType: row.userType,
            },
            { transaction }
          );

          // Fetch the inserted user to get the generated userID
          const insertedUser = await User.findOne({
            where: { userName: row.userName },
            transaction,
          });

          if (!insertedUser || !insertedUser.userID) {
            throw new Error(`Failed to retrieve userID for row ${index + 1}`);
          }

          console.log(`Row ${index + 1}: Created User with userID:`, insertedUser.userID);

          // Use the generated userID for the AlumniProfile table
          const newAlumni = await AlumniProfile.create(
            {
              userID: insertedUser.userID, // Use the userID retrieved from the User table
              last_name: row.last_name,
              first_name: row.first_name,
              middle_name: row.middle_name || null,
              mobile_number: row.mobile_number || null,
              telephone_number: row.telephone_number || null,
              email_address: row.email_address,
              country: row.country || null,
              region: row.region || null,
              city: row.city || null,
              province: row.province || null,
              profile_picture: row.profile_picture || null,
              date_of_birth: row.date_of_birth || null,
              gender: row.gender || null,
              civil_status: row.civil_status || null,
              nationality: row.nationality || null,
              department: row.department,
              batch: row.batch,
              program: row.program,
              resume: row.resume || null,
              job_profession: row.job_profession || null,
              job_status: row.job_status || null,
              prof_summary: row.prof_summary || null,
            },
            { transaction }
          );

          successfulInserts.push({ newUser, newAlumni });
        } catch (error) {
          console.error(`Error processing row ${index + 1}:`, error.message);
          errors.push({ row: index + 1, error: error.message });
        }
      }

      if (errors.length > 0) {
        // Rollback the transaction if there are errors
        await transaction.rollback();
        return res.status(400).json({
          message: "Some rows failed to process.",
          errors,
          successfulInserts: successfulInserts.length,
        });
      }

      // Commit the transaction if all rows are successful
      await transaction.commit();
      res.status(200).json({ message: "Data imported successfully", successfulInserts: successfulInserts.length });
    } catch (error) {
      console.error("Error processing data:", error);
      await transaction.rollback(); // Rollback the transaction on error
      res.status(500).json({ error: "Failed to process data" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
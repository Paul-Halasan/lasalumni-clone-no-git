import jwt from "jsonwebtoken";
import { parseCookies } from "nookies";
import User from "../../../models/usermodel";
import AlumniProfile from "../../../models/AlumniProfile";
import AlumniEducation from "../../../models/alumni_educ";
import { encrypt } from "../../../utils/crypto"; // Import encrypt function
import { getServerTime } from "../../../utils/getServerTime";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Parse cookies to get the access token
    const cookies = parseCookies({ req });
    const accessToken = cookies["access-token"];

    if (!accessToken) {
      return res.status(401).json({ message: "No access token found" });
    }

    // Verify and decode the access token
    const accessTokenSecret = process.env.JWT_SECRET;
    const decoded = jwt.verify(accessToken, accessTokenSecret);

    // Extract the userID from the decoded token
    const DCDuserID = decoded.userID;
    console.log("USER ID FOR ADDING ALUMNI:", DCDuserID);

    // Extract alumni details from the request body
    const {
      username,
      password,
      usertype,
      firstName,
      middleName,
      lastName,
      dateOfBirth,
      gender,
      civilStatus,
      nationality,
      country,
      region,
      city,
      province,
      emailAddress,
      mobileNumber,
      telephoneNumber,
      yearStarted,
      batch,
      school,
      department,
      program,
      profilePictureFileName,
      resumeFileName,
      selectedStatus,
      jobtitle,
      profsummary,
    } = req.body;

    // Ensure all required fields are provided
    if (
      !username ||
      !password ||
      !usertype ||
      !firstName ||
      !lastName ||
      !dateOfBirth ||
      !gender ||
      !civilStatus ||
      !nationality ||
      !country ||
      !city ||
      !province ||
      !emailAddress ||
      !mobileNumber ||
      !yearStarted ||
      !batch ||
      !school ||
      !department ||
      !program
    ) {
      return res.status(400).json({ error: "All required fields must be provided" });
    }

    const profilePicturePath = profilePictureFileName ? `public/${profilePictureFileName}` : null;
    const resumePath = resumeFileName ? `public/${resumeFileName}` : null;

    // Check if the user already exists
    const existingUser = await User.findOne({ where: { userName: username } });
    if (existingUser) {
      return res.status(400).json({ error: "Username already in use, please choose a different username." });
    }

    // Encrypt the password before saving
    const encryptedPassword = encrypt(password);

    // Create a new user
    const newUser = await User.create({
      userName: username,
      passWord: encryptedPassword,
      userType: usertype,
    });

    // Fetch the newly created user to get the userID
    const fetchedUser = await User.findOne({ where: { userName: username } });

    // Insert into the alumni_profile
    await AlumniProfile.create({
      userID: fetchedUser.userID,
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      mobile_number: mobileNumber,
      telephone_number: telephoneNumber,
      email_address: emailAddress,
      country,
      region,
      city,
      province,
      profile_picture: profilePicturePath,
      date_of_birth: dateOfBirth,
      gender,
      civil_status: civilStatus,
      nationality,
      department,
      batch,
      program,
      resume: resumePath,
      job_profession: jobtitle,
      job_status: selectedStatus,
      prof_summary: profsummary,
    });

    // Fetch server time once
    const serverDateTime = await getServerTime("datetime");
    const now = new Date(serverDateTime);

    await AlumniEducation.create({
      userID: fetchedUser.userID,
      degree: program,
      school,
      start_date: yearStarted,
      end_date: batch,
      createdAt: now,
      updatedAt: now,
    });

    return res.status(200).json({ message: "User and profile added successfully", userID: fetchedUser.userID });
  } catch (error) {
    console.error("Error adding alumni:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export const config = {
  api: {
    bodyParser: true, // Enable body parsing for JSON
  },
};
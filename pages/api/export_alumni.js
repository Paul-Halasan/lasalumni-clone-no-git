import AlumniProfile from "../../models/AlumniProfile"; // Sequelize model
import xlsx from "xlsx";
import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Fetch alumni data from the database
    const alumniData = await AlumniProfile.findAll();

    // Prepare data for the Excel file
    const data = alumniData.map((alumni) => ({
      FirstName: alumni.first_name,
      LastName: alumni.last_name,
      Email: alumni.email_address,
      Telephone: alumni.telephone_number,
      Batch: alumni.batch,
      Department: alumni.department,
    }));

    // Create a new workbook and worksheet
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(workbook, worksheet, "Alumni Data");

    // Write the workbook to a buffer
    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Generate a unique file name
    const fileName = `alumni-data-${Date.now()}.xlsx`;

    // Request a presigned URL from your API
    const presignedUrlResponse = await axios.get(
      `${process.env.BASE_URL}/api/generate_presigned_url`,
      {
        params: {
          fileName,
          fileType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      }
    );

    const presignedUrl = presignedUrlResponse.data.url;

    // Upload the file to S3 using the presigned URL
    await axios.put(presignedUrl, buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

    // Return the S3 file URL
    const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/public/${fileName}`;
    return res.status(200).json({ fileUrl });
  } catch (error) {
    console.error("Error exporting alumni data:", error);
    return res.status(500).json({ error: "Failed to export alumni data" });
  }
}
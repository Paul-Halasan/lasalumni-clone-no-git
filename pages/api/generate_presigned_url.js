import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION, // Add your AWS region here
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  const { fileName, fileType } = req.query;

  const s3Params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME, // Ensure this is set correctly
    Key: `public/${fileName}`, // Ensure this is set correctly
    ContentType: fileType,
  };

  try {
    const command = new PutObjectCommand(s3Params);
    const url = await getSignedUrl(s3Client, command, { expiresIn: 60 }); // URL expiration time in seconds
    res.status(200).json({ url });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    res.status(500).json({ error: 'Error generating presigned URL' });
  }
}

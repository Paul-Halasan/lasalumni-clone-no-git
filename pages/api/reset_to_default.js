import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { type } = req.body;

    const defaultContent = {
      description: 'Discover the Future of Alumni Networking on the Revamped Alumni Portal – Crafted for You in 2024',
      homepageBackgroundImage: '/landingpage.jpg',
      loginBackgroundImage: '/loginbg.png',
    };

    try {
      // Path to the JSON file
      const filePath = path.resolve(process.cwd(), 'data', 'homepageContent.json');

      // Read existing content
      let homepageContent = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      // Update the relevant field based on type
      if (type === 'homepage') {
        homepageContent.homepageBackgroundImage = defaultContent.homepageBackgroundImage;
      } else if (type === 'login') {
        homepageContent.loginBackgroundImage = defaultContent.loginBackgroundImage;
      } else if (type === 'description') {
        homepageContent.description = defaultContent.description;
      } else {
        return res.status(400).json({ message: 'Invalid reset type' });
      }

      // Write updated content back to file
      fs.writeFileSync(filePath, JSON.stringify(homepageContent, null, 2), 'utf8');

      res.status(200).json({ message: `${type} reset to default successfully`, updatedContent: homepageContent });
    } catch (error) {
      console.error(`Error resetting ${type} to default:`, error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
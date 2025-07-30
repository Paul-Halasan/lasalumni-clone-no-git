import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const filePath = path.resolve(process.cwd(), 'data', 'homepageContent.json');
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const homepageContent = JSON.parse(fileContents);

      res.status(200).json(homepageContent);
    } catch (error) {
      console.error('Error reading homepage content:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
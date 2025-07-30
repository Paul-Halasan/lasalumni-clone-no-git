import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  if (req.method === 'POST') {
    const form = new IncomingForm();
    form.uploadDir = path.join(process.cwd(), 'public/uploads');
    form.keepExtensions = true;

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Error parsing form data:', err);
        return res.status(500).json({ message: 'Error parsing form data' });
      }

      const description = fields.description;
      let homepageBackgroundImage = fields.homepageBackgroundImage;
      let loginBackgroundImage = fields.loginBackgroundImage;

      console.log('Fields:', fields);
      console.log('Files:', files);

      if (files.homepageBackgroundImage && files.homepageBackgroundImage.length > 0) {
        const file = files.homepageBackgroundImage[0];
        const newPath = path.join(form.uploadDir, file.newFilename);
        fs.renameSync(file.filepath, newPath);
        homepageBackgroundImage = `/uploads/${file.newFilename}`;
      }

      if (files.loginBackgroundImage && files.loginBackgroundImage.length > 0) {
        const file = files.loginBackgroundImage[0];
        const newPath = path.join(form.uploadDir, file.newFilename);
        fs.renameSync(file.filepath, newPath);
        loginBackgroundImage = `/uploads/${file.newFilename}`;
      }

      const homepageContent = {
        description,
        homepageBackgroundImage,
        loginBackgroundImage,
      };

      try {
        const filePath = path.resolve(process.cwd(), 'data', 'homepageContent.json');
        fs.writeFileSync(filePath, JSON.stringify(homepageContent, null, 2), 'utf8');
        res.status(200).json({ message: 'Homepage content updated successfully' });
      } catch (error) {
        console.error('Error saving homepage content:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
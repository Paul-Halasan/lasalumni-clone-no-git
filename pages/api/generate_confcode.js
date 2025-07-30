// pages/api/generate_confcode.js
export default function handler(req, res) {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
  
    // Generate a random confirmation code in the format "#######"
    const confirmationCode = `${Math.floor(100000 + Math.random() * 900000)}`;
  
    return res.status(200).json({ confirmationCode });
}
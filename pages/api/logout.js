export default function handler(req, res) {
    res.setHeader('Set-Cookie', [
        'access-token=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict',
        'refresh-token=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict'
    ]);
    
    res.status(200).json({ message: 'Logged out successfully' });
}

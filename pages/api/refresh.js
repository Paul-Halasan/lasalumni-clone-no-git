import { parseCookies, setCookie } from 'nookies';
import { serialize } from 'cookie';
import jwt from 'jsonwebtoken';
import { sign } from 'jsonwebtoken';

//assign new access token

export default async function handler(req, res) {
    try {
        const cookies = parseCookies({ req });
        const refreshToken = cookies['refresh-token'];
        console.log('refreshToken:', refreshToken);
        if (!refreshToken) {
            return res.status(401).json({ error: 'No refresh token found' });
        } else {
            const accessTokenSecret = process.env.JWT_SECRET;
            const refreshTokenSecret = process.env.REFRESHJWT_SECRET;

            // Verify the refresh token
            const decoded = jwt.verify(refreshToken, refreshTokenSecret);

            // Generate Access Token
            const token = sign(
                { userName: decoded.userName, userType: decoded.userType, userID: decoded.userID },
                accessTokenSecret,
                { expiresIn: '10m' }  // Shorter expiration for access token || 1 minute for testing
            );

            const tokenSerialized = serialize('access-token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 10,  // 15 minutes || 1 minute for testing
                path: '/',
            });
            console.log('access-token:', tokenSerialized);
            res.setHeader('Set-Cookie', [tokenSerialized]);
            return res.status(200).json({ message: 'Token refreshed' });
        }

    } catch (error) {
        console.error('Error refreshing token:', error);
        return res.status(401).json({ error: 'Invalid refresh token' });
    }
}
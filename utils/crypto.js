// filepath: e:\trylang\utils\crypto.js
import crypto from 'crypto';

const algorithm = 'aes-256-cbc'; // AES encryption algorithm
const secretKey = process.env.ENCRYPTION_SECRET_KEY; // Secret key from environment variables
const ivLength = 16; // Initialization vector length

if (!secretKey || Buffer.from(secretKey, 'hex').length !== 32) {
  throw new Error('ENCRYPTION_SECRET_KEY must be a 32-byte hexadecimal string.');
}

/**
 * Encrypts a plain text string.
 * @param {string} text - The plain text to encrypt.
 * @returns {string} - The encrypted text in base64 format.
 */
export function encrypt(text) {
  const iv = crypto.randomBytes(ivLength); // Generate a random IV
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, 'hex'), iv);
  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return `${iv.toString('hex')}:${encrypted}`; // Combine IV and encrypted text
}

/**
 * Decrypts an encrypted string.
 * @param {string} encryptedText - The encrypted text in base64 format.
 * @returns {string} - The decrypted plain text.
 */
export function decrypt(encryptedText) {
  const [ivHex, encrypted] = encryptedText.split(':'); // Split IV and encrypted text
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey, 'hex'), iv);
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
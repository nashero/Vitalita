// node-crypto.js - Node.js specific crypto utility for seed scripts
import crypto from 'crypto';

export function generateSHA256Hash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
} 
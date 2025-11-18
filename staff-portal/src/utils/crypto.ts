// src/utils/crypto.ts - Browser-compatible crypto utility

export async function generateSHA256Hash(data: string): Promise<string> {
  // Use Web Crypto API for browser compatibility
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  
  // Convert buffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

/**
 * Creates authentication hash from donor ID, secret, and salt
 */
export async function createAuthHash(donorId: string, secret: string, salt: string): Promise<string> {
  const combinedInput = `${donorId}${secret}${salt}`;
  return await generateSHA256Hash(combinedInput);
}

/**
 * Generates a random salt for password hashing
 */
export function generateSalt(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}


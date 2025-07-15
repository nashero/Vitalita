/**
 * Generates SHA-256 hash using Web Crypto API
 */
export async function generateSHA256Hash(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
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
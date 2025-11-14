/**
 * Generate SHA-256 hash of a string
 * This is used for GDPR-compliant donor identification
 * Personal information is hashed and never stored in plain text
 */
export async function generateSHA256Hash(input: string): Promise<string> {
  // Convert string to ArrayBuffer
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  
  // Hash the data
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convert ArrayBuffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

/**
 * Generate a random salt for additional security
 * This salt is stored with the hash to ensure uniqueness
 */
export function generateSalt(): string {
  // Generate a cryptographically secure random salt
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  
  // Convert to hex string
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generate donor hash ID from personal information
 * This creates a unique identifier without storing PII
 * Format: SHA256(firstName + lastName + dateOfBirth + donorId)
 */
export async function generateDonorHashId(
  firstName: string,
  lastName: string,
  dateOfBirth: string,
  donorId: string
): Promise<string> {
  // Combine all personal information into a single string
  const authString = `${firstName}${lastName}${dateOfBirth}${donorId}`;
  
  // Generate hash
  return await generateSHA256Hash(authString);
}


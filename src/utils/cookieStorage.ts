/**
 * Cookie Storage Utilities for Donor Credentials
 * 
 * This module provides secure cookie storage for donor registration credentials
 * that persist between sessions and enable the PIN setup flow.
 */

export interface DonorCredentials {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  donorId: string;
  email?: string;
  registrationTimestamp?: number;
}

const CREDENTIALS_COOKIE_NAME = 'vitalita_donor_credentials';
const COOKIE_EXPIRY_DAYS = 7; // Credentials expire after 7 days

/**
 * Set donor credentials in a secure cookie
 */
export function setDonorCredentials(credentials: DonorCredentials): void {
  try {
    const credentialsWithTimestamp = {
      ...credentials,
      registrationTimestamp: Date.now()
    };
    
    const cookieValue = encodeURIComponent(JSON.stringify(credentialsWithTimestamp));
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + COOKIE_EXPIRY_DAYS);
    
    document.cookie = `${CREDENTIALS_COOKIE_NAME}=${cookieValue}; expires=${expiryDate.toUTCString()}; path=/; secure; samesite=strict`;
    
    console.log('Donor credentials stored in cookie');
  } catch (error) {
    console.error('Failed to store donor credentials in cookie:', error);
  }
}

/**
 * Get donor credentials from cookie
 */
export function getDonorCredentials(): DonorCredentials | null {
  try {
    const cookies = document.cookie.split(';');
    const credentialsCookie = cookies.find(cookie => 
      cookie.trim().startsWith(`${CREDENTIALS_COOKIE_NAME}=`)
    );
    
    if (!credentialsCookie) {
      return null;
    }
    
    const cookieValue = credentialsCookie.split('=')[1];
    const credentials = JSON.parse(decodeURIComponent(cookieValue)) as DonorCredentials;
    
    // Check if credentials are expired
    if (credentials.registrationTimestamp) {
      const now = Date.now();
      const expiryTime = credentials.registrationTimestamp + (COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
      
      if (now > expiryTime) {
        console.log('Donor credentials cookie has expired');
        clearDonorCredentials();
        return null;
      }
    }
    
    return credentials;
  } catch (error) {
    console.error('Failed to retrieve donor credentials from cookie:', error);
    return null;
  }
}

/**
 * Clear donor credentials from cookie
 */
export function clearDonorCredentials(): void {
  try {
    document.cookie = `${CREDENTIALS_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; samesite=strict`;
    console.log('Donor credentials cleared from cookie');
  } catch (error) {
    console.error('Failed to clear donor credentials from cookie:', error);
  }
}

/**
 * Check if donor credentials exist and are valid
 */
export function hasValidDonorCredentials(): boolean {
  const credentials = getDonorCredentials();
  return credentials !== null && 
         credentials.firstName && 
         credentials.lastName && 
         credentials.dateOfBirth && 
         credentials.donorId;
}

/**
 * Update donor credentials (useful for adding email after verification)
 */
export function updateDonorCredentials(updates: Partial<DonorCredentials>): boolean {
  try {
    const existingCredentials = getDonorCredentials();
    if (!existingCredentials) {
      return false;
    }
    
    const updatedCredentials = {
      ...existingCredentials,
      ...updates
    };
    
    setDonorCredentials(updatedCredentials);
    return true;
  } catch (error) {
    console.error('Failed to update donor credentials:', error);
    return false;
  }
}

/**
 * Get credentials for PIN setup (ensures all required fields are present)
 */
export function getCredentialsForPinSetup(): DonorCredentials | null {
  const credentials = getDonorCredentials();
  
  if (!credentials) {
    return null;
  }
  
  // Ensure all required fields are present for PIN setup
  if (!credentials.firstName || 
      !credentials.lastName || 
      !credentials.dateOfBirth || 
      !credentials.donorId) {
    console.log('Incomplete credentials for PIN setup');
    return null;
  }
  
  return credentials;
}

/**
 * Validate donor credentials format
 */
export function validateDonorCredentials(credentials: DonorCredentials): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!credentials.firstName?.trim()) {
    errors.push('First name is required');
  }
  
  if (!credentials.lastName?.trim()) {
    errors.push('Last name is required');
  }
  
  if (!credentials.dateOfBirth) {
    errors.push('Date of birth is required');
  } else {
    // Validate date format
    const date = new Date(credentials.dateOfBirth);
    if (isNaN(date.getTime())) {
      errors.push('Invalid date of birth format');
    }
  }
  
  if (!credentials.donorId?.trim()) {
    errors.push('Donor ID is required');
  } else {
    // Validate donor ID format (5-digit alphanumeric)
    const donorIdRegex = /^[A-Za-z0-9]{5}$/;
    if (!donorIdRegex.test(credentials.donorId)) {
      errors.push('Donor ID must be exactly 5 alphanumeric characters');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

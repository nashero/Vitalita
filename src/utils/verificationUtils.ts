/**
 * Verification Status Detection Utilities
 * 
 * This module provides utilities to detect donor verification status
 * and manage the PIN setup flow after email verification.
 */

import { supabase } from '../lib/supabase';
import { getDonorCredentials, DonorCredentials } from './cookieStorage';
import { generateSHA256Hash } from './crypto';

export interface VerificationStatus {
  isVerified: boolean;
  needsPinSetup: boolean;
  donorId?: string;
  isFullyActivated?: boolean;
  error?: string;
}

/**
 * Check if a donor is verified and needs PIN setup
 */
export async function checkVerificationStatus(): Promise<VerificationStatus> {
  try {
    // Get credentials from cookies
    const credentials = getDonorCredentials();
    if (!credentials) {
      return {
        isVerified: false,
        needsPinSetup: false,
        error: 'No registration credentials found'
      };
    }

    // Generate hash from credentials
    const authString = `${credentials.firstName}${credentials.lastName}${credentials.dateOfBirth}${credentials.donorId}`;
    const donorHashId = await generateSHA256Hash(authString);

    // Check donor status in database
    const { data: donorData, error } = await supabase
      .from('donors')
      .select('donor_id, email_verified, account_activated, is_active')
      .eq('donor_hash_id', donorHashId)
      .single();

    if (error) {
      console.error('Error checking verification status:', error);
      return {
        isVerified: false,
        needsPinSetup: false,
        error: 'Failed to check verification status'
      };
    }

    if (!donorData) {
      return {
        isVerified: false,
        needsPinSetup: false,
        error: 'Donor not found'
      };
    }

    // Check if email is verified (PIN setup can happen after email verification)
    const isEmailVerified = donorData.email_verified;
    const isFullyActivated = donorData.account_activated && donorData.is_active;
    
    // Allow PIN setup after email verification, even if not fully activated by staff
    const needsPinSetup = isEmailVerified && !isFullyActivated;

    return {
      isVerified: isEmailVerified,
      needsPinSetup: needsPinSetup,
      donorId: donorData.donor_id,
      isFullyActivated: isFullyActivated
    };
  } catch (error) {
    console.error('Error checking verification status:', error);
    return {
      isVerified: false,
      needsPinSetup: false,
      error: 'An error occurred while checking verification status'
    };
  }
}

/**
 * Check if user should be redirected to PIN setup
 */
export async function shouldRedirectToPinSetup(): Promise<{
  shouldRedirect: boolean;
  reason?: string;
}> {
  try {
    const status = await checkVerificationStatus();
    
    if (status.error) {
      return {
        shouldRedirect: false,
        reason: status.error
      };
    }

    if (status.isVerified && status.needsPinSetup) {
      return {
        shouldRedirect: true,
        reason: 'Donor is verified and needs PIN setup'
      };
    }

    return {
      shouldRedirect: false,
      reason: status.isVerified ? 'Already has PIN setup' : 'Not verified yet'
    };
  } catch (error) {
    console.error('Error checking PIN setup redirect:', error);
    return {
      shouldRedirect: false,
      reason: 'Error checking verification status'
    };
  }
}

/**
 * Verify donor identity using stored credentials
 */
export async function verifyDonorIdentity(credentials: DonorCredentials): Promise<{
  isValid: boolean;
  donorId?: string;
  error?: string;
  isUnverified?: boolean;
}> {
  try {
    // Generate hash from credentials
    const authString = `${credentials.firstName}${credentials.lastName}${credentials.dateOfBirth}${credentials.donorId}`;
    const donorHashId = await generateSHA256Hash(authString);

    // Check if donor exists and is verified
    const { data: donorData, error } = await supabase
      .from('donors')
      .select('donor_id, email_verified, account_activated, is_active')
      .eq('donor_hash_id', donorHashId)
      .single();

    if (error) {
      console.error('Error verifying donor identity:', error);
      return {
        isValid: false,
        error: 'Failed to verify donor identity'
      };
    }

    if (!donorData) {
      return {
        isValid: false,
        error: 'Donor not found with these credentials'
      };
    }

    // Check if account is activated and email is verified
    if (!donorData.email_verified) {
      return {
        isValid: false,
        error: 'Email not verified yet',
        isUnverified: true
      };
    }

    if (!donorData.account_activated) {
      return {
        isValid: false,
        error: 'Account not activated yet'
      };
    }

    if (!donorData.is_active) {
      return {
        isValid: false,
        error: 'Account is not active'
      };
    }

    return {
      isValid: true,
      donorId: donorData.donor_id
    };
  } catch (error) {
    console.error('Error verifying donor identity:', error);
    return {
      isValid: false,
      error: 'An error occurred while verifying identity'
    };
  }
}

/**
 * Check if donor has completed PIN setup
 */
export async function hasCompletedPinSetup(): Promise<boolean> {
  try {
    // This would check if PIN is set up in the PIN storage system
    // For now, we'll use a simple check
    const { hasValidPinData } = await import('./pinStorage');
    return await hasValidPinData();
  } catch (error) {
    console.error('Error checking PIN setup status:', error);
    return false;
  }
}

/**
 * Get verification status for display
 */
export function getVerificationStatusMessage(status: VerificationStatus): string {
  if (status.error) {
    return `Error: ${status.error}`;
  }

  if (!status.isVerified) {
    return 'Staff will notify you by email after 45 days regarding your verification status. Once you are verified you will be able to setup your PIN.';
  }

  if (status.needsPinSetup) {
    return 'Your account is verified! Please set up your PIN to complete the registration process.';
  }

  return 'Your account is verified and ready to use.';
}

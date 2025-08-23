/**
 * Donor Credentials Module
 * 
 * This module provides secure collection and storage of donor credentials
 * with local-only encrypted storage and device authentication.
 */

export { CredentialForm } from './CredentialForm';
export { DemoPage } from './DemoPage';
export { UsageExample } from './UsageExample';

// Re-export types and utilities for convenience
export type { DonorCredentials, EncryptedData } from '../../utils/encryption';
export type { ValidationResult, FieldValidation } from '../../utils/validation';
export type { DeviceAuthResult, DeviceAuthConfig } from '../../utils/deviceAuth';

// Re-export utility functions
export {
  validateDonorCredentials,
  sanitizeInput,
  AVIS_CENTERS,
  validateBrowserCompatibility
} from '../../utils/validation';

export {
  storeCredentials,
  retrieveCredentials,
  hasValidCredentials,
  clearCredentials,
  getStorageInfo,
  updateCredentials,
  extendCredentialsExpiration
} from '../../utils/secureStorage';

export {
  authenticateDevice,
  isDeviceAuthenticated,
  getCurrentDeviceInfo,
  getDeviceAuthStatus,
  forceDeviceReauthentication,
  getDeviceAuthStats
} from '../../utils/deviceAuth';

export {
  encryptCredentials,
  decryptCredentials,
  generateDeviceHash,
  verifyDeviceAuthentication
} from '../../utils/encryption';

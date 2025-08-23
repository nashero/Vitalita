import React, { useState, useEffect } from 'react';
import { 
  CredentialForm, 
  DonorCredentials, 
  storeCredentials, 
  retrieveCredentials,
  hasValidCredentials,
  clearCredentials,
  getStorageInfo,
  authenticateDevice
} from './index';

/**
 * Usage Example Component
 * 
 * This component demonstrates how to integrate the secure donor credentials
 * system into other parts of your application.
 */
export const UsageExample: React.FC = () => {
  const [hasStoredCredentials, setHasStoredCredentials] = useState(false);
  const [storageInfo, setStorageInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkCredentialsStatus();
  }, []);

  const checkCredentialsStatus = async () => {
    try {
      setIsLoading(true);
      const hasCredentials = await hasValidCredentials();
      setHasStoredCredentials(hasCredentials);
      
      if (hasCredentials) {
        const info = getStorageInfo();
        setStorageInfo(info);
      }
    } catch (error) {
      console.error('Failed to check credentials status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialsStored = async (credentials: DonorCredentials) => {
    console.log('Credentials stored successfully:', credentials);
    await checkCredentialsStatus();
    
    // You can now use these credentials for other operations
    // For example, pre-fill forms, authenticate users, etc.
  };

  const handleCredentialsRetrieved = async (credentials: DonorCredentials) => {
    console.log('Credentials retrieved successfully:', credentials);
    
    // You can now use these credentials for other operations
    // For example, pre-fill forms, authenticate users, etc.
  };

  const handleUseCredentials = async () => {
    try {
      const credentials = await retrieveCredentials();
      if (credentials) {
        // Example: Use credentials to authenticate or pre-fill forms
        console.log('Using credentials for:', credentials.firstName, credentials.lastName);
        
        // You could navigate to another page with these credentials
        // or trigger some other action in your app
        alert(`Welcome back, ${credentials.firstName}! Your credentials are ready to use.`);
      }
    } catch (error) {
      console.error('Failed to use credentials:', error);
      alert('Failed to retrieve credentials. Please try again.');
    }
  };

  const handleClearAllCredentials = async () => {
    try {
      clearCredentials();
      await checkCredentialsStatus();
      alert('All stored credentials have been cleared.');
    } catch (error) {
      console.error('Failed to clear credentials:', error);
      alert('Failed to clear credentials. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking credentials status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Secure Donor Credentials - Usage Example
        </h1>
        <p className="text-gray-600">
          This example shows how to integrate the secure donor credentials system
          into your application workflow.
        </p>
      </div>

      {/* Status Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Status</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Credentials Status</h3>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                hasStoredCredentials ? 'bg-green-500' : 'bg-gray-400'
              }`}></div>
              <span className="text-sm text-gray-600">
                {hasStoredCredentials ? 'Credentials Available' : 'No Credentials Stored'}
              </span>
            </div>
          </div>

          {storageInfo && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Storage Info</h3>
              <div className="text-sm text-gray-600">
                <div>Stored: {new Date(storageInfo.storedAt).toLocaleDateString()}</div>
                <div>Expires: {new Date(storageInfo.expiresAt).toLocaleDateString()}</div>
                <div className={`font-medium ${
                  storageInfo.isExpired ? 'text-red-600' : 'text-green-600'
                }`}>
                  Status: {storageInfo.isExpired ? 'Expired' : 'Valid'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-3">
          {hasStoredCredentials && (
            <>
              <button
                onClick={handleUseCredentials}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Use Stored Credentials
              </button>
              
              <button
                onClick={handleClearAllCredentials}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Clear All Credentials
              </button>
            </>
          )}
          
          <button
            onClick={checkCredentialsStatus}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Refresh Status
          </button>
        </div>
      </div>

      {/* Integration Examples */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Integration Examples</h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Pre-fill Forms</h3>
            <p className="text-sm text-blue-800">
              Use stored credentials to automatically fill in forms when users return to your site.
              This improves user experience while maintaining security.
            </p>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">Authentication</h3>
            <p className="text-sm text-green-800">
              Verify device authentication before allowing access to sensitive features
              or donor-specific information.
            </p>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="font-medium text-purple-900 mb-2">Session Management</h3>
            <p className="text-sm text-purple-800">
              Use stored credentials to maintain user sessions across browser tabs
              and page refreshes without compromising security.
            </p>
          </div>
        </div>
      </div>

      {/* Main Credential Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {hasStoredCredentials ? 'Update Credentials' : 'Store New Credentials'}
        </h2>
        
        <CredentialForm
          onCredentialsStored={handleCredentialsStored}
          onCredentialsRetrieved={handleCredentialsRetrieved}
          showPrivacyNotice={true}
        />
      </div>

      {/* Code Examples */}
      <div className="mt-8 bg-gray-900 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Code Examples</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-200 mb-2">Check if credentials exist</h3>
            <pre className="bg-gray-800 p-4 rounded text-sm text-gray-300 overflow-x-auto">
{`const hasCredentials = await hasValidCredentials();
if (hasCredentials) {
  // User has stored credentials
  const credentials = await retrieveCredentials();
  // Use credentials...
}`}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-200 mb-2">Store new credentials</h3>
            <pre className="bg-gray-800 p-4 rounded text-sm text-gray-300 overflow-x-auto">
{`const success = await storeCredentials({
  firstName: 'John',
  lastName: 'Doe',
  avisCenter: 'AVIS Casalmaggiore',
  donorId: 'DON123456'
});

if (success) {
  // Credentials stored successfully
}`}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-200 mb-2">Device authentication</h3>
            <pre className="bg-gray-800 p-4 rounded text-sm text-gray-300 overflow-x-auto">
{`try {
  await authenticateDevice();
  // Device is authenticated, proceed with operations
} catch (error) {
  // Handle authentication failure
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

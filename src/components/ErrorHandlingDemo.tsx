import React, { useState } from 'react';
import { APPOINTMENT_ERRORS, AppointmentError } from '../utils/appointmentErrors';
import AppointmentErrorDisplay from './AppointmentErrorDisplay';

export default function ErrorHandlingDemo() {
  const [selectedError, setSelectedError] = useState<AppointmentError | null>(null);
  const [showDemo, setShowDemo] = useState(false);

  const errorCategories = [
    {
      title: 'Availability Issues',
      errors: [
        APPOINTMENT_ERRORS.SLOT_FULL,
        APPOINTMENT_ERRORS.SLOT_UNAVAILABLE,
        APPOINTMENT_ERRORS.INVALID_SLOT,
        APPOINTMENT_ERRORS.PAST_DATE
      ]
    },
    {
      title: 'System Issues',
      errors: [
        APPOINTMENT_ERRORS.CONNECTION_FAILED,
        APPOINTMENT_ERRORS.NETWORK_ERROR,
        APPOINTMENT_ERRORS.TIMEOUT_ERROR,
        APPOINTMENT_ERRORS.UNKNOWN_ERROR
      ]
    },
    {
      title: 'User Issues',
      errors: [
        APPOINTMENT_ERRORS.UNAUTHORIZED,
        APPOINTMENT_ERRORS.INVALID_DONOR,
        APPOINTMENT_ERRORS.DUPLICATE_APPOINTMENT
      ]
    },
    {
      title: 'Vitalita-Specific',
      errors: [
        APPOINTMENT_ERRORS.DONOR_ELIGIBILITY,
        APPOINTMENT_ERRORS.CENTER_MAINTENANCE,
        APPOINTMENT_ERRORS.APPOINTMENT_LIMIT,
        APPOINTMENT_ERRORS.DONATION_FREQUENCY
      ]
    }
  ];

  const handleErrorSelect = (error: AppointmentError) => {
    setSelectedError(error);
    setShowDemo(true);
  };

  const handleRetry = () => {
    alert('Retry functionality would be implemented here!');
  };

  const handleContactSupport = () => {
    alert('Contact Support:\nPhone: +39 0123 456 789\nEmail: support@vitalita.org');
  };

  const resetDemo = () => {
    setSelectedError(null);
    setShowDemo(false);
  };

  if (showDemo && selectedError) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button
              onClick={resetDemo}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Back to Error Examples
            </button>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Error Display Demo: {selectedError.code}
          </h1>
          
          <AppointmentErrorDisplay
            error={selectedError}
            onRetry={handleRetry}
            onContactSupport={handleContactSupport}
          />
          
          <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Code:</span> {selectedError.code}
              </div>
              <div>
                <span className="font-medium">Severity:</span> {selectedError.severity}
              </div>
              <div className="col-span-2">
                <span className="font-medium">Technical Message:</span> {selectedError.message}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Appointment Error Handling Demo
        </h1>
        
        <p className="text-gray-600 mb-8 max-w-3xl">
          This demo shows how different types of appointment booking errors are handled 
          in the Vitalita system. Click on any error to see how it would be displayed 
          to donors with helpful messages and suggestions.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {errorCategories.map((category) => (
            <div key={category.title} className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{category.title}</h2>
              <div className="space-y-3">
                {category.errors.map((error) => (
                  <button
                    key={error.code}
                    onClick={() => handleErrorSelect(error)}
                    className="w-full text-left p-3 rounded-md border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200"
                  >
                    <div className="font-medium text-gray-900">{error.code}</div>
                    <div className="text-sm text-gray-600 mt-1">{error.userMessage}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">How It Works</h3>
          <div className="text-blue-800 space-y-2">
            <p>• <strong>Specific Error Messages:</strong> Each error type has a clear, user-friendly message</p>
            <p>• <strong>Actionable Suggestions:</strong> Donors get specific guidance on what to do next</p>
            <p>• <strong>Retry Functionality:</strong> Most errors include a "Try Again" button</p>
            <p>• <strong>Support Information:</strong> Critical errors include contact information</p>
            <p>• <strong>Error Codes:</strong> Technical details for support team reference</p>
          </div>
        </div>
      </div>
    </div>
  );
}



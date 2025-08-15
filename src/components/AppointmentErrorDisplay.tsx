import React from 'react';
import { AlertCircle, AlertTriangle, XCircle, RefreshCw, Phone, Mail, HelpCircle } from 'lucide-react';
import { AppointmentError, getErrorColor, getErrorIcon } from '../utils/appointmentErrors';

interface AppointmentErrorDisplayProps {
  error: AppointmentError;
  onRetry?: () => void;
  onRefresh?: () => void;
  onContactSupport?: () => void;
  className?: string;
}

export default function AppointmentErrorDisplay({ 
  error, 
  onRetry, 
  onRefresh,
  onContactSupport, 
  className = '' 
}: AppointmentErrorDisplayProps) {
  const errorColors = getErrorColor(error.severity);
  const errorIcon = getErrorIcon(error.severity);

  const getIconComponent = () => {
    switch (error.severity) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-700" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getActionButtons = () => {
    const buttons = [];

    // Add retry button for most errors
    if (onRetry && error.severity !== 'critical') {
      buttons.push(
        <button
          key="retry"
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </button>
      );
    }

    // Add refresh button for slot availability errors
    if (onRefresh && (error.code === 'SLOT_UNAVAILABLE' || error.code === 'SLOT_FULL' || error.code === 'SLOT_CHANGED' || error.code === 'SLOT_TOO_SOON')) {
      buttons.push(
        <button
          key="refresh"
          onClick={onRefresh}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Slots
        </button>
      );
    }

    // Add contact support button for errors and critical issues
    if (onContactSupport && (error.severity === 'error' || error.severity === 'critical')) {
      buttons.push(
        <button
          key="support"
          onClick={onContactSupport}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          Contact Support
        </button>
      );
    }

    return buttons;
  };

  const getSupportInfo = () => {
    if (error.severity === 'critical' || error.severity === 'error') {
      return (
        <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
          <div className="flex items-start">
            <HelpCircle className="w-4 h-4 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">Need help?</p>
              <div className="space-y-1">
                <div className="flex items-center">
                  <Phone className="w-3 h-3 text-gray-400 mr-2" />
                  <span>Call: +39 0123 456 789</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-3 h-3 text-gray-400 mr-2" />
                  <span>Email: support@vitalita.org</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      <div className={`border rounded-lg p-6 ${errorColors}`}>
        {/* Error Header */}
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIconComponent()}
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-lg font-medium mb-2">
              {error.userMessage}
            </h3>
            <p className="text-sm mb-4">
              {error.suggestion}
            </p>
          </div>
        </div>

        {/* Error Details */}
        <div className="mt-4 p-3 bg-white bg-opacity-50 rounded-md border border-current border-opacity-20">
          <div className="text-xs font-mono text-gray-600">
            <span className="font-medium">Error Code:</span> {error.code}
          </div>
        </div>

        {/* Action Buttons */}
        {getActionButtons().length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {getActionButtons()}
          </div>
        )}

        {/* Support Information */}
        {getSupportInfo()}

        {/* Additional Help */}
        <div className="mt-4 text-xs text-gray-500">
          <p>
            If you continue to experience issues, please note the error code above 
            when contacting our support team.
          </p>
        </div>
      </div>
    </div>
  );
}

// Simplified version for inline use
export function InlineAppointmentError({ error }: { error: AppointmentError }) {
  const errorColors = getErrorColor(error.severity);
  
  return (
    <div className={`border rounded-lg p-4 ${errorColors}`}>
      <div className="flex items-start">
        <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium mb-1">{error.userMessage}</p>
          <p className="text-sm">{error.suggestion}</p>
        </div>
      </div>
    </div>
  );
}

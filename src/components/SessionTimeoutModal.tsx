/**
 * Session Timeout Modal Component
 * 
 * This component displays session timeout warnings and handles user interactions
 * for extending or ending the session.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  LogOut, 
  X,
  Shield
} from 'lucide-react';

export interface SessionTimeoutModalProps {
  isVisible: boolean;
  timeRemaining: number;
  isWarning: boolean;
  isExpired: boolean;
  onExtendSession: () => void;
  onLogout: () => void;
  onDismiss?: () => void;
  className?: string;
}

export default function SessionTimeoutModal({
  isVisible,
  timeRemaining,
  isWarning,
  isExpired,
  onExtendSession,
  onLogout,
  onDismiss,
  className = ''
}: SessionTimeoutModalProps) {
  const { t } = useTranslation();

  if (!isVisible) return null;

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getModalContent = () => {
    if (isExpired) {
      return {
        icon: <LogOut className="w-8 h-8 text-red-600" />,
        title: t('sessionTimeout.expired.title', 'Session Expired'),
        message: t('sessionTimeout.expired.message', 'Your session has expired due to inactivity. Please log in again.'),
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        buttonColor: 'bg-red-600 hover:bg-red-700',
        showExtendButton: false,
      };
    }

    if (isWarning) {
      return {
        icon: <AlertTriangle className="w-8 h-8 text-orange-600" />,
        title: t('sessionTimeout.warning.title', 'Session Timeout Warning'),
        message: t('sessionTimeout.warning.message', 'Your session will expire in {{time}} due to inactivity. Click "Extend Session" to continue.', { time: formatTime(timeRemaining) }),
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-800',
        buttonColor: 'bg-orange-600 hover:bg-orange-700',
        showExtendButton: true,
      };
    }

    return null;
  };

  const content = getModalContent();
  if (!content) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className={`relative bg-white rounded-lg shadow-xl max-w-md w-full ${content.bgColor} ${content.borderColor} border-2`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center">
            {content.icon}
            <h3 className={`ml-3 text-lg font-semibold ${content.textColor}`}>
              {content.title}
            </h3>
          </div>
          {onDismiss && !isExpired && (
            <button
              onClick={onDismiss}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <p className={`text-sm ${content.textColor} mb-6`}>
            {content.message}
          </p>

          {/* Time Remaining Display */}
          {!isExpired && (
            <div className="flex items-center justify-center mb-6">
              <div className={`flex items-center px-4 py-2 rounded-lg ${content.bgColor} ${content.borderColor} border`}>
                <Clock className="w-5 h-5 mr-2" />
                <span className={`font-mono text-lg font-semibold ${content.textColor}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {content.showExtendButton && (
              <button
                onClick={onExtendSession}
                className={`flex-1 ${content.buttonColor} text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center`}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {t('sessionTimeout.extendSession', 'Extend Session')}
              </button>
            )}
            
            <button
              onClick={onLogout}
              className={`flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center`}
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t('sessionTimeout.logout', 'Logout')}
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="px-6 py-3 bg-gray-50 rounded-b-lg">
          <div className="flex items-center text-xs text-gray-600">
            <Shield className="w-3 h-3 mr-1" />
            <span>
              {t('sessionTimeout.securityNote', 'For security, sessions expire after 15 minutes of inactivity.')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}














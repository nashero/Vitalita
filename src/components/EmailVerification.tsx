import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface EmailVerificationProps {
  token?: string;
  onBack?: () => void;
  onSuccess?: () => void;
}

export default function EmailVerification({ token, onBack, onSuccess }: EmailVerificationProps) {
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error' | 'invalid'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setVerificationStatus('invalid');
      setErrorMessage('No verification token provided');
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      setVerificationStatus('verifying');
      
      const { data, error } = await supabase.rpc('verify_donor_email', {
        p_verification_token: verificationToken
      });

      if (error) {
        console.error('Email verification error:', error);
        setVerificationStatus('error');
        setErrorMessage(error.message || 'Verification failed. Please try again.');
        return;
      }

      if (data) {
        setVerificationStatus('success');
        // Auto-redirect after 5 seconds
        setTimeout(() => {
          if (onSuccess) {
            onSuccess();
          }
        }, 5000);
      } else {
        setVerificationStatus('error');
        setErrorMessage('Invalid or expired verification token. Please contact AVIS staff for assistance.');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setVerificationStatus('error');
      setErrorMessage('An unexpected error occurred. Please try again.');
    }
  };

  const handleResendVerification = async () => {
    // This would typically require the user to enter their email again
    // For now, we'll just show a message
    setErrorMessage('Please contact AVIS staff to resend your verification email.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-6">
            <div className="flex items-center justify-between">
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center text-white/80 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </button>
              )}
              <div className="text-center flex-1">
                <div className="flex items-center justify-center mb-2">
                  <div className="bg-white/20 p-3 rounded-full">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-white">Email Verification</h1>
                <p className="text-red-100 text-sm mt-1">
                  Verify your email address
                </p>
              </div>
              <div className="w-16"></div> {/* Spacer for centering */}
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            {verificationStatus === 'verifying' && (
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <Loader className="w-8 h-8 text-red-600 animate-spin" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Verifying Your Email</h2>
                <p className="text-gray-600">Please wait while we verify your email address...</p>
              </div>
            )}

            {verificationStatus === 'success' && (
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Email Verified Successfully!</h2>
                <p className="text-gray-600 mb-4">
                  Your email address has been verified. AVIS staff will now review your application and activate your account.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm">
                    <strong>Next Steps:</strong><br/>
                    1. AVIS staff will review your application<br/>
                    2. You'll receive a notification when your account is activated<br/>
                    3. You can then log in and schedule your first donation
                  </p>
                </div>
                {onSuccess && (
                  <button
                    onClick={onSuccess}
                    className="mt-6 w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    Continue to Login
                  </button>
                )}
              </div>
            )}

            {verificationStatus === 'error' && (
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-red-100 p-3 rounded-full">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Verification Failed</h2>
                <p className="text-gray-600 mb-4">{errorMessage}</p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">
                    <strong>What to do:</strong><br/>
                    • Check if you clicked the correct link from your email<br/>
                    • Contact AVIS staff for assistance<br/>
                    • Make sure you're using the link within 24 hours
                  </p>
                </div>
                <button
                  onClick={handleResendVerification}
                  className="mt-6 w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  Contact AVIS Staff
                </button>
              </div>
            )}

            {verificationStatus === 'invalid' && (
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <AlertCircle className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Verification Link</h2>
                <p className="text-gray-600 mb-4">{errorMessage}</p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>Please:</strong><br/>
                    • Check your email for the verification link<br/>
                    • Make sure you copied the complete URL<br/>
                    • Contact AVIS staff if you need assistance
                  </p>
                </div>
                {onBack && (
                  <button
                    onClick={onBack}
                    className="mt-6 w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    Back to Registration
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
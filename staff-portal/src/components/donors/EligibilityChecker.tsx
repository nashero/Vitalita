/**
 * Eligibility Checker Component
 * Real-time eligibility calculation with countdown
 */

import { useDonorEligibility } from '../../hooks/useDonors';
import { format, differenceInDays, parseISO } from 'date-fns';
import { CheckCircle, XCircle, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { useState } from 'react';

interface EligibilityCheckerProps {
  hash: string;
}

export default function EligibilityChecker({ hash }: EligibilityCheckerProps) {
  const [donationType, setDonationType] = useState<'whole_blood' | 'plasma'>('whole_blood');
  const { data, isLoading } = useDonorEligibility(hash, donationType);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!data?.data?.eligibility) {
    return null;
  }

  const eligibility = data.data.eligibility;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Eligibility Status</h3>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Donation Type:</label>
          <select
            value={donationType}
            onChange={(e) => setDonationType(e.target.value as 'whole_blood' | 'plasma')}
            className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
          >
            <option value="whole_blood">Whole Blood</option>
            <option value="plasma">Plasma</option>
          </select>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        {eligibility.eligible ? (
          <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-lg font-semibold text-green-900">Eligible to Donate</p>
              <p className="text-sm text-green-700">
                This donor meets all requirements for {donationType.replace('_', ' ')} donation.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <XCircle className="h-8 w-8 text-amber-600" />
            <div className="flex-1">
              <p className="text-lg font-semibold text-amber-900">Not Currently Eligible</p>
              {eligibility.reasons.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {eligibility.reasons.map((reason, index) => (
                    <li key={index} className="text-sm text-amber-800 flex items-start">
                      <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      {reason}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Countdown Timer */}
      {eligibility.next_eligible_date && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3 mb-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <p className="font-medium text-blue-900">Next Eligible Date</p>
          </div>
          <div className="flex items-baseline space-x-4">
            <div>
              <p className="text-3xl font-bold text-blue-900">
                {eligibility.days_until_eligible || 0}
              </p>
              <p className="text-sm text-blue-700">days remaining</p>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <p className="text-sm text-blue-800">
                  {format(parseISO(eligibility.next_eligible_date), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Italian Regulation Rules */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Italian Regulation Compliance</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Minimum Interval</p>
            <p className="text-lg font-semibold text-gray-900">{eligibility.rules.minDays} days</p>
            <p className="text-xs text-gray-500 mt-1">
              Days since last: {eligibility.rules.daysSinceLast !== null ? eligibility.rules.daysSinceLast : 'N/A'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 mb-1">Maximum Per Year</p>
            <p className="text-lg font-semibold text-gray-900">
              {eligibility.rules.maxPerYear} {donationType === 'plasma' ? 'liters' : 'donations'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              This year: {eligibility.rules.donationsThisYear}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


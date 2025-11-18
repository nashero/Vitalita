/**
 * Donor Profile Component
 * Privacy-first: Only shows anonymized information
 */

import { useDonor, useAddDonorNote, DonorProfile } from '../../hooks/useDonors';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import {
  User,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import EligibilityChecker from './EligibilityChecker';
import DonorHistory from './DonorHistory';

interface DonorProfileProps {
  hash: string;
}

export default function DonorProfileComponent({ hash }: DonorProfileProps) {
  const { hasPermission } = useAuth();
  const { data, isLoading } = useDonor(hash);
  const addNote = useAddDonorNote();
  const [showFullHash, setShowFullHash] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ note_text: string; note_type: string }>();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!data?.data?.donor) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Donor not found</p>
      </div>
    );
  }

  const donor: DonorProfile = data.data.donor;
  const canViewNotes = hasPermission('donors:view_notes');
  const canAddNotes = hasPermission('donors:add_notes');

  const onSubmitNote = async (data: { note_text: string; note_type: string }) => {
    try {
      await addNote.mutateAsync({
        hash,
        note_text: data.note_text,
        note_type: data.note_type,
      });
      reset();
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Donor Profile</h2>
            <p className="text-gray-600 mt-1">Privacy-first: Hash-based identification only</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFullHash(!showFullHash)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              {showFullHash ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{showFullHash ? 'Hide' : 'Show'} Full Hash</span>
            </button>
          </div>
        </div>

        {/* Donor Hash */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <User className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Donor Hash ID</span>
          </div>
          <p className="font-mono text-lg text-gray-900 break-all">
            {showFullHash ? donor.donor_hash_id : donor.hash_display}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Use this hash to verify donor identity. Never share or store actual donor IDs.
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center space-x-2">
          {donor.is_active ? (
            <span className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <CheckCircle className="h-4 w-4" />
              <span>Active</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
              <XCircle className="h-4 w-4" />
              <span>Inactive</span>
            </span>
          )}
        </div>
      </div>

      {/* Eligibility Checker */}
      <EligibilityChecker hash={hash} />

      {/* Donor Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Donation Statistics</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Total Donations</p>
              <p className="text-2xl font-bold text-gray-900">{donor.total_donations || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Donations This Year</p>
              <p className="text-xl font-semibold text-gray-900">{donor.total_donations_this_year || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Donation</p>
              <p className="text-lg font-medium text-gray-900">
                {donor.last_donation_date
                  ? format(new Date(donor.last_donation_date), 'MMMM d, yyyy')
                  : 'Never'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Center Information</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">{donor.center_name || 'Unknown'}</p>
                {donor.center_address && (
                  <p className="text-sm text-gray-600">{donor.center_address}</p>
                )}
                {donor.center_city && (
                  <p className="text-sm text-gray-600">{donor.center_city}</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Preferred Language</p>
              <p className="font-medium text-gray-900 capitalize">
                {donor.preferred_language || 'Not specified'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Communication Channel</p>
              <p className="font-medium text-gray-900 capitalize">
                {donor.preferred_communication_channel || 'Not specified'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Staff Notes (Permission-based) */}
      {canViewNotes && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900">Staff Notes</h3>
              <Lock className="h-4 w-4 text-gray-400" />
            </div>
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="text-sm text-red-600 hover:text-red-700"
            >
              {showNotes ? 'Hide' : 'Show'} Notes
            </button>
          </div>

          {showNotes && (
            <>
              {donor.staff_notes && donor.staff_notes.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {donor.staff_notes.map((note) => (
                    <div key={note.note_id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">
                          {format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {note.note_type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900">{note.note_text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm mb-4">No notes yet</p>
              )}

              {canAddNotes && (
                <form onSubmit={handleSubmit(onSubmitNote)} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Note Type</label>
                    <select
                      {...register('note_type', { required: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="general">General</option>
                      <option value="medical">Medical</option>
                      <option value="administrative">Administrative</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                    <textarea
                      {...register('note_text', { required: true, minLength: 1, maxLength: 5000 })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Add a note about this donor..."
                    />
                    {errors.note_text && (
                      <p className="mt-1 text-sm text-red-600">{errors.note_text.message}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={addNote.isPending}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {addNote.isPending ? 'Adding...' : 'Add Note'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      )}

      {/* Donation History */}
      <DonorHistory hash={hash} />

      {/* Privacy Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Lock className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 mb-1">GDPR Compliance Notice</p>
            <p className="text-xs text-blue-800">
              This profile contains only anonymized data. No personally identifiable information (PII) is displayed.
              All access to this donor record has been logged for audit purposes. Staff notes are only accessible
              to authorized personnel with appropriate permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


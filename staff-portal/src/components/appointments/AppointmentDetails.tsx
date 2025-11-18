/**
 * Appointment Details Component
 * Full appointment information with donor history
 */

import { useAppointment } from '../../hooks/useAppointments';
import { useUpdateAppointment, useUpdateAppointmentStatus } from '../../hooks/useAppointments';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Edit,
  History,
  Loader,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface AppointmentDetailsProps {
  appointmentId: string;
  onClose?: () => void;
  onEdit?: () => void;
}

export default function AppointmentDetails({ appointmentId, onClose, onEdit }: AppointmentDetailsProps) {
  const { hasPermission } = useAuth();
  const { data, isLoading } = useAppointment(appointmentId);
  const updateStatus = useUpdateAppointmentStatus();
  const [notes, setNotes] = useState('');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (!data?.data?.appointment) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Appointment not found</p>
      </div>
    );
  }

  const appointment = data.data.appointment;
  const donationHistory = data.data.donation_history || [];

  const statusBadges: Record<string, { label: string; className: string }> = {
    scheduled: { label: 'Scheduled', className: 'bg-blue-100 text-blue-800' },
    confirmed: { label: 'Confirmed', className: 'bg-green-100 text-green-800' },
    arrived: { label: 'Arrived', className: 'bg-amber-100 text-amber-800' },
    'in-progress': { label: 'In Progress', className: 'bg-purple-100 text-purple-800' },
    completed: { label: 'Completed', className: 'bg-gray-100 text-gray-800' },
    cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
    'no-show': { label: 'No Show', className: 'bg-gray-100 text-gray-600' },
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateStatus.mutateAsync({
        id: appointmentId,
        status: newStatus as any,
        notes: notes || undefined,
      });
      setNotes('');
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Appointment Details</h2>
          <p className="text-gray-600 mt-1">ID: {appointment.appointment_id.substring(0, 8)}...</p>
        </div>
        <div className="flex items-center space-x-2">
          {hasPermission('appointments:update') && (
            <button
              onClick={onEdit}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadges[appointment.status]?.className || statusBadges.scheduled.className}`}>
          {statusBadges[appointment.status]?.label || appointment.status}
        </span>
      </div>

      {/* Appointment Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Appointment Information</h3>
          
          <div className="flex items-start space-x-3">
            <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Date & Time</p>
              <p className="font-medium text-gray-900">
                {format(new Date(appointment.appointment_datetime), 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="text-sm text-gray-600">
                {format(new Date(appointment.appointment_datetime), 'h:mm a')}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <User className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Donor ID</p>
              <p className="font-mono text-sm font-medium text-gray-900">
                {appointment.donor_hash_id.substring(0, 16)}...
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Donation Type</p>
              <p className="font-medium text-gray-900 capitalize">
                {appointment.donation_type.replace('_', ' ')}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">Center</p>
              <p className="font-medium text-gray-900">{appointment.center_name || 'Unknown'}</p>
              {appointment.center_address && (
                <p className="text-sm text-gray-600">{appointment.center_address}</p>
              )}
              {appointment.center_city && (
                <p className="text-sm text-gray-600">{appointment.center_city}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Donor Information</h3>
          
          <div>
            <p className="text-sm text-gray-600">Last Donation</p>
            <p className="font-medium text-gray-900">
              {appointment.last_donation_date
                ? format(new Date(appointment.last_donation_date), 'MMM d, yyyy')
                : 'Never'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Total Donations This Year</p>
            <p className="font-medium text-gray-900">{appointment.total_donations_this_year || 0}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Preferred Language</p>
            <p className="font-medium text-gray-900 capitalize">
              {appointment.preferred_language || 'Not specified'}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Account Status</p>
            <p className={`font-medium ${appointment.donor_active ? 'text-green-600' : 'text-red-600'}`}>
              {appointment.donor_active ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Timeline</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <div>
              <p className="text-sm font-medium text-gray-900">Created</p>
              <p className="text-xs text-gray-600">
                {format(new Date(appointment.creation_timestamp), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          </div>
          {appointment.last_updated_timestamp !== appointment.creation_timestamp && (
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <div>
                <p className="text-sm font-medium text-gray-900">Last Updated</p>
                <p className="text-xs text-gray-600">
                  {format(new Date(appointment.last_updated_timestamp), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Donation History */}
      {donationHistory.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <History className="h-5 w-5 text-gray-500" />
            <h3 className="text-lg font-semibold text-gray-900">Donation History</h3>
          </div>
          <div className="space-y-2">
            {donationHistory.map((donation: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {format(new Date(donation.donation_date), 'MMM d, yyyy')}
                  </p>
                  <p className="text-sm text-gray-600 capitalize">
                    {donation.donation_type.replace('_', ' ')} - {donation.donation_volume}ml
                  </p>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                  {donation.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {hasPermission('appointments:update') && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this status change..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {appointment.status !== 'confirmed' && (
                <button
                  onClick={() => handleStatusChange('confirmed')}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Confirm</span>
                </button>
              )}
              {appointment.status !== 'arrived' && (
                <button
                  onClick={() => handleStatusChange('arrived')}
                  className="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  <Clock className="h-4 w-4" />
                  <span>Mark Arrived</span>
                </button>
              )}
              {appointment.status !== 'completed' && (
                <button
                  onClick={() => handleStatusChange('completed')}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Complete</span>
                </button>
              )}
              {appointment.status !== 'cancelled' && (
                <button
                  onClick={() => handleStatusChange('cancelled')}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


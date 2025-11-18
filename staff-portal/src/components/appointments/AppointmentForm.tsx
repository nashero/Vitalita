/**
 * Appointment Form Component
 * Manual appointment creation with availability checking
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateAppointment } from '../../hooks/useAppointments';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Clock, User, MapPin, Loader, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface AppointmentFormData {
  donor_hash_id: string;
  donation_center_id: string;
  appointment_datetime: string;
  donation_type: 'whole_blood' | 'plasma';
  notes?: string;
}

interface AppointmentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AppointmentForm({ onSuccess, onCancel }: AppointmentFormProps) {
  const { hasPermission } = useAuth();
  const createAppointment = useCreateAppointment();
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<AppointmentFormData>({
    defaultValues: {
      donation_type: 'whole_blood',
    },
  });

  const selectedDateTime = watch('appointment_datetime');
  const selectedCenter = watch('donation_center_id');

  // Check availability
  const checkAvailability = async () => {
    if (!selectedDateTime || !selectedCenter) {
      return;
    }

    setIsCheckingAvailability(true);
    // TODO: Implement availability check API call
    // For now, just simulate
    setTimeout(() => {
      setIsCheckingAvailability(false);
      toast.success('Time slot available');
    }, 1000);
  };

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      await createAppointment.mutateAsync(data);
      onSuccess?.();
    } catch (error) {
      // Error handled by mutation
    }
  };

  // Get current date/time for min values
  const now = new Date();
  const minDate = format(now, 'yyyy-MM-dd');
  const minTime = format(now, 'HH:mm');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Calendar className="h-6 w-6 text-red-600" />
        <h2 className="text-2xl font-bold text-gray-900">Create Appointment</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Donor ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="h-4 w-4 inline mr-2" />
            Donor Hash ID
          </label>
          <input
            type="text"
            {...register('donor_hash_id', {
              required: 'Donor ID is required',
              minLength: { value: 8, message: 'Invalid donor ID format' },
            })}
            placeholder="Enter donor hash ID"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          {errors.donor_hash_id && (
            <p className="mt-1 text-sm text-red-600">{errors.donor_hash_id.message}</p>
          )}
        </div>

        {/* Center Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="h-4 w-4 inline mr-2" />
            Donation Center
          </label>
          <select
            {...register('donation_center_id', { required: 'Center is required' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Select a center</option>
            {/* TODO: Load centers from API */}
            <option value="center-1">AVIS Milano</option>
            <option value="center-2">AVIS Roma</option>
            <option value="center-3">AVIS Torino</option>
          </select>
          {errors.donation_center_id && (
            <p className="mt-1 text-sm text-red-600">{errors.donation_center_id.message}</p>
          )}
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="h-4 w-4 inline mr-2" />
              Date
            </label>
            <input
              type="date"
              {...register('appointment_datetime', { required: 'Date is required' })}
              min={minDate}
              onChange={(e) => {
                setValue('appointment_datetime', e.target.value);
                checkAvailability();
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {errors.appointment_datetime && (
              <p className="mt-1 text-sm text-red-600">{errors.appointment_datetime.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="h-4 w-4 inline mr-2" />
              Time
            </label>
            <input
              type="time"
              {...register('appointment_datetime', { required: 'Time is required' })}
              min={minTime}
              step="1800"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        {/* Availability Check */}
        {selectedDateTime && selectedCenter && (
          <div>
            <button
              type="button"
              onClick={checkAvailability}
              disabled={isCheckingAvailability}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isCheckingAvailability ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Check Availability</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Donation Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Donation Type</label>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                {...register('donation_type', { required: true })}
                value="whole_blood"
                className="text-red-600 focus:ring-red-500"
              />
              <div>
                <p className="font-medium text-gray-900">Whole Blood</p>
                <p className="text-sm text-gray-600">90 days between donations</p>
              </div>
            </label>
            <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                {...register('donation_type', { required: true })}
                value="plasma"
                className="text-red-600 focus:ring-red-500"
              />
              <div>
                <p className="font-medium text-gray-900">Plasma</p>
                <p className="text-sm text-gray-600">14 days between donations</p>
              </div>
            </label>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
          <textarea
            {...register('notes')}
            placeholder="Add any additional notes..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={createAppointment.isPending}
            className="flex items-center space-x-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {createAppointment.isPending ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Create Appointment</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}


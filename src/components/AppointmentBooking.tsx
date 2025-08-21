import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Droplets, 
  Heart,
  Building2,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  Loader,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { getAppointmentError, AppointmentError } from '../utils/appointmentErrors';
import AppointmentErrorDisplay from './AppointmentErrorDisplay';

/**
 * AppointmentBooking Component
 * 
 * Features:
 * - Real-time slot validation to prevent "INVALID_SLOT" errors
 * - Optimistic locking to handle concurrent bookings
 * - Automatic rollback on slot update failures
 * - Enhanced error handling with specific error codes
 * - Refresh functionality for slot availability
 * 
 * Real-time Validation Benefits:
 * - Prevents race condition errors
 * - Ensures data consistency
 * - Provides immediate feedback on slot changes
 * - Reduces failed booking attempts
 * - Improves user experience
 */
interface DonationCenter {
  center_id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  contact_phone: string | null;
  email: string | null;
}

interface AvailabilitySlot {
  slot_id: string;
  center_id: string;
  slot_datetime: string;
  donation_type: string;
  capacity: number;
  current_bookings: number;
  center?: DonationCenter;
}

type DonationType = 'Blood' | 'Plasma';
type BookingStep = 'type' | 'slots' | 'confirmation' | 'success';

interface AppointmentBookingProps {
  onBack: () => void;
}

export default function AppointmentBooking({ onBack }: AppointmentBookingProps) {
  const { donor } = useAuth();
  const [currentStep, setCurrentStep] = useState<BookingStep>('type');
  const [selectedType, setSelectedType] = useState<DonationType | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppointmentError | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const donationTypes = [
    {
      type: 'Blood' as DonationType,
      icon: Droplets,
      title: 'Blood Donation',
      description: 'Whole blood donation to help save lives',
      duration: '45-60 minutes',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200 hover:border-red-300',
    },
    {
      type: 'Plasma' as DonationType,
      icon: Heart,
      title: 'Plasma Donation',
      description: 'Plasma donation for medical treatments',
      duration: '90-120 minutes',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200 hover:border-blue-300',
    },
  ];

  const fetchAvailableSlots = async (donationType: DonationType) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch available slots from the database
      const { data: slots, error: slotsError } = await supabase
        .from('availability_slots')
        .select(`
          *,
          donation_centers!inner (
            center_id,
            name,
            address,
            city,
            country,
            contact_phone,
            email
          )
        `)
        .eq('donation_type', donationType)
        .eq('is_available', true)
        .gt('slot_datetime', new Date().toISOString())
        .order('slot_datetime', { ascending: true });

      if (slotsError) {
        console.error('Error fetching slots:', slotsError);
        setError(getAppointmentError(slotsError));
        return;
      }

      // Transform the data to match our interface
      const transformedSlots: AvailabilitySlot[] = slots?.map(slot => ({
        slot_id: slot.slot_id,
        center_id: slot.center_id,
        slot_datetime: slot.slot_datetime,
        donation_type: slot.donation_type,
        capacity: slot.capacity,
        current_bookings: slot.current_bookings,
        center: slot.donation_centers ? {
          center_id: slot.donation_centers.center_id,
          name: slot.donation_centers.name,
          address: slot.donation_centers.address,
          city: slot.donation_centers.city,
          country: slot.donation_centers.country,
          contact_phone: slot.donation_centers.contact_phone,
          email: slot.donation_centers.email,
        } : undefined,
      })) || [];

      setAvailableSlots(transformedSlots);
    } catch (err) {
      console.error('Error fetching slots:', err);
      setError(getAppointmentError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleTypeSelection = (type: DonationType) => {
    setSelectedType(type);
    setCurrentStep('slots');
    setError(null); // Clear any previous errors
    fetchAvailableSlots(type);
  };

  const refreshAndRetry = async () => {
    if (!selectedType) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Refresh available slots
      await fetchAvailableSlots(selectedType);
      
      // If the previously selected slot is no longer available, clear the selection
      if (selectedSlot) {
        const isStillAvailable = availableSlots.some(slot => 
          slot.slot_id === selectedSlot.slot_id && 
          slot.current_bookings < slot.capacity
        );
        
        if (!isStillAvailable) {
          setSelectedSlot(null);
          setCurrentStep('slots');
        }
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error refreshing slots:', err);
      setError(getAppointmentError(err));
      setLoading(false);
    }
  };

  const retryCurrentStep = async () => {
    setError(null);
    
    if (currentStep === 'confirmation' && selectedSlot) {
      // Re-validate the selected slot
      const validation = await validateSlotAvailability(selectedSlot);
      if (!validation.isValid && validation.error) {
        setError(validation.error);
        return;
      }
      
      // If validation passes, try to confirm again
      await confirmBooking();
    }
  };

  const handleContactSupport = () => {
    // You can implement various contact methods here
    const supportInfo = {
      phone: '+39 0123 456 789',
      email: 'support@vitalita.org',
      hours: 'Monday - Friday, 9:00 AM - 6:00 PM'
    };
    
    // For now, just show an alert with contact information
    alert(`Contact Support:\nPhone: ${supportInfo.phone}\nEmail: ${supportInfo.email}\nHours: ${supportInfo.hours}`);
    
    // In a real application, you might:
    // - Open a contact form
    // - Initiate a phone call
    // - Open an email client
    // - Show a live chat widget
  };

  const handleSlotSelection = (slot: AvailabilitySlot) => {
    setSelectedSlot(slot);
    setCurrentStep('confirmation');
    setError(null); // Clear any previous errors
  };

  // Real-time slot validation function
  const validateSlotAvailability = async (slot: AvailabilitySlot): Promise<{ isValid: boolean; error?: AppointmentError }> => {
    try {
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Validation timeout')), 10000)
      );

      // Fetch the latest slot information from the database
      const fetchPromise = supabase
        .from('availability_slots')
        .select('slot_id, current_bookings, capacity, is_available, slot_datetime')
        .eq('slot_id', slot.slot_id)
        .single();

      const { data: currentSlot, error: fetchError } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (fetchError) {
        console.error('Error fetching current slot data:', fetchError);
        
        // Handle specific database errors
        if (fetchError.code === 'PGRST116') {
          return {
            isValid: false,
            error: getAppointmentError({ 
              code: 'SLOT_NOT_FOUND', 
              message: 'Slot no longer exists',
              userMessage: 'The selected time slot no longer exists.',
              suggestion: 'Please refresh and select from available time slots.',
              severity: 'warning'
            })
          };
        }
        
        return {
          isValid: false,
          error: getAppointmentError({ 
            code: 'SLOT_FETCH_ERROR', 
            message: 'Failed to fetch current slot information',
            userMessage: 'Unable to verify slot availability.',
            suggestion: 'Please try again or select a different time slot.',
            severity: 'error'
          })
        };
      }

      if (!currentSlot) {
        return {
          isValid: false,
          error: getAppointmentError({ 
            code: 'SLOT_NOT_FOUND', 
            message: 'Slot no longer exists',
            userMessage: 'The selected time slot no longer exists.',
            suggestion: 'Please refresh and select from available time slots.',
            severity: 'warning'
          })
        };
      }

      // Check if slot is still available
      if (!currentSlot.is_available) {
        return {
          isValid: false,
          error: getAppointmentError({ 
            code: 'SLOT_UNAVAILABLE', 
            message: 'Slot is no longer available',
            userMessage: 'This time slot is no longer available for booking.',
            suggestion: 'Please select a different time or date.',
            severity: 'warning'
          })
        };
      }

      // Check if slot is at capacity
      if (currentSlot.current_bookings >= currentSlot.capacity) {
        return {
          isValid: false,
          error: getAppointmentError({ 
            code: 'SLOT_FULL', 
            message: 'Slot is at full capacity',
            userMessage: 'This time slot has reached its maximum capacity.',
            suggestion: 'Please select a different time or check back later for cancellations.',
            severity: 'warning'
          })
        };
      }

      // Check if slot is in the past
      const slotDateTime = new Date(currentSlot.slot_datetime);
      if (slotDateTime <= new Date()) {
        return {
          isValid: false,
          error: getAppointmentError({ 
            code: 'PAST_DATE', 
            message: 'Attempted to book appointment in the past',
            userMessage: 'You cannot book appointments for past dates.',
            suggestion: 'Please select a current or future date.',
            severity: 'warning'
          })
        };
      }

      // Check if there's a significant difference in current_bookings (race condition detection)
      if (Math.abs(currentSlot.current_bookings - slot.current_bookings) > 0) {
        return {
          isValid: false,
          error: getAppointmentError({ 
            code: 'SLOT_CHANGED', 
            message: 'Slot availability has changed since selection',
            userMessage: 'This time slot\'s availability has changed since you selected it.',
            suggestion: 'Please refresh and select from the updated available times.',
            severity: 'warning'
          })
        };
      }

      // Additional validation: check if the slot is still within acceptable booking window
      const now = new Date();
      const slotTime = new Date(currentSlot.slot_datetime);
      const timeDiff = slotTime.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      // If slot is less than 1 hour away, it might be too late to book
      if (hoursDiff < 1) {
        return {
          isValid: false,
          error: getAppointmentError({ 
            code: 'SLOT_TOO_SOON', 
            message: 'Slot is too close to book',
            userMessage: 'This time slot is too close to book now.',
            suggestion: 'Please select a time slot at least 1 hour in the future.',
            severity: 'warning'
          })
        };
      }

      return { isValid: true };
    } catch (err) {
      console.error('Error validating slot availability:', err);
      return {
        isValid: false,
        error: getAppointmentError({ 
          code: 'VALIDATION_ERROR', 
          message: 'Error during slot validation',
          userMessage: 'Unable to verify slot availability.',
          suggestion: 'Please try again or contact support if the problem persists.',
          severity: 'error'
        })
      };
    }
  };

  const confirmBooking = async () => {
    if (!selectedSlot || !donor || !selectedType) return;

    try {
      setLoading(true);
      setError(null);





      // Real-time slot validation before proceeding
      const validation = await validateSlotAvailability(selectedSlot);
      if (!validation.isValid && validation.error) {
        console.log('Slot validation failed:', validation.error);
        setError(validation.error);
        return;
      }

      // Create the appointment record
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          donor_hash_id: donor.donor_hash_id,
          donation_center_id: selectedSlot.center_id,
          appointment_datetime: selectedSlot.slot_datetime,
          donation_type: selectedType === 'Blood' ? 'Blood' : 'Plasma',
          status: 'SCHEDULED',
          booking_channel: 'online',
          confirmation_sent: false,
          reminder_sent: false,
        })
        .select()
        .single();

      if (appointmentError) {
        console.error('Error creating appointment:', appointmentError);
        console.error('Error details:', {
          code: appointmentError.code,
          message: appointmentError.message,
          details: appointmentError.details,
          hint: appointmentError.hint
        });
        setError(getAppointmentError(appointmentError));
        return;
      }

      // Update the availability slot with optimistic locking
      const { error: slotUpdateError } = await supabase
        .from('availability_slots')
        .update({ 
          current_bookings: selectedSlot.current_bookings + 1 
        })
        .eq('slot_id', selectedSlot.slot_id)
        .eq('current_bookings', selectedSlot.current_bookings) // Optimistic locking
        .eq('is_available', true); // Double-check availability

      if (slotUpdateError) {
        console.error('Error updating slot:', slotUpdateError);
        
        // If slot update failed, we need to rollback the appointment
        const { error: rollbackError } = await supabase
          .from('appointments')
          .delete()
          .eq('appointment_id', appointment.appointment_id);
        
        if (rollbackError) {
          console.error('Error rolling back appointment:', rollbackError);
        }

        // Set error and return to prevent inconsistent state
        setError(getAppointmentError({ 
          code: 'SLOT_UPDATE_FAILED', 
          message: 'Failed to update slot availability',
          userMessage: 'Unable to secure your time slot.',
          suggestion: 'Please try again or select a different time slot.',
          severity: 'error'
        }));
        return;
      }

      // Create audit log for the booking
      await supabase.rpc('create_audit_log', {
        p_user_id: donor.donor_hash_id,
        p_user_type: 'donor',
        p_action: 'appointment_booking',
        p_details: `Appointment booked for ${selectedType === 'Blood' ? 'blood' : 'plasma'} donation on ${new Date(selectedSlot.slot_datetime).toLocaleDateString()}`,
        p_resource_type: 'appointments',
        p_resource_id: appointment.appointment_id,
        p_status: 'success'
      });

      setBookingSuccess(true);
      setCurrentStep('success');
    } catch (err) {
      console.error('Error booking appointment:', err);
      setError(getAppointmentError(err));
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const getAvailabilityColor = (current: number, capacity: number) => {
    const percentage = (current / capacity) * 100;
    if (percentage < 50) return 'text-green-600 bg-green-100';
    if (percentage < 80) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const renderStepIndicator = () => {
    const steps = [
      { id: 'type', label: 'Type', completed: currentStep !== 'type' },
      { id: 'slots', label: 'Schedule', completed: currentStep === 'confirmation' || currentStep === 'success' },
      { id: 'confirmation', label: 'Confirm', completed: currentStep === 'success' },
    ];

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
              step.completed 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : currentStep === step.id
                ? 'border-blue-600 text-blue-600 bg-blue-50'
                : 'border-gray-300 text-gray-400'
            }`}>
              {step.completed ? (
                <Check className="w-5 h-5" />
              ) : (
                <span className="text-sm font-semibold">{index + 1}</span>
              )}
            </div>
            <div className="ml-3 mr-8">
              <p className={`text-sm font-medium ${
                step.completed || currentStep === step.id ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {step.label}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${
                step.completed ? 'bg-blue-600' : 'bg-gray-300'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderTypeSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Donation Type</h2>
        <p className="text-gray-600">Select the type of donation you'd like to make</p>
      </div>



      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {donationTypes.map((donation) => {
          const Icon = donation.icon;
          return (
            <button
              key={donation.type}
              onClick={() => handleTypeSelection(donation.type)}
              className={`p-8 rounded-2xl border-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] ${donation.borderColor} ${donation.bgColor} hover:shadow-lg`}
            >
              <div className="text-center">
                <div className={`inline-flex p-4 rounded-full ${donation.bgColor} mb-4`}>
                  <Icon className={`w-8 h-8 ${donation.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{donation.title}</h3>
                <p className="text-gray-600 mb-4">{donation.description}</p>
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-2" />
                  {donation.duration}
                </div>

              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderSlotSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Appointments</h2>
        <p className="text-gray-600">Choose a convenient time for your {selectedType?.toLowerCase()} donation</p>
        
        {/* Refresh button */}
        <button
          onClick={() => fetchAvailableSlots(selectedType!)}
          disabled={loading}
          className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh Slots'}
        </button>
      </div>



      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading available appointments...</span>
        </div>
      ) : availableSlots.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments available</h3>
          <p className="text-gray-600">Please try again later or contact us for assistance.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {availableSlots.map((slot) => {
            const dateTime = formatDateTime(slot.slot_datetime);
            const availabilityClass = getAvailabilityColor(slot.current_bookings, slot.capacity);
            
            return (
              <div
                key={slot.slot_id}
                className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {slot.center?.name}
                      </h3>
                      <div className="flex items-center text-gray-600 text-sm mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {slot.center?.address}, {slot.center?.city}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${availabilityClass}`}>
                      {slot.capacity - slot.current_bookings} spots left
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-700">
                      <Calendar className="w-4 h-4 mr-3 text-blue-600" />
                      <span className="font-medium">{dateTime.date}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Clock className="w-4 h-4 mr-3 text-blue-600" />
                      <span className="font-medium">{dateTime.time}</span>
                    </div>
                  </div>

                  {slot.center?.contact_phone && (
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Phone className="w-3 h-3 mr-2" />
                      {slot.center.contact_phone}
                    </div>
                  )}

                  <button
                    onClick={() => handleSlotSelection(slot)}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Select This Time
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderConfirmation = () => {
    if (!selectedSlot || !selectedType) return null;
    
    const dateTime = formatDateTime(selectedSlot.slot_datetime);
    
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Your Appointment</h2>
          <p className="text-gray-600">Please review your appointment details</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Appointment Summary</h3>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">Donation Type</span>
              <span className="font-semibold text-gray-900">{selectedType}</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">Date</span>
              <span className="font-semibold text-gray-900">{dateTime.date}</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">Time</span>
              <span className="font-semibold text-gray-900">{dateTime.time}</span>
            </div>
            
            <div className="py-3 border-b border-gray-100">
              <span className="text-gray-600 block mb-2">Location</span>
              <div className="space-y-1">
                <p className="font-semibold text-gray-900">{selectedSlot.center?.name}</p>
                <p className="text-gray-600 text-sm">{selectedSlot.center?.address}</p>
                <p className="text-gray-600 text-sm">{selectedSlot.center?.city}, {selectedSlot.center?.country}</p>
              </div>
            </div>
            
            {selectedSlot.center?.contact_phone && (
              <div className="flex items-center justify-between py-3">
                <span className="text-gray-600">Contact</span>
                <span className="font-semibold text-gray-900">{selectedSlot.center.contact_phone}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Important Reminders:</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Please arrive 15 minutes early</li>
                <li>• Bring a valid ID</li>
                <li>• Eat a healthy meal before donating</li>
                <li>• Stay hydrated</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentStep('slots')}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            Back to Slots
          </button>
          <button
            onClick={confirmBooking}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Loader className="w-4 h-4 animate-spin mr-2" />
                Booking...
              </div>
            ) : (
              <>
                <Check className="w-4 h-4 inline mr-2" />
                Confirm Booking
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  const renderSuccess = () => {
    if (!selectedSlot || !selectedType) return null;
    
    const dateTime = formatDateTime(selectedSlot.slot_datetime);
    
    return (
      <div className="space-y-6 max-w-2xl mx-auto text-center">
        <div className="bg-green-100 p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Appointment Confirmed!</h2>
                          <p className="text-gray-600 text-lg">Your {selectedType === 'Blood' ? 'blood' : 'plasma'} donation is scheduled</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h3>
          <div className="space-y-3 text-left">
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-semibold">{dateTime.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-semibold">{dateTime.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Location:</span>
              <span className="font-semibold">{selectedSlot.center?.name}</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-center text-green-800">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Confirmation sent to your preferred communication channel</span>
          </div>
        </div>

        <button
          onClick={onBack}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-8 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
        >
          Return to Dashboard
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200 mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </button>
              <Calendar className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Book Appointment</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderStepIndicator()}

        {error && (
          <AppointmentErrorDisplay 
            error={error}
            onRetry={retryCurrentStep}
            onRefresh={refreshAndRetry}
            onContactSupport={handleContactSupport}
            className="mb-6"
          />
        )}

        {currentStep === 'type' && renderTypeSelection()}
        {currentStep === 'slots' && renderSlotSelection()}
        {currentStep === 'confirmation' && renderConfirmation()}
        {currentStep === 'success' && renderSuccess()}
      </main>
    </div>
  );
}
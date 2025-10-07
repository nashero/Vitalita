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
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { getAppointmentError, AppointmentError } from '../utils/appointmentErrors';
import AppointmentErrorDisplay from './AppointmentErrorDisplay';
import LanguageSwitcher from './LanguageSwitcher';
import { getCurrentLocale, formatDate, formatTime } from '../utils/languageUtils';

/**
 * AppointmentBooking Component
 * 
 * Features:
 * - Integrated calendar and time slot selection interface
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
type BookingStep = 'type' | 'booking' | 'confirmation' | 'success';

interface AppointmentBookingProps {
  onBack: () => void;
}

export default function AppointmentBooking({ onBack }: AppointmentBookingProps) {
  const { t } = useTranslation();
  const { donor } = useAuth();
  const [currentStep, setCurrentStep] = useState<BookingStep>('type');
  const [selectedType, setSelectedType] = useState<DonationType | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppointmentError | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [allCenters, setAllCenters] = useState<DonationCenter[]>([]);
  const [showWeekends, setShowWeekends] = useState(false); // Weekend slot visibility toggle

  const donationTypes = [
    {
      type: 'Blood' as DonationType,
      icon: Droplets,
      title: t('appointment.bloodDonation'),
      description: t('appointment.wholeBloodDonation'),
      duration: '45-60 minutes',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200 hover:border-red-300',
    },
    {
      type: 'Plasma' as DonationType,
      icon: Heart,
      title: t('appointment.plasmaDonation'),
      description: t('appointment.plasmaDonationMedical'),
      duration: '90-120 minutes',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200 hover:border-blue-300',
    },
  ];

  // Fetch all donation centers
  const fetchCenters = async () => {
    try {
      const { data: centers, error } = await supabase
        .from('donation_centers')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching centers:', error);
        return;
      }

      setAllCenters(centers || []);
    } catch (err) {
      console.error('Error fetching centers:', err);
    }
  };

  const fetchAvailableSlots = async (donationType: DonationType, date?: Date) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching available slots for:', donationType, 'Date filter:', date);
      
      // Fetch slots from current date up to 2 years in the future to ensure calendar shows full range

      let query = supabase
        .from('availability_slots')
        .select(`
          *,
          donation_centers (
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
        .gte('slot_datetime', new Date().toISOString()) // Include current date and all future slots
        .lte('slot_datetime', new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString()); // Fetch slots up to 2 years in the future to show full calendar range

      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        query = query
          .gte('slot_datetime', startOfDay.toISOString())
          .lte('slot_datetime', endOfDay.toISOString());
      }

      // Fetch ALL available slots with explicit high limit to ensure we get everything
      // This ensures we get the full date range until August 2026
      const { data: slots, error: slotsError } = await query
        .order('slot_datetime', { ascending: true })
        .limit(100000); // Very high limit to ensure we get all slots

      // If the first query fails or returns limited results, try a simpler query
      if (!slots || slots.length < 100) {
        console.log('First query returned limited results, trying simpler query...');
        const { data: simpleSlots, error: simpleError } = await supabase
          .from('availability_slots')
          .select('*')
          .eq('donation_type', donationType)
          .eq('is_available', true)
          .gte('slot_datetime', new Date().toISOString()) // Include current date and all future slots
          .lte('slot_datetime', new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString()) // Fetch slots up to 2 years in the future to show full calendar range
          .order('slot_datetime', { ascending: true })
          .limit(100000);
        
        if (simpleError) {
          console.error('Simple query error:', simpleError);
        } else {
          console.log('Simple query result:', { 
            slotsCount: simpleSlots?.length || 0,
            firstSlot: simpleSlots?.[0]?.slot_datetime,
            lastSlot: simpleSlots?.[simpleSlots?.length - 1]?.slot_datetime
          });
        }
      }

      console.log('Query result:', { 
        slotsCount: slots?.length || 0, 
        error: slotsError,
        firstSlot: slots?.[0]?.slot_datetime,
        lastSlot: slots?.[slots?.length - 1]?.slot_datetime
      });

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

      console.log('Transformed slots count:', transformedSlots.length);
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
    setCurrentStep('booking');
    setError(null);
    fetchCenters();
    fetchAvailableSlots(type);
  };

  const handleDateSelection = async (date: Date) => {
    if (!selectedType) return;

    setSelectedDate(date);
    setSelectedCenter(null);
    setSelectedSlot(null);
    
    await fetchAvailableSlots(selectedType, date);
  };

  const handleCenterSelection = (centerId: string) => {
    setSelectedCenter(centerId);
    setSelectedSlot(null);
  };

  const handleTimeSlotSelection = (slot: AvailabilitySlot) => {
    setSelectedSlot(slot);
    setCurrentStep('confirmation');
    setError(null);
  };

  const refreshAndRetry = async () => {
    if (!selectedType) return;
    
    try {
      setLoading(true);
      setError(null);
      
              // Refresh available slots
        await fetchAvailableSlots(selectedType, selectedDate || undefined);
      
      // If the previously selected slot is no longer available, clear the selection
      if (selectedSlot) {
        const isStillAvailable = availableSlots.some(slot => 
          slot.slot_id === selectedSlot.slot_id && 
          slot.current_bookings < slot.capacity
        );
        
        if (!isStillAvailable) {
          setSelectedSlot(null);
          setCurrentStep('booking');
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
      hours: t('appointment.mondayToFriday')
    };
    
    // For now, just show an alert with contact information
    alert(`Contact Support:\nPhone: ${supportInfo.phone}\nEmail: ${supportInfo.email}\nHours: ${supportInfo.hours}`);
    
    // In a real application, you might:
    // - Open a contact form
    // - Initiate a phone call
    // - Open an email client
    // - Show a live chat widget
  };

  // Real-time slot validation function
  const validateSlotAvailability = async (slot: AvailabilitySlot): Promise<{ isValid: boolean; error?: AppointmentError }> => {
    try {
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error(t('appointment.validationTimeout'))), 10000)
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
              message: t('appointment.slotNoLongerExists'),
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
            message: t('appointment.failedToFetchSlotInfo'),
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
            message: t('appointment.slotNotAvailable'),
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
            message: t('appointment.slotAtFullCapacity'),
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
            message: t('appointment.bookingInPast'),
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
            message: t('appointment.slotAvailabilityChanged'),
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
            message: t('appointment.slotTooCloseToBook'),
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
          message: t('appointment.errorDuringValidation'),
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
          message: t('appointment.failedToUpdateSlot'),
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
        p_details: t('appointment.appointmentBookedFor', { 
          type: selectedType === 'Blood' ? t('appointment.bloodDonation').toLowerCase() : t('appointment.plasmaDonation').toLowerCase(),
          date: new Date(selectedSlot.slot_datetime).toLocaleDateString()
        }),
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
    const currentLanguage = i18n.language;
    return {
      date: formatDate(date, currentLanguage, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: formatTime(date, currentLanguage, {
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
      { id: 'type', label: t('appointment.selectType'), completed: currentStep !== 'type' },
      { id: 'booking', label: t('appointment.selectDate'), completed: currentStep === 'confirmation' || currentStep === 'success' },
      { id: 'confirmation', label: t('appointment.confirm'), completed: currentStep === 'success' },
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('appointment.selectType')}</h2>
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

  const renderCalendar = () => {
    const currentDate = new Date();
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());
    
    const endDate = new Date(lastDayOfMonth);
    endDate.setDate(endDate.getDate() + (6 - lastDayOfMonth.getDay()));

    const days = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    const isToday = (date: Date) => {
      return date.toDateString() === new Date().toDateString();
    };

    const isSelected = (date: Date) => {
      return selectedDate && date.toDateString() === selectedDate.toDateString();
    };

    const isAvailable = (date: Date) => {
      if (date < new Date()) return false;
      if (!showWeekends && (date.getDay() === 0 || date.getDay() === 6)) return false; // Weekend
      
      // Check if there are available slots for this date
      const hasSlots = availableSlots.some(slot => {
        const slotDate = new Date(slot.slot_datetime);
        return slotDate.toDateString() === date.toDateString();
      });
      
              // Production: No debug logging needed
      
      return hasSlots;
    };

    const getMonthName = (date: Date) => {
      const monthNames = [
        t('appointment.january'), t('appointment.february'), t('appointment.march'), t('appointment.april'),
        t('appointment.may'), t('appointment.june'), t('appointment.july'), t('appointment.august'),
        t('appointment.september'), t('appointment.october'), t('appointment.november'), t('appointment.december')
      ];
      return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    };

    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <h3 className="text-xl font-semibold text-gray-900">{getMonthName(currentMonth)}</h3>
          
          <button
            onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-4">
          {[t('appointment.sunday'), t('appointment.monday'), t('appointment.tuesday'), t('appointment.wednesday'), t('appointment.thursday'), t('appointment.friday'), t('appointment.saturday')].map(day => (
            <div key={day} className="text-sm font-medium text-gray-500 text-center py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            const available = isAvailable(date);
            const today = isToday(date);
            const selected = isSelected(date);
            const isCurrentMonth = date.getMonth() === month;
            
            // Count slots for this specific date
            const slotsForDate = availableSlots.filter(slot => {
              const slotDate = new Date(slot.slot_datetime);
              return slotDate.toDateString() === date.toDateString();
            });
            
            return (
              <button
                key={index}
                onClick={() => available && handleDateSelection(date)}
                disabled={!available}
                title={available ? `${slotsForDate.length} ${t('appointment.availableSlots').toLowerCase()} ${t('appointment.availableSlotsFrom')} ${date.toLocaleDateString()}` : t('appointment.noSlotsAvailable')}
                className={`
                  h-12 w-full rounded-lg text-sm font-medium transition-all duration-200 relative
                  ${today 
                    ? 'bg-blue-600 text-white ring-2 ring-blue-300' 
                    : selected
                    ? 'bg-blue-600 text-white'
                    : available
                    ? 'text-gray-900 bg-white hover:bg-blue-50 hover:text-blue-700 hover:ring-2 hover:ring-blue-200 cursor-pointer'
                    : 'text-gray-300 bg-gray-50 cursor-not-allowed'
                  }
                  ${!isCurrentMonth ? 'opacity-50' : ''}
                `}
              >
                {date.getDate()}
                {available && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderBookingInterface = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('appointment.selectAppointmentDate')}</h2>
        <p className="text-gray-600">{t('appointment.chooseConvenientDate', { type: selectedType?.toLowerCase() })}</p>
        
        {/* Refresh button */}
        <button
          onClick={() => fetchAvailableSlots(selectedType!)}
          disabled={loading}
          className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? t('appointment.refreshing') : t('appointment.refresh')}
        </button>
        
        {/* Jump to latest available month button */}
        {availableSlots.length > 0 && (
          <button
            onClick={jumpToLatestAvailableMonth}
            className="mt-2 ml-2 inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <Calendar className="w-4 h-4 mr-2" />
            {t('appointment.jumpToLatest')}
          </button>
        )}
        
        {/* Weekend slot visibility toggle */}
        <div className="mt-2 flex items-center">
          <input
            type="checkbox"
            id="showWeekends"
            checked={showWeekends}
            onChange={(e) => setShowWeekends(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="showWeekends" className="ml-2 text-sm text-gray-600">
            {t('appointment.showWeekendSlots')}
          </label>
        </div>
        
        {/* Availability information */}
        {availableSlots.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            <p>
              <span className="font-medium">{availableSlots.length}</span> {t('appointment.availableSlotsFrom')}{' '}
              <span className="font-medium">
                {formatDate(new Date(availableSlots[0].slot_datetime), i18n.language, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>{' '}
              {t('appointment.to')}{' '}
              <span className="font-medium">
                {formatDate(new Date(availableSlots[availableSlots.length - 1].slot_datetime), i18n.language, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </p>
            {(() => {
              const coverage = checkSlotCoverage();
              return coverage ? (
                <p className="mt-1 text-xs text-gray-500">
                  {t('appointment.coverage')}: {coverage.coverage}% ({coverage.daysWithSlots} {t('appointment.outOf')} {coverage.totalDays} {t('appointment.days')})
                </p>
              ) : null;
            })()}
            {checkIfLimitReached() && (
              <p className="mt-1 text-xs text-orange-600 font-medium">
                ⚠️ {t('appointment.warningSlotLimit')}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar Section */}
        <div>
          {renderCalendar()}
        </div>

        {/* Appointment Details Section */}
        <div className="space-y-6">
          {selectedDate ? (
            <>
              {/* Selected Date Header */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {formatDate(selectedDate, i18n.language, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                <p className="text-gray-600">
                  {selectedType === 'Blood' ? t('appointment.bloodDonationAppointment') : t('appointment.plasmaDonationAppointment')}
                </p>
              </div>

              {/* Center Selection */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('appointment.selectCenter')}:
                </label>
                <select
                  value={selectedCenter || ''}
                  onChange={(e) => handleCenterSelection(e.target.value)}
                  className="w-full px-3 py-2 border border-orange-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Choose a center...</option>
                  {allCenters.map((center) => (
                    <option key={center.center_id} value={center.center_id}>
                      {center.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Slots */}
              {selectedCenter && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('appointment.availableSlots')}</h4>
                  
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="ml-2 text-gray-600">Loading time slots...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {(() => {
                        // Filter slots for selected center and date
                        const centerSlots = availableSlots.filter(slot => 
                          slot.center_id === selectedCenter && 
                          selectedDate && 
                          new Date(slot.slot_datetime).toDateString() === selectedDate.toDateString()
                        );
                        
                        // Filter slots for selected center and date
                        
                        // Extract and filter time slots between 7am and 3pm efficiently
                        const timeSlotMap = new Map<string, AvailabilitySlot>();
                        
                        centerSlots.forEach(slot => {
                          const slotTime = new Date(slot.slot_datetime);
                          const hours = slotTime.getHours();
                          
                          // Only process slots between 7 AM and 3 PM (15:00)
                          if (hours >= 7 && hours <= 15) {
                            const timeString = formatTime(slotTime, i18n.language, {
                              hour: '2-digit',
                              minute: '2-digit'
                            });
                            
                            // Use Map to automatically handle duplicates - later slots override earlier ones
                            timeSlotMap.set(timeString, slot);
                          }
                        });
                        
                        // Convert Map to sorted array
                        const uniqueTimeSlots = Array.from(timeSlotMap.entries())
                          .map(([timeString, slot]) => ({
                            time: timeString,
                            displayTime: timeString,
                            slot: slot,
                            hours: new Date(slot.slot_datetime).getHours(),
                            minutes: new Date(slot.slot_datetime).getMinutes(),
                            originalDateTime: slot.slot_datetime
                          }))
                          .sort((a, b) => a.time.localeCompare(b.time));
                        
                        if (uniqueTimeSlots.length === 0) {
                          return (
                            <div className="col-span-2">
                              <div className="text-center py-8 text-gray-500">
                                <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <h4 className="text-lg font-medium text-gray-700 mb-2">{t('appointment.noSlotsAvailable')}</h4>
                                <p className="text-gray-500">{t('appointment.noSlotsAvailable')}</p>
                              </div>
                            </div>
                          );
                        }
                        
                        return uniqueTimeSlots.map((timeSlot) => (
                          <button
                            key={timeSlot.slot.slot_id}
                            onClick={() => handleTimeSlotSelection(timeSlot.slot)}
                            className="px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 font-medium"
                          >
                            {timeSlot.displayTime}
                          </button>
                        ));
                      })()}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('appointment.selectADate')}</h3>
              <p className="text-gray-600">{t('appointment.chooseDateFromCalendar')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderConfirmation = () => {
    if (!selectedSlot || !selectedType) return null;
    
    const dateTime = formatDateTime(selectedSlot.slot_datetime);
    
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('appointment.confirmBooking')}</h2>
          <p className="text-gray-600">Please review your appointment details</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{t('appointment.bookingSummary')}</h3>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">{t('appointment.donationType')}</span>
              <span className="font-semibold text-gray-900">{selectedType}</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">{t('appointment.date')}</span>
              <span className="font-semibold text-gray-900">{dateTime.date}</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-gray-600">{t('appointment.time')}</span>
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
            onClick={() => setCurrentStep('booking')}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            {t('common.back')}
          </button>
          <button
            onClick={confirmBooking}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Loader className="w-4 h-4 animate-spin mr-2" />
                {t('common.loading')}
              </div>
            ) : (
              <>
                <Check className="w-4 h-4 inline mr-2" />
                {t('appointment.confirmBooking')}
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('appointment.bookingSuccess')}</h2>
          <p className="text-gray-600 text-lg">{t('appointment.bookingSuccessDesc')}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('appointment.appointmentDetails')}</h3>
          <div className="space-y-3 text-left">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('appointment.date')}:</span>
              <span className="font-semibold">{dateTime.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('appointment.time')}:</span>
              <span className="font-semibold">{dateTime.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('appointment.center')}:</span>
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
          {t('dashboard.backToLanding')}
        </button>
      </div>
    );
  };

  // Function to find the latest month with available slots
  const findLatestMonthWithSlots = () => {
    if (availableSlots.length === 0) return null;
    
    // Find the latest slot date
    const latestSlot = availableSlots.reduce((latest, slot) => {
      const slotDate = new Date(slot.slot_datetime);
      return slotDate > latest ? slotDate : latest;
    }, new Date(0));
    
    return new Date(latestSlot.getFullYear(), latestSlot.getMonth(), 1);
  };

  // Function to jump to the latest month with slots
  const jumpToLatestAvailableMonth = () => {
    const latestMonth = findLatestMonthWithSlots();
    if (latestMonth) {
      setCurrentMonth(latestMonth);
    }
  };

  // Function to check if we have all available slots
  const checkSlotCoverage = () => {
    if (availableSlots.length === 0) return null;
    
    const dates = availableSlots.map(slot => new Date(slot.slot_datetime));
    const sortedDates = dates.sort((a, b) => a.getTime() - b.getTime());
    const earliestDate = sortedDates[0];
    const latestDate = sortedDates[sortedDates.length - 1];
    
    // Check if we have slots for the full range
    const totalDays = Math.ceil((latestDate.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysWithSlots = new Set(dates.map(d => d.toDateString())).size;
    
    return {
      totalDays,
      daysWithSlots,
      coverage: Math.round((daysWithSlots / totalDays) * 100),
      earliestDate,
      latestDate
    };
  };

  // Function to check if we might be hitting the limit
  const checkIfLimitReached = () => {
    if (availableSlots.length === 0) return false;
    
    // If we have exactly 10,000 slots, we might be hitting the limit
    return availableSlots.length >= 10000;
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
                {t('dashboard.backToLanding')}
              </button>
              <Calendar className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">{t('appointment.title')}</h1>
            </div>
            <LanguageSwitcher variant="minimal" />
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
        {currentStep === 'booking' && renderBookingInterface()}
        {currentStep === 'confirmation' && renderConfirmation()}
        {currentStep === 'success' && renderSuccess()}
      </main>
    </div>
  );
}
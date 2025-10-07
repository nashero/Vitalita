import React, { useState, useEffect, useMemo } from 'react';
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
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Info
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { getAppointmentError, AppointmentError } from '../utils/appointmentErrors';
import AppointmentErrorDisplay from './AppointmentErrorDisplay';
import { getCurrentLocale, formatDate, formatTime, formatDateTime } from '../utils/languageUtils';

interface DonationCenter {
  center_id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  contact_phone: string | null;
  email: string | null;
  is_active: boolean;
}

interface AvailabilitySlot {
  slot_id: string;
  center_id: string;
  slot_datetime: string;
  donation_type: string;
  capacity: number;
  current_bookings: number;
  is_available: boolean;
  center?: DonationCenter;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  isWeekend: boolean;
  isCenterOpen: boolean;
  availableSlots: {
    blood: number;
    plasma: number;
  };
  totalSlots: {
    blood: number;
    plasma: number;
  };
}

type DonationType = 'Blood' | 'Plasma';
type CalendarView = 'month' | 'year';

interface AppointmentCalendarProps {
  onBack: () => void;
}

export default function AppointmentCalendar({ onBack }: AppointmentCalendarProps) {
  const { t } = useTranslation();
  const { donor } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedType, setSelectedType] = useState<DonationType | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<DonationCenter | null>(null);
  const [monthAvailabilitySlots, setMonthAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [selectedDateSlots, setSelectedDateSlots] = useState<AvailabilitySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [donationCenters, setDonationCenters] = useState<DonationCenter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppointmentError | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [calendarView, setCalendarView] = useState<CalendarView>('month');
  const [showSlotSelection, setShowSlotSelection] = useState(false);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [showPastSlots, setShowPastSlots] = useState(true); // Show all slots including past ones

  // AVIS Centers configuration
  const avisCenters = [
    'AVIS Casalmaggiore',
    'AVIS Gussola', 
    'AVIS Viadana',
    'AVIS Piadena',
    'AVIS Rivarolo del Re',
    'AVIS Scandolara-Ravara',
    'AVIS Calvatone'
  ];

  // Operating hours: Monday-Saturday, 7 AM - 3 PM
  const isCenterOpen = (date: Date): boolean => {
    const day = date.getDay();
    return day >= 1 && day <= 6; // Monday = 1, Saturday = 6
  };

  // Generate calendar days for the current month/year
  const generateCalendarDays = (date: Date, view: CalendarView): CalendarDay[] => {
    const days: CalendarDay[] = [];
    const today = new Date();
    
    if (view === 'month') {
      const year = date.getFullYear();
      const month = date.getMonth();
      
      // Get first day of month and last day of month
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      // Get first day of week for the first day of month
      const firstDayOfWeek = firstDay.getDay();
      
      // Add days from previous month to fill first week
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const prevDate = new Date(year, month, -i);
        days.push({
          date: prevDate,
          isCurrentMonth: false,
          isToday: false,
          isPast: prevDate < today, // Mark as past if before today
          isWeekend: prevDate.getDay() === 0 || prevDate.getDay() === 6,
          isCenterOpen: isCenterOpen(prevDate),
          availableSlots: { blood: 0, plasma: 0 },
          totalSlots: { blood: 0, plasma: 0 }
        });
      }
      
      // Add days of current month
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const currentDate = new Date(year, month, day);
        days.push({
          date: currentDate,
          isCurrentMonth: true,
          isToday: currentDate.toDateString() === today.toDateString(),
          isPast: currentDate < today, // Mark as past if before today
          isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
          isCenterOpen: isCenterOpen(currentDate),
          availableSlots: { blood: 0, plasma: 0 },
          totalSlots: { blood: 0, plasma: 0 }
        });
      }
      
      // Add days from next month to fill last week
      const lastDayOfWeek = lastDay.getDay();
      for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
        const nextDate = new Date(year, month + 1, i);
        days.push({
          date: nextDate,
          isCurrentMonth: false,
          isToday: false,
          isPast: nextDate < today, // Mark as past if before today
          isWeekend: nextDate.getDay() === 0 || nextDate.getDay() === 6,
          isCenterOpen: isCenterOpen(nextDate),
          availableSlots: { blood: 0, plasma: 0 },
          totalSlots: { blood: 0, plasma: 0 }
        });
      }
    } else {
      // Year view - show all months
      for (let month = 0; month < 12; month++) {
        const monthDate = new Date(date.getFullYear(), month, 1);
        days.push({
          date: monthDate,
          isCurrentMonth: true,
          isToday: false,
          isPast: monthDate < today, // Mark as past if before today
          isWeekend: false,
          isCenterOpen: true, // Always true for month view
          availableSlots: { blood: 0, plasma: 0 },
          totalSlots: { blood: 0, plasma: 0 }
        });
      }
    }
    
    return days;
  };

  // Fetch donation centers
  const fetchDonationCenters = async () => {
    try {
      const { data: centers, error } = await supabase
        .from('donation_centers')
        .select('*')
        .eq('is_active', true)
        .in('name', avisCenters)
        .order('name');

      if (error) {
        console.error('Error fetching centers:', error);
        setError(getAppointmentError(error));
        return;
      }

      setDonationCenters(centers || []);
    } catch (err) {
      console.error('Error fetching centers:', err);
      setError(getAppointmentError(err));
    }
  };

  // Fetch availability slots for the current month
  const fetchMonthAvailability = async (date: Date) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch ALL available slots from the database to show complete availability
      // This allows users to see the full range of available dates
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
            email,
            is_active
          )
        `)
        .eq('is_available', true)
        .order('slot_datetime', { ascending: true });

      if (slotsError) {
        console.error('Error fetching slots:', slotsError);
        setError(getAppointmentError(slotsError));
        return;
      }

      setMonthAvailabilitySlots(slots || []);
      
      // Update calendar days with availability
      updateCalendarWithAvailability(slots || []);
    } catch (err) {
      console.error('Error fetching month availability:', err);
      setError(getAppointmentError(err));
    } finally {
      setLoading(false);
    }
  };

  // Fetch availability slots for a specific date and center
  const fetchAvailabilitySlots = async (date: Date, centerId?: string) => {
    try {
      setLoading(true);
      setError(null);

      const startOfDay = new Date(date);
      startOfDay.setHours(7, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(15, 0, 0, 0);

      let query = supabase
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
            email,
            is_active
          )
        `)
        .gte('slot_datetime', startOfDay.toISOString())
        .lte('slot_datetime', endOfDay.toISOString())
        .eq('is_available', true)
        .order('slot_datetime', { ascending: true });

      if (centerId) {
        query = query.eq('center_id', centerId);
      }

      const { data: slots, error: slotsError } = await query;

      if (slotsError) {
        console.error('Error fetching slots:', slotsError);
        setError(getAppointmentError(slotsError));
        return;
      }

      return slots || [];
    } catch (err) {
      console.error('Error fetching slots:', err);
      setError(getAppointmentError(err));
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Calculate slot availability for calendar display
  const calculateSlotAvailability = (date: Date, slots: AvailabilitySlot[]): { blood: number; plasma: number } => {
    const startOfDay = new Date(date);
    startOfDay.setHours(7, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(15, 0, 0, 0);

    const daySlots = slots.filter(slot => {
      const slotDate = new Date(slot.slot_datetime);
      return slotDate >= startOfDay && slotDate < endOfDay;
    });

    const bloodSlots = daySlots.filter(slot => slot.donation_type === 'Blood');
    const plasmaSlots = daySlots.filter(slot => slot.donation_type === 'Plasma');

    return {
      blood: bloodSlots.reduce((total, slot) => total + (slot.capacity - slot.current_bookings), 0),
      plasma: plasmaSlots.reduce((total, slot) => total + (slot.capacity - slot.current_bookings), 0)
    };
  };

  // Calculate total availability information across all slots
  const calculateTotalAvailability = () => {
    if (monthAvailabilitySlots.length === 0) return null;
    
    const dates = monthAvailabilitySlots.map(slot => new Date(slot.slot_datetime));
    const sortedDates = dates.sort((a, b) => a.getTime() - b.getTime());
    const earliestDate = sortedDates[0];
    const latestDate = sortedDates[sortedDates.length - 1];
    
    const totalBloodSlots = monthAvailabilitySlots
      .filter(slot => slot.donation_type === 'Blood')
      .reduce((total, slot) => total + (slot.capacity - slot.current_bookings), 0);
    
    const totalPlasmaSlots = monthAvailabilitySlots
      .filter(slot => slot.donation_type === 'Plasma')
      .reduce((total, slot) => total + (slot.capacity - slot.current_bookings), 0);
    
    return {
      totalSlots: monthAvailabilitySlots.length,
      totalBloodSlots,
      totalPlasmaSlots,
      earliestDate,
      latestDate,
      dateRange: `${formatDate(earliestDate, i18n.language, { month: 'long', day: 'numeric', year: 'numeric' })} to ${formatDate(latestDate, i18n.language, { month: 'long', day: 'numeric', year: 'numeric' })}`
    };
  };

  // Function to find the latest month with available slots
  const findLatestMonthWithSlots = () => {
    if (monthAvailabilitySlots.length === 0) return null;
    
    // Find the latest slot date
    const latestSlot = monthAvailabilitySlots.reduce((latest, slot) => {
      const slotDate = new Date(slot.slot_datetime);
      return slotDate > latest ? slotDate : latest;
    }, new Date(0));
    
    return new Date(latestSlot.getFullYear(), latestSlot.getMonth(), 1);
  };

  // Function to jump to the latest month with slots
  const jumpToLatestAvailableMonth = () => {
    const latestMonth = findLatestMonthWithSlots();
    if (latestMonth) {
      setCurrentDate(latestMonth);
    }
  };

  // Update calendar days with slot availability
  const updateCalendarWithAvailability = (slots: AvailabilitySlot[]) => {
    const updatedDays = generateCalendarDays(currentDate, calendarView).map(day => {
      const availability = calculateSlotAvailability(day.date, slots);
      return {
        ...day,
        availableSlots: availability,
        totalSlots: {
          blood: Math.max(availability.blood, 0),
          plasma: Math.max(availability.plasma, 0)
        }
      };
    });

    setCalendarDays(updatedDays);
  };

  // Handle date selection
  const handleDateSelection = async (date: Date) => {
    // Prevent selecting past dates, but allow all future dates
    const today = new Date();
    if (date < today || !isCenterOpen(date)) return;
    
    setSelectedDate(date);
    setShowSlotSelection(true);
    
    // Fetch slots for the selected date
    const slots = await fetchAvailabilitySlots(date);
    if (slots) {
      setSelectedDateSlots(slots);
    }
  };

  // Handle donation type selection
  const handleTypeSelection = (type: DonationType) => {
    setSelectedType(type);
  };

  // Handle center selection
  const handleCenterSelection = (center: DonationCenter) => {
    setSelectedCenter(center);
  };

  // Handle slot selection
  const handleSlotSelection = (slot: AvailabilitySlot) => {
    setSelectedSlot(slot);
  };

  // Confirm booking
  const confirmBooking = async () => {
    if (!selectedSlot || !donor || !selectedType) return;

    try {
      setLoading(true);
      setError(null);

      // Create the appointment record
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          donor_hash_id: donor.donor_hash_id,
          donation_center_id: selectedSlot.center_id,
          appointment_datetime: selectedSlot.slot_datetime,
          donation_type: selectedType,
          status: 'SCHEDULED',
          booking_channel: 'online',
          confirmation_sent: false,
          reminder_sent: false,
        })
        .select()
        .single();

      if (appointmentError) {
        console.error('Error creating appointment:', appointmentError);
        setError(getAppointmentError(appointmentError));
        return;
      }

      // Update the availability slot
      const { error: slotUpdateError } = await supabase
        .from('availability_slots')
        .update({ 
          current_bookings: selectedSlot.current_bookings + 1 
        })
        .eq('slot_id', selectedSlot.slot_id)
        .eq('current_bookings', selectedSlot.current_bookings);

      if (slotUpdateError) {
        console.error('Error updating slot:', slotUpdateError);
        
        // Rollback appointment if slot update fails
        await supabase
          .from('appointments')
          .delete()
          .eq('appointment_id', appointment.appointment_id);

        setError(getAppointmentError({ 
          code: 'SLOT_UPDATE_FAILED', 
          message: 'Failed to update slot availability',
          userMessage: 'Unable to secure your time slot.',
          suggestion: 'Please try again or select a different time slot.',
          severity: 'error'
        }));
        return;
      }

      // Create audit log
      await supabase.rpc('create_audit_log', {
        p_user_id: donor.donor_hash_id,
        p_user_type: 'donor',
        p_action: 'appointment_booking',
        p_details: t('appointment.appointmentBookedFor', { 
          type: selectedType?.toLowerCase() === 'blood' ? t('appointment.bloodDonation').toLowerCase() : t('appointment.plasmaDonation').toLowerCase(),
          date: selectedDate ? formatDate(selectedDate, i18n.language) : ''
        }),
        p_resource_type: 'appointments',
        p_resource_id: appointment.appointment_id,
        p_status: 'success'
      });

      setBookingSuccess(true);
      setShowSlotSelection(false);
    } catch (err) {
      console.error('Error booking appointment:', err);
      setError(getAppointmentError(err));
    } finally {
      setLoading(false);
    }
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(newDate);
    fetchMonthAvailability(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(newDate);
    fetchMonthAvailability(newDate);
  };

  const goToPreviousYear = () => {
    const newDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1);
    setCurrentDate(newDate);
    fetchMonthAvailability(newDate);
  };

  const goToNextYear = () => {
    const newDate = new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1);
    setCurrentDate(newDate);
    fetchMonthAvailability(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(null);
    fetchMonthAvailability(today);
  };

  // Load initial data
  useEffect(() => {
    fetchDonationCenters();
    // Initialize calendar days
    const initialDays = generateCalendarDays(currentDate, calendarView);
    setCalendarDays(initialDays);
    fetchMonthAvailability(currentDate); // Fetch availability for the current month on mount
  }, []);

  // Update availability when slots change
  useEffect(() => {
    if (monthAvailabilitySlots.length > 0) {
      updateCalendarWithAvailability(monthAvailabilitySlots);
    }
  }, [monthAvailabilitySlots, currentDate, calendarView]);

  // Update calendar when month/year changes
  useEffect(() => {
    fetchMonthAvailability(currentDate);
  }, [currentDate, calendarView]);

  // Update calendar when showPastSlots changes
  useEffect(() => {
    if (monthAvailabilitySlots.length > 0) {
      updateCalendarWithAvailability(monthAvailabilitySlots);
    }
  }, [showPastSlots]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getAvailabilityColor = (available: number, total: number) => {
    if (available === 0) return 'bg-red-100 text-red-800';
    if (available < total * 0.3) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  const getCenterStatusColor = (isOpen: boolean) => {
    return isOpen ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600';
  };

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-green-100 p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('appointment.bookingSuccess')}</h2>
          <p className="text-gray-600 mb-6">
            {t('appointment.bookingSuccessDesc')} {selectedDate ? formatDate(selectedDate, i18n.language) : ''} presso {selectedCenter?.name}
          </p>
          <button
            onClick={() => {
              setBookingSuccess(false);
              setSelectedDate(null);
              setSelectedType(null);
              setSelectedCenter(null);
              setSelectedSlot(null);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Book Another Appointment
          </button>
        </div>
      </div>
    );
  }

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
              <h1 className="text-xl font-bold text-gray-900">Appointment Calendar</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={goToToday}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => fetchMonthAvailability(currentDate)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                title="Refresh availability"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              
              {/* Toggle for showing past slots */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Show Past Slots:</label>
                <button
                  onClick={() => setShowPastSlots(!showPastSlots)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    showPastSlots 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                  }`}
                  title={showPastSlots ? 'Hide past slots' : 'Show all slots including past ones'}
                >
                  {showPastSlots ? 'ON' : 'OFF'}
                </button>
                {showPastSlots && (
                  <div className="flex items-center text-xs text-orange-600">
                    <Info className="w-3 h-3 mr-1" />
                    Shows all available slots including past dates
                  </div>
                )}
              </div>
              {monthAvailabilitySlots.length > 0 && (
                <button
                  onClick={jumpToLatestAvailableMonth}
                  className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-lg transition-colors"
                  title="Jump to latest available month"
                >
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Jump to Latest Available Month
                </button>
              )}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCalendarView('month')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    calendarView === 'month' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setCalendarView('year')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    calendarView === 'year' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Year
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <AppointmentErrorDisplay 
            error={error}
            onRetry={() => setError(null)}
            onRefresh={() => fetchAvailabilitySlots(selectedDate || new Date())}
            onContactSupport={() => alert('Contact support at support@vitalita.org')}
            className="mb-6"
          />
        )}

        {/* Total Availability Summary */}
        {monthAvailabilitySlots.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {calculateTotalAvailability()?.totalBloodSlots || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Blood Slots</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {calculateTotalAvailability()?.totalPlasmaSlots || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Plasma Slots</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {calculateTotalAvailability()?.totalSlots || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Available Slots</div>
                </div>
              </div>
                          <div className="text-right">
              <div className="text-lg font-semibold text-blue-900 mb-1">
                Available Date Range
              </div>
              <div className="text-sm text-blue-700">
                {calculateTotalAvailability()?.dateRange || 'Loading...'}
              </div>
              {showPastSlots && (
                <div className="text-xs text-orange-600 mt-1">
                  ⚠️ Including past dates with available slots
                </div>
              )}
            </div>
            </div>
          </div>
        )}

        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-8">
          {/* Navigation Controls */}
          <div className="flex items-center space-x-4">
            <button
              onClick={calendarView === 'month' ? goToPreviousMonth : goToPreviousYear}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <h2 className="text-2xl font-bold text-gray-900">
              {calendarView === 'month' 
                ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                : currentDate.getFullYear()
              }
            </h2>
            
            <button
              onClick={calendarView === 'month' ? goToNextMonth : goToNextYear}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

                      <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Blood Donation</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Plasma Donation</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Available</span>
              </div>
              {showPastSlots && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Past Available</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Closed/No Slots</span>
              </div>
            </div>
        </div>

        {/* Current Month Summary */}
        {monthAvailabilitySlots.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="text-xl font-bold text-red-600">
                  {monthAvailabilitySlots
                    .filter(slot => {
                      const slotDate = new Date(slot.slot_datetime);
                      return slotDate.getMonth() === currentDate.getMonth() && 
                             slotDate.getFullYear() === currentDate.getFullYear() &&
                             slot.donation_type === 'Blood';
                    })
                    .reduce((total, slot) => total + (slot.capacity - slot.current_bookings), 0)}
                </div>
                <div className="text-sm text-gray-600">Blood Slots This Month</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">
                  {monthAvailabilitySlots
                    .filter(slot => {
                      const slotDate = new Date(slot.slot_datetime);
                      return slotDate.getMonth() === currentDate.getMonth() && 
                             slotDate.getFullYear() === currentDate.getFullYear() &&
                             slot.donation_type === 'Plasma';
                    })
                    .reduce((total, slot) => total + (slot.capacity - slot.current_bookings), 0)}
                </div>
                <div className="text-sm text-gray-600">Plasma Slots This Month</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">
                  {monthAvailabilitySlots.filter(slot => {
                    const slotDate = new Date(slot.slot_datetime);
                    return slotDate.getMonth() === currentDate.getMonth() && 
                           slotDate.getFullYear() === currentDate.getFullYear();
                  }).length}
                </div>
                <div className="text-sm text-gray-600">Total Slots This Month</div>
              </div>
            </div>
          </div>
        )}

        {/* Calendar Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-blue-600 mr-3" />
              <span className="text-gray-600">Loading calendar availability...</span>
            </div>
          ) : monthAvailabilitySlots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Available Slots</h3>
              <p className="text-gray-600 text-center mb-4">
                There are currently no available donation slots in the system.
                <br />
                Please try refreshing or contact the donation center for availability.
              </p>
              <button
                onClick={() => fetchMonthAvailability(currentDate)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          ) : (
            <>
              {calendarView === 'month' ? (
                <>
                  {/* Month Header */}
                  <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="px-4 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wide">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Month Grid */}
                  <div className="grid grid-cols-7">
                    {calendarDays.map((day, index) => {
                      const isSelected = selectedDate?.toDateString() === day.date.toDateString();
                      const hasAvailability = day.availableSlots.blood > 0 || day.availableSlots.plasma > 0;
                      const isClickable = day.isCenterOpen && (showPastSlots || !day.isPast) && hasAvailability;
                      
                      return (
                        <div
                          key={index}
                          onClick={() => isClickable ? handleDateSelection(day.date) : undefined}
                          className={`min-h-[120px] p-2 border-r border-b border-gray-200 transition-all duration-200 ${
                            isSelected ? 'bg-blue-100 border-blue-300' : ''
                          } ${
                            !day.isCenterOpen 
                              ? 'bg-gray-50 cursor-not-allowed' 
                              : (day.isPast && !showPastSlots)
                                ? 'bg-gray-50 cursor-not-allowed'
                                : hasAvailability 
                                  ? (day.isPast ? 'cursor-pointer hover:bg-orange-50' : 'cursor-pointer hover:bg-blue-50')
                                  : 'bg-gray-50 cursor-not-allowed'
                          }`}
                        >
                          <div className="text-right mb-1">
                            <span className={`text-sm font-medium ${
                              day.isToday 
                                ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center'
                                : day.isCurrentMonth 
                                  ? (isClickable ? (day.isPast ? 'text-orange-700' : 'text-gray-900') : 'text-gray-400')
                                  : 'text-gray-400'
                            }`}>
                              {day.date.getDate()}
                            </span>
                          </div>

                          {/* Center Status Indicator */}
                          <div className="mb-2">
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getCenterStatusColor(day.isCenterOpen)}`}>
                              {day.isCenterOpen ? 'Open' : 'Closed'}
                            </span>
                          </div>

                          {/* Slot Availability Indicators */}
                          {day.isCenterOpen && (showPastSlots || !day.isPast) && (
                            <div className="space-y-1">
                              {/* Blood Donation - Red color scheme */}
                              <div className={`text-xs px-2 py-1 rounded flex items-center justify-between ${
                                day.availableSlots.blood > 0 
                                  ? (day.isPast ? 'bg-orange-100 text-orange-800 border border-orange-200' : 'bg-red-100 text-red-800 border border-red-200')
                                  : 'bg-gray-100 text-gray-500'
                              }`}>
                                <span className="flex items-center">
                                  <Droplets className="w-3 h-3 mr-1" />
                                  Blood
                                </span>
                                <span className="font-medium">{day.availableSlots.blood}</span>
                              </div>
                              
                              {/* Plasma Donation - Blue color scheme */}
                              <div className={`text-xs px-2 py-1 rounded flex items-center justify-between ${
                                day.availableSlots.plasma > 0 
                                  ? (day.isPast ? 'bg-orange-100 text-orange-800 border border-orange-200' : 'bg-blue-100 text-blue-800 border border-blue-200')
                                  : 'bg-gray-100 text-gray-500'
                              }`}>
                                <span className="flex items-center">
                                  <Heart className="w-3 h-3 mr-1" />
                                  Plasma
                                </span>
                                <span className="font-medium">{day.availableSlots.plasma}</span>
                              </div>
                            </div>
                          )}

                          {/* Past Date or No Availability */}
                          {(day.isPast || (!hasAvailability && day.isCenterOpen)) && (
                            <div className="mt-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                day.isPast && hasAvailability && showPastSlots
                                  ? 'text-orange-700 bg-orange-100'
                                  : 'text-gray-500 bg-gray-100'
                              }`}>
                                {day.isPast 
                                  ? (hasAvailability && showPastSlots ? 'Past (Available)' : 'Past')
                                  : 'No slots'
                                }
                              </span>
                            </div>
                          )}

                          {/* Weekend Indicator */}
                          {day.isWeekend && day.isCenterOpen && !day.isPast && (
                            <div className="mt-2">
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                Weekend
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  {/* Year Header */}
                  <div className="grid grid-cols-4 bg-gray-50 border-b border-gray-200">
                    {['Q1', 'Q2', 'Q3', 'Q4'].map(quarter => (
                      <div key={quarter} className="px-4 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wide">
                        {quarter}
                      </div>
                    ))}
                  </div>

                  {/* Year Grid */}
                  <div className="grid grid-cols-4">
                    {calendarDays.map((month, index) => {
                      const monthAvailability = calculateSlotAvailability(month.date, monthAvailabilitySlots);
                      const hasAvailability = monthAvailability.blood > 0 || monthAvailability.plasma > 0;
                      
                      return (
                        <div
                          key={index}
                          onClick={() => {
                            setCalendarView('month');
                            setCurrentDate(month.date);
                          }}
                          className={`min-h-[200px] p-4 border-r border-b border-gray-200 cursor-pointer transition-all duration-200 hover:bg-blue-50 ${
                            hasAvailability ? 'bg-green-50' : 'bg-gray-50'
                          }`}
                        >
                          <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {monthNames[month.date.getMonth()]}
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                              {month.date.getFullYear()}
                            </p>
                            
                            {/* Month Summary with Availability */}
                            <div className="space-y-2">
                              <div className={`text-xs px-2 py-1 rounded ${
                                monthAvailability.blood > 0 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'text-gray-500'
                              }`}>
                                <Droplets className="w-3 h-3 inline mr-1" />
                                Blood: {monthAvailability.blood} slots
                              </div>
                              <div className={`text-xs px-2 py-1 rounded ${
                                monthAvailability.plasma > 0 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'text-gray-500'
                              }`}>
                                <Heart className="w-3 h-3 inline mr-1" />
                                Plasma: {monthAvailability.plasma} slots
                              </div>
                            </div>
                            
                            {/* Availability Status */}
                            <div className="mt-3">
                              <span className={`text-xs px-3 py-1 rounded-full ${
                                hasAvailability 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {hasAvailability ? 'Available' : 'No slots'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Slot Selection Modal */}
        {showSlotSelection && selectedDate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">
                    {t('appointment.title')} per {formatDate(selectedDate, i18n.language)}
                  </h3>
                  <button
                    onClick={() => setShowSlotSelection(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Donation Type Selection */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Select Donation Type</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleTypeSelection('Blood')}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        selectedType === 'Blood'
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Droplets className="w-6 h-6 text-red-600" />
                        <div className="text-left">
                          <h5 className="font-semibold text-gray-900">Blood Donation</h5>
                          <p className="text-sm text-gray-600">450ml • 60 minutes</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleTypeSelection('Plasma')}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        selectedType === 'Plasma'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Heart className="w-6 h-6 text-blue-600" />
                        <div className="text-left">
                          <h5 className="font-semibold text-gray-900">Plasma Donation</h5>
                          <p className="text-sm text-gray-600">600-700ml • 60 minutes</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Center Selection */}
                {selectedType && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('appointment.selectCenter')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {donationCenters.map(center => (
                        <button
                          key={center.center_id}
                          onClick={() => handleCenterSelection(center)}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                            selectedCenter?.center_id === center.center_id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <Building2 className="w-5 h-5 text-blue-600 mt-1" />
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900">{center.name}</h5>
                              <p className="text-sm text-gray-600">{center.address}</p>
                              <p className="text-sm text-gray-600">{center.city}, {center.country}</p>
                              {center.contact_phone && (
                                <p className="text-sm text-gray-500 mt-1">
                                  <Phone className="w-3 h-3 inline mr-1" />
                                  {center.contact_phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Time Slot Selection */}
                {selectedType && selectedCenter && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Select Time Slot</h4>
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader className="w-6 h-6 animate-spin text-blue-600 mr-3" />
                        <span className="text-gray-600">Loading available time slots...</span>
                      </div>
                    ) : selectedDateSlots.length === 0 ? (
                      <div className="text-center py-8">
                        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h5 className="text-lg font-semibold text-gray-900 mb-2">No slots available</h5>
                        <p className="text-gray-600">Please select a different date or center.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {selectedDateSlots
                          .filter(slot => slot.donation_type === selectedType)
                          .map(slot => {
                            const slotTime = new Date(slot.slot_datetime);
                            const isSelected = selectedSlot?.slot_id === slot.slot_id;
                            
                            return (
                              <button
                                key={slot.slot_id}
                                onClick={() => handleSlotSelection(slot)}
                                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                                  isSelected
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-blue-300'
                                }`}
                              >
                                <div className="text-center">
                                  <div className="text-lg font-semibold text-gray-900">
                                    {formatTime(slotTime, i18n.language, {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {slot.capacity - slot.current_bookings} {t('appointment.spotsLeft')}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )}

                {/* Booking Confirmation */}
                {selectedType && selectedCenter && selectedSlot && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-2">{t('appointment.appointmentSummary')}:</p>
                        <ul className="space-y-1 text-blue-700">
                          <li>• <strong>{t('appointment.type')}:</strong> {selectedType} {t('appointment.donationType')}</li>
                          <li>• <strong>{t('appointment.date')}:</strong> {selectedDate ? formatDate(selectedDate, i18n.language) : ''}</li>
                          <li>• <strong>{t('appointment.time')}:</strong> {formatTime(new Date(selectedSlot.slot_datetime), i18n.language)}</li>
                          <li>• <strong>{t('appointment.center')}:</strong> {selectedCenter.name}</li>
                          <li>• <strong>{t('appointment.duration')}:</strong> 60 {t('appointment.minutes')}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowSlotSelection(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmBooking}
                    disabled={!selectedType || !selectedCenter || !selectedSlot || loading}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <Loader className="w-4 h-4 animate-spin mr-2" />
                        {t('appointment.loading')}
                      </div>
                    ) : (
                      {t('appointment.confirmBooking')}
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

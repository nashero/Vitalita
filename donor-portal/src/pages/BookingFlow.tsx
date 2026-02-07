import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { addDays, format, setHours, setMinutes, parseISO } from 'date-fns';
import { it, enUS } from 'date-fns/locale';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { Calendar, Clock, Droplet, FlaskConical, HelpCircle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { ensureLeafletIcon } from '../utils/mapDefaults';
import { supabase } from '../lib/supabase';
import { isAuthenticated } from '../utils/auth';
import AppointmentConfirmation from '../components/AppointmentConfirmation';
import { validateDonationRules } from '../utils/donationRules';

type RiskLevel = 'normal' | 'high';

interface TimeSlot {
  id: string;
  time: string;
  spotsLeft: number;
  status: 'available' | 'filling';
  riskLevel: RiskLevel;
  slot_datetime: string;
  slot_id: string;
}

interface TimeSlotWithDate extends TimeSlot {
  isoDate: string;
}

interface CenterAvailability {
  isoDate: string;
  date: Date;
  slots: TimeSlot[];
}

interface LatLng {
  lat: number;
  lng: number;
}

interface DonationCenter {
  id: string;
  center_id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  distanceKm: number;
  position: LatLng;
  availability: CenterAvailability[];
  isDefault?: boolean;
}



// Steps will be translated in the component using useTranslation
const stepKeys = [
  { id: 1, labelKey: 'booking.steps.selectCenter' },
  { id: 2, labelKey: 'booking.steps.dateTime' },
  { id: 3, labelKey: 'booking.steps.confirmation' },
];


type SlotTemplate = {
  time: string;
  spotsLeft: number;
  riskLevel?: RiskLevel;
};

const midnightToday = (() => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
})();

const slotBlueprintA: SlotTemplate[] = [
  { time: '08:30', spotsLeft: 6 },
  { time: '09:15', spotsLeft: 3, riskLevel: 'high' },
  { time: '10:00', spotsLeft: 4 },
  { time: '10:45', spotsLeft: 2, riskLevel: 'high' },
  { time: '11:30', spotsLeft: 5 },
  { time: '13:00', spotsLeft: 4 },
  { time: '14:00', spotsLeft: 3 },
];

const slotBlueprintB: SlotTemplate[] = [
  { time: '09:00', spotsLeft: 5 },
  { time: '09:45', spotsLeft: 3, riskLevel: 'high' },
  { time: '10:30', spotsLeft: 4 },
  { time: '11:15', spotsLeft: 2, riskLevel: 'high' },
  { time: '12:00', spotsLeft: 4 },
  { time: '15:00', spotsLeft: 5 },
];

const slotBlueprintC: SlotTemplate[] = [
  { time: '08:15', spotsLeft: 4 },
  { time: '09:00', spotsLeft: 3, riskLevel: 'high' },
  { time: '09:45', spotsLeft: 4 },
  { time: '10:30', spotsLeft: 3 },
  { time: '11:15', spotsLeft: 5 },
  { time: '12:45', spotsLeft: 4 },
  { time: '13:30', spotsLeft: 3 },
];

const createAvailability = (
  offsets: number[],
  blueprint: SlotTemplate[],
): CenterAvailability[] => {
  return offsets.map((offset) => {
    const date = addDays(midnightToday, offset);
    const isoDate = format(date, 'yyyy-MM-dd');

    const slots = blueprint.map((template, index) => {
      const riskLevel = template.riskLevel ?? (template.spotsLeft <= 2 ? 'high' : 'normal');
      const status: TimeSlot['status'] =
        template.spotsLeft <= 3 ? 'filling' : 'available';
      const id = `${isoDate}-${index}-${template.time.replace(':', '')}`;

      return {
        id,
        time: template.time,
        spotsLeft: template.spotsLeft,
        status,
        riskLevel,
      };
    });

    return {
      isoDate,
      date,
      slots,
    };
  });
};

// Centers will be loaded from database

ensureLeafletIcon();

const MapViewUpdater = ({ position }: { position: LatLng }) => {
  const map = useMap();

  useEffect(() => {
    map.setView([position.lat, position.lng], position ? 12 : 11, {
      animate: true,
    });
  }, [map, position]);

  return null;
};

const findCenterById = (centers: DonationCenter[], centerId: string | null) => {
  if (!centerId) {
    return null;
  }
  for (const center of centers) {
    if (center.id === centerId || center.center_id === centerId) {
      return center;
    }
  }
  return null;
};

const findAvailabilityByDate = (
  availability: CenterAvailability[],
  isoDate: string | null,
) => {
  if (!isoDate) {
    return null;
  }
  for (const day of availability) {
    if (day.isoDate === isoDate) {
      return day;
    }
  }
  return null;
};

const findSlotById = (day: CenterAvailability | null, slotId: string | null) => {
  if (!day || !slotId) {
    return null;
  }
  for (const slot of day.slots) {
    if (slot.id === slotId) {
      return slot;
    }
  }
  return null;
};

const BookingFlow = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  // Get date-fns locale based on current language
  const dateLocale = i18n.language === 'it' ? it : enUS;
  const [currentStep, setCurrentStep] = useState(1);
  const [postalCodeQuery, setPostalCodeQuery] = useState('');
  const [centers, setCenters] = useState<DonationCenter[]>([]);
  const [loadingCenters, setLoadingCenters] = useState(true);
  const [donorDefaultCenter, setDonorDefaultCenter] = useState<string | null>(null);
  const [selectedCenterId, setSelectedCenterId] = useState<string | null>(null);
  const [selectedDateIso, setSelectedDateIso] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [selectedDonationType, setSelectedDonationType] = useState<'Blood' | 'Plasma'>('Blood');
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null,
  );
  const [slotError, setSlotError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [alternativeSlots, setAlternativeSlots] = useState<TimeSlotWithDate[]>(
    [],
  );
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [currentMonthView, setCurrentMonthView] = useState(new Date());

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch donor's default center and all centers on mount
  useEffect(() => {
    const fetchDonorAndCenters = async () => {
      try {
        setLoadingCenters(true);
        const donorHashId = sessionStorage.getItem('donor_hash_id');
        let defaultCenterName: string | null = null;

        // Fetch donor's default center if logged in
        if (donorHashId) {
          const { data: donorData, error: donorError } = await supabase
            .from('donors')
            .select('avis_donor_center')
            .eq('donor_hash_id', donorHashId)
            .single();

          if (!donorError && donorData?.avis_donor_center) {
            defaultCenterName = donorData.avis_donor_center;
            setDonorDefaultCenter(defaultCenterName);
          }
        }

        // Fetch all donation centers
        const { data: centersData, error: centersError } = await supabase
          .from('donation_centers')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (centersError) {
          console.error('Error fetching centers:', centersError);
          setValidationMessage(t('booking.validation.failedToLoadCenters'));
          return;
        }

        if (centersData && centersData.length > 0) {
          const centersWithAvailability: DonationCenter[] = centersData.map((center) => ({
            id: center.center_id,
            center_id: center.center_id,
            name: center.name,
            address: center.address,
            city: center.city || '',
            postalCode: center.postal_code || '',
            distanceKm: 0, // Can be calculated if needed
            position: {
              lat: center.latitude || 45.4642, // Default to Milan if not set
              lng: center.longitude || 9.1900,
            },
            availability: [], // Will be populated when center is selected
            isDefault: defaultCenterName ? center.name === defaultCenterName : false,
          }));

          setCenters(centersWithAvailability);

          // Pre-select donor's default center if available
          if (defaultCenterName) {
            const defaultCenter = centersWithAvailability.find(
              (c) => c.name === defaultCenterName
            );
            if (defaultCenter) {
              setSelectedCenterId(defaultCenter.id);
            } else if (centersWithAvailability.length > 0) {
              // Otherwise select first center
              setSelectedCenterId(centersWithAvailability[0].id);
            }
          } else if (centersWithAvailability.length > 0) {
            // Select first center if no default
            setSelectedCenterId(centersWithAvailability[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setValidationMessage(t('booking.validation.errorLoadingCenters'));
      } finally {
        setLoadingCenters(false);
      }
    };

    fetchDonorAndCenters();
  }, []);

  // Fetch availability slots when center or donation type is selected
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedCenterId || centers.length === 0) return;

      try {
        // Fetch all slots for the center and donation type, regardless of is_available flag
        // We'll filter by capacity in the application logic
        const { data: slotsData, error: slotsError } = await supabase
          .from('availability_slots')
          .select(`
            *,
            donation_centers!inner(
              center_id,
              name,
              address,
              city
            )
          `)
          .eq('center_id', selectedCenterId)
          .eq('donation_type', selectedDonationType)
          .gte('slot_datetime', new Date().toISOString())
          .order('slot_datetime', { ascending: true });

        if (slotsError) {
          console.error('Error fetching slots:', slotsError);
          return;
        }

        if (slotsData) {
          
          // Group slots by date and filter by available capacity
          const slotsByDate = new Map<string, TimeSlot[]>();
          const now = new Date();

          slotsData.forEach((slot) => {
            const slotDate = new Date(slot.slot_datetime);
            
            // Skip slots in the past
            if (slotDate < now) {
              return;
            }

            // Only include slots that have available capacity
            const spotsLeft = slot.capacity - slot.current_bookings;
            if (spotsLeft <= 0) {
              return; // Skip fully booked slots
            }

            const isoDate = format(slotDate, 'yyyy-MM-dd');
            const time = format(slotDate, 'HH:mm');
            const riskLevel: RiskLevel = spotsLeft <= 2 ? 'high' : 'normal';
            const status: 'available' | 'filling' = spotsLeft <= 3 ? 'filling' : 'available';

            if (!slotsByDate.has(isoDate)) {
              slotsByDate.set(isoDate, []);
            }

            slotsByDate.get(isoDate)!.push({
              id: `${isoDate}-${slot.slot_id}`,
              time,
              spotsLeft,
              status,
              riskLevel,
              slot_datetime: slot.slot_datetime,
              slot_id: slot.slot_id,
            });
          });

          // Convert to CenterAvailability format
          const availability: CenterAvailability[] = Array.from(slotsByDate.entries()).map(
            ([isoDate, slots]) => ({
              isoDate,
              date: parseISO(isoDate),
              slots: slots.sort((a, b) => a.time.localeCompare(b.time)),
            })
          );

          // Update the selected center's availability
          setCenters((prevCenters) =>
            prevCenters.map((center) =>
              center.id === selectedCenterId || center.center_id === selectedCenterId
                ? { ...center, availability }
                : center
            )
          );

          // Auto-select first available date if none selected
          if (!selectedDateIso && availability.length > 0) {
            setSelectedDateIso(availability[0].isoDate);
          }

          // Reset month view to current month when availability is loaded
          setCurrentMonthView(new Date());
        }
      } catch (err) {
        console.error('Error fetching availability:', err);
      }
    };

    fetchAvailability();
  }, [selectedCenterId, selectedDonationType]);

  const filteredCenters = useMemo(() => {
    const query = postalCodeQuery.trim();
    if (!query) {
      return centers;
    }

    const match = centers.filter((center) => {
      const matchPrefix = center.postalCode.slice(0, query.length);
      return matchPrefix === query;
    });

    return match.length > 0 ? match : centers;
  }, [postalCodeQuery, centers]);

  const selectedCenter = useMemo(
    () => findCenterById(centers, selectedCenterId),
    [centers, selectedCenterId],
  );

  const currentAvailability = selectedCenter?.availability ?? [];

  const selectedDateAvailability = useMemo(
    () => findAvailabilityByDate(currentAvailability, selectedDateIso),
    [currentAvailability, selectedDateIso],
  );

  const selectedSlot = useMemo(
    () => findSlotById(selectedDateAvailability, selectedSlotId),
    [selectedDateAvailability, selectedSlotId],
  );

  useEffect(() => {
    if (!selectedCenter) {
      setSelectedDateIso(null);
      setSelectedSlotId(null);
      return;
    }

    if (
      selectedDateIso &&
      !selectedCenter.availability.some((day) => day.isoDate === selectedDateIso)
    ) {
      setSelectedDateIso(selectedCenter.availability[0]?.isoDate ?? null);
      setSelectedSlotId(null);
    }
  }, [selectedCenter, selectedDateIso]);

  useEffect(() => {
    setSelectedSlotId(null);
  }, [selectedDateIso]);


  const handleSelectCenter = (centerId: string) => {
    setSelectedCenterId(centerId);
    setValidationMessage(null);
    setSelectedDateIso(null);
    setSelectedSlotId(null);
    setCurrentMonthView(new Date()); // Reset to current month
  };

  const handleNext = async () => {
    // Only clear validation message if we're not on step 2 (where validation happens)
    // This prevents clearing validation errors that were just set
    if (currentStep !== 2) {
      setValidationMessage(null);
    }

    if (currentStep === 1) {
      if (!selectedCenter) {
        setValidationMessage(t('booking.validation.chooseCenter'));
        return;
      }
    }

    if (currentStep === 2) {
      if (!selectedDateAvailability || !selectedSlot) {
        setValidationMessage(t('booking.validation.selectDateAndTime'));
        return;
      }

      if (selectedSlot.riskLevel === 'high') {
        const friendlyMessage = t('booking.step2.slotError');
        setSlotError(friendlyMessage);

        const sameDayAlternatives = selectedDateAvailability.slots.filter((slot) => {
          if (slot.id === selectedSlot.id) {
            return false;
          }
          return slot.riskLevel !== 'high';
        });

        if (sameDayAlternatives.length > 0) {
          setAlternativeSlots(
            sameDayAlternatives.map((slot) => ({
              ...slot,
              isoDate: selectedDateAvailability.isoDate,
            })),
          );
          return;
        }

        const otherOptions: TimeSlotWithDate[] = [];
        for (const day of currentAvailability) {
          if (day.isoDate === selectedDateAvailability.isoDate) {
            continue;
          }
          for (const slot of day.slots) {
            if (slot.riskLevel === 'high') {
              continue;
            }
            otherOptions.push({
              ...slot,
              isoDate: day.isoDate,
            });
          }
        }

        setAlternativeSlots(otherOptions.slice(0, 4));
        return;
      }

      setSlotError(null);
      setAlternativeSlots([]);

      // Submit appointment before advancing to confirmation step
      const success = await handleSubmitAppointment();
      if (success) {
        // Only advance to step 3 (confirmation) if appointment was successfully saved
        setCurrentStep((step) => step + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    if (currentStep === 3) {
      // Step 3 is just the confirmation view - appointment is already saved
      // No action needed here
      return;
    }

    if (currentStep < stepKeys.length) {
      setCurrentStep((step) => step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmitAppointment = async (): Promise<boolean> => {
    if (!selectedSlot || !selectedCenter) {
      setValidationMessage(t('booking.validation.selectDateTimeCenter'));
      return false;
    }

    try {
      setIsSubmitting(true);
      const donorHashId = sessionStorage.getItem('donor_hash_id');

      if (!donorHashId) {
        setValidationMessage(t('booking.validation.loginRequired'));
        navigate('/login');
        return false;
      }

      // Fetch donor data to validate donation rules
      const { data: donorData, error: donorError } = await supabase
        .from('donors')
        .select('last_donation_date, total_donations_this_year')
        .eq('donor_hash_id', donorHashId)
        .single();

      if (donorError) {
        console.error('Error fetching donor data:', donorError);
        setValidationMessage(t('booking.validation.errorFetchingDonorData'));
        setIsSubmitting(false);
        return false;
      }

      // Fetch all appointments (scheduled and completed) to check both rules
      const currentYear = new Date().getFullYear();
      const yearStart = new Date(currentYear, 0, 1).toISOString();
      const yearEnd = new Date(currentYear + 1, 0, 1).toISOString();
      
      const { data: allAppointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('appointment_id, appointment_datetime, donation_type, status')
        .eq('donor_hash_id', donorHashId)
        .eq('donation_type', selectedDonationType)
        .order('appointment_datetime', { ascending: false });

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
      }

      // Find the most recent appointment date (for 90-day interval check)
      const appointments = allAppointments || [];
      // Get the most recent appointment that is before the new appointment date
      const pastAppointments = appointments.filter(apt => 
        new Date(apt.appointment_datetime) < new Date(selectedSlot.slot_datetime)
      );
      const mostRecentAppointment = pastAppointments.length > 0 
        ? pastAppointments.reduce((latest, current) => 
            new Date(current.appointment_datetime) > new Date(latest.appointment_datetime) ? current : latest
          )
        : null;
      
      // Use the most recent appointment date or last donation date, whichever is later
      let lastRelevantDate = donorData?.last_donation_date || null;
      if (mostRecentAppointment) {
        const mostRecentDate = mostRecentAppointment.appointment_datetime;
        if (!lastRelevantDate || new Date(mostRecentDate) > new Date(lastRelevantDate)) {
          lastRelevantDate = mostRecentDate;
        }
      }

      // Count scheduled appointments for the current year (for 4 donations/year limit)
      const scheduledThisYear = appointments.filter(apt => {
        const aptDate = new Date(apt.appointment_datetime);
        return aptDate >= new Date(yearStart) && 
               aptDate < new Date(yearEnd) &&
               ['SCHEDULED', 'scheduled', 'CONFIRMED', 'confirmed'].includes(apt.status);
      }).length;
      
      // Total donations this year = completed donations + scheduled appointments
      const totalDonationsThisYear = (donorData?.total_donations_this_year || 0) + scheduledThisYear;

      // Debug logging (can be removed in production)
      console.log('Donation validation check:', {
        lastDonationDate: donorData?.last_donation_date,
        mostRecentAppointmentDate: mostRecentAppointment?.appointment_datetime,
        lastRelevantDate,
        completedDonationsThisYear: donorData?.total_donations_this_year,
        scheduledThisYear: scheduledThisYear,
        totalDonationsThisYear,
        newAppointmentDate: selectedSlot.slot_datetime
      });

      // Validate Italian donation rules (90 days interval, max 4 donations/year)
      const appointmentDate = new Date(selectedSlot.slot_datetime);
      const donationValidation = validateDonationRules(
        lastRelevantDate,
        totalDonationsThisYear,
        appointmentDate,
        selectedDonationType
      );

      if (!donationValidation.isValid) {
        // Ensure we have a specific error message - validation function should always return one
        let errorMessage = donationValidation.error;
        
        // If no error message from validation function, create one based on error code
        if (!errorMessage || errorMessage.trim() === '') {
          if (donationValidation.errorCode === 'INSUFFICIENT_INTERVAL') {
            const daysSince = lastRelevantDate ? Math.floor((new Date(selectedSlot.slot_datetime).getTime() - new Date(lastRelevantDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
            const daysRemaining = 90 - daysSince;
            errorMessage = `You must wait 90 days between blood donations. Your last donation was ${daysSince} days ago. Please wait ${daysRemaining} more days before booking.`;
          } else if (donationValidation.errorCode === 'MAX_DONATIONS_REACHED') {
            const currentYear = new Date().getFullYear();
            errorMessage = `You have reached the maximum of 4 blood donations per year (${currentYear}). You can book again starting from ${currentYear + 1}.`;
          } else if (donationValidation.errorCode === 'INSUFFICIENT_INTERVAL_PLASMA') {
            const daysSince = lastRelevantDate ? Math.floor((new Date(selectedSlot.slot_datetime).getTime() - new Date(lastRelevantDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
            const daysRemaining = 14 - daysSince;
            errorMessage = `You must wait 14 days between plasma donations. Your last donation was ${daysSince} days ago. Please wait ${daysRemaining} more days before booking.`;
          } else {
            errorMessage = 'This appointment cannot be booked due to donation eligibility rules. Please select a different date or contact support for assistance.';
          }
        }
        
        // Log for debugging
        console.error('❌ Donation validation FAILED:', {
          errorCode: donationValidation.errorCode,
          errorMessage: errorMessage,
          validationResult: donationValidation,
          lastRelevantDate,
          totalDonationsThisYear,
          appointmentDate: selectedSlot.slot_datetime,
          donationType: selectedDonationType
        });
        
        // Force set the specific error message - this should never be generic
        setValidationMessage(errorMessage);
        setIsSubmitting(false);
        // Scroll to top to ensure error is visible
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return false;
      }
      
      // Log successful validation
      console.log('✅ Donation validation PASSED:', {
        lastRelevantDate,
        totalDonationsThisYear,
        appointmentDate: selectedSlot.slot_datetime
      });

      // Create appointment
      const appointmentData = {
        donor_hash_id: donorHashId,
        donation_center_id: selectedCenter.center_id,
        appointment_datetime: selectedSlot.slot_datetime,
        donation_type: selectedDonationType,
        status: 'SCHEDULED',
        booking_channel: 'online',
        confirmation_sent: false,
        reminder_sent: false,
      };
      
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select()
        .single();
      
      if (appointmentError) {
        console.error('Error creating appointment:', appointmentError);
        setValidationMessage(t('booking.validation.failedToBook'));
        setIsSubmitting(false);
        return false;
      }

      // Update slot bookings count
      // First get current bookings count
      const { data: currentSlot, error: slotFetchError } = await supabase
        .from('availability_slots')
        .select('current_bookings, capacity')
        .eq('slot_id', selectedSlot.slot_id)
        .single();

      if (slotFetchError || !currentSlot) {
        console.error('Error fetching slot:', slotFetchError);
        // Appointment was created, but slot update failed
        setValidationMessage(t('booking.validation.appointmentCreatedIssue'));
        setIsSubmitting(false);
        return false;
      }

      // Update with optimistic locking
      const newBookings = currentSlot.current_bookings + 1;
      
      if (newBookings > currentSlot.capacity) {
        setValidationMessage(t('booking.validation.slotFull'));
        // Delete the appointment we just created
        const { error: deleteError } = await supabase
          .from('appointments')
          .delete()
          .eq('appointment_id', appointment.appointment_id);
        setIsSubmitting(false);
        return false;
      }

      const { error: slotUpdateError } = await supabase
        .from('availability_slots')
        .update({ 
          current_bookings: newBookings,
          is_available: newBookings < currentSlot.capacity
        })
        .eq('slot_id', selectedSlot.slot_id)
        .eq('current_bookings', currentSlot.current_bookings); // Optimistic locking

      if (slotUpdateError) {
        console.error('Error updating slot:', slotUpdateError);
        // Appointment was created, but slot update failed - rollback appointment
        const { error: rollbackError } = await supabase
          .from('appointments')
          .delete()
          .eq('appointment_id', appointment.appointment_id);
        setValidationMessage(t('booking.validation.slotBookedByOther'));
        setIsSubmitting(false);
        return false;
      }

      // Success - appointment saved and slot updated
      setValidationMessage(null);
      setIsSubmitting(false);
      return true;
    } catch (err) {
      console.error('Error submitting appointment:', err);
      // Only show generic error if we don't already have a specific validation message
      // Check if validationMessage state already has a specific error (not generic)
      // We use a ref-like check by looking at the error object
      const isGenericError = !validationMessage || 
                            validationMessage === t('booking.validation.errorOccurred') ||
                            validationMessage === 'An error occurred. Please try again.';
      
      if (isGenericError) {
        setValidationMessage(t('booking.validation.errorOccurred'));
      }
      // If validationMessage already has a specific error, don't overwrite it
      setIsSubmitting(false);
      return false;
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      return;
    }
    setCurrentStep((step) => step - 1);
    setValidationMessage(null);
    setSlotError(null);
  };

  const handleAlternativeSelection = (slot: TimeSlotWithDate) => {
    setAlternativeSlots([]);
    setSlotError(null);
    setSelectedDateIso(slot.isoDate);
    setSelectedSlotId(slot.id);
  };

  const handleAddToCalendar = () => {
    if (!selectedCenter || !selectedDateAvailability || !selectedSlot) {
      return;
    }

    const startDateParts = selectedSlot.time.split(':');
    const hour = Number(startDateParts[0]);
    const minute = Number(startDateParts[1]);
    const start = setMinutes(setHours(selectedDateAvailability.date, hour), minute);
    const end = setMinutes(setHours(selectedDateAvailability.date, hour), minute + 45);

    const formattedStart = format(start, "yyyyMMdd'T'HHmmss");
    const formattedEnd = format(end, "yyyyMMdd'T'HHmmss");

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Vitalita//Donor Portal//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${selectedSlot.id}@vitalita.com`,
      `DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss'Z'")}`,
      `DTSTART:${formattedStart}`,
      `DTEND:${formattedEnd}`,
      `SUMMARY:Blood Donation Appointment - ${selectedCenter.name}`,
      `LOCATION:${selectedCenter.address}`,
      'DESCRIPTION:Thank you for booking with Vitalita. Please arrive 10 minutes early and remember to bring a valid ID.',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'vitalita-appointment.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    if (!selectedCenter || !selectedDateAvailability || !selectedSlot) {
      return;
    }

    const friendlyDate = format(selectedDateAvailability.date, 'EEEE d MMMM', { locale: dateLocale });
    const message = t('booking.step5.shareMessage', { 
      date: friendlyDate, 
      time: selectedSlot.time, 
      center: selectedCenter.name 
    });

    if (navigator.share) {
      navigator
        .share({
          title: 'Join me at Vitalita',
          text: message,
          url: window.location.href,
        })
        .catch((error) => {
          console.warn('Share cancelled', error);
        });
      return;
    }

    setShareMenuOpen((state) => !state);
  };

  const resetAndExit = () => {
    setCurrentStep(1);
    setPostalCodeQuery('');
    setSelectedCenterId(centers.length > 0 ? centers[0]?.id ?? null : null);
    setSelectedDateIso(centers.length > 0 && centers[0]?.availability.length > 0 ? centers[0]?.availability[0]?.isoDate ?? null : null);
    setSelectedSlotId(null);
    navigate('/appointments');
  };

  const renderStepTitle = (title: string, subtitle?: string, id?: string) => (
    <header className="wizard-step-header">
      <h1 id={id || undefined}>{title}</h1>
      {subtitle && <p className="wizard-step-subtitle">{subtitle}</p>}
    </header>
  );

  const renderStepOne = () => (
    <section className="wizard-step" aria-labelledby="step-select-center">
      {/* Step Header with Progress Indicator */}
      <div style={{
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: '#f9fafb',
        borderRadius: '0.5rem',
        border: '1px solid #e5e7eb',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#D97757',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.875rem',
          }}>
            1
          </span>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#1f2937' }}>
              {t('booking.step1.stepTitle')}
            </h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
              {t('booking.step1.stepDescription')}
            </p>
          </div>
        </div>
      </div>

      {renderStepTitle(
        t('booking.step1.title'),
        donorDefaultCenter
          ? t('booking.step1.subtitleDefault', { center: donorDefaultCenter })
          : t('booking.step1.subtitleNoDefault'),
        'step-select-center',
      )}

      {loadingCenters ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>{t('booking.step1.loadingCenters')}</p>
        </div>
      ) : (
        <>
          <div className="center-search">
        <label htmlFor="postalCode" className="postal-code-label">
          {t('booking.step1.postalCodeLabel')}
        </label>
        <div className="postal-code-input">
          <input
            id="postalCode"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder={t('booking.step1.postalCodePlaceholder')}
            value={postalCodeQuery}
            onChange={(event) => setPostalCodeQuery(event.target.value)}
          />
          {postalCodeQuery && (
            <button
              type="button"
              className="text-button"
              onClick={() => setPostalCodeQuery('')}
            >
              {t('booking.step1.clear')}
            </button>
          )}
        </div>
            <p className="postal-code-note">
              {t('booking.step1.postalCodeNote')}
            </p>
          </div>

          {centers.length > 0 && (
            <div className="center-map-wrapper" style={{ width: '100%', overflow: 'hidden', borderRadius: '0.5rem' }}>
              <MapContainer
                center={[
                  selectedCenter?.position.lat ?? centers[0].position.lat,
                  selectedCenter?.position.lng ?? centers[0].position.lng,
                ]}
                zoom={12}
                scrollWheelZoom={false}
                style={{ height: '260px', width: '100%', minHeight: '200px' }}
              >
                {selectedCenter && <MapViewUpdater position={selectedCenter.position} />}
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {centers.map((center) => (
                  <Marker key={center.id} position={[center.position.lat, center.position.lng]}>
                    <Popup>
                      <div className="map-popup">
                        <strong>{center.name}</strong>
                        <p>{center.address}</p>
                        <button
                          type="button"
                          className="text-button"
                          onClick={() => handleSelectCenter(center.id)}
                        >
                          {t('booking.step1.selectThisCenter')}
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}

          <div className="center-list">
            {filteredCenters.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '2rem' }}>
                {t('booking.step1.noCentersFound')}
              </p>
            ) : (
              filteredCenters.map((center) => {
                const isSelected = center.id === selectedCenter?.id || center.center_id === selectedCenter?.center_id;
                const isDefault = center.name === donorDefaultCenter;
                return (
                  <article
                    key={center.id}
                    className={`center-card ${isSelected ? 'selected' : ''} ${isDefault ? 'default-center' : ''}`}
                  >
                    <div className="center-card-body">
                      {isDefault && (
                        <span className="default-badge" style={{ fontSize: '0.875rem', color: '#D97757', fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
                          {t('booking.step1.yourDefaultCenter')}
                        </span>
                      )}
                      <div className="center-card-heading">
                        <h2>{center.name}</h2>
                        {center.distanceKm > 0 && (
                          <span className="center-distance">
                            {t('booking.step1.kmAway', { distance: center.distanceKm.toFixed(1) })}
                          </span>
                        )}
                      </div>
                      <p className="center-address">{center.address}</p>
                      {center.postalCode && (
                        <p className="center-postal">{t('booking.step1.postalCode', { code: center.postalCode })}</p>
                      )}
                      {center.availability.length > 0 && (
                        <p className="center-availability">
                          {t('booking.step1.nextAvailable', { date: format(center.availability[0].date, 'EEEE d MMMM', { locale: dateLocale }) })}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      className="button primary"
                      onClick={() => handleSelectCenter(center.id)}
                      aria-pressed={isSelected}
                    >
                      {isSelected ? t('booking.step1.selected') : t('booking.step1.select')}
                    </button>
                  </article>
                );
              })
            )}
          </div>
        </>
      )}
    </section>
  );

  const renderStepTwo = () => (
    <section className="wizard-step">
      {/* Step Indicator Card */}
      <div style={{
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: '#FDF6E9',
        borderRadius: '0.5rem',
        borderLeft: '4px solid #D97757',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
        }}>
          <Calendar size={24} color="#D97757" style={{ marginTop: '2px' }} />
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#3E2723' }}>
              {t('booking.step2.stepTitle')}
            </h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#A1887F', marginTop: '0.25rem' }}>
              {t('booking.step2.stepDescription')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Heading */}
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#3E2723', margin: '0 0 0.5rem 0' }}>
          {t('booking.step2.title')}
        </h1>
        <p style={{ fontSize: '16px', color: '#A1887F', margin: 0 }}>
          {t('booking.step2.subtitle')}
        </p>
      </header>

      {/* Donation Type Selection */}
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '16px', fontWeight: 600, color: '#3E2723' }}>
          {t('booking.step2.donationType')} <span aria-label={t('common.required')} style={{ color: '#D97757' }}>*</span>
        </label>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }} role="radiogroup">
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            borderRadius: '8px',
            border: selectedDonationType === 'Blood' ? '2px solid #5B9BD5' : '2px solid #A1887F',
            backgroundColor: selectedDonationType === 'Blood' ? '#5B9BD5' : '#ffffff',
            color: selectedDonationType === 'Blood' ? '#ffffff' : '#3E2723',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontSize: '16px',
            fontWeight: 500,
          }}>
            <input
              type="radio"
              name="donationType"
              value="Blood"
              checked={selectedDonationType === 'Blood'}
              onChange={(e) => {
                setSelectedDonationType(e.target.value as 'Blood' | 'Plasma');
                setSelectedDateIso(null);
                setSelectedSlotId(null);
              }}
              style={{ display: 'none' }}
            />
            <Droplet size={20} />
            {t('booking.step2.bloodDonation')}
          </label>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            borderRadius: '8px',
            border: selectedDonationType === 'Plasma' ? '2px solid #5B9BD5' : '2px solid #A1887F',
            backgroundColor: selectedDonationType === 'Plasma' ? '#5B9BD5' : '#ffffff',
            color: selectedDonationType === 'Plasma' ? '#ffffff' : '#3E2723',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontSize: '16px',
            fontWeight: 500,
          }}>
            <input
              type="radio"
              name="donationType"
              value="Plasma"
              checked={selectedDonationType === 'Plasma'}
              onChange={(e) => {
                setSelectedDonationType(e.target.value as 'Blood' | 'Plasma');
                setSelectedDateIso(null);
                setSelectedSlotId(null);
              }}
              style={{ display: 'none' }}
            />
            <FlaskConical size={20} />
            {t('booking.step2.plasmaDonation')}
          </label>
        </div>
      </div>

      {slotError && (
        <div className="inline-alert">
          <strong>{slotError}</strong>
          {alternativeSlots.length > 0 && (
            <div className="alternative-slots">
              <p>{t('booking.step2.alternativeSlotsTitle')}</p>
              <div className="slot-grid">
                {alternativeSlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    className="slot-button"
                    onClick={() => handleAlternativeSelection(slot)}
                  >
                    <span className="slot-time">{slot.time}</span>
                    <span className="slot-date">
                      {format(
                        (findAvailabilityByDate(currentAvailability, slot.isoDate)?.date ??
                          new Date(slot.isoDate)),
                        'EEE d MMM',
                        { locale: dateLocale }
                      )}
                    </span>
                    {slot.status === 'filling' && (
                      <span className="slot-status">{t('booking.step2.onlySpotsLeft', { count: slot.spotsLeft })}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!selectedCenter && (
        <div className="inline-alert warning">
          <p>{t('booking.step2.pleaseSelectCenter')}</p>
        </div>
      )}

      {selectedCenter && currentAvailability.length === 0 && (
        <div className="inline-alert" style={{
          padding: '1.5rem',
          backgroundColor: '#fef2f2',
          border: '2px solid #fecaca',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '0.75rem', color: '#D97757', fontSize: '1.125rem' }}>
            {t('booking.step2.noAvailableSlots')}
          </h3>
          <p style={{ marginBottom: '1rem', color: '#C5694A' }}>
            {t('booking.step2.noSlotsFound', { type: selectedDonationType })}
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="button primary"
              onClick={() => setCurrentStep(1)}
              style={{
                backgroundColor: '#D97757',
                borderColor: '#D97757',
              }}
            >
              {t('booking.step2.tryDifferentCenter')}
            </button>
            <button
              type="button"
              className="button secondary"
              onClick={() => {
                setSelectedDonationType(selectedDonationType === 'Blood' ? 'Plasma' : 'Blood');
              }}
            >
              {t('booking.step2.tryOtherDonation', { type: selectedDonationType === 'Blood' ? 'Plasma' : 'Blood' })}
            </button>
            <a
              href="https://vitalita.com/callback"
              target="_blank"
              rel="noreferrer"
              className="button secondary"
              style={{
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              {t('booking.step2.requestCallback')}
            </a>
          </div>
        </div>
      )}

      {selectedCenter && currentAvailability.length > 0 && (() => {
        // Filter dates for current month and next month
        const currentMonth = currentMonthView.getMonth();
        const currentYear = currentMonthView.getFullYear();
        const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
        const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;

        // Get all dates in the current and next month
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const filteredDates = currentAvailability.filter((day) => {
          const dayMonth = day.date.getMonth();
          const dayYear = day.date.getFullYear();
          return (
            (dayMonth === currentMonth && dayYear === currentYear) ||
            (dayMonth === nextMonth && dayYear === nextYear)
          );
        });

        // Group dates by month
        const datesByMonth = new Map<string, CenterAvailability[]>();
        filteredDates.forEach((day) => {
          const monthKey = format(day.date, 'yyyy-MM');
          if (!datesByMonth.has(monthKey)) {
            datesByMonth.set(monthKey, []);
          }
          datesByMonth.get(monthKey)!.push(day);
        });

        // Generate all days for the two months (including days without availability)
        const generateMonthDays = (year: number, month: number) => {
          const firstDay = new Date(year, month, 1);
          const lastDay = new Date(year, month + 1, 0);
          const days: Array<{ date: Date; isoDate: string; hasAvailability: boolean; availability?: CenterAvailability }> = [];

          // Add days from start of month
          for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day);
            const isoDate = format(date, 'yyyy-MM-dd');
            const hasAvailability = filteredDates.some((d) => d.isoDate === isoDate);
            const availability = filteredDates.find((d) => d.isoDate === isoDate);

            days.push({
              date,
              isoDate,
              hasAvailability,
              availability,
            });
          }

          return days;
        };

        const currentMonthDays = generateMonthDays(currentYear, currentMonth);
        const nextMonthDays = generateMonthDays(nextYear, nextMonth);

        const handlePreviousMonth = () => {
          const newDate = new Date(currentYear, currentMonth - 1, 1);
          setCurrentMonthView(newDate);
        };

        const handleNextMonth = () => {
          const newDate = new Date(currentYear, currentMonth + 1, 1);
          setCurrentMonthView(newDate);
        };

        // Helper function to generate calendar grid with proper day-of-week alignment
        const generateCalendarGrid = (days: Array<{ date: Date; isoDate: string; hasAvailability: boolean; availability?: CenterAvailability }>, year: number, month: number) => {
          const firstDay = new Date(year, month, 1);
          const lastDay = new Date(year, month + 1, 0);
          const startDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
          const totalDays = lastDay.getDate();
          
          const grid: Array<{ date: Date | null; isoDate: string | null; hasAvailability: boolean; availability?: CenterAvailability; slotCount?: number; hasHighDemand?: boolean }> = [];
          
          // Add empty cells for days before the first day of the month
          for (let i = 0; i < startDayOfWeek; i++) {
            grid.push({ date: null, isoDate: null, hasAvailability: false });
          }
          
          // Add all days of the month
          for (let day = 1; day <= totalDays; day++) {
            const date = new Date(year, month, day);
            const isoDate = format(date, 'yyyy-MM-dd');
            const dayData = days.find(d => d.isoDate === isoDate);
            const slotCount = dayData?.availability?.slots.length || 0;
            const hasHighDemand = dayData?.availability?.slots.some(slot => slot.riskLevel === 'high') || false;
            
            grid.push({
              date,
              isoDate,
              hasAvailability: dayData?.hasAvailability || false,
              availability: dayData?.availability,
              slotCount,
              hasHighDemand,
            });
          }
          
          return grid;
        };

        const currentMonthGrid = generateCalendarGrid(currentMonthDays, currentYear, currentMonth);
        const nextMonthGrid = generateCalendarGrid(nextMonthDays, nextYear, nextMonth);
        const isToday = (date: Date | null) => {
          if (!date) return false;
          return format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
        };

        return (
          <>
            <div className="date-picker date-picker-container" style={{
              backgroundColor: '#ffffff',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              border: '1px solid #FDF6E9',
              marginBottom: '2rem',
            }}>
              {/* Month Navigation */}
              <div className="month-navigation" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                padding: '0.75rem',
                backgroundColor: '#FDF6E9',
                borderRadius: '8px',
              }}>
                <button
                  type="button"
                  onClick={handlePreviousMonth}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#5B9BD5',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <ChevronLeft size={16} />
                  {t('booking.step2.prevMonth')}
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#5B9BD5',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {t('booking.step2.nextMonth')}
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Two Calendars - Responsive Grid */}
              <div className="date-picker-grid">
                {/* Current Month Calendar */}
                <div className="calendar-month-container">
                  <h3 style={{
                    marginBottom: '0.5rem',
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#1f2937',
                  }}>
                    {format(new Date(currentYear, currentMonth, 1), 'MMMM yyyy', { locale: dateLocale })}
                  </h3>
                  {/* Day of week headers */}
                  <div className="calendar-day-header" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                  }}>
                    {[t('booking.step2.days.sun'), t('booking.step2.days.mon'), t('booking.step2.days.tue'), t('booking.step2.days.wed'), t('booking.step2.days.thu'), t('booking.step2.days.fri'), t('booking.step2.days.sat')].map((day, idx) => (
                      <div key={idx} style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#A1887F',
                        textAlign: 'center',
                        padding: '0.5rem',
                      }}>
                        {day}
                      </div>
                    ))}
                  </div>
                  {/* Calendar grid */}
                  <div className="calendar-grid">
                    {currentMonthGrid.map((day, index) => {
                      if (!day.date) {
                        return <div key={`empty-${index}`} style={{ minHeight: '50px' }} />;
                      }
                      
                      const isSelected = day.isoDate === selectedDateIso;
                      const isPast = day.date < today;
                      const isAvailable = day.hasAvailability && !isPast;
                      const isTodayDate = isToday(day.date);

                      return (
                        <button
                          key={day.isoDate}
                          type="button"
                          className={`calendar-day-button ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            if (isAvailable) {
                              setSelectedDateIso(day.isoDate!);
                              setValidationMessage(null);
                            }
                          }}
                          disabled={!isAvailable}
                          style={{
                            width: '40px',
                            height: '40px',
                            border: isTodayDate && !isSelected ? '2px solid #5B9BD5' : isSelected ? '2px solid #D97757' : '1px solid #FDF6E9',
                            backgroundColor: isSelected ? '#D97757' : isAvailable ? '#ffffff' : '#f9fafb',
                            color: isSelected ? '#ffffff' : isAvailable ? '#3E2723' : '#A1887F',
                            borderRadius: '8px',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: isAvailable ? 'pointer' : 'not-allowed',
                            textDecoration: !isAvailable ? 'line-through' : 'none',
                          }}
                          onMouseEnter={(e) => {
                            if (isAvailable && !isSelected) {
                              e.currentTarget.style.backgroundColor = '#FDF6E9';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (isAvailable && !isSelected) {
                              e.currentTarget.style.backgroundColor = '#ffffff';
                            }
                          }}
                        >
                          <span style={{
                            fontWeight: 600,
                          }}>
                            {format(day.date, 'd')}
                          </span>
                          {isAvailable && (
                            <span
                              style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: day.hasHighDemand ? '#E67E22' : '#9CAF88',
                              }}
                              aria-label={day.hasHighDemand ? t('booking.step2.highDemand') : t('booking.step2.available')}
                            />
                          )}
                          {isTodayDate && (
                            <span style={{
                              fontSize: '0.625rem',
                              color: isSelected ? '#ffffff' : '#5B9BD5',
                              fontWeight: 500,
                              marginTop: '0.0625rem',
                            }}>
                              {t('booking.step2.today')}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Next Month Calendar */}
                {nextMonthDays.length > 0 && (
                  <div className="calendar-month-container">
                    <h3 style={{
                      marginBottom: '0.5rem',
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      color: '#1f2937',
                    }}>
                      {format(new Date(nextYear, nextMonth, 1), 'MMMM yyyy', { locale: dateLocale })}
                    </h3>
                    {/* Day of week headers */}
                    <div className="calendar-day-header" style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(7, 1fr)',
                      gap: '0.5rem',
                      marginBottom: '0.5rem',
                    }}>
                      {[t('booking.step2.days.sun'), t('booking.step2.days.mon'), t('booking.step2.days.tue'), t('booking.step2.days.wed'), t('booking.step2.days.thu'), t('booking.step2.days.fri'), t('booking.step2.days.sat')].map((day, idx) => (
                        <div key={idx} style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: '#A1887F',
                          textAlign: 'center',
                          padding: '0.5rem',
                        }}>
                          {day}
                        </div>
                      ))}
                    </div>
                    {/* Calendar grid */}
                    <div className="calendar-grid">
                      {nextMonthGrid.map((day, index) => {
                        if (!day.date) {
                          return <div key={`empty-${index}`} style={{ minHeight: '50px' }} />;
                        }
                        
                        const isSelected = day.isoDate === selectedDateIso;
                        const isPast = day.date < today;
                        const isAvailable = day.hasAvailability && !isPast;
                        const isTodayDate = isToday(day.date);

                        return (
                          <button
                            key={day.isoDate}
                            type="button"
                            className={`calendar-day-button ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                              if (isAvailable) {
                                setSelectedDateIso(day.isoDate!);
                                setValidationMessage(null);
                              }
                            }}
                            disabled={!isAvailable}
                            style={{
                              width: '40px',
                              height: '40px',
                              border: isTodayDate && !isSelected ? '2px solid #5B9BD5' : isSelected ? '2px solid #D97757' : '1px solid #FDF6E9',
                              backgroundColor: isSelected ? '#D97757' : isAvailable ? '#ffffff' : '#f9fafb',
                              color: isSelected ? '#ffffff' : isAvailable ? '#3E2723' : '#A1887F',
                              borderRadius: '8px',
                              position: 'relative',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: isAvailable ? 'pointer' : 'not-allowed',
                              textDecoration: !isAvailable ? 'line-through' : 'none',
                            }}
                            onMouseEnter={(e) => {
                              if (isAvailable && !isSelected) {
                                e.currentTarget.style.backgroundColor = '#FDF6E9';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (isAvailable && !isSelected) {
                                e.currentTarget.style.backgroundColor = '#ffffff';
                              }
                            }}
                          >
                            <span style={{
                              fontWeight: 600,
                            }}>
                              {format(day.date, 'd')}
                            </span>
                            {isAvailable && (
                              <span
                                style={{
                                  position: 'absolute',
                                  top: '4px',
                                  right: '4px',
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  backgroundColor: '#9CAF88',
                                }}
                                aria-label={t('booking.step2.available')}
                              />
                            )}
                            {isTodayDate && (
                              <span style={{
                                fontSize: '0.625rem',
                                color: isSelected ? '#ffffff' : '#5B9BD5',
                                fontWeight: 500,
                                marginTop: '0.0625rem',
                              }}>
                                {t('booking.step2.today')}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Availability Legend */}
              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                backgroundColor: '#FDF6E9',
                borderRadius: '8px',
                display: 'flex',
                gap: '1.5rem',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#9CAF88',
                  }} />
                  <span style={{ fontSize: '14px', color: '#3E2723' }}>{t('booking.step2.available')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#E67E22',
                  }} />
                  <span style={{ fontSize: '14px', color: '#3E2723' }}>{t('booking.step2.highDemand')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#A1887F',
                  }} />
                  <span style={{ fontSize: '14px', color: '#3E2723' }}>{t('booking.step2.full')}</span>
                </div>
              </div>
            </div>

            {/* Time slots only appear after date is selected */}
            {!selectedDateIso && (
              <div style={{
                marginTop: '2rem',
                padding: '2rem',
                textAlign: 'center',
                backgroundColor: '#f9fafb',
                borderRadius: '0.5rem',
                border: '2px dashed #d1d5db',
              }}>
                <p style={{ margin: 0, fontSize: '1rem', color: '#6b7280', fontWeight: 500 }}>
                  {t('booking.step2.selectDatePrompt')}
                </p>
              </div>
            )}

            {selectedDateIso && (
              <div className="time-slot-picker" style={{ marginTop: '2rem' }}>
                <div className="time-slot-section-header" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '2px solid #D97757',
                }}>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#3E2723' }}>
                    {t('booking.step2.selectTime')} {t('booking.step2.forDate', { date: format(selectedDateAvailability?.date || new Date(selectedDateIso), 'EEEE, d MMMM', { locale: dateLocale }) })}
                  </h2>
                </div>
                {selectedDateAvailability?.slots.length === 0 ? (
                  <div className="inline-alert" style={{
                    padding: '1.5rem',
                    backgroundColor: '#fef2f2',
                    border: '2px solid #fecaca',
                    borderRadius: '0.5rem',
                  }}>
                    <h3 style={{ marginTop: 0, marginBottom: '0.75rem', color: '#D97757', fontSize: '1.125rem' }}>
                      {t('booking.step2.noTimeSlots')}
                    </h3>
                    <p style={{ marginBottom: '1rem', color: '#C5694A' }}>
                      {t('booking.step2.noTimeSlotsMessage')}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="button primary"
                        onClick={() => setSelectedDateIso(null)}
                        style={{
                          backgroundColor: '#D97757',
                          borderColor: '#D97757',
                        }}
                      >
                        {t('booking.step2.selectDifferentDate')}
                      </button>
                      <a
                        href="https://vitalita.com/callback"
                        target="_blank"
                        rel="noreferrer"
                        className="button secondary"
                        style={{
                          textDecoration: 'none',
                          display: 'inline-block',
                        }}
                      >
                        {t('booking.step2.joinWaitlist')}
                      </a>
                      <a
                        href="https://vitalita.com/callback"
                        target="_blank"
                        rel="noreferrer"
                        className="button secondary"
                        style={{
                          textDecoration: 'none',
                          display: 'inline-block',
                        }}
                      >
                        {t('booking.step2.requestAlternativeDate')}
                      </a>
                    </div>
                  </div>
                ) : (() => {
                // Group slots by time of day
                const groupSlots = (slots: TimeSlot[]) => {
                  const morning: TimeSlot[] = [];
                  const lunch: TimeSlot[] = [];
                  const afternoon: TimeSlot[] = [];

                  slots.forEach((slot) => {
                    const hour = parseInt(slot.time.split(':')[0]);
                    if (hour >= 8 && hour < 11) {
                      morning.push(slot);
                    } else if (hour >= 11 && hour < 14) {
                      lunch.push(slot);
                    } else if (hour >= 14 && hour <= 18) {
                      afternoon.push(slot);
                    }
                  });

                  return { morning, lunch, afternoon };
                };

                const { morning, lunch, afternoon } = groupSlots(selectedDateAvailability.slots);

                const renderSlotGroup = (titleKey: string, slots: TimeSlot[]) => {
                  if (slots.length === 0) return null;

                  return (
                    <div key={titleKey} style={{ marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: '#6b7280' }}>
                        {t(titleKey)}
                      </h3>
                      <div className="slot-grid">
                        {slots.map((slot) => {
                          const isSelected = slot.id === selectedSlotId;
                          const isBooked = slot.spotsLeft === 0;
                          const isAvailable = !isBooked && slot.spotsLeft > 0;

                          return (
                            <button
                              key={slot.id}
                              type="button"
                              className={`slot-button ${isSelected ? 'selected' : ''} ${!isAvailable || isBooked ? 'unavailable' : 'available'}`}
                              onClick={() => {
                                if (isAvailable && !isBooked) {
                                  setSelectedSlotId(slot.id);
                                  setValidationMessage(null);
                                  setSlotError(null);
                                }
                              }}
                              disabled={!isAvailable || isBooked}
                              style={{
                                position: 'relative',
                                height: '52px',
                                minWidth: '120px',
                                padding: '0.65rem 0.75rem',
                                border: isSelected
                                  ? '2px solid #D97757'
                                  : isAvailable && !isBooked
                                  ? '2px solid #9CAF88'
                                  : '2px solid #A1887F',
                                backgroundColor: isSelected
                                  ? '#D97757'
                                  : isAvailable && !isBooked
                                  ? '#ffffff'
                                  : '#FDF6E9',
                                borderRadius: '8px',
                                cursor: isAvailable && !isBooked ? 'pointer' : 'not-allowed',
                                opacity: isBooked ? 0.5 : 1,
                                transition: 'all 0.3s ease',
                                textDecoration: isBooked ? 'line-through' : 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.25rem',
                                color: isSelected ? '#ffffff' : isAvailable && !isBooked ? '#9CAF88' : '#A1887F',
                                textAlign: 'center',
                              }}
                              onMouseEnter={(e) => {
                                if (isAvailable && !isBooked && !isSelected) {
                                  e.currentTarget.style.backgroundColor = '#FDF6E9';
                                  e.currentTarget.style.borderColor = '#5B9BD5';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (isAvailable && !isBooked && !isSelected) {
                                  e.currentTarget.style.backgroundColor = '#ffffff';
                                  e.currentTarget.style.borderColor = '#9CAF88';
                                }
                              }}
                            >
                              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', lineHeight: 1 }}>
                                {isSelected ? (
                                  <CheckCircle2 size={16} style={{ color: '#ffffff' }} />
                                ) : (
                                  <Clock size={16} style={{ color: isAvailable && !isBooked ? '#9CAF88' : '#A1887F' }} />
                                )}
                                <span
                                  className="slot-time"
                                  style={{
                                    fontSize: '1rem',
                                    fontWeight: isSelected ? 700 : 600,
                                    color: isSelected ? '#ffffff' : isAvailable && !isBooked ? '#3E2723' : '#A1887F',
                                  }}
                                >
                                  {slot.time}
                                </span>
                              </span>
                              {!isSelected && (
                                <span
                                  style={{
                                    fontSize: '0.8rem',
                                    color: isBooked ? '#A1887F' : slot.status === 'filling' ? '#E67E22' : '#9CAF88',
                                    fontWeight: 600,
                                  }}
                                >
                                  {isBooked ? t('booking.step2.booked') : slot.status === 'filling' ? t('booking.step2.left', { count: slot.spotsLeft }) : t('booking.step2.available')}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                };

                return (
                  <>
                    {renderSlotGroup('booking.step2.morning', morning)}
                    {renderSlotGroup('booking.step2.lunch', lunch)}
                    {renderSlotGroup('booking.step2.afternoon', afternoon)}
                  </>
                );
              })()}
                {selectedDateAvailability?.slots.length > 0 && (
                  <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#FDF6E9', borderRadius: '0.5rem', border: '1px solid #A1887F' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#3E2723', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <HelpCircle size={18} color="#5B9BD5" />
                      <span>
                        <strong>{t('booking.step2.needDifferentTime')}</strong> {t('booking.step2.requestCallbackLink')} {t('common.or')} {t('booking.step2.joinWaitlistLink')} {t('booking.step2.forPreferredTimes')}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        );
      })()}
    </section>
  );


  const renderStepThree = () => {
    if (!selectedCenter || !selectedDateAvailability || !selectedSlot) {
      return null;
    }

    return (
      <section className="wizard-step">
        <AppointmentConfirmation
          centerName={selectedCenter.name}
          centerAddress={selectedCenter.address}
          appointmentDate={selectedDateAvailability.date}
          appointmentTime={selectedSlot.time}
          donationType={selectedDonationType}
          patientsHelped={3}
        />
      </section>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderStepOne();
      case 2:
        return renderStepTwo();
      case 3:
        return renderStepThree();
      default:
        return null;
    }
  };

  return (
    <div className="booking-flow">
      <div className="wizard-main">
        <nav className="wizard-progress" aria-label="Booking progress">
          <ol style={{ display: 'flex', alignItems: 'center', width: '100%', position: 'relative' }}>
            {stepKeys.map((step, index) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              const nextStep = stepKeys[index + 1];
              const isConnectorActive = isCurrent || isCompleted;
              
              return (
                <>
                  <li
                    key={step.id}
                    className={`progress-step ${isCompleted ? 'completed' : ''} ${
                      isCurrent ? 'current' : ''
                    }`}
                    style={{ position: 'relative', zIndex: 2 }}
                  >
                    <span className="progress-index" aria-hidden="true">
                      {isCompleted ? <CheckCircle2 size={20} strokeWidth={2.5} /> : step.id}
                    </span>
                    <span className="progress-label">{t(step.labelKey)}</span>
                  </li>
                  {nextStep && (
                    <div
                      key={`connector-${step.id}`}
                      className="progress-connector"
                      style={{
                        flex: 1,
                        height: '3px',
                        margin: '0 8px',
                        borderRadius: '999px',
                        backgroundColor: isConnectorActive ? '#D97757' : '#A1887F',
                        transition: 'background-color 0.3s ease',
                        position: 'relative',
                        zIndex: 1,
                      }}
                      role="presentation"
                    />
                  )}
                </>
              );
            })}
          </ol>
        </nav>

        {validationMessage && (
          <div 
            className="inline-alert warning" 
            role="alert" 
            aria-live="polite"
            style={{
              backgroundColor: '#fef2f2',
              border: '2px solid #dc2626',
              borderRadius: '0.5rem',
              padding: '1rem 1.5rem',
              marginBottom: '1.5rem',
              color: '#991b1b',
              fontWeight: 500
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>⚠️</span>
              <div>
                <strong style={{ display: 'block', marginBottom: '0.5rem', fontSize: '1rem' }}>
                  Cannot Book Appointment
                </strong>
                <p style={{ margin: 0, fontSize: '0.9375rem', lineHeight: 1.5 }}>
                  {validationMessage}
                </p>
              </div>
            </div>
          </div>
        )}

        {renderStepContent()}

        <div className="wizard-controls" style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', marginTop: '2rem' }}>
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            style={{
              height: '48px',
              padding: '0 1.5rem',
              borderRadius: '8px',
              border: '2px solid #A1887F',
              backgroundColor: 'transparent',
              color: '#A1887F',
              fontSize: '16px',
              fontWeight: 600,
              cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (currentStep !== 1) {
                e.currentTarget.style.borderColor = '#3E2723';
                e.currentTarget.style.color = '#3E2723';
              }
            }}
            onMouseLeave={(e) => {
              if (currentStep !== 1) {
                e.currentTarget.style.borderColor = '#A1887F';
                e.currentTarget.style.color = '#A1887F';
              }
            }}
          >
            <ChevronLeft size={18} />
            {t('booking.buttons.back')}
          </button>
          {currentStep < stepKeys.length && (
            <button
              type="button"
              className={`button primary ${isSubmitting ? 'loading' : ''}`}
              onClick={handleNext}
              disabled={isSubmitting || (currentStep === 2 && (!selectedDateIso || !selectedSlotId))}
              aria-busy={isSubmitting}
              style={{
                backgroundColor: (currentStep === 2 && (!selectedDateIso || !selectedSlotId)) ? '#A1887F' : '#D97757',
                borderColor: (currentStep === 2 && (!selectedDateIso || !selectedSlotId)) ? '#A1887F' : '#D97757',
                color: '#ffffff',
                minWidth: '150px',
                boxShadow: (currentStep === 2 && (!selectedDateIso || !selectedSlotId)) ? 'none' : '0 2px 8px rgba(217, 119, 87, 0.2)',
                transition: 'all 0.2s ease',
                opacity: (currentStep === 2 && (!selectedDateIso || !selectedSlotId)) ? 0.6 : 1,
                cursor: (currentStep === 2 && (!selectedDateIso || !selectedSlotId)) ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting && !(currentStep === 2 && (!selectedDateIso || !selectedSlotId))) {
                  e.currentTarget.style.backgroundColor = '#C5694A';
                  e.currentTarget.style.borderColor = '#C5694A';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(217, 119, 87, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting && !(currentStep === 2 && (!selectedDateIso || !selectedSlotId))) {
                  e.currentTarget.style.backgroundColor = '#D97757';
                  e.currentTarget.style.borderColor = '#D97757';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(217, 119, 87, 0.2)';
                }
              }}
            >
              {isSubmitting ? (
                t('booking.buttons.processing')
              ) : currentStep === 1 ? (
                t('booking.buttons.continueToDateTime')
              ) : currentStep === 2 ? (
                t('booking.buttons.confirmAppointment')
              ) : (
                t('common.next')
              )}
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

export default BookingFlow;



import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { addDays, format, setHours, setMinutes, parseISO } from 'date-fns';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ensureLeafletIcon } from '../utils/mapDefaults';
import { supabase } from '../lib/supabase';
import { isAuthenticated } from '../utils/auth';

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

interface PersonalInfo {
  fullName: string;
  dob: string;
  phone: string;
  email: string;
  hasDonatedBefore: '' | 'yes' | 'no';
  autofillKey: string | null;
}

type HealthAnswer = '' | 'yes' | 'no';

interface HealthAnswers {
  recentDonation: HealthAnswer;
  feelsHealthy: HealthAnswer;
  medications: HealthAnswer;
  travel: HealthAnswer;
}

// Health questions will be translated in the component using useTranslation
const healthQuestionKeys: ReadonlyArray<{
  id: keyof HealthAnswers;
  textKey: string;
  helpKey: string;
}> = [
  {
    id: 'recentDonation',
    textKey: 'booking.step4.recentDonation',
    helpKey: 'booking.step4.recentDonationHelp',
  },
  {
    id: 'feelsHealthy',
    textKey: 'booking.step4.feelsHealthy',
    helpKey: 'booking.step4.feelsHealthyHelp',
  },
  {
    id: 'medications',
    textKey: 'booking.step4.medications',
    helpKey: 'booking.step4.medicationsHelp',
  },
  {
    id: 'travel',
    textKey: 'booking.step4.travel',
    helpKey: 'booking.step4.travelHelp',
  },
];

// Steps will be translated in the component using useTranslation
const stepKeys = [
  { id: 1, labelKey: 'booking.steps.selectCenter' },
  { id: 2, labelKey: 'booking.steps.dateTime' },
  { id: 3, labelKey: 'booking.steps.yourDetails' },
  { id: 4, labelKey: 'booking.steps.healthCheck' },
  { id: 5, labelKey: 'booking.steps.confirmation' },
];

const returningDonorProfiles: Record<
  string,
  Pick<PersonalInfo, 'fullName' | 'dob' | 'email'>
> = {
  '3335551212': {
    fullName: 'Giulia Rossi',
    dob: '1990-04-12',
    email: 'giulia.rossi@email.com',
  },
  '3471118899': {
    fullName: 'Marco Bianchi',
    dob: '1986-09-28',
    email: 'marco.bianchi@email.com',
  },
};

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
  const { t } = useTranslation();
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
  const [autofillMessage, setAutofillMessage] = useState<string | null>(null);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [currentMonthView, setCurrentMonthView] = useState(new Date());
  

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: '',
    dob: '',
    phone: '',
    email: '',
    hasDonatedBefore: '',
    autofillKey: null,
  });

  const [healthAnswers, setHealthAnswers] = useState<HealthAnswers>({
    recentDonation: '',
    feelsHealthy: '',
    medications: '',
    travel: '',
  });

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

  useEffect(() => {
    if (personalInfo.hasDonatedBefore !== 'yes') {
      if (personalInfo.autofillKey) {
        setPersonalInfo((prev) => ({
          ...prev,
          autofillKey: null,
        }));
      }
      return;
    }

    const normalizedPhone = personalInfo.phone.replace(/\D/g, '');
    if (!normalizedPhone || normalizedPhone === personalInfo.autofillKey) {
      return;
    }

    const profile = returningDonorProfiles[normalizedPhone];
    if (profile) {
      setPersonalInfo((prev) => ({
        ...prev,
        ...profile,
        hasDonatedBefore: 'yes',
        phone: prev.phone,
        autofillKey: normalizedPhone,
      }));
      setAutofillMessage(t('booking.step3.autofillMessage'));
    }
  }, [personalInfo]);

  const handleSelectCenter = (centerId: string) => {
    setSelectedCenterId(centerId);
    setValidationMessage(null);
    setSelectedDateIso(null);
    setSelectedSlotId(null);
    setCurrentMonthView(new Date()); // Reset to current month
  };

  const handleNext = async () => {
    setValidationMessage(null);

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
    }

    if (currentStep === 3) {
      const errors: Record<string, string> = {};
      
      if (!personalInfo.fullName.trim()) {
        errors.fullName = t('booking.step3.fullNameRequired');
      }
      
      if (!personalInfo.dob) {
        errors.dob = t('booking.step3.dobRequired');
      }
      
      if (!personalInfo.phone.trim()) {
        errors.phone = t('booking.step3.phoneRequired');
      }
      
      if (!personalInfo.hasDonatedBefore) {
        errors.hasDonatedBefore = t('booking.step3.hasDonatedBeforeRequired');
      }
      
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setValidationMessage(t('booking.step3.pleaseCorrectErrors'));
        return;
      }
      
      setFieldErrors({});
    }

    if (currentStep === 4) {
      const unanswered: HealthAnswers[keyof HealthAnswers][] = [];
      for (const question of healthQuestionKeys) {
        if (healthAnswers[question.id] === '') {
          unanswered.push(healthAnswers[question.id]);
        }
      }

      if (unanswered.length > 0) {
        setValidationMessage(t('booking.step4.pleaseAnswerAll'));
        return;
      }

      // Submit appointment before advancing to confirmation step
      const success = await handleSubmitAppointment();
      if (success) {
        // Only advance to step 5 if appointment was successfully saved
        setCurrentStep((step) => step + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    if (currentStep === 5) {
      // Step 5 is just the confirmation view - appointment is already saved
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
      setValidationMessage(t('booking.validation.errorOccurred'));
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

    const friendlyDate = format(selectedDateAvailability.date, 'EEEE d MMMM');
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
    setPersonalInfo({
      fullName: '',
      dob: '',
      phone: '',
      email: '',
      hasDonatedBefore: '',
      autofillKey: null,
    });
    setHealthAnswers({
      recentDonation: '',
      feelsHealthy: '',
      medications: '',
      travel: '',
    });
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
            backgroundColor: '#dc2626',
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
            <div className="center-map-wrapper">
              <MapContainer
                center={[
                  selectedCenter?.position.lat ?? centers[0].position.lat,
                  selectedCenter?.position.lng ?? centers[0].position.lng,
                ]}
                zoom={12}
                scrollWheelZoom={false}
                style={{ height: '260px', width: '100%' }}
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
                        <span className="default-badge" style={{ fontSize: '0.875rem', color: '#dc2626', fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
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
                          {t('booking.step1.nextAvailable', { date: format(center.availability[0].date, 'EEEE d MMMM') })}
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
            backgroundColor: '#dc2626',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.875rem',
          }}>
            2
          </span>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#1f2937' }}>
              {t('booking.step2.stepTitle')}
            </h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
              {t('booking.step2.stepDescription')}
            </p>
          </div>
        </div>
      </div>

      {renderStepTitle(
        t('booking.step2.title'),
        t('booking.step2.subtitle'),
      )}

      {/* Donation Type Selection */}
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
          {t('booking.step2.donationType')} <span aria-label="required">*</span>
        </label>
        <div className="choice-group" role="radiogroup" style={{ display: 'flex', gap: '1rem' }}>
          <label>
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
            />
            {t('booking.step2.bloodDonation')}
          </label>
          <label>
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
            />
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
          <h3 style={{ marginTop: 0, marginBottom: '0.75rem', color: '#dc2626', fontSize: '1.125rem' }}>
            {t('booking.step2.noAvailableSlots')}
          </h3>
          <p style={{ marginBottom: '1rem', color: '#991b1b' }}>
            {t('booking.step2.noSlotsFound', { type: selectedDonationType })}
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="button primary"
              onClick={() => setCurrentStep(1)}
              style={{
                backgroundColor: '#dc2626',
                borderColor: '#dc2626',
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
          
          const grid: Array<{ date: Date | null; isoDate: string | null; hasAvailability: boolean; availability?: CenterAvailability; slotCount?: number }> = [];
          
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
            
            grid.push({
              date,
              isoDate,
              hasAvailability: dayData?.hasAvailability || false,
              availability: dayData?.availability,
              slotCount,
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
            <div className="date-picker" style={{
              backgroundColor: '#ffffff',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              border: '2px solid #e5e7eb',
              marginBottom: '2rem',
            }}>
              {/* Month Navigation */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
              }}>
                <button
                  type="button"
                  onClick={handlePreviousMonth}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#2563eb',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  {t('booking.step2.prevMonth')}
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#2563eb',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  {t('booking.step2.nextMonth')}
                </button>
              </div>

              {/* Two Calendars Side by Side */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
              }}>
                {/* Current Month Calendar */}
                <div>
                  <h3 style={{
                    marginBottom: '0.5rem',
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#1f2937',
                  }}>
                    {format(new Date(currentYear, currentMonth, 1), 'MMMM yyyy')}
                  </h3>
                  {/* Day of week headers */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '0.25rem',
                    marginBottom: '0.25rem',
                  }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} style={{
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#6b7280',
                        padding: '0.125rem',
                      }}>
                        {day}
                      </div>
                    ))}
                  </div>
                  {/* Calendar grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '0.25rem',
                  }}>
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
                          onClick={() => {
                            if (isAvailable) {
                              setSelectedDateIso(day.isoDate!);
                              setValidationMessage(null);
                            }
                          }}
                          disabled={!isAvailable}
                          style={{
                            minHeight: '50px',
                            padding: '0.375rem',
                            borderRadius: '0.5rem',
                            border: isSelected ? '2px solid #2563eb' : '1px solid #e5e7eb',
                            backgroundColor: isSelected ? '#eff6ff' : isAvailable ? '#ffffff' : '#f9fafb',
                            cursor: isAvailable ? 'pointer' : 'not-allowed',
                            opacity: isAvailable ? 1 : 0.4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.125rem',
                            position: 'relative',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            if (isAvailable && !isSelected) {
                              e.currentTarget.style.backgroundColor = '#f3f4f6';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (isAvailable && !isSelected) {
                              e.currentTarget.style.backgroundColor = '#ffffff';
                            }
                          }}
                        >
                          <span style={{
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: isAvailable ? '#1f2937' : '#9ca3af',
                          }}>
                            {format(day.date, 'd')}
                          </span>
                          {isAvailable && (
                            <>
                              <span
                                style={{
                                  position: 'absolute',
                                  top: '4px',
                                  right: '4px',
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  backgroundColor: '#10b981',
                                }}
                                aria-label="Available"
                              />
                              {day.slotCount && day.slotCount > 0 && (
                                <span style={{
                                  fontSize: '0.75rem',
                                  color: '#10b981',
                                  fontWeight: 600,
                                  marginTop: '0.125rem',
                                }}>
                                  {day.slotCount}
                                </span>
                              )}
                            </>
                          )}
                          {isTodayDate && (
                            <span style={{
                              fontSize: '0.625rem',
                              color: isSelected ? '#2563eb' : '#6b7280',
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
                  <div>
                    <h3 style={{
                      marginBottom: '0.5rem',
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      color: '#1f2937',
                    }}>
                      {format(new Date(nextYear, nextMonth, 1), 'MMMM yyyy')}
                    </h3>
                    {/* Day of week headers */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(7, 1fr)',
                      gap: '0.25rem',
                      marginBottom: '0.25rem',
                    }}>
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} style={{
                          textAlign: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: '#6b7280',
                          padding: '0.125rem',
                        }}>
                          {day}
                        </div>
                      ))}
                    </div>
                    {/* Calendar grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(7, 1fr)',
                      gap: '0.25rem',
                    }}>
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
                            onClick={() => {
                              if (isAvailable) {
                                setSelectedDateIso(day.isoDate!);
                                setValidationMessage(null);
                              }
                            }}
                            disabled={!isAvailable}
                            style={{
                              minHeight: '50px',
                              padding: '0.375rem',
                              borderRadius: '0.5rem',
                              border: isSelected ? '2px solid #2563eb' : '1px solid #e5e7eb',
                              backgroundColor: isSelected ? '#eff6ff' : isAvailable ? '#ffffff' : '#f9fafb',
                              cursor: isAvailable ? 'pointer' : 'not-allowed',
                              opacity: isAvailable ? 1 : 0.4,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.125rem',
                              position: 'relative',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              if (isAvailable && !isSelected) {
                                e.currentTarget.style.backgroundColor = '#f3f4f6';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (isAvailable && !isSelected) {
                                e.currentTarget.style.backgroundColor = '#ffffff';
                              }
                            }}
                          >
                            <span style={{
                              fontSize: '1rem',
                              fontWeight: 600,
                              color: isAvailable ? '#1f2937' : '#9ca3af',
                            }}>
                              {format(day.date, 'd')}
                            </span>
                            {isAvailable && (
                              <>
                                <span
                                  style={{
                                    position: 'absolute',
                                    top: '4px',
                                    right: '4px',
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: '#10b981',
                                  }}
                                  aria-label="Available"
                                />
                                {day.slotCount && day.slotCount > 0 && (
                                  <span style={{
                                    fontSize: '0.75rem',
                                    color: '#10b981',
                                    fontWeight: 600,
                                    marginTop: '0.125rem',
                                  }}>
                                    {day.slotCount}
                                  </span>
                                )}
                              </>
                            )}
                            {isTodayDate && (
                              <span style={{
                                fontSize: '0.625rem',
                                color: isSelected ? '#2563eb' : '#6b7280',
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
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                  paddingBottom: '0.75rem',
                  borderBottom: '2px solid #dc2626',
                }}>
                  <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#1f2937' }}>
                    {t('booking.step2.selectTime')}
                  </h2>
                  <span style={{
                    fontSize: '0.875rem',
                    color: '#6b7280',
                    fontStyle: 'italic',
                  }}>
                    {t('booking.step2.forDate', { date: format(selectedDateAvailability?.date || new Date(selectedDateIso), 'EEEE, MMMM d') })}
                  </span>
                </div>
                {selectedDateAvailability?.slots.length === 0 ? (
                  <div className="inline-alert" style={{
                    padding: '1.5rem',
                    backgroundColor: '#fef2f2',
                    border: '2px solid #fecaca',
                    borderRadius: '0.5rem',
                  }}>
                    <h3 style={{ marginTop: 0, marginBottom: '0.75rem', color: '#dc2626', fontSize: '1.125rem' }}>
                      {t('booking.step2.noTimeSlots')}
                    </h3>
                    <p style={{ marginBottom: '1rem', color: '#991b1b' }}>
                      {t('booking.step2.noTimeSlotsMessage')}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="button primary"
                        onClick={() => setSelectedDateIso(null)}
                        style={{
                          backgroundColor: '#dc2626',
                          borderColor: '#dc2626',
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
                      <div className="slot-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.75rem' }}>
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
                                padding: '0.75rem 1rem',
                                border: isSelected
                                  ? '2px solid #dc2626'
                                  : isAvailable && !isBooked
                                  ? '2px solid #10b981'
                                  : '2px solid #e5e7eb',
                                backgroundColor: isSelected
                                  ? '#fef2f2'
                                  : isAvailable && !isBooked
                                  ? '#f0fdf4'
                                  : '#f9fafb',
                                borderRadius: '0.5rem',
                                cursor: isAvailable && !isBooked ? 'pointer' : 'not-allowed',
                                opacity: isBooked ? 0.5 : 1,
                                transition: 'all 0.2s ease',
                                textDecoration: isBooked ? 'line-through' : 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.25rem',
                              }}
                              onMouseEnter={(e) => {
                                if (isAvailable && !isBooked && !isSelected) {
                                  e.currentTarget.style.backgroundColor = '#dcfce7';
                                  e.currentTarget.style.borderColor = '#10b981';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (isAvailable && !isBooked && !isSelected) {
                                  e.currentTarget.style.backgroundColor = '#f0fdf4';
                                  e.currentTarget.style.borderColor = '#10b981';
                                }
                              }}
                            >
                              {isSelected && (
                                <span
                                  style={{
                                    position: 'absolute',
                                    top: '4px',
                                    right: '4px',
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    backgroundColor: '#dc2626',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                  }}
                                  aria-label="Selected"
                                >
                                  ✓
                                </span>
                              )}
                              <span
                                className="slot-time"
                                style={{
                                  fontSize: '1rem',
                                  fontWeight: isSelected ? 700 : 600,
                                  color: isBooked ? '#9ca3af' : isSelected ? '#dc2626' : '#1f2937',
                                }}
                              >
                                {slot.time}
                              </span>
                              {isBooked ? (
                                <span
                                  style={{
                                    fontSize: '0.75rem',
                                    color: '#9ca3af',
                                    textTransform: 'uppercase',
                                  }}
                                >
                                  {t('booking.step2.booked')}
                                </span>
                              ) : slot.status === 'filling' ? (
                                <span
                                  style={{
                                    fontSize: '0.75rem',
                                    color: '#f59e0b',
                                    fontWeight: 600,
                                  }}
                                >
                                  {t('booking.step2.left', { count: slot.spotsLeft })}
                                </span>
                              ) : (
                                <span
                                  style={{
                                    fontSize: '0.75rem',
                                    color: '#10b981',
                                    fontWeight: 600,
                                  }}
                                >
                                  {t('booking.step2.available')}
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
                  <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '0.5rem', border: '1px solid #bfdbfe' }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#1e40af' }}>
                      <strong>{t('booking.step2.needDifferentTime')}</strong> You can{' '}
                      <a
                        href="https://vitalita.com/callback"
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 600 }}
                      >
                        {t('booking.step2.requestCallbackLink')}
                      </a>
                      {' '}or{' '}
                      <a
                        href="https://vitalita.com/waitlist"
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 600 }}
                      >
                        {t('booking.step2.joinWaitlistLink')}
                      </a>
                      {' '}{t('booking.step2.forPreferredTimes')}
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

  const renderStepThree = () => (
    <section className="wizard-step">
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
            backgroundColor: '#dc2626',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.875rem',
          }}>
            3
          </span>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#1f2937' }}>
              {t('booking.step3.stepTitle')}
            </h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
              {t('booking.step3.stepDescription')}
            </p>
          </div>
        </div>
      </div>

      {renderStepTitle(
        t('booking.step3.title'),
        t('booking.step3.subtitle'),
      )}

      {autofillMessage && (
        <div className="inline-notice">
          <p>{autofillMessage}</p>
          <button
            type="button"
            className="text-button"
            onClick={() => setAutofillMessage(null)}
          >
            {t('booking.step3.gotIt')}
          </button>
        </div>
      )}

      <form className="info-form" onSubmit={(event) => event.preventDefault()}>
        <div className="form-field">
          <label htmlFor="fullName">
            {t('booking.step3.fullName')} <span aria-label="required">{t('booking.step3.required')}</span>
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            required
            aria-required="true"
            aria-invalid={fieldErrors.fullName ? 'true' : 'false'}
            aria-describedby={fieldErrors.fullName ? 'fullName-error' : undefined}
            value={personalInfo.fullName}
            onChange={(event) => {
              setPersonalInfo((prev) => ({ ...prev, fullName: event.target.value }));
              if (fieldErrors.fullName) {
                setFieldErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.fullName;
                  return newErrors;
                });
              }
            }}
            placeholder={t('booking.step3.fullNamePlaceholder')}
          />
          {fieldErrors.fullName && (
            <span id="fullName-error" className="field-error" role="alert">
              {fieldErrors.fullName}
            </span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="dob">
            {t('booking.step3.dateOfBirth')} <span aria-label="required">{t('booking.step3.required')}</span>
          </label>
          <input
            id="dob"
            type="date"
            required
            aria-required="true"
            aria-invalid={fieldErrors.dob ? 'true' : 'false'}
            aria-describedby={fieldErrors.dob ? 'dob-error' : undefined}
            max={format(addDays(new Date(), -1), 'yyyy-MM-dd')}
            value={personalInfo.dob}
            onChange={(event) => {
              setPersonalInfo((prev) => ({ ...prev, dob: event.target.value }));
              if (fieldErrors.dob) {
                setFieldErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.dob;
                  return newErrors;
                });
              }
            }}
          />
          {fieldErrors.dob && (
            <span id="dob-error" className="field-error" role="alert">
              {fieldErrors.dob}
            </span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="phone">
            {t('booking.step3.phoneNumber')} <span aria-label="required">{t('booking.step3.required')}</span>
          </label>
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            aria-required="true"
            aria-invalid={fieldErrors.phone ? 'true' : 'false'}
            aria-describedby={fieldErrors.phone ? 'phone-error phone-hint' : 'phone-hint'}
            placeholder={t('booking.step3.phonePlaceholder')}
            value={personalInfo.phone}
            onChange={(event) => {
              setPersonalInfo((prev) => ({
                ...prev,
                phone: event.target.value,
              }));
              setAutofillMessage(null);
              if (fieldErrors.phone) {
                setFieldErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.phone;
                  return newErrors;
                });
              }
            }}
          />
          <small id="phone-hint" className="field-hint">{t('booking.step3.phoneHint')}</small>
          {fieldErrors.phone && (
            <span id="phone-error" className="field-error" role="alert">
              {fieldErrors.phone}
            </span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="email">
            {t('booking.step3.email')} <span className="field-optional">{t('booking.step3.optional')}</span>
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={fieldErrors.email ? 'true' : 'false'}
            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            placeholder={t('booking.step3.emailPlaceholder')}
            value={personalInfo.email}
            onChange={(event) => {
              setPersonalInfo((prev) => ({ ...prev, email: event.target.value }));
              if (fieldErrors.email) {
                setFieldErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.email;
                  return newErrors;
                });
              }
            }}
          />
          {fieldErrors.email && (
            <span id="email-error" className="field-error" role="alert">
              {fieldErrors.email}
            </span>
          )}
        </div>

        <fieldset className="form-field">
          <legend>{t('booking.step3.hasDonatedBefore')} <span aria-label="required">{t('booking.step3.required')}</span></legend>
          <div className="choice-group" role="radiogroup" aria-required="true" aria-invalid={fieldErrors.hasDonatedBefore ? 'true' : 'false'}>
            <label>
              <input
                type="radio"
                name="hasDonatedBefore"
                value="yes"
                checked={personalInfo.hasDonatedBefore === 'yes'}
                onChange={(event) => {
                  setPersonalInfo((prev) => ({
                    ...prev,
                    hasDonatedBefore: event.target.value as PersonalInfo['hasDonatedBefore'],
                  }));
                  if (fieldErrors.hasDonatedBefore) {
                    setFieldErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.hasDonatedBefore;
                      return newErrors;
                    });
                  }
                }}
                aria-describedby={fieldErrors.hasDonatedBefore ? 'hasDonatedBefore-error' : undefined}
              />
              {t('booking.step3.yesReturning')}
            </label>
            <label>
              <input
                type="radio"
                name="hasDonatedBefore"
                value="no"
                checked={personalInfo.hasDonatedBefore === 'no'}
                onChange={(event) => {
                  setPersonalInfo((prev) => ({
                    ...prev,
                    hasDonatedBefore: event.target.value as PersonalInfo['hasDonatedBefore'],
                    autofillKey: null,
                  }));
                  if (fieldErrors.hasDonatedBefore) {
                    setFieldErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.hasDonatedBefore;
                      return newErrors;
                    });
                  }
                }}
                aria-describedby={fieldErrors.hasDonatedBefore ? 'hasDonatedBefore-error' : undefined}
              />
              {t('booking.step3.noFirstTime')}
            </label>
          </div>
          {fieldErrors.hasDonatedBefore && (
            <span id="hasDonatedBefore-error" className="field-error" role="alert">
              {fieldErrors.hasDonatedBefore}
            </span>
          )}
        </fieldset>
      </form>
    </section>
  );

  const renderStepFour = () => {
    return (
      <section className="wizard-step">
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
              backgroundColor: '#dc2626',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.875rem',
            }}>
              4
            </span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#1f2937' }}>
                {t('booking.step4.stepTitle')}
              </h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                {t('booking.step4.stepDescription')}
              </p>
            </div>
          </div>
        </div>

        {renderStepTitle(
          t('booking.step4.title'),
          t('booking.step4.subtitle'),
          'health-questions-title',
        )}

        <div className="health-questions" role="group" aria-labelledby="health-questions-title">
          {healthQuestionKeys.map((question) => {
            const questionText = t(question.textKey);
            const questionHelp = t(question.helpKey);
            return (
              <fieldset className="health-question" key={question.id}>
                <div className="health-question-header">
                  <legend className="health-question-title">{questionText}</legend>
                  <button
                    type="button"
                    className="info-icon"
                    aria-label={`Help for ${questionText}: ${questionHelp}`}
                    aria-expanded="false"
                  >
                    i
                  </button>
                </div>
                <p className="health-help" id={`${question.id}-help`}>{questionHelp}</p>
                <div className="choice-group" role="radiogroup" aria-required="true" aria-labelledby={`${question.id}-label`}>
                  <span id={`${question.id}-label`} className="sr-only">{questionText}</span>
                  <label>
                    <input
                      type="radio"
                      name={question.id}
                      value="yes"
                      required
                      aria-required="true"
                      aria-describedby={`${question.id}-help`}
                      checked={healthAnswers[question.id] === 'yes'}
                      onChange={() =>
                        setHealthAnswers((prev) => ({
                          ...prev,
                          [question.id]: 'yes',
                        }))
                      }
                    />
                    {t('booking.step4.yes')}
                  </label>
                  <label>
                    <input
                      type="radio"
                      name={question.id}
                      value="no"
                      required
                      aria-required="true"
                      aria-describedby={`${question.id}-help`}
                      checked={healthAnswers[question.id] === 'no'}
                      onChange={() =>
                        setHealthAnswers((prev) => ({
                          ...prev,
                          [question.id]: 'no',
                        }))
                      }
                    />
                    {t('booking.step4.no')}
                  </label>
                </div>
              </fieldset>
            );
          })}
        </div>
      </section>
    );
  };

  const renderStepFive = () => {
    if (!selectedCenter || !selectedDateAvailability || !selectedSlot) {
      return null;
    }

    const formattedDate = format(selectedDateAvailability.date, 'EEEE d MMMM');

    return (
      <section className="wizard-step">
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
              backgroundColor: '#dc2626',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.875rem',
            }}>
              5
            </span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#1f2937' }}>
                {t('booking.step5.stepTitle')}
              </h3>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                {t('booking.step5.stepDescription')}
              </p>
            </div>
          </div>
        </div>

        {renderStepTitle(
          t('booking.step5.title'),
          t('booking.step5.subtitle'),
        )}

        <div className="confirmation-details">
          <div className="confirmation-card">
            <h2>{t('booking.step5.appointmentDetails')}</h2>
            <p className="confirmation-highlight">{formattedDate}</p>
            <p className="confirmation-highlight">{selectedSlot.time}</p>
            <p className="confirmation-location">
              {selectedCenter.name}
              <br />
              {selectedCenter.address}
            </p>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                selectedCenter.address,
              )}`}
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              {t('booking.step5.getDirections')}
            </a>
          </div>

          <div className="confirmation-actions">
            <button
              type="button"
              className="button primary"
              onClick={handleAddToCalendar}
              style={{
                backgroundColor: '#dc2626',
                borderColor: '#dc2626',
                color: '#ffffff',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ marginRight: '0.5rem' }}>📅</span>
              {t('booking.step5.addToCalendar')}
            </button>
            <button
              type="button"
              className="button secondary"
              onClick={handleShare}
              style={{
                backgroundColor: '#ffffff',
                borderColor: '#dc2626',
                color: '#dc2626',
                fontWeight: 'normal',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {t('booking.step5.share')}
            </button>
            {shareMenuOpen && (
              <div className="share-menu">
                <a
                  href={`https://t.me/share/url?url=&text=${encodeURIComponent(
                    t('booking.step5.shareMessage', { date: formattedDate, time: selectedSlot.time, center: selectedCenter.name }),
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('booking.step5.shareOnTelegram')}
                </a>
                <a
                  href={`mailto:?subject=Join me at Vitalita&body=${encodeURIComponent(
                    t('booking.step5.shareMessage', { date: formattedDate, time: selectedSlot.time, center: selectedCenter.name }),
                  )}`}
                >
                  {t('booking.step5.shareViaEmail')}
                </a>
              </div>
            )}
            <p className="confirmation-reminder">
              {t('booking.step5.reminderMessage')}
            </p>
          </div>

          <div className="confirmation-extras">
            <div>
              <h3>{t('booking.step5.whatToBring')}</h3>
              <ul>
                <li>{t('booking.step5.whatToBring1')}</li>
                <li>{t('booking.step5.whatToBring2')}</li>
                <li>{t('booking.step5.whatToBring3')}</li>
              </ul>
            </div>
            <div>
              <h3>{t('booking.step5.whatToExpect')}</h3>
              <p>
                {t('booking.step5.whatToExpectText')}
              </p>
            </div>
          </div>
        </div>

        <div className="done-action">
          <button
            type="button"
            className="button secondary"
            onClick={resetAndExit}
            style={{
              backgroundColor: '#ffffff',
              borderColor: '#dc2626',
              color: '#dc2626',
              fontWeight: 'normal',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {t('booking.step5.done')}
          </button>
        </div>
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
      case 4:
        return renderStepFour();
      case 5:
        return renderStepFive();
      default:
        return null;
    }
  };

  return (
    <div className="booking-flow">
      <div className="wizard-main">
        <nav className="wizard-progress" aria-label="Booking progress">
          <ol>
            {stepKeys.map((step) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              return (
                <li
                  key={step.id}
                  className={`progress-step ${isCompleted ? 'completed' : ''} ${
                    isCurrent ? 'current' : ''
                  }`}
                >
                  <span className="progress-index" aria-hidden="true">
                    {step.id}
                  </span>
                  <span className="progress-label">{t(step.labelKey)}</span>
                </li>
              );
            })}
          </ol>
          <div
            className="progress-bar"
            style={{
              width: `${((currentStep - 1) / (stepKeys.length - 1)) * 100}%`,
            }}
            role="presentation"
          />
        </nav>

        {validationMessage && (
          <div className="inline-alert warning" role="alert" aria-live="polite">
            <p>{validationMessage}</p>
          </div>
        )}

        {renderStepContent()}

        <div className="wizard-controls">
          <button
            type="button"
            className="button secondary"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            {t('booking.buttons.back')}
          </button>
          {currentStep < stepKeys.length && (
            <button
              type="button"
              className={`button primary ${isSubmitting ? 'loading' : ''}`}
              onClick={handleNext}
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              style={{
                backgroundColor: '#e11d48',
                borderColor: '#e11d48',
                color: '#ffffff',
                minWidth: '150px',
                boxShadow: '0 2px 8px rgba(225, 29, 72, 0.2)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#be123c';
                  e.currentTarget.style.borderColor = '#be123c';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(225, 29, 72, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#e11d48';
                  e.currentTarget.style.borderColor = '#e11d48';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(225, 29, 72, 0.2)';
                }
              }}
            >
              {isSubmitting ? (
                t('booking.buttons.processing')
              ) : currentStep === 1 ? (
                t('booking.buttons.continueToDateTime')
              ) : currentStep === 2 ? (
                selectedDateIso && selectedSlotId ? t('booking.buttons.reviewAppointment') : t('booking.buttons.selectDateTime')
              ) : currentStep === 3 ? (
                t('booking.buttons.continueToHealthCheck')
              ) : currentStep === 4 ? (
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



import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDays, format, setHours, setMinutes } from 'date-fns';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ensureLeafletIcon } from '../utils/mapDefaults';

type RiskLevel = 'normal' | 'high';

interface TimeSlot {
  id: string;
  time: string;
  spotsLeft: number;
  status: 'available' | 'filling';
  riskLevel: RiskLevel;
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
  name: string;
  address: string;
  postalCode: string;
  distanceKm: number;
  position: LatLng;
  availability: CenterAvailability[];
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

const healthQuestionItems: ReadonlyArray<{
  id: keyof HealthAnswers;
  text: string;
  help: string;
}> = [
  {
    id: 'recentDonation',
    text: 'Have you donated blood in the last 8 weeks?',
    help: 'You need to wait 8 weeks between blood donations.',
  },
  {
    id: 'feelsHealthy',
    text: 'Do you feel healthy today?',
    help: 'Feeling unwell? We can reschedule so you’re at your best.',
  },
  {
    id: 'medications',
    text: 'Are you currently taking any medications?',
    help: 'Some medicines are okay—let us know so we can confirm.',
  },
  {
    id: 'travel',
    text: 'Have you traveled outside Italy recently?',
    help: 'Certain destinations may require a short waiting period.',
  },
];

const steps = [
  { id: 1, label: 'Select Center' },
  { id: 2, label: 'Date & Time' },
  { id: 3, label: 'Your Details' },
  { id: 4, label: 'Health Check' },
  { id: 5, label: 'Confirmation' },
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

const centers: DonationCenter[] = [
  {
    id: 'milan-centro',
    name: 'Centro Donazioni Duomo',
    address: 'Via Torino 18, Milano',
    postalCode: '20122',
    distanceKm: 1.1,
    position: { lat: 45.4627, lng: 9.1856 },
    availability: createAvailability([1, 2, 4, 5, 7, 9], slotBlueprintA),
  },
  {
    id: 'milan-navigli',
    name: 'Sala Donatori Navigli',
    address: 'Alzaia Naviglio Grande 34, Milano',
    postalCode: '20144',
    distanceKm: 2.6,
    position: { lat: 45.4508, lng: 9.1737 },
    availability: createAvailability([2, 3, 6, 8, 10], slotBlueprintB),
  },
  {
    id: 'monza',
    name: 'Vitalita Monza',
    address: 'Via Vittorio Emanuele 8, Monza',
    postalCode: '20900',
    distanceKm: 15.4,
    position: { lat: 45.5845, lng: 9.2744 },
    availability: createAvailability([1, 3, 5, 6, 9], slotBlueprintC),
  },
];

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

const findCenterById = (centerId: string | null) => {
  if (!centerId) {
    return null;
  }
  for (const center of centers) {
    if (center.id === centerId) {
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
  const [currentStep, setCurrentStep] = useState(1);
  const [postalCodeQuery, setPostalCodeQuery] = useState('');
  const [selectedCenterId, setSelectedCenterId] = useState<string | null>(
    centers[0]?.id ?? null,
  );
  const [selectedDateIso, setSelectedDateIso] = useState<string | null>(
    centers[0]?.availability[0]?.isoDate ?? null,
  );
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
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
  }, [postalCodeQuery]);

  const selectedCenter = useMemo(
    () => findCenterById(selectedCenterId),
    [selectedCenterId],
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
      setAutofillMessage(
        'Welcome back! We pre-filled your information. Give it a quick check before you continue.',
      );
    }
  }, [personalInfo]);

  const handleSelectCenter = (centerId: string) => {
    setSelectedCenterId(centerId);
    setValidationMessage(null);
  };

  const handleNext = () => {
    setValidationMessage(null);

    if (currentStep === 1) {
      if (!selectedCenter) {
        setValidationMessage('Please choose a donation center to continue.');
        return;
      }
    }

    if (currentStep === 2) {
      if (!selectedDateAvailability || !selectedSlot) {
        setValidationMessage('Please select a date and an available time slot.');
        return;
      }

      if (selectedSlot.riskLevel === 'high') {
        const friendlyMessage =
          "Looks like that time just filled up. Let’s find another slot that works for you.";
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
        errors.fullName = 'Full name is required';
      }
      
      if (!personalInfo.dob) {
        errors.dob = 'Date of birth is required';
      }
      
      if (!personalInfo.phone.trim()) {
        errors.phone = 'Phone number is required';
      }
      
      if (!personalInfo.hasDonatedBefore) {
        errors.hasDonatedBefore = 'Please let us know if you have donated before';
      }
      
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setValidationMessage('Please correct the errors below');
        return;
      }
      
      setFieldErrors({});
    }

    if (currentStep === 4) {
      const unanswered: HealthAnswers[keyof HealthAnswers][] = [];
      for (const question of healthQuestionItems) {
        if (healthAnswers[question.id] === '') {
          unanswered.push(healthAnswers[question.id]);
        }
      }

      if (unanswered.length > 0) {
        setValidationMessage('Please answer all the health questions.');
        return;
      }
    }

    if (currentStep < steps.length) {
      setCurrentStep((step) => step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    const message = `I booked a donation with Vitalita on ${friendlyDate} at ${selectedSlot.time} at ${selectedCenter.name}. Want to join me?`;

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
    setSelectedCenterId(centers[0]?.id ?? null);
    setSelectedDateIso(centers[0]?.availability[0]?.isoDate ?? null);
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
    navigate('/');
  };

  const renderStepTitle = (title: string, subtitle?: string, id?: string) => (
    <header className="wizard-step-header">
      <h1 id={id || undefined}>{title}</h1>
      {subtitle && <p className="wizard-step-subtitle">{subtitle}</p>}
    </header>
  );

  const renderStepOne = () => (
    <section className="wizard-step" aria-labelledby="step-select-center">
      {renderStepTitle(
        'Where would you like to donate?',
        'Choose the Vitalita center that is most convenient for you.',
        'step-select-center',
      )}

      <div className="center-search">
        <label htmlFor="postalCode" className="postal-code-label">
          Enter your postal code to see nearby centers
        </label>
        <div className="postal-code-input">
          <input
            id="postalCode"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="e.g. 20122"
            value={postalCodeQuery}
            onChange={(event) => setPostalCodeQuery(event.target.value)}
          />
          {postalCodeQuery && (
            <button
              type="button"
              className="text-button"
              onClick={() => setPostalCodeQuery('')}
            >
              Clear
            </button>
          )}
        </div>
        <p className="postal-code-note">
          We’ll always show you the closest options available today.
        </p>
      </div>

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
                    Select this center
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="center-list">
        {filteredCenters.map((center) => {
          const isSelected = center.id === selectedCenter?.id;
          return (
            <article
              key={center.id}
              className={`center-card ${isSelected ? 'selected' : ''}`}
            >
              <div className="center-card-body">
                <div className="center-card-heading">
                  <h2>{center.name}</h2>
                  <span className="center-distance">
                    {center.distanceKm.toFixed(1)} km away
                  </span>
                </div>
                <p className="center-address">{center.address}</p>
                <p className="center-postal">Postal code {center.postalCode}</p>
                <p className="center-availability">
                  Next available: {format(center.availability[0].date, 'EEEE d MMMM')}
                </p>
              </div>
              <button
                type="button"
                className="button primary"
                onClick={() => handleSelectCenter(center.id)}
                aria-pressed={isSelected}
              >
                {isSelected ? 'Selected' : 'Select'}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );

  const renderStepTwo = () => (
    <section className="wizard-step">
      {renderStepTitle(
        'When can you donate?',
        'Pick the date and time that fits your schedule.',
      )}

      {slotError && (
        <div className="inline-alert">
          <strong>{slotError}</strong>
          {alternativeSlots.length > 0 && (
            <div className="alternative-slots">
              <p>Here are some fresh openings you can grab right now:</p>
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
                      <span className="slot-status">Only {slot.spotsLeft} spots left!</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="date-picker">
        <h2>Available dates</h2>
        <div className="date-grid">
          {currentAvailability.map((day) => {
            const isSelected = day.isoDate === selectedDateIso;
            return (
              <button
                key={day.isoDate}
                type="button"
                className={`date-card ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedDateIso(day.isoDate);
                  setValidationMessage(null);
                }}
              >
                <span className="date-day">{format(day.date, 'EEE')}</span>
                <span className="date-number">{format(day.date, 'd')}</span>
                <span className="date-month">{format(day.date, 'MMM')}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="time-slot-picker">
        <h2>Select a time</h2>
        <div className="slot-grid">
          {selectedDateAvailability?.slots.map((slot) => {
            const isSelected = slot.id === selectedSlotId;
            return (
              <button
                key={slot.id}
                type="button"
                className={`slot-button ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedSlotId(slot.id);
                  setValidationMessage(null);
                  setSlotError(null);
                }}
              >
                <span className="slot-time">{slot.time}</span>
                {slot.status === 'filling' && (
                  <span className="slot-status">
                    Only {slot.spotsLeft} spots left!
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <a
          className="text-link"
          href="https://vitalita.com/callback"
          target="_blank"
          rel="noreferrer"
        >
          Can’t find a good time? Request a callback.
        </a>
      </div>
    </section>
  );

  const renderStepThree = () => (
    <section className="wizard-step">
      {renderStepTitle(
        'Tell us about yourself',
        'We’ll send reminders and keep you updated about your appointment.',
      )}

      {autofillMessage && (
        <div className="inline-notice">
          <p>{autofillMessage}</p>
          <button
            type="button"
            className="text-button"
            onClick={() => setAutofillMessage(null)}
          >
            Got it
          </button>
        </div>
      )}

      <form className="info-form" onSubmit={(event) => event.preventDefault()}>
        <div className="form-field">
          <label htmlFor="fullName">
            Full Name <span aria-label="required">*</span>
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
            placeholder="e.g. Giulia Rossi"
          />
          {fieldErrors.fullName && (
            <span id="fullName-error" className="field-error" role="alert">
              {fieldErrors.fullName}
            </span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="dob">
            Date of Birth <span aria-label="required">*</span>
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
            Phone Number <span aria-label="required">*</span>
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
            placeholder="e.g. 333 555 1212"
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
          <small id="phone-hint" className="field-hint">We'll send you an SMS reminder.</small>
          {fieldErrors.phone && (
            <span id="phone-error" className="field-error" role="alert">
              {fieldErrors.phone}
            </span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="email">
            Email <span className="field-optional">(optional)</span>
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={fieldErrors.email ? 'true' : 'false'}
            aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            placeholder="We'll send you a confirmation"
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
          <legend>Have you donated before? <span aria-label="required">*</span></legend>
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
              Yes, I'm a returning donor
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
              No, this is my first time
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
        {renderStepTitle(
          'Just a few quick questions',
          'These help us keep everyone safe.',
          'health-questions-title',
        )}

        <div className="health-questions" role="group" aria-labelledby="health-questions-title">
          {healthQuestionItems.map((question) => (
            <fieldset className="health-question" key={question.id}>
              <div className="health-question-header">
                <legend className="health-question-title">{question.text}</legend>
                <button
                  type="button"
                  className="info-icon"
                  aria-label={`Help for ${question.text}: ${question.help}`}
                  aria-expanded="false"
                >
                  i
                </button>
              </div>
              <p className="health-help" id={`${question.id}-help`}>{question.help}</p>
              <div className="choice-group" role="radiogroup" aria-required="true" aria-labelledby={`${question.id}-label`}>
                <span id={`${question.id}-label`} className="sr-only">{question.text}</span>
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
                  Yes
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
                  No
                </label>
              </div>
            </fieldset>
          ))}
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
        {renderStepTitle(
          'Your appointment is confirmed! 🎉',
          "You're all set. Here’s everything you need to know.",
        )}

        <div className="confirmation-details">
          <div className="confirmation-card">
            <h2>Appointment details</h2>
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
              Get directions
            </a>
          </div>

          <div className="confirmation-actions">
            <button type="button" className="button primary" onClick={handleAddToCalendar}>
              Add to Calendar
            </button>
            <button type="button" className="button secondary" onClick={handleShare}>
              Share
            </button>
            {shareMenuOpen && (
              <div className="share-menu">
                <a
                  href={`https://t.me/share/url?url=&text=${encodeURIComponent(
                    `Come donate with me at ${formattedDate} ${selectedSlot.time} — ${selectedCenter.name}`,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Share on Telegram
                </a>
                <a
                  href={`mailto:?subject=Join me at Vitalita&body=${encodeURIComponent(
                    `I’m giving blood on ${formattedDate} at ${selectedSlot.time} at ${selectedCenter.name} (${selectedCenter.address}). Want to come too?`,
                  )}`}
                >
                  Share via Email
                </a>
              </div>
            )}
            <p className="confirmation-reminder">
              We’ll send you a reminder the day before your appointment.
            </p>
          </div>

          <div className="confirmation-extras">
            <div>
              <h3>What to bring</h3>
              <ul>
                <li>Valid photo ID</li>
                <li>Hydration (water bottle is perfect)</li>
                <li>Something to eat afterwards</li>
              </ul>
            </div>
            <div>
              <h3>What to expect</h3>
              <p>
                The entire visit usually takes about 45 minutes. Our team will guide you
                through each step and answer any questions. Wear comfortable clothing with
                sleeves that can be rolled up.
              </p>
            </div>
          </div>
        </div>

        <div className="done-action">
          <button type="button" className="button primary" onClick={resetAndExit}>
            Done
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
            {steps.map((step) => {
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
                  <span className="progress-label">{step.label}</span>
                </li>
              );
            })}
          </ol>
          <div
            className="progress-bar"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
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
            Back
          </button>
          {currentStep < steps.length && (
            <button
              type="button"
              className={`button primary ${isSubmitting ? 'loading' : ''}`}
              onClick={handleNext}
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Next'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingFlow;



import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addWeeks, differenceInCalendarDays, format, isBefore } from 'date-fns';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import { ensureLeafletIcon } from '../utils/mapDefaults';
import 'leaflet/dist/leaflet.css';

ensureLeafletIcon();

interface Appointment {
  id: string;
  isoDate: string;
  time: string;
  locationName: string;
  address: string;
  lat: number;
  lng: number;
}

interface DonationRecord {
  id: string;
  isoDate: string;
  locationName: string;
}

interface DonorProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  upcoming: Appointment[];
  history: DonationRecord[];
}

const mockProfiles: DonorProfile[] = [
  {
    id: 'donor-giulia',
    name: 'Giulia Rossi',
    email: 'giulia.rossi@email.com',
    phone: '3335551212',
    upcoming: [
      {
        id: 'upcoming-1',
        isoDate: format(addWeeks(new Date(), 1), 'yyyy-MM-dd'),
        time: '09:15',
        locationName: 'Centro Donazioni Duomo',
        address: 'Via Torino 18, Milano',
        lat: 45.4627,
        lng: 9.1856,
      },
      {
        id: 'upcoming-2',
        isoDate: format(addWeeks(new Date(), 5), 'yyyy-MM-dd'),
        time: '10:45',
        locationName: 'Vitalita Monza',
        address: 'Via Vittorio Emanuele 8, Monza',
        lat: 45.5845,
        lng: 9.2744,
      },
    ],
    history: [
      {
        id: 'history-1',
        isoDate: format(addWeeks(new Date(), -10), 'yyyy-MM-dd'),
        locationName: 'Sala Donatori Navigli',
      },
      {
        id: 'history-2',
        isoDate: format(addWeeks(new Date(), -30), 'yyyy-MM-dd'),
        locationName: 'Centro Donazioni Duomo',
      },
    ],
  },
  {
    id: 'donor-marco',
    name: 'Marco Bianchi',
    email: 'marco.bianchi@email.com',
    phone: '3471118899',
    upcoming: [],
    history: [],
  },
];

const MOCK_OTP = '123456';

type LoginStage = 'enter' | 'verify';

const MyAppointments = () => {
  const navigate = useNavigate();
  const [loginStage, setLoginStage] = useState<LoginStage>('enter');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [profile, setProfile] = useState<DonorProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if user is authenticated via sessionStorage
    return !!sessionStorage.getItem('donor_hash_id');
  });
  const [cancelConfirmationId, setCancelConfirmationId] = useState<string | null>(
    null,
  );
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const donorHashId = sessionStorage.getItem('donor_hash_id');
    if (donorHashId) {
      setIsAuthenticated(true);
      // Load profile data if needed
      const donorEmail = sessionStorage.getItem('donor_email');
      const donorId = sessionStorage.getItem('donor_id');
      if (donorEmail || donorId) {
        // Set a basic profile for authenticated user
        setProfile({
          id: donorHashId,
          name: donorId || 'Donor',
          email: donorEmail || '',
          phone: '',
          upcoming: [],
          history: [],
        });
      }
    } else {
      // Redirect to login if not authenticated
      navigate('/login');
    }
  }, [navigate]);

  const formattedUpcoming = useMemo(() => {
    if (!profile) {
      return [];
    }

    return [...profile.upcoming].sort((a, b) =>
      a.isoDate.localeCompare(b.isoDate),
    );
  }, [profile]);

  const formattedHistory = useMemo(() => {
    if (!profile) {
      return [];
    }

    return [...profile.history].sort((a, b) => b.isoDate.localeCompare(a.isoDate));
  }, [profile]);

  const nextAppointment = formattedUpcoming[0];

  const impactLivesSaved = useMemo(() => {
    if (!profile) {
      return 0;
    }
    return profile.history.length * 3;
  }, [profile]);

  const nextEligibleDate = useMemo(() => {
    if (!profile || formattedHistory.length === 0) {
      return null;
    }
    const lastDonation = formattedHistory[0];
    const eligible = addWeeks(new Date(lastDonation.isoDate), 8);
    return format(eligible, 'EEEE d MMMM');
  }, [formattedHistory, profile]);

  const handleSendOtp = () => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.replace(/\D/g, '');
    const matchedProfile = mockProfiles.find(
      (item) =>
        (normalizedEmail && item.email.toLowerCase() === normalizedEmail) ||
        (normalizedPhone && item.phone === normalizedPhone),
    );

    if (!matchedProfile) {
      setLoginError("We couldn't find an account with those details.");
      return;
    }

    setProfile(matchedProfile);
    setLoginError(null);
    setOtpSent(true);
    setLoginStage('verify');
  };

  const handleVerifyOtp = () => {
    if (otp !== MOCK_OTP) {
      setLoginError('That code is not correct. Please try again.');
      return;
    }

    setLoginError(null);
    setActionMessage('You are now signed in.');
    setIsAuthenticated(true);
  };

  const requireAuth = (render: () => JSX.Element) => {
    // Check sessionStorage for authentication
    const donorHashId = sessionStorage.getItem('donor_hash_id');
    if (!donorHashId || !isAuthenticated) {
      // Redirect to login page instead of showing login form
      navigate('/login');
      return null;
    }
    return render();
  };

  const renderCountdown = (appointment: Appointment) => {
    const appointmentDate = new Date(`${appointment.isoDate}T${appointment.time}`);
    const today = new Date();
    const days = differenceInCalendarDays(appointmentDate, today);

    if (days < 0) {
      return 'Your appointment date has passed';
    }
    if (days === 0) {
      return 'Your appointment is today';
    }
    if (days === 1) {
      return 'Your appointment is in 1 day';
    }
    return `Your appointment is in ${days} days`;
  };

  const handleAddToCalendar = (appointment: Appointment) => {
    const start = new Date(`${appointment.isoDate}T${appointment.time}`);
    const end = new Date(start.getTime() + 45 * 60 * 1000);

    const formatICS = (date: Date) => format(date, "yyyyMMdd'T'HHmmss");

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Vitalita//Donor Portal//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${appointment.id}@vitalita.com`,
      `DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss'Z'")}`,
      `DTSTART:${formatICS(start)}`,
      `DTEND:${formatICS(end)}`,
      `SUMMARY:Blood Donation Appointment - ${appointment.locationName}`,
      `LOCATION:${appointment.address}`,
      'DESCRIPTION:Please arrive 10 minutes early and bring a valid ID.',
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

  const handleCancelAppointment = (appointmentId: string) => {
    setCancelConfirmationId(appointmentId);
  };

  const confirmCancelAppointment = () => {
    if (!profile || !cancelConfirmationId) {
      return;
    }

    const filtered = profile.upcoming.filter(
      (appointment) => appointment.id !== cancelConfirmationId,
    );

    setProfile({ ...profile, upcoming: filtered });
    setCancelConfirmationId(null);
    setActionMessage('Your appointment has been cancelled.');
  };

  const renderLogin = () => (
    <section className="wizard-step appointments-auth">
      <header className="wizard-step-header">
        <h1>Log in to see your appointments</h1>
        <p className="wizard-step-subtitle">
          Enter your email or phone number and we’ll send you a one-time code.
        </p>
      </header>
      <form
        className="info-form"
        onSubmit={(event) => {
          event.preventDefault();
          loginStage === 'enter' ? handleSendOtp() : handleVerifyOtp();
        }}
      >
        {loginStage === 'enter' && (
          <>
            <div className="form-field">
              <label htmlFor="authEmail">Email</label>
              <input
                id="authEmail"
                type="email"
                placeholder="e.g. giulia.rossi@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="form-field">
              <label htmlFor="authPhone">Phone number</label>
              <input
                id="authPhone"
                type="tel"
                placeholder="e.g. 333 555 1212"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                autoComplete="tel"
              />
              <small className="field-hint">
                Use the mobile number you shared with us when booking.
              </small>
            </div>
            <button type="submit" className="button primary">
              Send me a code
            </button>
          </>
        )}

        {loginStage === 'verify' && (
          <>
            <div className="form-field">
              <label htmlFor="otpCode">Enter the code sent to you</label>
              <input
                id="otpCode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Six-digit code"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
              />
              <small className="field-hint">
                Didn’t get it?{' '}
                <button
                  type="button"
                  className="text-button"
                  onClick={() => {
                    setOtpSent(false);
                    setLoginStage('enter');
                    setOtp('');
                  }}
                >
                  Try again
                </button>
              </small>
            </div>
            <button type="submit" className="button primary">
              Verify and continue
            </button>
          </>
        )}

        {loginError && (
          <div className="inline-alert warning">
            <p>{loginError}</p>
          </div>
        )}

        {otpSent && loginStage === 'verify' && !loginError && (
          <div className="inline-notice">
            <p>
              We sent a one-time code to {profile?.email || 'your contact details'}.
              Enter it above to continue.
            </p>
          </div>
        )}
      </form>
    </section>
  );

  const renderUpcomingCards = () => {
    if (!profile) {
      return null;
    }

    if (formattedUpcoming.length === 0) {
      return (
        <article className="appointments-empty">
          <h2>You don’t have any upcoming appointments</h2>
          <p>Book your next visit in just a few taps.</p>
          <button
            type="button"
            className="button primary"
            onClick={() => navigate('/book')}
          >
            Book Now
          </button>
        </article>
      );
    }

    return (
      <div className="appointments-list">
        {formattedUpcoming.map((appointment) => {
          const appointmentDate = new Date(`${appointment.isoDate}T${appointment.time}`);
          const formattedDate = format(appointmentDate, 'EEEE d MMMM');
          const isActive = nextAppointment?.id === appointment.id;

          return (
            <article
              key={appointment.id}
              className={`appointment-card ${isActive ? 'next' : ''}`}
            >
              <div className="appointment-card-header">
                <div>
                  <p className="appointment-date">{formattedDate}</p>
                  <p className="appointment-time">{appointment.time}</p>
                </div>
                <span className="appointment-countdown">
                  {renderCountdown(appointment)}
                </span>
              </div>
              <p className="appointment-location">
                {appointment.locationName}
                <br />
                {appointment.address}
              </p>
              <div className="appointment-map">
                <MapContainer
                  center={[appointment.lat, appointment.lng]}
                  zoom={13}
                  scrollWheelZoom={false}
                  dragging={false}
                  doubleClickZoom={false}
                  style={{ height: '180px', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[appointment.lat, appointment.lng]} />
                </MapContainer>
              </div>
              <div className="appointment-actions">
                <a
                  className="button secondary"
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    appointment.address,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Get Directions
                </a>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => handleAddToCalendar(appointment)}
                >
                  Add to Calendar
                </button>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => navigate('/book')}
                >
                  Change Appointment
                </button>
                <button
                  type="button"
                  className="button secondary danger"
                  onClick={() => handleCancelAppointment(appointment.id)}
                >
                  Cancel
                </button>
              </div>
              {cancelConfirmationId === appointment.id && (
                <div className="inline-alert warning">
                  <p>
                    Are you sure you want to cancel this appointment? Availability can
                    fill up quickly.
                  </p>
                  <div className="confirmation-buttons">
                    <button
                      type="button"
                      className="button primary"
                      onClick={confirmCancelAppointment}
                    >
                      Yes, cancel it
                    </button>
                    <button
                      type="button"
                      className="button secondary"
                      onClick={() => setCancelConfirmationId(null)}
                    >
                      Keep it
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    );
  };

  const renderDonationHistory = () => {
    if (!profile) {
      return null;
    }

    if (formattedHistory.length === 0) {
      return (
        <div className="history-empty">
          <h3>You haven’t donated with us yet</h3>
          <p>We can’t wait to welcome you for your first donation!</p>
        </div>
      );
    }

    return (
      <ol className="donation-timeline">
        {formattedHistory.map((record) => {
          const recordDate = new Date(record.isoDate);
          return (
            <li key={record.id} className="donation-timeline-item">
              <div className="timeline-marker" />
              <div className="timeline-card">
                <p className="timeline-date">{format(recordDate, 'EEEE d MMMM')}</p>
                <p className="timeline-location">{record.locationName}</p>
                <p className="timeline-message">Thank you for donating!</p>
              </div>
            </li>
          );
        })}
      </ol>
    );
  };

  const renderAuthedContent = () => {
    if (!profile) {
      return null;
    }

    const lastDonation = formattedHistory[0];
    const eligibleDate = lastDonation
      ? addWeeks(new Date(lastDonation.isoDate), 8)
      : null;
    const canDonateAgain =
      eligibleDate && !isBefore(eligibleDate, new Date()) ? eligibleDate : null;

    return (
      <>
        <section className="wizard-step appointments-welcome">
          <header className="wizard-step-header">
            <h1>Welcome back, {profile.name}!</h1>
            <p className="wizard-step-subtitle">
              Here’s a quick look at your donations and what’s coming up next.
            </p>
          </header>
          {actionMessage && (
            <div className="inline-notice">
              <p>{actionMessage}</p>
            </div>
          )}
        </section>

        <section className="wizard-step appointments-upcoming">
          <header className="wizard-step-header">
            <h2>Upcoming appointments</h2>
            <p className="wizard-step-subtitle">
              Need to make a change? You can manage everything here.
            </p>
          </header>
          {renderUpcomingCards()}
        </section>

        <section className="wizard-step appointments-history">
          <header className="wizard-step-header">
            <h2>Donation history</h2>
            <p className="wizard-step-subtitle">
              You’ve helped save up to {impactLivesSaved} lives. Thank you!
            </p>
          </header>
          {renderDonationHistory()}
          {nextEligibleDate && (
            <div className="eligibility-reminder">
              <strong>Eligibility reminder:</strong> You can donate again after{' '}
              {nextEligibleDate}.
            </div>
          )}
        </section>

        <section className="wizard-step appointments-cta">
          <div className="cta-actions">
            <button
              type="button"
              className="button primary"
              onClick={() => navigate('/book')}
            >
              Ready to donate again?
            </button>
            <a className="text-link" href="/profile">
              Need to update your information?
            </a>
          </div>
        </section>
      </>
    );
  };

  return (
    <div className="booking-flow appointments-page">
      <div className="wizard-main">
        {requireAuth(() => renderAuthedContent())}
      </div>
    </div>
  );
};

export default MyAppointments;



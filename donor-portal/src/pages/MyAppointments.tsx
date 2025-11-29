import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { addWeeks, differenceInCalendarDays, format, isBefore } from 'date-fns';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import { ensureLeafletIcon } from '../utils/mapDefaults';
import { supabase } from '../lib/supabase';
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
  const { t } = useTranslation();
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
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  // Check authentication on mount and fetch appointments
  useEffect(() => {
    const donorHashId = sessionStorage.getItem('donor_hash_id');
    if (donorHashId) {
      setIsAuthenticated(true);
      // Load profile data if needed
      const donorEmail = sessionStorage.getItem('donor_email');
      const donorId = sessionStorage.getItem('donor_id');
      
      // Fetch appointments from database
      const fetchAppointments = async () => {
        try {
          setLoadingAppointments(true);
          
          // Fetch upcoming appointments (future dates, excluding cancelled)
          const { data: upcomingData, error: upcomingError } = await supabase
            .from('appointments')
            .select(`
              appointment_id,
              appointment_datetime,
              donation_type,
              status,
              donation_centers!donation_center_id (
                name,
                address,
                city,
                center_id
              )
            `)
            .eq('donor_hash_id', donorHashId)
            .gte('appointment_datetime', new Date().toISOString())
            .not('status', 'eq', 'CANCELLED')
            .not('status', 'eq', 'cancelled')
            .order('appointment_datetime', { ascending: true });

          if (upcomingError) {
            console.error('Error fetching upcoming appointments:', upcomingError);
          }

          // Fetch donation history (completed donations)
          const { data: historyData, error: historyError } = await supabase
            .from('donation_history')
            .select(`
              history_id,
              donation_date,
              donation_type,
              donation_centers!donation_center_id (
                name
              )
            `)
            .eq('donor_hash_id', donorHashId)
            .order('donation_date', { ascending: false })
            .limit(20);

          if (historyError) {
            console.error('Error fetching donation history:', historyError);
          }

          // Transform upcoming appointments to match the interface
          const upcoming: Appointment[] = (upcomingData || []).map((apt: any) => {
            const appointmentDate = new Date(apt.appointment_datetime);
            const center = Array.isArray(apt.donation_centers) 
              ? apt.donation_centers[0] 
              : apt.donation_centers;

            return {
              id: apt.appointment_id,
              isoDate: format(appointmentDate, 'yyyy-MM-dd'),
              time: format(appointmentDate, 'HH:mm'),
              locationName: center?.name || t('myAppointments.unknownCenter'),
              address: center?.address || '',
              lat: center?.latitude || 45.4642, // Default to Milan if not set
              lng: center?.longitude || 9.1900, // Default to Milan if not set
            };
          });

          // Transform donation history to match the interface
          const history: DonationRecord[] = (historyData || []).map((record: any) => {
            const center = Array.isArray(record.donation_centers)
              ? record.donation_centers[0]
              : record.donation_centers;

            return {
              id: record.history_id,
              isoDate: format(new Date(record.donation_date), 'yyyy-MM-dd'),
              locationName: center?.name || t('myAppointments.unknownCenter'),
            };
          });

          // Set profile with fetched data
          setProfile({
            id: donorHashId,
            name: donorId || t('myAppointments.defaultDonorName'),
            email: donorEmail || '',
            phone: '',
            upcoming,
            history,
          });
        } catch (error) {
          console.error('Error fetching appointments:', error);
          // Set profile with empty arrays on error
          setProfile({
            id: donorHashId,
            name: donorId || t('myAppointments.defaultDonorName'),
            email: donorEmail || '',
            phone: '',
            upcoming: [],
            history: [],
          });
        } finally {
          setLoadingAppointments(false);
        }
      };

      if (donorEmail || donorId) {
        fetchAppointments();
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
      setLoginError(t('myAppointments.login.accountNotFound'));
      return;
    }

    setProfile(matchedProfile);
    setLoginError(null);
    setOtpSent(true);
    setLoginStage('verify');
  };

  const handleVerifyOtp = () => {
    if (otp !== MOCK_OTP) {
      setLoginError(t('myAppointments.login.incorrectCode'));
      return;
    }

    setLoginError(null);
    setActionMessage(t('myAppointments.login.signedIn'));
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
      return t('myAppointments.upcoming.countdown.passed');
    }
    if (days === 0) {
      return t('myAppointments.upcoming.countdown.today');
    }
    if (days === 1) {
      return t('myAppointments.upcoming.countdown.oneDay');
    }
    return t('myAppointments.upcoming.countdown.days', { days });
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
      `SUMMARY:${t('myAppointments.calendar.summary', { location: appointment.locationName })}`,
      `LOCATION:${appointment.address}`,
      `DESCRIPTION:${t('myAppointments.calendar.description')}`,
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

  const confirmCancelAppointment = async () => {
    if (!profile || !cancelConfirmationId) {
      return;
    }

    try {
      // Update appointment status in database
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ status: 'CANCELLED' })
        .eq('appointment_id', cancelConfirmationId)
        .eq('donor_hash_id', profile.id);

      if (updateError) {
        console.error('Error cancelling appointment:', updateError);
        setActionMessage(t('myAppointments.upcoming.cancelError'));
        setCancelConfirmationId(null);
        return;
      }

      // Remove from local state
      const filtered = profile.upcoming.filter(
        (appointment) => appointment.id !== cancelConfirmationId,
      );

      setProfile({ ...profile, upcoming: filtered });
      setCancelConfirmationId(null);
      setActionMessage(t('myAppointments.upcoming.cancelSuccess'));
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      setActionMessage(t('myAppointments.upcoming.cancelError'));
      setCancelConfirmationId(null);
    }
  };

  const renderLogin = () => (
    <section className="wizard-step appointments-auth">
      <header className="wizard-step-header">
        <h1>{t('myAppointments.login.title')}</h1>
        <p className="wizard-step-subtitle">
          {t('myAppointments.login.subtitle')}
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
              <label htmlFor="authEmail">{t('myAppointments.login.email')}</label>
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
              <label htmlFor="authPhone">{t('myAppointments.login.phoneNumber')}</label>
              <input
                id="authPhone"
                type="tel"
                placeholder="e.g. 333 555 1212"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                autoComplete="tel"
              />
              <small className="field-hint">
                {t('myAppointments.login.phoneHint')}
              </small>
            </div>
            <button type="submit" className="button primary">
              {t('myAppointments.login.sendCode')}
            </button>
          </>
        )}

        {loginStage === 'verify' && (
          <>
            <div className="form-field">
              <label htmlFor="otpCode">{t('myAppointments.login.enterCode')}</label>
              <input
                id="otpCode"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder={t('myAppointments.login.codePlaceholder')}
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
              />
              <small className="field-hint">
                {t('myAppointments.login.didntGetIt')}{' '}
                <button
                  type="button"
                  className="text-button"
                  onClick={() => {
                    setOtpSent(false);
                    setLoginStage('enter');
                    setOtp('');
                  }}
                >
                  {t('myAppointments.login.tryAgain')}
                </button>
              </small>
            </div>
            <button type="submit" className="button primary">
              {t('myAppointments.login.verifyAndContinue')}
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
              {profile?.email
                ? t('myAppointments.login.codeSent', { email: profile.email })
                : t('myAppointments.login.codeSentGeneric')}
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
          <h2>{t('myAppointments.upcoming.empty.title')}</h2>
          <p>{t('myAppointments.upcoming.empty.description')}</p>
          <button
            type="button"
            className="button primary"
            onClick={() => navigate('/book')}
          >
            {t('myAppointments.upcoming.empty.bookNow')}
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
              <div className="appointment-map" style={{ width: '100%', overflow: 'hidden', borderRadius: '0.5rem' }}>
                <MapContainer
                  center={[appointment.lat, appointment.lng]}
                  zoom={13}
                  scrollWheelZoom={false}
                  dragging={false}
                  doubleClickZoom={false}
                  style={{ height: '180px', width: '100%', minHeight: '150px' }}
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
                  {t('myAppointments.upcoming.actions.getDirections')}
                </a>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => handleAddToCalendar(appointment)}
                >
                  {t('myAppointments.upcoming.actions.addToCalendar')}
                </button>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => navigate('/book')}
                >
                  {t('myAppointments.upcoming.actions.changeAppointment')}
                </button>
                <button
                  type="button"
                  className="button secondary danger"
                  onClick={() => handleCancelAppointment(appointment.id)}
                >
                  {t('myAppointments.upcoming.actions.cancel')}
                </button>
              </div>
              {cancelConfirmationId === appointment.id && (
                <div className="inline-alert warning">
                  <p>
                    {t('myAppointments.upcoming.cancelConfirmation.message')}
                  </p>
                  <div className="confirmation-buttons">
                    <button
                      type="button"
                      className="button primary"
                      onClick={confirmCancelAppointment}
                    >
                      {t('myAppointments.upcoming.cancelConfirmation.yesCancel')}
                    </button>
                    <button
                      type="button"
                      className="button secondary"
                      onClick={() => setCancelConfirmationId(null)}
                    >
                      {t('myAppointments.upcoming.cancelConfirmation.keepIt')}
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
          <h3>{t('myAppointments.history.empty.title')}</h3>
          <p>{t('myAppointments.history.empty.description')}</p>
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
                <p className="timeline-message">{t('myAppointments.history.thankYou')}</p>
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

    if (loadingAppointments) {
      return (
        <section className="wizard-step appointments-welcome">
          <header className="wizard-step-header">
            <h1>{t('myAppointments.loading.title')}</h1>
            <p className="wizard-step-subtitle">{t('myAppointments.loading.subtitle')}</p>
          </header>
        </section>
      );
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
            <h1>{t('myAppointments.welcome.title', { name: profile.name })}</h1>
            <p className="wizard-step-subtitle">
              {t('myAppointments.welcome.subtitle')}
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
            <h2>{t('myAppointments.upcoming.title')}</h2>
            <p className="wizard-step-subtitle">
              {t('myAppointments.upcoming.subtitle')}
            </p>
          </header>
          {renderUpcomingCards()}
        </section>

        <section className="wizard-step appointments-history">
          <header className="wizard-step-header">
            <h2>{t('myAppointments.history.title')}</h2>
            <p className="wizard-step-subtitle">
              {t('myAppointments.history.subtitle', { count: impactLivesSaved })}
            </p>
          </header>
          {renderDonationHistory()}
          {nextEligibleDate && (
            <div className="eligibility-reminder">
              <strong>{t('myAppointments.history.eligibilityReminder')}</strong>{' '}
              {t('myAppointments.history.canDonateAgain', { date: nextEligibleDate })}
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
              {t('myAppointments.cta.readyToDonate')}
            </button>
            <a className="text-link" href="/profile">
              {t('myAppointments.cta.updateInformation')}
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



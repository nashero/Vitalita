import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { addWeeks, differenceInCalendarDays, format } from 'date-fns';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import {
  Heart,
  Clock,
  Calendar,
  MapPin,
  Navigation,
  CalendarPlus,
  Edit,
  X,
} from 'lucide-react';
import { ensureLeafletIcon } from '../utils/mapDefaults';
import { supabase } from '../lib/supabase';
import 'leaflet/dist/leaflet.css';

ensureLeafletIcon();

// Create Mediterranean Blue marker icon
const createMediterraneanBlueIcon = () => {
  return L.divIcon({
    className: 'custom-marker-appointment',
    html: `<div style="
      width: 24px;
      height: 24px;
      background-color: #5B9BD5;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(91, 155, 213, 0.5);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

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

const MyAppointments = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<DonorProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!sessionStorage.getItem('donor_hash_id');
  });
  const [cancelConfirmationId, setCancelConfirmationId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [loadingAppointments, setLoadingAppointments] = useState(true);

  // Check authentication on mount and fetch appointments
  useEffect(() => {
    const donorHashId = sessionStorage.getItem('donor_hash_id');
    if (donorHashId) {
      setIsAuthenticated(true);
      const donorEmail = sessionStorage.getItem('donor_email');
      const donorId = sessionStorage.getItem('donor_id');
      
      const fetchAppointments = async () => {
        let hasSuccessfullyLoadedData = false;
        try {
          setLoadingAppointments(true);
          
          // Fetch upcoming appointments with center join
          let upcomingData: any[] = [];
          let upcomingError: any = null;

          // Fetch donor's default center name as fallback
          let donorDefaultCenterName: string | null = null;
          const { data: donorData } = await supabase
            .from('donors')
            .select('avis_donor_center')
            .eq('donor_hash_id', donorHashId)
            .single();
          
          if (donorData?.avis_donor_center) {
            donorDefaultCenterName = donorData.avis_donor_center;
          }

          // Try with the join using the foreign key relationship
          const { data: joinedData, error: joinError } = await supabase
            .from('appointments')
            .select(`
              appointment_id,
              appointment_datetime,
              donation_type,
              status,
              donation_center_id,
              donation_centers(
                name,
                address,
                city,
                center_id,
                latitude,
                longitude
              )
            `)
            .eq('donor_hash_id', donorHashId)
            .order('appointment_datetime', { ascending: true });

          if (joinError) {
            console.error('Error with join query, trying without join:', joinError);
            
            // Fallback: fetch appointments without join
            const { data: simpleData, error: simpleError } = await supabase
              .from('appointments')
              .select('appointment_id, appointment_datetime, donation_type, status, donation_center_id')
              .eq('donor_hash_id', donorHashId)
              .order('appointment_datetime', { ascending: true });

            if (simpleError) {
              console.error('Error fetching appointments (simple query):', simpleError);
              upcomingError = simpleError;
            } else {
              upcomingData = simpleData || [];
              
              // Fetch center data separately for each appointment
              const centerIds = [...new Set(upcomingData.map(apt => apt.donation_center_id).filter(Boolean))];
              if (centerIds.length > 0) {
                const { data: centersData, error: centersError } = await supabase
                  .from('donation_centers')
                  .select('center_id, name, address, city, latitude, longitude')
                  .in('center_id', centerIds);

                if (centersError) {
                  console.error('Error fetching centers:', centersError);
                } else {
                  // Map centers to appointments
                  const centersMap = new Map((centersData || []).map(c => [c.center_id, c]));
                  upcomingData = upcomingData.map(apt => ({
                    ...apt,
                    donation_centers: centersMap.get(apt.donation_center_id) || null
                  }));
                }
              }
            }
          } else {
            upcomingData = joinedData || [];
            console.log('Fetched appointments with join:', upcomingData);
          }

          // Only set error message if we actually failed to get any data
          if (upcomingError && (!upcomingData || upcomingData.length === 0)) {
            console.error('Failed to fetch appointments:', upcomingError);
            setActionMessage(`Failed to load appointments: ${upcomingError.message || 'Unknown error'}. Please refresh the page.`);
            upcomingData = [];
          } else if (upcomingData && upcomingData.length > 0) {
            // Clear any previous error messages if we successfully loaded data
            setActionMessage(null);
          }

          // Filter client-side: future appointments that are not cancelled
          const now = new Date();
          let filteredUpcoming = (upcomingData || []).filter((apt: any) => {
            const appointmentDate = new Date(apt.appointment_datetime);
            const status = apt.status?.toUpperCase();
            const isCancelled = status === 'CANCELLED' || status === 'CANCELED';
            const isFuture = appointmentDate >= now;
            return isFuture && !isCancelled;
          });

          console.log('Filtered upcoming appointments:', filteredUpcoming);
          console.log('Total fetched:', upcomingData?.length || 0, 'After filtering:', filteredUpcoming.length);

          // Fetch donation history
          const { data: historyData, error: historyError } = await supabase
            .from('donation_history')
            .select(`
              history_id,
              donation_date,
              donation_type,
              donation_centers(
                name
              )
            `)
            .eq('donor_hash_id', donorHashId)
            .order('donation_date', { ascending: false })
            .limit(20);

          if (historyError) {
            console.error('Error fetching donation history:', historyError);
          }

          // Check if any appointments are missing center data and fetch them individually
          const appointmentsMissingCenters = filteredUpcoming.filter((apt: any) => {
            if (!apt.donation_centers && apt.donation_center_id) {
              return true;
            }
            if (apt.donation_centers) {
              const center = Array.isArray(apt.donation_centers) 
                ? apt.donation_centers[0] 
                : apt.donation_centers;
              return !center || !center.name;
            }
            return false;
          });

          // Fetch missing centers individually
          if (appointmentsMissingCenters.length > 0) {
            const missingCenterIds = [...new Set(
              appointmentsMissingCenters
                .map((apt: any) => apt.donation_center_id)
                .filter(Boolean)
            )];
            
            if (missingCenterIds.length > 0) {
              const { data: missingCentersData } = await supabase
                .from('donation_centers')
                .select('center_id, name, address, city, latitude, longitude')
                .in('center_id', missingCenterIds);

              const missingCentersMap = new Map(
                (missingCentersData || []).map(c => [c.center_id, c])
              );

              // Update appointments with missing center data
              filteredUpcoming = filteredUpcoming.map((apt: any) => {
                if (!apt.donation_centers && apt.donation_center_id) {
                  const center = missingCentersMap.get(apt.donation_center_id);
                  if (center) {
                    return { ...apt, donation_centers: center };
                  }
                }
                return apt;
              });
            }
          }

          // Transform upcoming appointments
          const upcoming: Appointment[] = filteredUpcoming.map((apt: any) => {
            const appointmentDate = new Date(apt.appointment_datetime);
            
            // Handle donation_centers data structure - could be object, array, or null
            // When using join, it returns as an object
            // When fetched separately, it's already an object
            let center = null;
            if (apt.donation_centers) {
              if (Array.isArray(apt.donation_centers)) {
                center = apt.donation_centers[0] || null;
              } else if (typeof apt.donation_centers === 'object') {
                center = apt.donation_centers;
              }
            }

            // Use center name, or fallback to donor's default center, or "Unknown Center"
            const locationName = center?.name || donorDefaultCenterName || 'Unknown Center';

            console.log('Processing appointment:', apt.appointment_id, {
              hasCenter: !!center,
              centerName: center?.name,
              defaultCenterName: donorDefaultCenterName,
              finalLocationName: locationName,
              appointmentDate: apt.appointment_datetime
            });

            return {
              id: apt.appointment_id,
              isoDate: format(appointmentDate, 'yyyy-MM-dd'),
              time: format(appointmentDate, 'HH:mm'),
              locationName: locationName,
              address: center?.address || center?.city || '',
              lat: center?.latitude || 45.4642,
              lng: center?.longitude || 9.1900,
            };
          });

          // Transform donation history
          const history: DonationRecord[] = (historyData || []).map((record: any) => {
            const center = Array.isArray(record.donation_centers)
              ? record.donation_centers[0]
              : record.donation_centers;

            // Use center name, or fallback to donor's default center, or "Unknown Center"
            const locationName = center?.name || donorDefaultCenterName || 'Unknown Center';

            return {
              id: record.history_id,
              isoDate: format(new Date(record.donation_date), 'yyyy-MM-dd'),
              locationName: locationName,
            };
          });

          const profileData = {
            id: donorHashId,
            name: donorId || 'Donor',
            email: donorEmail || '',
            phone: '',
            upcoming,
            history,
          };

          console.log('Setting profile with appointments:', {
            upcomingCount: upcoming.length,
            historyCount: history.length,
            upcoming: upcoming,
          });

          setProfile(profileData);
          hasSuccessfullyLoadedData = true;
          
          // Clear any error messages if we successfully loaded appointments
          setActionMessage(null);
        } catch (error) {
          console.error('Error fetching appointments:', error);
          // Only set error message if we didn't successfully load any data
          if (!hasSuccessfullyLoadedData) {
            setActionMessage('Failed to load appointments. Please refresh the page.');
            setProfile({
              id: donorHashId,
              name: donorId || 'Donor',
              email: donorEmail || '',
              phone: '',
              upcoming: [],
              history: [],
            });
          } else {
            // If we successfully loaded data before the error, just clear error message
            setActionMessage(null);
          }
        } finally {
          setLoadingAppointments(false);
        }
      };

      // Always fetch appointments if we have donorHashId
      if (donorHashId) {
        fetchAppointments();
      } else {
        console.error('No donor_hash_id found in sessionStorage');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const formattedUpcoming = useMemo(() => {
    if (!profile) return [];
    return [...profile.upcoming].sort((a, b) => a.isoDate.localeCompare(b.isoDate));
  }, [profile]);

  const formattedHistory = useMemo(() => {
    if (!profile) return [];
    return [...profile.history].sort((a, b) => b.isoDate.localeCompare(a.isoDate));
  }, [profile]);

  const impactLivesSaved = useMemo(() => {
    if (!profile) return 0;
    return Math.min(profile.history.length * 3, 9);
  }, [profile]);

  const donationsThisYear = useMemo(() => {
    if (!profile) return 0;
    const currentYear = new Date().getFullYear();
    return profile.history.filter(record => {
      const recordYear = new Date(record.isoDate).getFullYear();
      return recordYear === currentYear;
    }).length;
  }, [profile]);

  const nextEligibleDate = useMemo(() => {
    if (!profile || formattedHistory.length === 0) return null;
    const lastDonation = formattedHistory[0];
    const eligible = addWeeks(new Date(lastDonation.isoDate), 8);
    return format(eligible, 'MMMM d');
  }, [formattedHistory, profile]);

  const renderCountdown = (appointment: Appointment) => {
    const appointmentDate = new Date(`${appointment.isoDate}T${appointment.time}`);
    const today = new Date();
    const days = differenceInCalendarDays(appointmentDate, today);

    if (days < 0) return 'Past';
    if (days === 0) return 'Today';
    if (days === 1) return 'Your appointment is in 1 day';
    return `Your appointment is in ${days} days`;
  };

  const getUrgencyColor = (appointment: Appointment) => {
    const appointmentDate = new Date(`${appointment.isoDate}T${appointment.time}`);
    const today = new Date();
    const days = differenceInCalendarDays(appointmentDate, today);

    if (days < 3) return 'text-burnt-orange';
    if (days < 7) return 'text-burnt-orange';
    return 'text-terracotta';
  };

  const shouldPulse = (appointment: Appointment) => {
    const appointmentDate = new Date(`${appointment.isoDate}T${appointment.time}`);
    const today = new Date();
    const days = differenceInCalendarDays(appointmentDate, today);
    return days < 3;
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
      'DESCRIPTION:Your blood donation appointment with Vitalita',
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
    if (!profile || !cancelConfirmationId) return;

    try {
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ status: 'CANCELLED' })
        .eq('appointment_id', cancelConfirmationId)
        .eq('donor_hash_id', profile.id);

      if (updateError) {
        console.error('Error cancelling appointment:', updateError);
        setActionMessage('Failed to cancel appointment. Please try again.');
        setCancelConfirmationId(null);
        return;
      }

      const filtered = profile.upcoming.filter(
        (appointment) => appointment.id !== cancelConfirmationId,
      );

      setProfile({ ...profile, upcoming: filtered });
      setCancelConfirmationId(null);
      setActionMessage('Appointment cancelled successfully.');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      setActionMessage('Failed to cancel appointment. Please try again.');
      setCancelConfirmationId(null);
    }
  };

  const requireAuth = () => {
    const donorHashId = sessionStorage.getItem('donor_hash_id');
    if (!donorHashId || !isAuthenticated) {
      navigate('/login');
      return false;
    }
    return true;
  };

  if (!requireAuth()) {
    return null;
  }

  if (loadingAppointments || !profile) {
    return (
      <div className="min-h-screen bg-cream pt-24 pb-12">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-xl text-espresso">Loading your appointments...</p>
          </div>
        </div>
      </div>
    );
  }

  const donorId = sessionStorage.getItem('donor_id') || profile.name;

  return (
    <div className="min-h-screen bg-cream pt-24 pb-12">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
        {/* Header Section */}
        <div className="bg-white rounded-[12px] shadow-sm p-8 mb-8">
          <h1 className="text-[32px] font-bold text-espresso mb-2">
            Welcome back, {donorId}! 👋
          </h1>
          <p className="text-base text-taupe">
            Here's a quick look at your donations and what's coming up next.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-8">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Impact Summary Section */}
            <div className="bg-cream rounded-[12px] p-6 border-l-4 border-terracotta">
              <div className="flex items-start gap-4">
                <Heart className="w-12 h-12 text-terracotta flex-shrink-0" />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-espresso mb-2">
                    You've helped save up to {impactLivesSaved} lives
                  </h2>
                  <p className="text-base text-taupe mb-4">
                    Thank you for being a hero in your community
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-olive-green/20 text-olive-green text-sm font-medium">
                      {donationsThisYear} donations this year
                    </span>
                    {nextEligibleDate && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-mediterranean-blue/20 text-mediterranean-blue text-sm font-medium">
                        Next eligible: {nextEligibleDate}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Appointments Section */}
            <div>
              <h2 className="text-2xl font-bold text-espresso mb-2">
                Upcoming appointments
              </h2>
              <p className="text-sm text-taupe mb-6">
                Need to make a change? You can manage everything here.
              </p>

              {formattedUpcoming.length === 0 ? (
                <div className="bg-white rounded-[12px] p-8 text-center">
                  <p className="text-lg text-espresso mb-4">No upcoming appointments</p>
                  <button
                    onClick={() => navigate('/book')}
                    className="px-6 py-3 bg-terracotta text-white rounded-lg font-medium hover:bg-[#C5694A] transition-colors"
                  >
                    Book an Appointment
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {formattedUpcoming.map((appointment) => {
                    const appointmentDate = new Date(`${appointment.isoDate}T${appointment.time}`);
                    const formattedDate = format(appointmentDate, 'EEEE d MMMM');
                    const countdown = renderCountdown(appointment);
                    const urgencyColor = getUrgencyColor(appointment);
                    const pulse = shouldPulse(appointment);

                    return (
                      <div
                        key={appointment.id}
                        className="bg-white rounded-[12px] shadow-sm p-6 border-l-4 border-terracotta hover:shadow-md transition-shadow"
                      >
                        {/* Card Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                          <div>
                            <p className="text-xl font-bold text-espresso mb-1">
                              {formattedDate}
                            </p>
                            <div className="flex items-center gap-2 text-taupe">
                              <Clock className="w-4 h-4 text-mediterranean-blue" />
                              <span className="text-base">{appointment.time}</span>
                            </div>
                          </div>
                          <div
                            className={`flex items-center gap-2 ${urgencyColor} ${
                              pulse ? 'animate-pulse' : ''
                            }`}
                          >
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm font-medium">{countdown}</span>
                          </div>
                        </div>

                        {/* Location Info */}
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="w-4 h-4 text-mediterranean-blue" />
                            <p className="text-base font-bold text-espresso">
                              {appointment.locationName}
                            </p>
                          </div>
                          <p className="text-sm text-taupe ml-6">{appointment.address}</p>
                        </div>

                        {/* Map and Actions Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {/* Map */}
                          <div className="rounded-lg overflow-hidden h-[150px] md:h-[150px] md:w-[200px]">
                            <MapContainer
                              center={[appointment.lat, appointment.lng]}
                              zoom={13}
                              scrollWheelZoom={false}
                              dragging={false}
                              doubleClickZoom={false}
                              style={{ height: '100%', width: '100%' }}
                            >
                              <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              />
                              <Marker 
                                position={[appointment.lat, appointment.lng]} 
                                icon={createMediterraneanBlueIcon()}
                              />
                            </MapContainer>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-3">
                            {/* Row 1 */}
                            <div className="grid grid-cols-2 gap-3">
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                                  appointment.address,
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="h-10 px-4 rounded-lg border-2 border-mediterranean-blue text-mediterranean-blue font-medium text-sm flex items-center justify-center gap-2 hover:bg-mediterranean-blue hover:text-white transition-all duration-200"
                              >
                                <Navigation className="w-4 h-4" />
                                Get Directions
                              </a>
                              <button
                                onClick={() => handleAddToCalendar(appointment)}
                                className="h-10 px-4 rounded-lg border-2 border-olive-green text-olive-green font-medium text-sm flex items-center justify-center gap-2 hover:bg-olive-green hover:text-white transition-all duration-200"
                              >
                                <CalendarPlus className="w-4 h-4" />
                                Add to Calendar
                              </button>
                            </div>

                            {/* Row 2 */}
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                onClick={() => navigate('/book')}
                                className="h-10 px-4 rounded-lg border-2 border-terracotta text-terracotta font-medium text-sm flex items-center justify-center gap-2 hover:bg-terracotta hover:text-white transition-all duration-200"
                              >
                                <Edit className="w-4 h-4" />
                                Change Appointment
                              </button>
                              <button
                                onClick={() => handleCancelAppointment(appointment.id)}
                                className="h-10 px-4 rounded-lg bg-cream text-taupe font-medium text-sm flex items-center justify-center gap-2 hover:border-2 hover:border-burnt-orange transition-all duration-200"
                              >
                                <X className="w-4 h-4" />
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* View Larger Map Link */}
                        <a
                          href={`https://www.google.com/maps?q=${appointment.lat},${appointment.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-mediterranean-blue hover:underline inline-block"
                        >
                          View larger map
                        </a>

                        {/* Cancel Confirmation */}
                        {cancelConfirmationId === appointment.id && (
                          <div className="mt-4 p-4 bg-cream rounded-lg border border-taupe/20">
                            <p className="text-sm text-espresso mb-3">
                              Are you sure you want to cancel this appointment?
                            </p>
                            <div className="flex gap-3">
                              <button
                                onClick={confirmCancelAppointment}
                                className="px-4 py-2 bg-terracotta text-white rounded-lg text-sm font-medium hover:bg-[#C5694A] transition-colors"
                              >
                                Yes, Cancel
                              </button>
                              <button
                                onClick={() => setCancelConfirmationId(null)}
                                className="px-4 py-2 bg-white border-2 border-taupe text-taupe rounded-lg text-sm font-medium hover:bg-cream transition-colors"
                              >
                                Keep It
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Donation History Section */}
            <div>
              <h2 className="text-2xl font-bold text-espresso mb-2">
                Donation History
              </h2>
              {formattedHistory.length === 0 ? (
                <div className="bg-white rounded-[12px] p-8 text-center">
                  <p className="text-base text-taupe">
                    You haven't made any donations yet. Book your first appointment to get started!
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-[12px] shadow-sm p-6">
                  <div className="space-y-4">
                    {formattedHistory.map((record) => {
                      const recordDate = new Date(record.isoDate);
                      return (
                        <div
                          key={record.id}
                          className="pb-4 border-b border-cream last:border-b-0 last:pb-0"
                        >
                          <p className="text-base font-bold text-espresso mb-1">
                            {format(recordDate, 'EEEE d MMMM yyyy')}
                          </p>
                          <p className="text-sm text-taupe">{record.locationName}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats Card */}
            <div className="bg-white rounded-[12px] shadow-sm p-6">
              <h3 className="text-lg font-bold text-espresso mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-taupe mb-1">Total Donations</p>
                  <p className="text-2xl font-bold text-terracotta">
                    {profile.history.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-taupe mb-1">This Year</p>
                  <p className="text-2xl font-bold text-olive-green">
                    {donationsThisYear}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-taupe mb-1">Lives Saved</p>
                  <p className="text-2xl font-bold text-mediterranean-blue">
                    Up to {impactLivesSaved}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Message */}
            {actionMessage && (
              <div className="bg-mint-green/20 border border-mint-green/40 rounded-lg p-4">
                <p className="text-sm text-espresso">{actionMessage}</p>
              </div>
            )}

            {/* CTA Card */}
            <div className="bg-white rounded-[12px] shadow-sm p-6">
              <h3 className="text-lg font-bold text-espresso mb-3">
                Ready to Donate Again?
              </h3>
              <button
                onClick={() => navigate('/book')}
                className="w-full px-6 py-3 bg-terracotta text-white rounded-lg font-medium hover:bg-[#C5694A] transition-colors"
              >
                Book New Appointment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAppointments;

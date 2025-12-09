import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Calendar,
  History,
  User,
  HelpCircle,
  Droplet,
  Award,
  MapPin,
  Navigation,
  X,
  ChevronRight,
  Menu,
  Users,
} from 'lucide-react';
import { format, differenceInDays, addDays, parseISO } from 'date-fns';

interface Appointment {
  id: string;
  date: string;
  time: string;
  location: string;
  address: string;
  daysUntil: number;
  lat?: number;
  lng?: number;
}

interface DonationRecord {
  id: string;
  date: string;
  location: string;
  type: string;
  bloodType?: string;
  notes?: string;
}

interface DonorStats {
  totalDonations: number;
  currentStreak: number;
  nextEligibleDate: string;
  livesSaved: number;
  progressToNextMilestone: number;
  nextMilestone: number;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

function DonorDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedHistory, setExpandedHistory] = useState<Set<string>>(new Set());
  const [donorName] = useState('Marco'); // In real app, get from auth context

  // Mock data - in real app, fetch from API
  const [stats] = useState<DonorStats>({
    totalDonations: 9,
    currentStreak: 3,
    nextEligibleDate: format(addDays(new Date(), 56), 'yyyy-MM-dd'),
    livesSaved: 9,
    progressToNextMilestone: 90, // 9 out of 10 donations
    nextMilestone: 10,
  });

  const [appointments] = useState<Appointment[]>([
    {
      id: '1',
      date: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
      time: '10:30',
      location: 'Centro Donazioni Duomo',
      address: 'Via Torino 18, Milano',
      daysUntil: 2,
      lat: 45.4627,
      lng: 9.1859,
    },
    {
      id: '2',
      date: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
      time: '14:00',
      location: 'Ospedale San Raffaele',
      address: 'Via Olgettina 60, Milano',
      daysUntil: 30,
      lat: 45.5014,
      lng: 9.2589,
    },
  ]);

  const [donationHistory] = useState<DonationRecord[]>([
    {
      id: '1',
      date: format(addDays(new Date(), -60), 'yyyy-MM-dd'),
      location: 'Centro Donazioni Duomo',
      type: 'Whole Blood',
      bloodType: 'O+',
      notes: 'All health checks passed. Blood pressure: 120/80',
    },
    {
      id: '2',
      date: format(addDays(new Date(), -90), 'yyyy-MM-dd'),
      location: 'Ospedale San Raffaele',
      type: 'Whole Blood',
      bloodType: 'O+',
      notes: 'Excellent donation. Hemoglobin: 14.5 g/dL',
    },
    {
      id: '3',
      date: format(addDays(new Date(), -120), 'yyyy-MM-dd'),
      location: 'Centro Donazioni Duomo',
      type: 'Whole Blood',
      bloodType: 'O+',
    },
  ]);

  const navItems: NavItem[] = [
    { id: 'dashboard', label: t('dashboard.nav.dashboard'), icon: LayoutDashboard, path: '/dashboard' },
    { id: 'schedule', label: t('dashboard.nav.schedule'), icon: Calendar, path: '/book' },
    { id: 'history', label: t('dashboard.nav.history'), icon: History, path: '/appointments' },
    { id: 'profile', label: t('dashboard.nav.profile'), icon: User, path: '/profile' },
    { id: 'help', label: t('dashboard.nav.help'), icon: HelpCircle, path: '/help' },
  ];

  const currentPath = location.pathname;

  useEffect(() => {
    // Close sidebar on mobile when route changes
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location]);

  const toggleHistoryItem = (id: string) => {
    setExpandedHistory((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleGetDirections = (appointment: Appointment) => {
    if (appointment.lat && appointment.lng) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${appointment.lat},${appointment.lng}`,
        '_blank'
      );
    }
  };

  const handleCancelAppointment = (appointmentId: string) => {
    // In real app, call API to cancel
    console.log('Cancel appointment:', appointmentId);
  };

  const handleScheduleNext = () => {
    navigate('/book');
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed left-0 top-0 h-full w-[240px] bg-white border-r border-taupe/20 z-50 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-taupe/20 lg:hidden">
          <h2 className="text-lg font-bold text-espresso">Menu</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 hover:bg-cream rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-espresso" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path || currentPath.startsWith(item.path);
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-cream text-terracotta font-semibold'
                    : 'text-espresso hover:bg-cream/50 hover:text-mediterranean-blue'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-[240px]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8">
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6 text-espresso" />
            </button>
            <h1 className="text-xl font-bold text-espresso">Dashboard</h1>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>

          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-[28px] font-bold text-espresso mb-6">
              Welcome Back, {donorName} 👋
            </h1>

            {/* Impact Statement Card */}
            <div className="bg-white border-l-4 border-l-terracotta rounded-[12px] p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="flex-1">
                <div className="text-[48px] font-bold text-terracotta mb-2">
                  {stats.livesSaved} lives
                </div>
                <p className="text-base text-espresso leading-relaxed mb-6">
                  Your donations have saved {stats.livesSaved} lives so far. You're a hero to three families.
                </p>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-taupe">
                    Progress to {stats.nextMilestone} donations
                  </span>
                  <span className="text-sm font-semibold text-olive-green">
                    {stats.progressToNextMilestone}%
                  </span>
                </div>
                <div className="w-full h-3 bg-taupe/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-olive-green rounded-full transition-all duration-500"
                    style={{ width: `${stats.progressToNextMilestone}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Upcoming Appointments */}
              <section>
                <h2 className="text-xl font-bold text-espresso mb-4">Upcoming Appointments</h2>
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="bg-white border-l-4 border-l-mediterranean-blue border border-taupe rounded-[12px] overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex flex-col md:flex-row p-6">
                        {/* Left Side: Date, Time, Countdown */}
                        <div className="flex-1 mb-4 md:mb-0 md:pr-6">
                          <div className="flex items-start gap-3 mb-3">
                            <Calendar className="w-5 h-5 text-mediterranean-blue flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <div className="text-base font-bold text-espresso mb-1">
                                {format(parseISO(appointment.date), 'EEEE, MMMM d')} at{' '}
                                {appointment.time}
                              </div>
                              <div
                                className={`text-sm font-medium ${
                                  appointment.daysUntil < 7
                                    ? 'text-terracotta'
                                    : 'text-taupe'
                                }`}
                              >
                                in {appointment.daysUntil} day
                                {appointment.daysUntil !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>

                          {/* CTAs */}
                          <div className="flex flex-col sm:flex-row gap-3 mt-4">
                            <button
                              onClick={() => handleGetDirections(appointment)}
                              className="flex-1 border-2 border-mediterranean-blue text-mediterranean-blue hover:bg-mediterranean-blue hover:text-white font-semibold text-sm px-4 py-2 rounded-lg transition-all duration-300"
                            >
                              <Navigation className="w-4 h-4 inline mr-2" />
                              Get Directions
                            </button>
                            <button
                              onClick={() => handleCancelAppointment(appointment.id)}
                              className="flex-1 text-taupe hover:text-espresso font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>

                        {/* Right Side: Location with Map Thumbnail */}
                        <div className="md:w-32 md:flex-shrink-0">
                          <div className="flex flex-col items-start md:items-end gap-2">
                            <div className="text-sm text-espresso font-medium mb-2 md:text-right">
                              <MapPin className="w-4 h-4 inline mr-1" />
                              {appointment.location}
                            </div>
                            <div className="text-xs text-taupe md:text-right mb-2">
                              {appointment.address}
                            </div>
                            {/* Map Thumbnail */}
                            <div className="w-full md:w-24 h-24 bg-taupe/10 rounded-lg flex items-center justify-center border border-taupe/20">
                              <MapPin className="w-8 h-8 text-taupe/40" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Donation History */}
              <section>
                <h2 className="text-xl font-bold text-espresso mb-4">Donation History</h2>
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-taupe" />

                  <div className="space-y-6">
                    {donationHistory.map((record, index) => {
                      const isExpanded = expandedHistory.has(record.id);
                      return (
                        <div key={record.id} className="relative pl-16">
                          {/* Timeline Node */}
                          <div className="absolute left-4 top-2 w-4 h-4 rounded-full bg-olive-green border-4 border-white shadow-md" />

                          {/* Card */}
                          <div
                            className="bg-white border border-taupe rounded-[12px] p-4 hover:shadow-md transition-all duration-300 cursor-pointer"
                            onClick={() => toggleHistoryItem(record.id)}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="font-bold text-espresso mb-1">
                                  {format(parseISO(record.date), 'MMMM d, yyyy')}
                                </div>
                                <div className="text-sm text-taupe mb-2">{record.location}</div>
                                <div className="text-sm font-medium text-mediterranean-blue">
                                  {record.type}
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                  <div className="mt-4 pt-4 border-t border-taupe/20 space-y-2">
                                    {record.bloodType && (
                                      <div className="text-sm">
                                        <span className="font-semibold text-espresso">
                                          Blood Type:
                                        </span>{' '}
                                        <span className="text-taupe">{record.bloodType}</span>
                                      </div>
                                    )}
                                    {record.notes && (
                                      <div className="text-sm text-taupe">{record.notes}</div>
                                    )}
                                  </div>
                                )}
                              </div>
                              <ChevronRight
                                className={`w-5 h-5 text-taupe transition-transform duration-300 ${
                                  isExpanded ? 'rotate-90' : ''
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Lives Saved Summary */}
                <div className="mt-6 p-4 bg-white border border-taupe rounded-[12px] text-center">
                  <p className="text-base text-espresso">
                    <span className="font-bold text-terracotta">
                      You've helped save up to {stats.livesSaved * 3} lives
                    </span>
                  </p>
                </div>
              </section>
            </div>

            {/* Right Sidebar Column */}
            <div className="space-y-6">
              {/* Donation Stats */}
              <section>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                  {/* Total Donations */}
                  <div className="bg-white border-l-4 border-l-terracotta border border-taupe rounded-[12px] p-4 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3 mb-2">
                      <Droplet className="w-6 h-6 text-terracotta" />
                      <h3 className="font-bold text-espresso text-sm">Total Donations</h3>
                    </div>
                    <div className="text-3xl font-bold text-terracotta">
                      {stats.totalDonations}
                    </div>
                  </div>

                  {/* Current Streak */}
                  <div className="bg-white border-l-4 border-l-mediterranean-blue border border-taupe rounded-[12px] p-4 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3 mb-2">
                      <Award className="w-6 h-6 text-mediterranean-blue" />
                      <h3 className="font-bold text-espresso text-sm">Current Streak</h3>
                    </div>
                    <div className="text-3xl font-bold text-mediterranean-blue">
                      {stats.currentStreak}
                    </div>
                    <div className="text-sm text-taupe mt-1">consecutive donations</div>
                  </div>

                  {/* Next Eligible Date */}
                  <div className="bg-white border-l-4 border-l-olive-green border border-taupe rounded-[12px] p-4 hover:shadow-md transition-all duration-300 col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-6 h-6 text-olive-green" />
                      <h3 className="font-bold text-espresso text-sm">Next Eligible</h3>
                    </div>
                    <div className="text-lg font-semibold text-olive-green">
                      {format(parseISO(stats.nextEligibleDate), 'MMM d, yyyy')}
                    </div>
                    <div className="text-sm text-taupe mt-1">
                      {differenceInDays(parseISO(stats.nextEligibleDate), new Date())} days from
                      now
                    </div>
                  </div>
                </div>
              </section>

              {/* Quick Actions */}
              <div className="bg-cream border-2 border-terracotta rounded-[12px] p-6 lg:sticky lg:top-6">
                <h3 className="text-lg font-bold text-espresso mb-4">
                  Ready to donate again?
                </h3>
                <button
                  onClick={handleScheduleNext}
                  className="w-full bg-terracotta hover:bg-[#C5694A] text-white font-bold text-base px-6 py-3 rounded-lg transition-all duration-300 hover:shadow-lg mb-4"
                >
                  Schedule Your Next Life-Saving Donation
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full text-mediterranean-blue hover:text-mediterranean-blue/80 font-semibold text-sm transition-colors text-left"
                >
                  Update your information →
                </button>
              </div>

              {/* Community Impact */}
              <section className="bg-white border border-taupe rounded-[12px] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-olive-green" />
                  <h3 className="text-lg font-bold text-espresso">
                    Your Impact in the Community
                  </h3>
                </div>
                <div className="space-y-3 text-sm mb-4">
                  <div className="flex items-center gap-2 text-taupe">
                    <div className="w-2 h-2 rounded-full bg-olive-green flex-shrink-0" />
                    <span>Ospedale San Raffaele, Milano</span>
                  </div>
                  <div className="flex items-center gap-2 text-taupe">
                    <div className="w-2 h-2 rounded-full bg-olive-green flex-shrink-0" />
                    <span>Centro Donazioni Duomo, Milano</span>
                  </div>
                  <div className="flex items-center gap-2 text-taupe">
                    <div className="w-2 h-2 rounded-full bg-olive-green flex-shrink-0" />
                    <span>Ospedale Niguarda, Milano</span>
                  </div>
                </div>
                {/* Italy Map with Regions - Simplified visualization */}
                <div className="mt-4 h-40 bg-gradient-to-b from-sky-blue/20 to-olive-green/20 rounded-lg relative overflow-hidden border border-taupe/20">
                  {/* Simplified Italy shape with regions */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full h-full">
                      {/* Lombardy region (highlighted) */}
                      <div className="absolute top-1/4 left-1/3 w-16 h-12 bg-olive-green/40 rounded border-2 border-olive-green">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-3 h-3 rounded-full bg-olive-green border-2 border-white shadow-md"></div>
                        </div>
                      </div>
                      {/* Additional regions */}
                      <div className="absolute top-1/3 right-1/4 w-12 h-10 bg-olive-green/30 rounded border border-olive-green/50">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-2 h-2 rounded-full bg-olive-green"></div>
                        </div>
                      </div>
                      <div className="absolute bottom-1/4 left-1/4 w-10 h-8 bg-olive-green/30 rounded border border-olive-green/50">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-2 h-2 rounded-full bg-olive-green"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-taupe font-medium">
                    Regions where your donations helped
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DonorDashboard;


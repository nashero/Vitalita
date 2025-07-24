import React, { useState, useRef, useEffect } from 'react';
import { Heart, Cross, Users, Calendar, ShieldCheck, Clock, BarChart3, HelpCircle, Menu, X, ArrowRight, UserPlus, CheckCircle, MessageCircle, QrCode, Mail, Smartphone, CalendarDays, Award, Group, Star, Info, ArrowDown } from 'lucide-react';

const stats = [
  { label: 'Donations per year', value: 500000, icon: <Heart className="w-7 h-7 text-red-600" /> },
  { label: 'AWS Centers', value: 150, icon: <Cross className="w-7 h-7 text-red-600" /> },
  { label: 'Lives saved', value: 1000000, icon: <CheckCircle className="w-7 h-7 text-red-600" /> },
  { label: 'Online support', value: 24, icon: <MessageCircle className="w-7 h-7 text-red-600" /> },
];

const features = [
  { icon: <Calendar className="w-8 h-8 text-red-600" />, title: 'Easy Booking', desc: 'Book your donation in just a few clicks with our virtual assistant.' },
  { icon: <ShieldCheck className="w-8 h-8 text-red-600" />, title: 'Guaranteed Safety', desc: 'All AWS centers meet the highest safety standards.' },
  { icon: <Group className="w-8 h-8 text-red-600" />, title: 'AWS Community', desc: 'Join thousands of donors across the country.' },
  { icon: <Clock className="w-8 h-8 text-red-600" />, title: 'Flexible Hours', desc: 'Many available times to fit your schedule.' },
];

const processSteps = [
  'Start the Conversation - Use our advanced booking wizard or chat with the virtual assistant',
  'Identity Verification - Secure identification with your name, AWS center, and donor ID with birth generation',
  'Eligibility & Scheduling - Advanced eligibility checking and smart scheduling with real-time availability',
  'Instant Confirmation - Multiple delivery options, QR codes, calendar integration and automated reminders',
];

const highlights = [
  { icon: <BarChart3 className="w-6 h-6 text-red-600" />, title: 'Smart Scheduling', desc: 'Real-time availability, Live slot checking, Capacity management, Conflict detection' },
  { icon: <ShieldCheck className="w-6 h-6 text-red-600" />, title: 'Eligibility Checking', desc: 'Medical history review, Annual holds, Health screening' },
  { icon: <Mail className="w-6 h-6 text-red-600" />, title: 'Multi-Channel Delivery', desc: 'Email, SMS, Calendar, Automated reminders' },
  { icon: <QrCode className="w-6 h-6 text-red-600" />, title: 'Advanced Features', desc: 'Draft saving, Rescheduling, QR codes' },
];

const benefits = [
  { icon: <Heart className="w-8 h-8 text-red-600" />, title: 'Save Lives', desc: 'A single donation can save up to 3 people.' },
  { icon: <ShieldCheck className="w-8 h-8 text-red-600" />, title: 'Safety', desc: 'Highest safety and hygiene standards.' },
  { icon: <Group className="w-8 h-8 text-red-600" />, title: 'Community', desc: 'Join the great AWS family.' },
  { icon: <Award className="w-8 h-8 text-red-600" />, title: 'Recognition', desc: 'Receive certificates for your social contribution.' },
];

function useAnimatedCounter(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    let raf: number;
    function animate() {
      start += increment;
      if (start < target) {
        setCount(Math.floor(start));
        raf = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    }
    animate();
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return count;
}

// Add prop types for navigation
interface LandingPageProps {
  onDonorPortal?: () => void;
  onStaffPortal?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onDonorPortal, onStaffPortal }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const sectionRefs = {
    hero: useRef<HTMLDivElement>(null),
    statistics: useRef<HTMLDivElement>(null),
    features: useRef<HTMLDivElement>(null),
    registration: useRef<HTMLDivElement>(null),
    process: useRef<HTMLDivElement>(null),
    footer: useRef<HTMLDivElement>(null),
  };

  const handleNav = (to: keyof typeof sectionRefs) => {
    setMenuOpen(false);
    sectionRefs[to].current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Animated counters for stats
  const statCounts = [
    useAnimatedCounter(500000),
    useAnimatedCounter(150),
    useAnimatedCounter(1000000),
    useAnimatedCounter(24),
  ];

  // Move navLinks here so it can use props
  const navLinks = [
    { label: 'Home', to: 'hero', onClick: undefined },
    { label: 'Book Donation', to: 'process', onClick: undefined },
    { label: 'Donor Portal', to: 'registration', onClick: onDonorPortal },
    { label: 'Analytics', to: 'statistics', onClick: undefined },
    { label: 'Staff Area', to: 'features', onClick: onStaffPortal },
    { label: 'FAQ', to: 'footer', onClick: undefined },
  ];

  return (
    <div className="font-sans bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 shadow-sm backdrop-blur-md">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:py-4">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => handleNav('hero')}>
            <span className="inline-flex items-center text-2xl font-bold text-red-600">
              <Heart className="w-7 h-7 mr-1" fill="#DC2626" /> Vitalita
            </span>
          </div>
          <div className="hidden md:flex space-x-8 text-base font-medium">
            {navLinks.map(link => (
              <button
                key={link.label}
                onClick={link.onClick ? link.onClick : () => handleNav(link.to as keyof typeof sectionRefs)}
                className="hover:text-red-600 transition-colors focus:outline-none"
              >
                {link.label}
              </button>
            ))}
          </div>
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMenuOpen(v => !v)} aria-label="Open menu">
            {menuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
        </nav>
        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white shadow-lg border-t border-gray-100 animate-fade-in-down">
            <div className="flex flex-col px-6 py-4 space-y-2">
              {navLinks.map(link => (
                <button
                  key={link.label}
                  onClick={link.onClick ? link.onClick : () => handleNav(link.to as keyof typeof sectionRefs)}
                  className="text-lg text-left py-2 px-2 rounded hover:bg-gray-100 focus:outline-none"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section ref={sectionRefs.hero} className="relative flex flex-col items-center justify-center min-h-[50vh] px-4 py-10 bg-gradient-to-b from-white to-gray-50 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
          Donate Blood, <span className="text-red-600">Save Lives</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-700 mb-8">
          Vitalita's online booking system allows you to schedule your blood or plasma donation simply and quickly. Our virtual assistant will guide you through every step of the process.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold shadow-md hover:bg-red-700 transition-all focus:outline-none focus:ring-2 focus:ring-red-400">
            Book Donation
          </button>
          <button className="border-2 border-red-600 text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-red-50 transition-all focus:outline-none focus:ring-2 focus:ring-red-400">
            Learn More
          </button>
        </div>
        <ArrowDown className="mx-auto mt-12 animate-bounce text-red-400 w-8 h-8" />
      </section>

      {/* Statistics Section */}
      <section ref={sectionRefs.statistics} className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white rounded-2xl shadow-lg p-8">
          {stats.map((stat, i) => (
            <div key={stat.label} className="flex flex-col items-center text-center">
              <div className="mb-2">{stat.icon}</div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900">
                {i === 0 && <span>{statCounts[0].toLocaleString()}+</span>}
                {i === 1 && <span>{statCounts[1]}+</span>}
                {i === 2 && <span>{statCounts[2].toLocaleString()}+</span>}
                {i === 3 && <span>{statCounts[3]}/7</span>}
              </div>
              <div className="text-gray-600 text-base mt-1 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section ref={sectionRefs.features} className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Why Choose Vitalita?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {features.map(f => (
            <div key={f.title} className="flex items-start bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="mr-4">{f.icon}</div>
              <div>
                <h3 className="text-lg font-semibold mb-1">{f.title}</h3>
                <p className="text-gray-600 text-base">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Registration Section */}
      <section ref={sectionRefs.registration} className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">Donor Registration &amp; Login</h2>
        <p className="text-gray-700 mb-6">New to Vitalita? Register as a donor or login to your existing account to manage appointments.</p>
        <button
          className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold shadow-md hover:bg-red-700 transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
          onClick={onDonorPortal}
        >
          Access Donor Portal
        </button>
      </section>

      {/* Process Section */}
      <section ref={sectionRefs.process} className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Book Your Donation</h2>
            <p className="text-gray-700 mb-6">Our advanced booking system will guide you step by step through the process. Complete eligibility checking, smart scheduling, and instant confirmation.</p>
            <button className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold shadow-md hover:bg-red-700 transition-all focus:outline-none focus:ring-2 focus:ring-red-400">
              Start Advanced Booking
            </button>
          </div>
          <div className="flex-1">
            <ol className="space-y-4">
              {processSteps.map((step, i) => (
                <li key={i} className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold mr-4 shadow">
                    {i + 1}
                  </span>
                  <span className="text-gray-800 text-base font-medium">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Feature Highlights</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {highlights.map(h => (
            <div key={h.title} className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center hover:shadow-lg transition-shadow">
              <div className="mb-2">{h.icon}</div>
              <h3 className="text-lg font-semibold mb-1 text-center">{h.title}</h3>
              <p className="text-gray-600 text-center text-base">{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Vitalita Section */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">Why Choose Vitalita?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {benefits.map(b => (
            <div key={b.title} className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center hover:shadow-lg transition-shadow">
              <div className="mb-2">{b.icon}</div>
              <h3 className="text-lg font-semibold mb-1 text-center">{b.title}</h3>
              <p className="text-gray-600 text-center text-base">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer ref={sectionRefs.footer} className="bg-white border-t border-gray-200 mt-4">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-2">
            <Heart className="w-6 h-6 text-red-600" fill="#DC2626" />
            <span className="font-bold text-lg text-red-600">Vitalita</span>
          </div>
          <div className="flex flex-wrap gap-4 text-gray-600 text-sm">
            <a href="#" className="hover:text-red-600 transition-colors">Company Info</a>
            <a href="#" className="hover:text-red-600 transition-colors">Support</a>
            <a href="#" className="hover:text-red-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-red-600 transition-colors">Terms of Service</a>
          </div>
          <div className="flex space-x-4">
            <a href="#" aria-label="Twitter" className="hover:text-red-600 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0022.4.36a9.09 9.09 0 01-2.88 1.1A4.52 4.52 0 0016.11 0c-2.5 0-4.52 2.02-4.52 4.52 0 .35.04.7.11 1.03C7.69 5.4 4.07 3.67 1.64.9c-.38.65-.6 1.4-.6 2.2 0 1.52.77 2.86 1.94 3.65A4.48 4.48 0 01.96 6v.06c0 2.13 1.52 3.9 3.54 4.3-.37.1-.76.16-1.16.16-.28 0-.55-.03-.81-.08.55 1.7 2.16 2.94 4.07 2.97A9.05 9.05 0 010 21.54a12.8 12.8 0 006.95 2.04c8.34 0 12.9-6.91 12.9-12.9 0-.2 0-.39-.01-.58A9.22 9.22 0 0023 3z" /></svg></a>
            <a href="#" aria-label="Facebook" className="hover:text-red-600 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg></a>
            <a href="#" aria-label="Instagram" className="hover:text-red-600 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.5" y2="6.5" /></svg></a>
          </div>
        </div>
        <div className="text-center text-gray-400 text-xs pb-2">&copy; {new Date().getFullYear()} Vitalita. All rights reserved.</div>
      </footer>
    </div>
  );
};

export default LandingPage; 
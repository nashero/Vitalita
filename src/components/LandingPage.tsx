import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, Cross, Calendar, ShieldCheck, Clock, BarChart3, Menu, X, CheckCircle, MessageCircle, QrCode, Mail, ArrowDown, Key, User } from 'lucide-react';
import firstImage from '../assets/images/First.jpg';
import secondImage from '../assets/images/Second.jpg';
import thirdImage from '../assets/images/Third.jpg';
import VoiceAgent from './VoiceAgent';
import LanguageSwitcher from './LanguageSwitcher';
import HowItWorksSection from './HowItWorksSection';


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
  onStaffPortal?: () => void;
  onDeployProject?: () => void;
  onPinAuthDemo?: () => void;
  onPinLogin?: () => void;
  onPinDebug?: () => void;
  onDonorRegistration?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStaffPortal, onDeployProject, onPinAuthDemo, onPinLogin, onPinDebug, onDonorRegistration }) => {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [secondaryMenuOpen, setSecondaryMenuOpen] = useState(false);
  

  
  const sectionRefs = {
    hero: useRef<HTMLDivElement>(null),
    statistics: useRef<HTMLDivElement>(null),
    features: useRef<HTMLDivElement>(null),
    registration: useRef<HTMLDivElement>(null),
    process: useRef<HTMLDivElement>(null),
    footer: useRef<HTMLDivElement>(null),
  };



  // Close secondary menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.secondary-menu')) {
        setSecondaryMenuOpen(false);
      }
    };

    if (secondaryMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [secondaryMenuOpen]);

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
    { label: t('navigation.home'), to: 'hero', onClick: undefined },
    { label: t('navigation.donorPortal'), to: 'registration', onClick: onDonorRegistration },
    { label: t('navigation.faq'), to: 'footer', onClick: undefined },
  ];

  // Secondary menu items
  const secondaryNavItems = [
    { label: t('navigation.analytics'), to: 'statistics', onClick: undefined },
    { label: t('navigation.staffArea'), to: 'features', onClick: onStaffPortal },
    { label: t('navigation.pinAuthDemo'), to: 'pinAuth', onClick: onPinAuthDemo },
    { label: 'PIN Debug Tool', to: 'pinDebug', onClick: onPinDebug },
  ];

  return (
    <div className="font-sans bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 shadow-sm backdrop-blur-md">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 md:py-4">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => handleNav('hero')}>
            <span className="inline-flex items-center text-2xl font-bold text-red-600">
              <Heart className="w-7 h-7 mr-1" fill="#DC2626" />
              Vitalita
            </span>
          </div>
          <div className="flex items-center space-x-4 text-base font-medium">
                         {navLinks.map(link => (
               <button
                 key={link.label}
                 onClick={link.onClick ? link.onClick : () => handleNav(link.to as keyof typeof sectionRefs)}
                 className={`transition-all focus:outline-none ${
                   link.label === t('navigation.donorPortal')
                     ? 'bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 shadow-md hover:shadow-lg transform hover:scale-105'
                     : 'hover:text-red-600'
                 }`}
               >
                 {link.label}
               </button>
             ))}
            
            {/* Language Switcher */}
            <LanguageSwitcher variant="minimal" />
            
            {/* Secondary Menu Dropdown */}
            <div className="relative secondary-menu">
              <button
                onClick={() => setSecondaryMenuOpen(!secondaryMenuOpen)}
                className="flex items-center space-x-1 hover:text-red-600 transition-colors focus:outline-none"
              >
                <span>{t('navigation.more')}</span>
                <ArrowDown className={`w-4 h-4 transition-transform ${secondaryMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {secondaryMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {secondaryNavItems.map(link => (
                    <button
                      key={link.label}
                      onClick={() => {
                        setSecondaryMenuOpen(false);
                        if (link.onClick) {
                          link.onClick();
                        } else {
                          handleNav(link.to as keyof typeof sectionRefs);
                        }
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 hover:text-red-600 transition-colors"
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
                   className={`text-lg text-left py-2 px-2 rounded focus:outline-none ${
                     link.label === t('navigation.donorPortal')
                       ? 'bg-red-600 text-white font-semibold hover:bg-red-700 shadow-md'
                       : 'hover:bg-gray-100'
                   }`}
                 >
                   {link.label}
                 </button>
               ))}
              
              {/* Language Switcher in mobile */}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="text-xs font-medium text-gray-500 mb-2 px-2">{t('language.selectLanguage')}</div>
                <div className="px-2">
                  <LanguageSwitcher variant="compact" className="w-full" />
                </div>
              </div>
              
              {/* Secondary menu items in mobile */}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="text-xs font-medium text-gray-500 mb-2 px-2">{t('navigation.moreOptions')}</div>
                {secondaryNavItems.map(link => (
                  <button
                    key={link.label}
                    onClick={() => {
                      setMenuOpen(false);
                      if (link.onClick) {
                        link.onClick();
                      } else {
                        handleNav(link.to as keyof typeof sectionRefs);
                      }
                    }}
                    className="text-lg text-left py-2 px-2 rounded hover:bg-gray-100 focus:outline-none text-gray-600"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

             {/* Hero Section */}
       <section ref={sectionRefs.hero} className="relative flex flex-col items-center justify-center min-h-[60vh] px-4 py-12 bg-gradient-to-br from-red-50 via-white to-gray-50 text-center overflow-hidden">
         {/* Background Image */}
         <div className="absolute inset-0 z-0">
           <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/80 to-transparent"></div>
           <img 
             src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB2aWV3Qm94PSIwIDAgMTIwMCA4MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZGllbnQpIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KPHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6I2YlZjVmNjsgc3RvcC1vcGFjaXR5OjEiIC8+CjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I2Y5ZmFmYjsgc3RvcC1vcGFjaXR5OjEiIC8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPC9zdmc+" 
             alt="Blood donation process" 
             className="w-full h-full object-cover opacity-10"
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23fef2f2;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23f9fafb;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23bg)'/%3E%3C/svg%3E")`,
               backgroundSize: 'cover',
               backgroundPosition: 'center'
             }}
           />
         </div>
         
         {/* Content */}
         <div className="relative z-10 max-w-6xl mx-auto">
           <div className="flex flex-col items-center text-center space-y-8">
             {/* Text Content - Centered at top */}
             <div className="max-w-4xl">
               <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
                 {t('landing.title').split(', ')[0]}, <span className="text-red-600">{t('landing.title').split(', ')[1]}</span>
               </h1>
               <p className="text-base md:text-lg text-gray-700 mb-6 leading-relaxed">
                 {t('landing.subtitle')}
               </p>
             </div>
             
             {/* Blood Donation Images - 3 images in a row */}
             <div className="relative w-full max-w-4xl">
               <div className="grid grid-cols-3 gap-4 rounded-2xl shadow-2xl overflow-hidden">
                 <div className="relative">
                   <img 
                     src={firstImage} 
                     alt="Blood donation process - Step 1" 
                     className="w-full h-48 md:h-56 lg:h-64 object-cover"
                   />
                 </div>
                 <div className="relative">
                   <img 
                     src={secondImage} 
                     alt="Blood donation process - Step 2" 
                     className="w-full h-48 md:h-56 lg:h-64 object-cover"
                   />
                 </div>
                 <div className="relative">
                   <img 
                     src={thirdImage} 
                     alt="Blood donation process - Step 3" 
                     className="w-full h-48 md:h-56 lg:h-64 object-cover"
                   />
                 </div>
               </div>
               
               {/* Decorative elements */}
               <div className="absolute -top-4 -right-4 w-8 h-8 bg-red-400 rounded-full opacity-60"></div>
               <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-red-300 rounded-full opacity-60"></div>
               
               {/* Medical Icons */}
               <div className="absolute -top-2 left-4">
                 <div className="w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center">
                   <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                   </svg>
                 </div>
               </div>
             </div>
           </div>
         </div>
         
         {/* Floating elements */}
         <div className="absolute top-20 left-10 w-4 h-4 bg-red-300 rounded-full opacity-40 animate-pulse"></div>
         <div className="absolute top-40 right-20 w-3 h-3 bg-red-400 rounded-full opacity-60 animate-ping"></div>
         <div className="absolute bottom-20 left-20 w-5 h-5 bg-red-200 rounded-full opacity-50 animate-bounce"></div>
       </section>

       {/* Registration Section */}
       <section ref={sectionRefs.registration} className="max-w-4xl mx-auto px-4 py-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">{t('landing.donorRegistration')}</h2>
        <p className="text-gray-700 mb-6">{t('landing.donorRegistrationDesc')}</p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {/* Traditional Login */}
          <button
            className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold shadow-md hover:bg-red-700 transition-all focus:outline-none focus:ring-2 focus:ring-red-400 flex items-center justify-center min-w-[200px]"
            onClick={onDonorRegistration}
          >
            <User className="w-5 h-5 mr-2" />
            {t('landing.accessDonorPortal')}
          </button>
          
          {/* PIN Login - only show if onPinLogin is provided */}
          {onPinLogin && (
            <button
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center min-w-[200px]"
              onClick={onPinLogin}
            >
              <Key className="w-5 h-5 mr-2" />
              {t('landing.quickPinLogin')}
            </button>
          )}
        </div>
        
      </section>



      {/* How It Works Section */}
      <HowItWorksSection ref={sectionRefs.process} />

             {/* Feature Highlights Section */}
       <section className="max-w-7xl mx-auto px-4 py-12 bg-gray-50">
         <div className="px-4">
           <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">{t('landing.featureHighlights')}</h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             {[
               { icon: <BarChart3 className="w-6 h-6 text-red-600" />, title: t('highlights.smartScheduling.title'), desc: t('highlights.smartScheduling.desc') },
               { icon: <ShieldCheck className="w-6 h-6 text-red-600" />, title: t('highlights.eligibilityChecking.title'), desc: t('highlights.eligibilityChecking.desc') },
               { icon: <Mail className="w-6 h-6 text-red-600" />, title: t('highlights.multiChannelDelivery.title'), desc: t('highlights.multiChannelDelivery.desc') },
               { icon: <QrCode className="w-6 h-6 text-red-600" />, title: t('highlights.advancedFeatures.title'), desc: t('highlights.advancedFeatures.desc') }
             ].map((h, index) => (
               <div key={index} className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center hover:shadow-lg transition-shadow">
                 <div className="mb-2">{h.icon}</div>
                 <h3 className="text-lg font-semibold mb-1 text-center">{h.title}</h3>
                 <p className="text-gray-600 text-center text-sm">{h.desc}</p>
               </div>
             ))}
           </div>
         </div>
       </section>

       {/* Why Choose Vitalita Section */}
       <section className="max-w-7xl mx-auto px-4 py-12 bg-white">
         <div className="px-4">
           <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">{t('landing.whyChooseVitalita')}</h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             {[
               { icon: <Calendar className="w-8 h-8 text-red-600" />, title: t('benefits.easyBooking.title'), desc: t('benefits.easyBooking.desc') },
               { icon: <ShieldCheck className="w-8 h-8 text-red-600" />, title: t('benefits.maximumSafety.title'), desc: t('benefits.maximumSafety.desc') },
               { icon: <Heart className="w-8 h-8 text-red-600" />, title: t('benefits.saveLives.title'), desc: t('benefits.saveLives.desc') },
               { icon: <Clock className="w-8 h-8 text-red-600" />, title: t('benefits.flexibleHours.title'), desc: t('benefits.flexibleHours.desc') }
             ].map((b, index) => (
               <div key={index} className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow border border-gray-100">
                 <div className="mb-3">{b.icon}</div>
                 <h3 className="text-lg font-semibold mb-2 text-gray-900">{b.title}</h3>
                 <p className="text-gray-600 text-sm">{b.desc}</p>
               </div>
             ))}
           </div>
         </div>
       </section>

       {/* Analytics Section */}
       <section ref={sectionRefs.statistics} className="max-w-7xl mx-auto px-4 py-8">
         <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">{t('landing.analytics')}</h2>
         <div className="bg-white rounded-2xl shadow-lg p-6">
           <div className="flex flex-wrap justify-center items-center gap-8 text-center">
             <div className="flex items-center space-x-2">
               <Heart className="w-6 h-6 text-red-600" />
               <span className="text-2xl md:text-3xl font-bold text-gray-900">
                 {statCounts[0].toLocaleString()}+
               </span>
               <span className="text-gray-600 font-medium">{t('stats.donations')}</span>
             </div>
             <div className="flex items-center space-x-2">
               <Cross className="w-6 h-6 text-red-600" />
               <span className="text-2xl md:text-3xl font-bold text-gray-900">
                 {statCounts[1]}+
               </span>
               <span className="text-gray-600 font-medium">{t('stats.centers')}</span>
             </div>
             <div className="flex items-center space-x-2">
               <CheckCircle className="w-6 h-6 text-red-600" />
               <span className="text-2xl md:text-3xl font-bold text-gray-900">
                 {statCounts[2].toLocaleString()}+
               </span>
               <span className="text-gray-600 font-medium">{t('stats.livesSavedShort')}</span>
             </div>
             <div className="flex items-center space-x-2">
               <MessageCircle className="w-6 h-6 text-red-600" />
               <span className="text-2xl md:text-3xl font-bold text-gray-900">
                 {statCounts[3]}/7
               </span>
               <span className="text-gray-600 font-medium">{t('stats.support')}</span>
             </div>
           </div>
         </div>
       </section>

                                                                                               {/* Blood Donation Centers Section */}
           <section className="bg-gradient-to-r from-green-50 to-emerald-50 py-16">
             <div className="max-w-4xl mx-auto px-4 text-center">
               <h2 className="text-2xl md:text-3xl font-bold mb-6">{t('landing.transformManagement').split(' — ')[0]} — <span className="text-red-600">{t('landing.transformManagement').split(' — ')[1]}</span></h2>
               <button
                 onClick={onDeployProject}
                 className="bg-red-600 text-white px-8 py-4 rounded-lg font-semibold shadow-lg hover:bg-red-700 transition-all focus:outline-none focus:ring-2 focus:ring-red-400 text-lg"
               >
                 {t('landing.showMeHow')}
               </button>
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
            <a href="#" className="hover:text-red-600 transition-colors">{t('landing.companyInfo')}</a>
            <a href="#" className="hover:text-red-600 transition-colors">{t('landing.support')}</a>
            <a href="#" className="hover:text-red-600 transition-colors">{t('landing.privacyPolicy')}</a>
            <a href="#" className="hover:text-red-600 transition-colors">{t('landing.termsOfService')}</a>
          </div>
          <div className="flex space-x-4">
            <a href="#" aria-label="Twitter" className="hover:text-red-600 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0022.4.36a9.09 9.09 0 01-2.88 1.1A4.52 4.52 0 0016.11 0c-2.5 0-4.52 2.02-4.52 4.52 0 .35.04.7.11 1.03C7.69 5.4 4.07 3.67 1.64.9c-.38.65-.6 1.4-.6 2.2 0 1.52.77 2.86 1.94 3.65A4.48 4.48 0 01.96 6v.06c0 2.13 1.52 3.9 3.54 4.3-.37.1-.76.16-1.16.16-.28 0-.55-.03-.81-.08.55 1.7 2.16 2.94 4.07 2.97A9.05 9.05 0 010 21.54a12.8 12.8 0 006.95 2.04c8.34 0 12.9-6.91 12.9-12.9 0-.2 0-.39-.01-.58A9.22 9.22 0 0023 3z" /></svg></a>
            <a href="#" aria-label="Facebook" className="hover:text-red-600 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg></a>
            <a href="#" aria-label="Instagram" className="hover:text-red-600 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.5" y2="6.5" /></svg></a>
          </div>
        </div>
        <div className="text-center text-gray-400 text-xs pb-2">&copy; {new Date().getFullYear()} Vitalita. {t('landing.allRightsReserved')}</div>
      </footer>
      
      {/* Voice Agent */}
      <VoiceAgent />
    </div>
  );
};

export default LandingPage; 
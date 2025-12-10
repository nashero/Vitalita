import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Footer from './components/Footer';
import Header from './components/Header';
import Home from './pages/Home';
import FeaturesPage from './pages/Features';
import HowItWorks from './pages/HowItWorks';
import HowWeSimplify from './pages/HowWeSimplify';
import Contact from './pages/Contact';
import CaseStudy from './pages/CaseStudy';
import I18nDemo from './components/I18nDemo';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
};

const LanguageSync = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Update HTML lang attribute when language changes
    document.documentElement.lang = i18n.language;
    
    // Update page title and meta description based on language
    const updateMetaTags = () => {
      if (i18n.language === 'it') {
        document.title = 'Vitalita | Software di Gestione Donazioni di Sangue per Italia ed UE';
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', 'Coordinamento alimentato da AI, comunicazione conforme al GDPR e analisi in tempo reale per banche del sangue. Affidato da AVIS Nazionale e oltre 47 sezioni italiane.');
        }
      } else {
        document.title = 'Vitalita | Blood Donation Management Software for Italy & EU';
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', 'AI-powered donor scheduling, GDPR-compliant communication, and real-time analytics for blood banks. Trusted by AVIS Nazionale and 47+ Italian chapters.');
        }
      }
    };

    updateMetaTags();

    // Listen for language changes
    i18n.on('languageChanged', (lng) => {
      document.documentElement.lang = lng;
      updateMetaTags();
    });

    return () => {
      i18n.off('languageChanged');
    };
  }, [i18n]);

  return null;
};

const App = () => {
  const location = useLocation();
  const isDemoRoute = location.pathname === '/i18n-demo';

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <ScrollToTop />
      <LanguageSync />
      {/* Accessibility: Skip to main content link */}
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      {!isDemoRoute && <Header />}
      <main id="main-content" className="flex-1" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/how-we-simplify" element={<HowWeSimplify />} />
          <Route path="/case-studies" element={<CaseStudy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/i18n-demo" element={<I18nDemo />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      {!isDemoRoute && <Footer />}
      {/* Accessibility: Live region for screen reader announcements */}
      <div 
        id="live-region" 
        className="live-region" 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        aria-relevant="additions text"
      />
    </div>
  );
};

export default App;

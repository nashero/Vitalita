import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import Footer from './components/Footer';
import Header from './components/Header';
import Home from './pages/Home';
import FeaturesPage from './pages/Features';
import HowItWorks from './pages/HowItWorks';
import PricingPage from './pages/Pricing';
import Contact from './pages/Contact';
import CaseStudies from './pages/CaseStudies';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
};

const App = () => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/case-studies" element={<CaseStudies />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;

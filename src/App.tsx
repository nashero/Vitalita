import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import Footer from './components/Footer';
import Header from './components/Header';
import Home from './pages/Home';
import FeaturesPage from './pages/Features';
import HowItWorks from './pages/HowItWorks';
import HowWeSimplify from './pages/HowWeSimplify';
import Contact from './pages/Contact';
import CaseStudies from './pages/CaseStudies';
import I18nDemo from './components/I18nDemo';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
};

const App = () => {
  const location = useLocation();
  const isDemoRoute = location.pathname === '/i18n-demo';

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <ScrollToTop />
      {!isDemoRoute && <Header />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/how-we-simplify" element={<HowWeSimplify />} />
          <Route path="/case-studies" element={<CaseStudies />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/i18n-demo" element={<I18nDemo />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      {!isDemoRoute && <Footer />}
    </div>
  );
};

export default App;

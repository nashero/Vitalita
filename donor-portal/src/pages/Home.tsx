import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import WhyDonateSection from '../components/WhyDonateSection';
import HowItWorksSection from '../components/HowItWorksSection';
import TrustImpactSection from '../components/TrustImpactSection';
import TestimonialsSection from '../components/TestimonialsSection';
import CallToActionSection from '../components/CallToActionSection';

const HomePage = () => {
  const location = useLocation();

  useEffect(() => {
    // Scroll to section if hash is present in URL
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        // Small delay to ensure page is rendered
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } else {
      // Scroll to top if no hash
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.hash]);

  return (
    <div className="pt-16 md:pt-20">
      <HeroSection />
      <WhyDonateSection />
      <HowItWorksSection />
      <TrustImpactSection />
      <TestimonialsSection />
      <CallToActionSection />
    </div>
  );
};

export default HomePage;



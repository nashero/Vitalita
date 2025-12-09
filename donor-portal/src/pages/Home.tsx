import HeroSection from '../components/HeroSection';
import WhyDonateSection from '../components/WhyDonateSection';
import HowItWorksSection from '../components/HowItWorksSection';
import TrustImpactSection from '../components/TrustImpactSection';
import TestimonialsSection from '../components/TestimonialsSection';
import CallToActionSection from '../components/CallToActionSection';

const HomePage = () => {
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



import { useEffect } from 'react';
import ComprehensiveFAQ from '../components/ComprehensiveFAQ';
import VoiceAgent from '../components/VoiceAgent';

const HelpPage = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <>
      <ComprehensiveFAQ />
      <VoiceAgent />
    </>
  );
};

export default HelpPage;


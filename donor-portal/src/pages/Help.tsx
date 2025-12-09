import { useEffect } from 'react';
import ComprehensiveFAQ from '../components/ComprehensiveFAQ';

const HelpPage = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return <ComprehensiveFAQ />;
};

export default HelpPage;


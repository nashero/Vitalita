import CTA from '../components/CTA';
import Features from '../components/Features';
import Hero from '../components/Hero';
import ProblemStatement from '../components/ProblemStatement';
import SocialProof from '../components/SocialProof';
import SolutionOverview from '../components/SolutionOverview';

const Home = () => {
  return (
    <div className="bg-slate-50">
      <Hero />
      <ProblemStatement />
      <SolutionOverview />
      <Features />
      <SocialProof />
      <CTA />
    </div>
  );
};

export default Home;


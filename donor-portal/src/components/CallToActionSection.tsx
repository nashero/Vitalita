import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { isAuthenticated } from '../utils/auth';

function CallToActionSection() {
  const navigate = useNavigate();

  const handleScheduleDonation = () => {
    if (isAuthenticated()) {
      navigate('/book');
    } else {
      navigate('/register');
    }
  };

  const handleLearnMore = () => {
    navigate('/eligibility');
  };

  return (
    <section className="relative w-full bg-gradient-to-br from-terracotta to-[#C5694A] py-20 md:py-[80px] px-6 overflow-hidden">
      {/* Subtle heart pattern background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 50px,
              rgba(255, 255, 255, 0.1) 50px,
              rgba(255, 255, 255, 0.1) 51px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 50px,
              rgba(255, 255, 255, 0.1) 50px,
              rgba(255, 255, 255, 0.1) 51px
            )`,
          }}
        />
        {/* Heart icons scattered */}
        {[...Array(12)].map((_, i) => (
          <Heart
            key={i}
            className="absolute w-8 h-8 text-white opacity-5"
            style={{
              left: `${(i * 8) % 100}%`,
              top: `${(i * 7) % 100}%`,
              transform: `rotate(${i * 30}deg)`,
            }}
          />
        ))}
      </div>

      <div className="max-w-[800px] mx-auto text-center relative z-10">
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
          Ready to Save Lives?
        </h2>

        {/* Subtext */}
        <p className="text-lg md:text-xl text-white/90 mb-10">
          Join 50,000+ donors making a difference every day
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleScheduleDonation}
            className="bg-white text-terracotta hover:bg-cream font-bold text-lg px-8 py-4 rounded-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
          >
            Schedule Your First Donation
          </button>
          <button
            onClick={handleLearnMore}
            className="border-2 border-white text-white hover:bg-white/10 font-bold text-lg px-8 py-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-50"
          >
            Learn More About Eligibility
          </button>
        </div>
      </div>
    </section>
  );
}

export default CallToActionSection;


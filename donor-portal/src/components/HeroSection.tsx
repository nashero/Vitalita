import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, CheckCircle2, Award, Heart } from 'lucide-react';
import { isAuthenticated } from '../utils/auth';
import volunteerImage from '../images/Volunteer Smiling.jpg';

function HeroSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(() => isAuthenticated());
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const targetCount = 15234;

  useEffect(() => {
    const checkAuth = () => {
      setAuthenticated(isAuthenticated());
    };

    checkAuth();
    window.addEventListener('auth-change', checkAuth);
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('auth-change', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  // Count-up animation (respects reduced motion)
  useEffect(() => {
    setIsVisible(true);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      setCount(targetCount);
      return;
    }

    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = targetCount / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newCount = Math.min(Math.floor(increment * currentStep), targetCount);
      setCount(newCount);

      if (currentStep >= steps) {
        setCount(targetCount);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  // Parallax effect on scroll (respects reduced motion)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const handleScroll = () => {
      if (imageRef.current) {
        const scrolled = window.pageYOffset;
        const parallaxSpeed = 0.15; // Subtle parallax
        imageRef.current.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePrimaryCTA = () => {
    const bookingSection = document.getElementById('book');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/book');
    }
  };

  const handleSecondaryCTA = () => {
    if (authenticated) {
      navigate('/appointments');
    } else {
      navigate('/login');
    }
  };

  return (
    <section
      ref={heroRef}
      className="relative w-full bg-gradient-to-b from-cream to-[#FEFBF5] py-12 md:py-20 lg:py-24 overflow-hidden"
    >
      {/* Subtle Mediterranean pattern background */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 20px,
              #D97757 20px,
              #D97757 21px
            ),
            repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 20px,
              #5B9BD5 20px,
              #5B9BD5 21px
            )`,
          }}
        />
      </div>
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Content */}
          <div
            className={`space-y-6 md:space-y-8 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            } transition-all duration-1000 ease-out motion-reduce:transition-none`}
          >
            {/* Animated Counter */}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-bold text-terracotta">
                {count.toLocaleString()}
              </span>
              <span className="text-base md:text-lg text-taupe">
                lives saved this year
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-[36px] md:text-5xl lg:text-[48px] font-bold text-espresso leading-tight">
              Your Blood Saves{' '}
              <span className="text-terracotta">Three</span> Lives
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-taupe leading-relaxed max-w-xl">
              Schedule your donation in 3 minutes. Every pint creates hope for
              patients across Italy.{' '}
              
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2 px-4 sm:px-0">
              <button
                onClick={handlePrimaryCTA}
                className="w-full sm:w-auto bg-terracotta hover:bg-[#C5694A] text-white font-bold text-base px-8 py-4 rounded-[8px] transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-terracotta focus:ring-opacity-50"
              >
                Start Saving Lives
              </button>
              <button
                onClick={handleSecondaryCTA}
                className="w-full sm:w-auto border-2 border-mediterranean-blue text-mediterranean-blue hover:bg-mediterranean-blue hover:text-white font-bold text-base px-8 py-4 rounded-[8px] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-mediterranean-blue focus:ring-opacity-50"
              >
                I'm Already a Donor
              </button>
            </div>

            {/* Trust Line */}
            <p className="text-sm text-taupe pt-2">
              Trusted by 50,000+ donors • Verified by AVIS • GDPR Protected
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 md:gap-6 pt-4">
              <div className="flex items-center gap-2 text-taupe">
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">GDPR Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-taupe">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">Verified by AVIS</span>
              </div>
              <div className="flex items-center gap-2 text-taupe">
                <Award className="w-5 h-5" />
                <span className="text-sm font-medium">ISO 27001 Certified</span>
              </div>
            </div>
          </div>

          {/* Right Column - Hero Image */}
          <div
            ref={imageRef}
            className={`relative ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            } transition-all duration-1000 ease-out delay-300 motion-reduce:transition-none`}
          >
            <div className="relative rounded-[12px] overflow-hidden aspect-video bg-gradient-to-br from-terracotta/20 to-olive-green/20">
              {/* Hero image */}
              <img
                src={volunteerImage}
                alt="Smiling volunteer donor - diverse, warm lighting"
                className="w-full h-full object-cover"
              />
              {/* Warm overlay filter */}
              <div className="absolute inset-0 bg-gradient-to-t from-terracotta/10 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;

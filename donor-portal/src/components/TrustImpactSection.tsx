import { useState, useEffect, useRef } from 'react';
import { Users, Heart, MapPin } from 'lucide-react';

interface StatCard {
  number: string;
  text: string;
  icon: React.ReactNode;
  color: string;
  iconColor: string;
}

function TrustImpactSection() {
  const [visibleCards, setVisibleCards] = useState<boolean[]>([false, false, false]);
  const [counts, setCounts] = useState({ donors: 0, lives: 0, centers: 0 });
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const stats: StatCard[] = [
    {
      number: '50,000+',
      text: 'Active Donors',
      icon: <Users className="w-12 h-12" />,
      color: 'terracotta',
      iconColor: 'text-olive-green',
    },
    {
      number: '150,000+',
      text: 'Lives Saved This Year',
      icon: <Heart className="w-12 h-12" />,
      color: 'mediterranean-blue',
      iconColor: 'text-terracotta',
    },
    {
      number: '200+',
      text: 'AVIS Centers Connected',
      icon: <MapPin className="w-12 h-12" />,
      color: 'olive-green',
      iconColor: 'text-mediterranean-blue',
    },
  ];

  // Counter animation
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setCounts({ donors: 50000, lives: 150000, centers: 200 });
      return;
    }

    const duration = 2000;
    const steps = 60;
    const incrementDonors = 50000 / steps;
    const incrementLives = 150000 / steps;
    const incrementCenters = 200 / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setCounts({
        donors: Math.min(Math.floor(incrementDonors * currentStep), 50000),
        lives: Math.min(Math.floor(incrementLives * currentStep), 150000),
        centers: Math.min(Math.floor(incrementCenters * currentStep), 200),
      });

      if (currentStep >= steps) {
        setCounts({ donors: 50000, lives: 150000, centers: 200 });
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setVisibleCards([true, true, true]);
      return;
    }

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };

    const cardsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const cardIndex = cardsRef.current.indexOf(entry.target as HTMLDivElement);
          if (cardIndex !== -1) {
            setTimeout(() => {
              setVisibleCards((prev) => {
                const newState = [...prev];
                newState[cardIndex] = true;
                return newState;
              });
            }, cardIndex * 150);
          }
          cardsObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    cardsRef.current.forEach((card) => {
      if (card) cardsObserver.observe(card);
    });

    return () => {
      cardsObserver.disconnect();
    };
  }, []);

  const getDisplayNumber = (index: number) => {
    if (index === 0) return counts.donors.toLocaleString() + '+';
    if (index === 1) return counts.lives.toLocaleString() + '+';
    return counts.centers.toLocaleString() + '+';
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-cream/50 py-20 md:py-[80px] px-6 overflow-hidden"
    >
      <div className="max-w-[1200px] mx-auto">
        {/* Heading */}
        <h2 className="text-[28px] md:text-[36px] font-bold text-espresso text-center mb-12 md:mb-16">
          Trusted Across Italy
        </h2>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
              className={`bg-white border border-taupe/30 rounded-[12px] p-8 text-center transition-all duration-500 hover:shadow-lg hover:-translate-y-1 ${
                visibleCards[index]
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              } motion-reduce:transition-none`}
            >
              <div className={`${stat.iconColor} mb-4 flex justify-center`}>
                {stat.icon}
              </div>
              <div
                className={`text-4xl md:text-5xl font-bold mb-3 ${
                  stat.color === 'terracotta'
                    ? 'text-terracotta'
                    : stat.color === 'mediterranean-blue'
                    ? 'text-mediterranean-blue'
                    : 'text-olive-green'
                }`}
              >
                {getDisplayNumber(index)}
              </div>
              <p className="text-lg text-espresso font-medium">{stat.text}</p>
            </div>
          ))}
        </div>

        {/* Partnership Logos */}
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {/* AVIS Logo */}
          <div className="bg-white border border-taupe/30 rounded-lg p-6 hover:shadow-md transition-all hover:-translate-y-1">
            <div className="text-center">
              <div className="text-2xl font-bold text-olive-green mb-2">AVIS</div>
              <div className="text-sm text-taupe">Official Partner</div>
            </div>
          </div>

          {/* ISO Certification */}
          <div className="bg-white border border-taupe/30 rounded-lg p-6 hover:shadow-md transition-all hover:-translate-y-1">
            <div className="text-center">
              <div className="text-xl font-bold text-espresso mb-2">ISO 27001</div>
              <div className="text-sm text-taupe">Certified</div>
            </div>
          </div>

          {/* GDPR Compliance */}
          <div className="bg-white border border-taupe/30 rounded-lg p-6 hover:shadow-md transition-all hover:-translate-y-1">
            <div className="text-center">
              <div className="text-xl font-bold text-espresso mb-2">GDPR</div>
              <div className="text-sm text-taupe">Compliant</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TrustImpactSection;


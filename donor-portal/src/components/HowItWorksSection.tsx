import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserPlus, Calendar, Heart, TrendingUp } from 'lucide-react';
import { isAuthenticated } from '../utils/auth';

interface Step {
  icon: React.ReactNode;
  title: string;
  text: string;
  number: string;
  color: string;
  iconColor: string;
}

function HowItWorksSection() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [visibleSteps, setVisibleSteps] = useState<boolean[]>([false, false, false, false]);
  const sectionRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);

  const steps: Step[] = [
    {
      icon: <UserPlus className="w-8 h-8" />,
      title: t('landing.howItWorks.steps.createProfile.title'),
      text: t('landing.howItWorks.steps.createProfile.text'),
      number: '1',
      color: 'terracotta',
      iconColor: 'text-terracotta',
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: t('landing.howItWorks.steps.chooseTime.title'),
      text: t('landing.howItWorks.steps.chooseTime.text'),
      number: '2',
      color: 'mediterranean-blue',
      iconColor: 'text-mediterranean-blue',
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: t('landing.howItWorks.steps.saveLives.title'),
      text: t('landing.howItWorks.steps.saveLives.text'),
      number: '3',
      color: 'olive-green',
      iconColor: 'text-olive-green',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: t('landing.howItWorks.steps.seeImpact.title'),
      text: t('landing.howItWorks.steps.seeImpact.text'),
      number: '4',
      color: 'terracotta',
      iconColor: 'text-terracotta',
    },
  ];

  // Intersection Observer for scroll animations
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setVisibleSteps([true, true, true, true]);
      return;
    }

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };

    const stepsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const stepIndex = stepsRef.current.indexOf(entry.target as HTMLDivElement);
          if (stepIndex !== -1) {
            setTimeout(() => {
              setVisibleSteps((prev) => {
                const newState = [...prev];
                newState[stepIndex] = true;
                return newState;
              });
            }, stepIndex * 150);
          }
          stepsObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    stepsRef.current.forEach((step) => {
      if (step) stepsObserver.observe(step);
    });

    return () => {
      stepsObserver.disconnect();
    };
  }, []);

  const handleStartJourney = () => {
    if (isAuthenticated()) {
      navigate('/book');
    } else {
      navigate('/register');
    }
  };

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative w-full bg-white pt-24 md:pt-28 pb-20 md:pb-[80px] px-6 overflow-hidden scroll-mt-16 md:scroll-mt-20"
    >
      <div className="max-w-[1200px] mx-auto">
        {/* Heading */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-[28px] md:text-[36px] font-bold text-espresso mb-4">
            {t('landing.howItWorks.title')}
          </h2>
          <p className="text-lg md:text-xl text-taupe">
            {t('landing.howItWorks.subtitle')}
          </p>
        </div>

        {/* Steps Timeline */}
        <div className="relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 border-t-2 border-dashed border-mediterranean-blue/40" />

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 relative">
            {steps.map((step, index) => (
              <div
                key={index}
                ref={(el) => {
                  stepsRef.current[index] = el;
                }}
                className={`relative flex flex-col items-center text-center transition-all duration-700 ${
                  visibleSteps[index]
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                } motion-reduce:transition-none`}
              >
                {/* Number Badge */}
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 relative z-10 shadow-lg ${
                    step.color === 'terracotta'
                      ? 'bg-terracotta'
                      : step.color === 'mediterranean-blue'
                      ? 'bg-mediterranean-blue'
                      : 'bg-olive-green'
                  }`}
                >
                  {step.number}
                </div>

                {/* Icon */}
                <div className={`${step.iconColor} mb-4`}>{step.icon}</div>

                {/* Content */}
                <h3 className="text-xl font-bold text-espresso mb-3">{step.title}</h3>
                <p className="text-base text-taupe leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex justify-center mt-12 md:mt-16">
          <button
            onClick={handleStartJourney}
            className="bg-terracotta hover:bg-[#C5694A] text-white font-bold text-base md:text-lg px-8 py-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-terracotta focus:ring-opacity-50"
          >
            {t('landing.howItWorks.cta')}
          </button>
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;


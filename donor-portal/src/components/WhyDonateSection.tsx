import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Activity, Users } from 'lucide-react';

interface BenefitCard {
  icon: React.ReactNode;
  title: string;
  text: string;
  iconColor: string;
}

function WhyDonateSection() {
  const navigate = useNavigate();
  const [visibleCards, setVisibleCards] = useState<boolean[]>([false, false, false]);
  const [ctaVisible, setCtaVisible] = useState(false);
  const [testimonialVisible, setTestimonialVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const ctaRef = useRef<HTMLDivElement>(null);
  const testimonialRef = useRef<HTMLDivElement>(null);

  const benefits: BenefitCard[] = [
    {
      icon: <Heart className="w-[48px] h-[48px]" />,
      title: 'Save Lives',
      text: 'One donation helps up to three patients survive surgery, accidents, or chronic conditions.',
      iconColor: 'text-terracotta',
    },
    {
      icon: <Activity className="w-[48px] h-[48px]" />,
      title: 'Stay Healthy',
      text: 'Regular donors benefit from free health screenings and reduced cardiovascular risk.',
      iconColor: 'text-mediterranean-blue',
    },
    {
      icon: <Users className="w-[48px] h-[48px]" />,
      title: 'Join a Community',
      text: "Become part of Italy's lifesaving network of 50,000+ donors.",
      iconColor: 'text-olive-green',
    },
  ];

  // Intersection Observer for scroll animations
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // Show all immediately if reduced motion
      setVisibleCards([true, true, true]);
      setCtaVisible(true);
      setTestimonialVisible(true);
      return;
    }

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };

    // Observer for benefit cards (stagger animation)
    const cardsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          const cardIndex = cardsRef.current.indexOf(entry.target as HTMLDivElement);
          if (cardIndex !== -1) {
            setTimeout(() => {
              setVisibleCards((prev) => {
                const newState = [...prev];
                newState[cardIndex] = true;
                return newState;
              });
            }, cardIndex * 150); // Stagger delay: 150ms between each card
          }
          cardsObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observer for CTA
    const ctaObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setCtaVisible(true);
          ctaObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observer for testimonial (slide from left)
    const testimonialObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTestimonialVisible(true);
          testimonialObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all cards
    cardsRef.current.forEach((card) => {
      if (card) cardsObserver.observe(card);
    });

    // Observe CTA
    if (ctaRef.current) ctaObserver.observe(ctaRef.current);

    // Observe testimonial
    if (testimonialRef.current) testimonialObserver.observe(testimonialRef.current);

    return () => {
      cardsObserver.disconnect();
      ctaObserver.disconnect();
      testimonialObserver.disconnect();
    };
  }, []);

  const handleEligibilityClick = () => {
    navigate('/eligibility');
  };

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-cream py-20 md:py-[80px] px-6 overflow-hidden"
    >
      {/* Subtle decorative pattern background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              #A1887F 10px,
              #A1887F 20px
            )`,
          }}
        />
      </div>

      <div className="max-w-[1200px] mx-auto relative z-10">
        {/* Heading */}
        <h2 className="text-[28px] md:text-[36px] font-bold text-espresso text-center mb-6 md:mb-[24px]">
          Why Your Donation Matters
        </h2>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              ref={(el) => {
                cardsRef.current[index] = el;
              }}
              className={`bg-white border border-taupe rounded-[12px] p-6 transition-all duration-500 ${
                visibleCards[index]
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              } hover:shadow-lg hover:bg-cream/30 motion-reduce:transition-none`}
            >
              <div className={`${benefit.iconColor} mb-4`}>{benefit.icon}</div>
              <h3 className="text-xl font-bold text-espresso mb-3">{benefit.title}</h3>
              <p className="text-base text-taupe leading-relaxed">{benefit.text}</p>
            </div>
          ))}
        </div>

        {/* Mediterranean decorative elements between cards */}
        <div className="flex justify-center items-center gap-4 mb-12 md:mb-16">
          <div className="w-12 h-12 rounded-full bg-terracotta/10 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-terracotta/30" />
          </div>
          <div className="w-16 h-1 bg-gradient-to-r from-terracotta/20 via-olive-green/30 to-mediterranean-blue/20 rounded-full" />
          <div className="w-12 h-12 rounded-full bg-olive-green/10 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-olive-green/30" />
          </div>
          <div className="w-16 h-1 bg-gradient-to-r from-olive-green/20 via-mediterranean-blue/30 to-terracotta/20 rounded-full" />
          <div className="w-12 h-12 rounded-full bg-mediterranean-blue/10 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-mediterranean-blue/30" />
          </div>
        </div>

        {/* CTA */}
        <div
          ref={ctaRef}
          className={`flex justify-center mb-12 md:mb-16 transition-all duration-700 ${
            ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          } motion-reduce:transition-none`}
        >
          <button
            onClick={handleEligibilityClick}
            className="border-2 border-mediterranean-blue text-mediterranean-blue hover:bg-mediterranean-blue hover:text-white font-bold text-base px-8 py-4 rounded-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-mediterranean-blue focus:ring-opacity-50"
          >
            See If You're Eligible →
          </button>
        </div>

        {/* Testimonial */}
        <div
          ref={testimonialRef}
          className={`bg-white rounded-[12px] p-6 shadow-md border-l-4 border-l-terracotta transition-all duration-700 ${
            testimonialVisible
              ? 'opacity-100 translate-x-0'
              : 'opacity-0 -translate-x-8'
          } motion-reduce:transition-none`}
        >
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {/* Avatar placeholder */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-terracotta/20 to-olive-green/20 flex items-center justify-center border-2 border-terracotta/30">
                <span className="text-2xl">MR</span>
              </div>
            </div>

            {/* Quote and info */}
            <div className="flex-1">
              <blockquote className="text-lg md:text-xl text-espresso italic mb-4 leading-relaxed">
                "Donating blood makes me feel like I'm making a real difference. It's the
                easiest way to be a hero."
              </blockquote>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <p className="text-base font-semibold text-espresso">Marco R., Milan</p>
                <span className="text-sm text-olive-green font-medium">
                  32 donations
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyDonateSection;


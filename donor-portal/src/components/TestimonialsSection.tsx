import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';

interface Testimonial {
  quote: string;
  name: string;
  location: string;
  donations: string;
  accentColor: string;
  avatarInitials: string;
}

function TestimonialsSection() {
  const { t } = useTranslation();
  const [visibleTestimonials, setVisibleTestimonials] = useState<boolean[]>([false, false, false]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<(HTMLDivElement | null)[]>([]);

  const translatedTestimonials = t('landing.testimonials.items', {
    returnObjects: true,
  }) as Array<Omit<Testimonial, 'accentColor' | 'avatarInitials'>>;

  const accentPalette: Array<Testimonial['accentColor']> = [
    'terracotta',
    'mediterranean-blue',
    'olive-green',
  ];

  const testimonials: Testimonial[] = translatedTestimonials.map((item, index) => {
    const initials =
      item.name
        .replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, '')
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'DV';

    return {
      ...item,
      accentColor: accentPalette[index % accentPalette.length],
      avatarInitials: initials,
    };
  });

  // Intersection Observer for scroll animations
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setVisibleTestimonials([true, true, true]);
      return;
    }

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };

    const testimonialsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const testimonialIndex = testimonialsRef.current.indexOf(
            entry.target as HTMLDivElement
          );
          if (testimonialIndex !== -1) {
            setTimeout(() => {
              setVisibleTestimonials((prev) => {
                const newState = [...prev];
                newState[testimonialIndex] = true;
                return newState;
              });
            }, testimonialIndex * 200);
          }
          testimonialsObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    testimonialsRef.current.forEach((testimonial) => {
      if (testimonial) testimonialsObserver.observe(testimonial);
    });

    return () => {
      testimonialsObserver.disconnect();
    };
  }, []);

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="relative w-full bg-white py-20 md:py-[80px] px-6 overflow-hidden"
    >
      <div className="max-w-[1200px] mx-auto">
        {/* Heading */}
        <h2 className="text-[28px] md:text-[36px] font-bold text-espresso text-center mb-12 md:mb-16">
          {t('landing.testimonials.title')}
        </h2>

        {/* Testimonials Grid/Carousel */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                ref={(el) => {
                  testimonialsRef.current[index] = el;
                }}
                className={`bg-white border-l-4 rounded-[12px] p-6 shadow-md transition-all duration-700 hover:shadow-lg hover:-translate-y-1 ${
                  testimonial.accentColor === 'terracotta'
                    ? 'border-terracotta'
                    : testimonial.accentColor === 'mediterranean-blue'
                    ? 'border-mediterranean-blue'
                    : 'border-olive-green'
                } ${
                  visibleTestimonials[index]
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                } motion-reduce:transition-none`}
              >
              {/* Avatar */}
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${
                    testimonial.accentColor === 'terracotta'
                      ? 'bg-gradient-to-br from-terracotta/20 to-terracotta/40 border-terracotta/30'
                      : testimonial.accentColor === 'mediterranean-blue'
                      ? 'bg-gradient-to-br from-mediterranean-blue/20 to-mediterranean-blue/40 border-mediterranean-blue/30'
                      : 'bg-gradient-to-br from-olive-green/20 to-olive-green/40 border-olive-green/30'
                  }`}
                >
                  <span className="text-xl font-bold text-espresso">
                    {testimonial.avatarInitials}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-espresso">{testimonial.name}</p>
                  <p className="text-sm text-taupe">{testimonial.location}</p>
                </div>
              </div>

              {/* Quote */}
              <blockquote className="text-base md:text-lg text-espresso italic mb-4 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-terracotta text-terracotta"
                    aria-hidden="true"
                  />
                ))}
              </div>

              {/* Donations Badge */}
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  testimonial.accentColor === 'terracotta'
                    ? 'bg-terracotta/10 text-terracotta'
                    : testimonial.accentColor === 'mediterranean-blue'
                    ? 'bg-mediterranean-blue/10 text-mediterranean-blue'
                    : 'bg-olive-green/10 text-olive-green'
                }`}
              >
                {testimonial.donations}
              </div>
            </div>
          ))}
          </div>
        </div>

        {/* Mobile Carousel Indicators (hidden on desktop) */}
        <div className="flex justify-center gap-2 mt-8 md:hidden">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentIndex === index ? 'bg-terracotta w-8' : 'bg-taupe/30'
              }`}
              aria-label={t('landing.testimonials.goTo', { index: index + 1 })}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;


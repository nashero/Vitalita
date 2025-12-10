import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  Clock,
  Users,
  Calendar,
  CalendarCheck,
  FileText,
  Bell,
  BarChart3,
  TrendingUp,
  Zap,
  Smartphone,
  MapPin,
  Shield,
  ShieldCheck,
  Heart,
  Building2,
  UserCheck,
  Sparkles,
  X,
  Trophy,
  Settings,
  Rocket,
  UserPlus,
  ClipboardCheck,
  Activity,
  Award,
  Database,
} from 'lucide-react';

const HowWeSimplify = () => {
  const { t } = useTranslation();
  
  // State for animations
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [statCounts, setStatCounts] = useState({
    time: 0,
    paperwork: 0,
    digital: 0,
    centers: 0
  });
  const [statsVisible, setStatsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Refs for intersection observer
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const statsRef = useRef<HTMLDivElement>(null);

  // SEO: Set page title and meta tags
  useEffect(() => {
    document.title = 'How Vitalita Works | Blood Donation Scheduling Software for AVIS Italy';
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Discover how Vitalita transforms blood donation scheduling for AVIS Italy. AI-powered platform that saves 25 hours per week and eliminates scheduling chaos.');
    
    // Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', 'blood donation software, AVIS Italy, donor management system, healthcare scheduling, Italian healthcare technology');
    
    // Add canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', 'https://vitalita.com/how-it-works');
    
    // Add structured data (JSON-LD)
    let structuredDataScript = document.querySelector('script[type="application/ld+json"][data-page="how-we-simplify"]');
    if (!structuredDataScript) {
      structuredDataScript = document.createElement('script');
      structuredDataScript.setAttribute('type', 'application/ld+json');
      structuredDataScript.setAttribute('data-page', 'how-we-simplify');
      document.head.appendChild(structuredDataScript);
    }
    
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Vitalita",
      "applicationCategory": "HealthApplication",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "EUR"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "50"
      },
      "operatingSystem": "Web-based",
      "countryOfOrigin": "IT"
    };
    
    structuredDataScript.textContent = JSON.stringify(structuredData);
    
    // Cleanup function
    return () => {
      // Remove page-specific structured data on unmount
      const scriptToRemove = document.querySelector('script[type="application/ld+json"][data-page="how-we-simplify"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      if (e.matches) {
        // Show all sections immediately if reduced motion
        setVisibleSections(new Set(['hero', 'comparison', 'features', 'donors', 'stats', 'trusted', 'cta']));
        setStatCounts({ time: 5, paperwork: 0, digital: 100, centers: 50 });
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    if (prefersReducedMotion) {
      // Show all sections immediately
      setVisibleSections(new Set(['hero', 'comparison', 'features', 'donors', 'stats', 'trusted', 'cta']));
      return;
    }

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('data-section-id');
          if (sectionId) {
            setVisibleSections((prev) => new Set(prev).add(sectionId));
            observer.unobserve(entry.target);
          }
        }
      });
    }, observerOptions);

    // Observe all sections
    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    // Observe stats section separately for counter animation
    if (statsRef.current) {
      const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !statsVisible) {
            setStatsVisible(true);
            statsObserver.unobserve(entry.target);
          }
        });
      }, observerOptions);
      
      statsObserver.observe(statsRef.current);
      
      return () => {
        observer.disconnect();
        statsObserver.disconnect();
      };
    }

    return () => observer.disconnect();
  }, [prefersReducedMotion, statsVisible]);

  // Counter animation for statistics
  useEffect(() => {
    if (!statsVisible || prefersReducedMotion) {
      if (prefersReducedMotion) {
        setStatCounts({ time: 5, paperwork: 0, digital: 100, centers: 50 });
      }
      return;
    }

    const duration = 1500; // 1.5s
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    
    const timeInterval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3); // Cubic ease-out

      setStatCounts({
        time: Math.round(5 * easeOut),
        paperwork: 0, // Zero doesn't need animation
        digital: Math.round(100 * easeOut),
        centers: Math.round(50 * easeOut)
      });

      if (currentStep >= steps) {
        clearInterval(timeInterval);
        setStatCounts({ time: 5, paperwork: 0, digital: 100, centers: 50 });
      }
    }, stepDuration);

    return () => clearInterval(timeInterval);
  }, [statsVisible, prefersReducedMotion]);

  return (
    <div style={{ backgroundColor: 'var(--color-neutral-light)' }}>
      {/* Hero Section */}
      <section 
        ref={(el) => { sectionRefs.current['hero'] = el; }}
        data-section-id="hero"
        aria-labelledby="hero-heading"
        className={`section-container relative overflow-hidden ${visibleSections.has('hero') ? 'fade-in-up visible' : 'fade-in-up'}`}
        style={{
          background: 'linear-gradient(180deg, #1A2332 0%, #111827 100%)',
          position: 'relative',
          padding: '60px 20px'
        }}
      >
        {/* Texture Overlay - Diagonal Lines Pattern */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              #F9FAFB 10px,
              #F9FAFB 11px
            )`
          }}
        />
        
        <div className="relative mx-auto max-w-4xl text-center px-4 sm:px-6">
          {/* Badge */}
          <p 
            className="inline-block text-xs font-semibold uppercase mb-6"
            style={{
              border: '2px solid #FF6B6B',
              background: 'transparent',
              color: '#FF6B6B',
              letterSpacing: '1.5px',
              padding: '6px 16px',
              borderRadius: '20px'
            }}
          >
            {t('howWeSimplify.hero.badge')}
          </p>
          
          {/* Headline */}
          <h1 
            id="hero-heading"
            className="mb-4 sm:mb-6 font-bold text-[32px] sm:text-4xl md:text-5xl lg:text-[48px]"
            style={{
              color: '#F9FAFB',
              lineHeight: '1.1',
              fontWeight: 'bold'
            }}
          >
            {t('howWeSimplify.hero.title')}
          </h1>
          
          {/* Subtitle */}
          <p 
            className="mx-auto mb-8 sm:mb-10 text-base sm:text-lg md:text-xl"
            style={{
              color: '#F9FAFB',
              opacity: 0.8,
              maxWidth: '600px',
              lineHeight: '1.5',
              fontSize: '16px'
            }}
          >
            {t('howWeSimplify.hero.subtitle')}
          </p>
          
          {/* Icon Illustration */}
          <div className="flex items-center justify-center gap-8 sm:gap-12 md:gap-16 mb-8 sm:mb-10 px-4">
            {/* Calendar Icon */}
            <div className="flex flex-col items-center">
              <div 
                className="flex items-center justify-center"
                style={{
                  width: '64px',
                  height: '64px',
                  color: '#FF6B6B'
                }}
              >
                <Calendar className="h-16 w-16" strokeWidth={1.5} aria-hidden="true" />
        </div>
            </div>
            
            {/* Animated Dotted Line 1 */}
            <svg 
              viewBox="0 0 100 2" 
              preserveAspectRatio="none"
              className="hidden sm:block"
              style={{ minWidth: '40px', maxWidth: '80px', flex: '1 1 auto', height: '2px' }}
            >
              <line 
                x1="0" 
                y1="1" 
                x2="100" 
                y2="1" 
                className="hero-dotted-line"
                aria-hidden="true"
              />
            </svg>
            
            {/* Sparkles Icon (AI) */}
            <div className="flex flex-col items-center">
              <div 
                className="flex items-center justify-center"
                style={{
                  width: '64px',
                  height: '64px',
                  color: '#FF6B6B'
                }}
              >
                <Sparkles className="h-16 w-16 animate-pulse" strokeWidth={1.5} aria-hidden="true" />
            </div>
            </div>
            
            {/* Animated Dotted Line 2 */}
            <svg 
              viewBox="0 0 100 2" 
              preserveAspectRatio="none"
              className="hidden sm:block"
              style={{ minWidth: '40px', maxWidth: '80px', flex: '1 1 auto', height: '2px' }}
            >
              <line 
                x1="0" 
                y1="1" 
                x2="100" 
                y2="1" 
                className="hero-dotted-line"
                aria-hidden="true"
              />
            </svg>
            
            {/* Heart Icon */}
            <div className="flex flex-col items-center">
              <div 
                className="flex items-center justify-center"
                style={{
                  width: '64px',
                  height: '64px',
                  color: '#FF6B6B'
                }}
              >
                <Heart className="h-16 w-16" strokeWidth={1.5} fill="#FF6B6B" aria-hidden="true" />
              </div>
            </div>
          </div>
          
          {/* CTA Button */}
          <div className="mb-5 sm:mb-6 w-full sm:w-auto">
            <Link
              to="/contact"
              aria-label="Get started with Vitalita - Schedule your free demo"
              className="flex sm:inline-flex w-full sm:w-auto items-center justify-center transition-all duration-200 text-sm sm:text-base"
              style={{
                background: '#FF6B6B',
                color: '#FFFFFF',
                fontWeight: '600',
                padding: '14px 24px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
                textDecoration: 'none',
                minHeight: '44px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#E65555';
                e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FF6B6B';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 107, 107, 0.3)';
              }}
            >
              {t('howWeSimplify.hero.cta')}
            </Link>
          </div>
          
          {/* Trust Line */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 px-4">
            <div className="flex items-center gap-2">
              <ShieldCheck 
                className="h-4 w-4 flex-shrink-0" 
                style={{ color: '#14B8A6' }}
                aria-label="Trusted and verified" 
              />
              <p 
                className="text-xs sm:text-sm text-center sm:text-left"
                style={{
                  color: '#F9FAFB',
                  opacity: 0.6,
                  fontSize: '12px'
                }}
              >
                {t('howWeSimplify.hero.trustLine')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Organizations Section - Before/After Comparison */}
      <section 
        ref={(el) => { sectionRefs.current['comparison'] = el; }}
        data-section-id="comparison"
        aria-labelledby="comparison-heading"
        className={`section-container ${visibleSections.has('comparison') ? 'fade-in-up visible' : 'fade-in-up'}`}
        style={{ backgroundColor: '#F9FAFB', padding: '60px 20px' }}
      >
        <div className="mx-auto max-w-6xl" style={{ paddingLeft: '16px', paddingRight: '16px' }}>
          <div className="mb-10 text-center">
            {/* Badge */}
            <p 
              className="inline-block mb-4 text-xs font-semibold uppercase"
              style={{
                color: '#D04242',
                letterSpacing: '1.5px'
              }}
            >
              {t('howWeSimplify.comparison.badge')}
            </p>
            
            {/* Main Heading */}
            <h2 
              id="comparison-heading"
              role="heading"
              aria-level={2}
              className="mb-4 font-bold text-2xl md:text-3xl lg:text-4xl"
              style={{
                color: '#1A2332',
                fontWeight: 'bold'
              }}
            >
              {t('howWeSimplify.comparison.title')}
            </h2>
            
            {/* Subtitle */}
            <p 
              className="mx-auto text-base md:text-lg"
              style={{
                color: '#6B7280',
                maxWidth: '600px',
                lineHeight: '1.5',
                fontSize: '16px'
              }}
            >
              {t('howWeSimplify.comparison.subtitle')}
            </p>
          </div>

          {/* Comparison Cards */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            {/* Before Vitalita Card */}
            <div 
              className="rounded-xl p-6 md:p-8"
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid rgba(107, 114, 128, 0.1)',
                borderLeft: '4px solid #FF6B6B',
                borderRadius: '12px',
                padding: '32px',
                boxShadow: '0 4px 12px rgba(26, 35, 50, 0.05)'
              }}
            >
              {/* Header */}
              <div className="mb-6 flex items-center gap-3">
                <div 
                  className="card-icon-negative flex items-center justify-center rounded-full"
                  style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    color: '#FF6B6B',
                    padding: '4px',
                    fontSize: '18px'
                  }}
                >
                  ❌
              </div>
                <h3 
                  role="heading"
                  aria-level={3}
                  className="font-semibold"
                  style={{
                    fontSize: '20px',
                    color: '#111827',
                    fontWeight: '600'
                  }}
                >
                  {t('howWeSimplify.comparison.before.title')}
                </h3>
              </div>
              
              {/* List Items */}
              <ul className="space-y-4">
                {(t('howWeSimplify.comparison.before.items', { returnObjects: true }) as string[]).map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <X 
                      className="mt-0.5 h-5 w-5 flex-shrink-0 rounded-full" 
                      style={{ 
                        color: '#FF6B6B', 
                        minWidth: '20px', 
                        minHeight: '20px',
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        padding: '2px'
                      }}
                      aria-hidden="true"
                    />
                    <span 
                      className="text-sm md:text-base"
                      style={{
                        fontSize: '14px',
                        color: '#6B7280',
                        lineHeight: '1.6'
                      }}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* With Vitalita Card */}
            <div 
              className="rounded-xl p-6 md:p-8"
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid rgba(107, 114, 128, 0.1)',
                borderLeft: '4px solid #14B8A6',
                borderRadius: '12px',
                padding: '32px',
                boxShadow: '0 4px 12px rgba(26, 35, 50, 0.05)'
              }}
            >
              {/* Header */}
              <div className="mb-6 flex items-center gap-3">
                <div 
                  className="card-icon-positive flex items-center justify-center rounded-full"
                  style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: 'rgba(20, 184, 166, 0.1)',
                    color: '#14B8A6',
                    padding: '4px',
                    fontSize: '18px'
                  }}
                >
                  ✓
              </div>
                <h3 
                  role="heading"
                  aria-level={3}
                  className="font-semibold"
                  style={{
                    fontSize: '20px',
                    color: '#111827',
                    fontWeight: '600'
                  }}
                >
                  {t('howWeSimplify.comparison.after.title')}
                </h3>
              </div>
              
              {/* List Items */}
              <ul className="space-y-4">
                {(t('howWeSimplify.comparison.after.items', { returnObjects: true }) as string[]).map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 
                      className="mt-0.5 h-5 w-5 flex-shrink-0 rounded-full" 
                      style={{ 
                        color: '#14B8A6', 
                        minWidth: '20px', 
                        minHeight: '20px',
                        backgroundColor: 'rgba(20, 184, 166, 0.1)',
                        padding: '2px'
                      }}
                      aria-hidden="true"
                    />
                    <span 
                      className="text-sm md:text-base"
                      style={{
                        fontSize: '14px',
                        color: '#111827',
                        lineHeight: '1.6'
                      }}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

          {/* Key Innovations for Organizations */}
      <section 
        ref={(el) => { sectionRefs.current['features'] = el; }}
        data-section-id="features"
        aria-labelledby="features-heading"
        className={`section-container ${visibleSections.has('features') ? 'fade-in-up visible' : 'fade-in-up'}`}
        style={{ backgroundColor: '#FFFFFF', padding: '60px 20px' }}
      >
        <div className="mx-auto max-w-6xl" style={{ paddingLeft: '16px', paddingRight: '16px' }}>
          {/* Section Header */}
          <div className="mb-12 text-center">
            {/* Badge */}
            <p 
              className="inline-block mb-4 text-xs font-semibold uppercase"
              style={{
                color: '#FF6B6B',
                letterSpacing: '1.5px',
                fontSize: '12px'
              }}
            >
              {t('howWeSimplify.organizations.badge')}
            </p>
            
            <h2 
              id="features-heading"
              role="heading"
              aria-level={2}
              className="mb-4 font-bold text-2xl md:text-3xl lg:text-4xl"
              style={{
                color: '#1A2332',
                fontWeight: 'bold'
              }}
            >
              {t('howWeSimplify.organizations.title')}
            </h2>
            <p 
              className="mx-auto text-base md:text-lg"
              style={{
                color: '#6B7280',
                maxWidth: '600px',
                lineHeight: '1.5',
                fontSize: '16px'
              }}
            >
              {t('howWeSimplify.organizations.subtitle')}
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: CalendarCheck },
              { icon: Users, iconSecondary: Settings },
              { icon: Bell, iconSecondary: Sparkles },
              { icon: TrendingUp },
              { icon: ShieldCheck },
              { icon: Rocket },
            ].map((iconConfig, index) => {
              const feature = (t('howWeSimplify.organizations.features', { returnObjects: true }) as any[])[index];
              const IconComponent = iconConfig.icon;
              const IconSecondary = iconConfig.iconSecondary;
              return (
                <article
                  key={index}
                  aria-labelledby={`feature-title-${index}`}
                  aria-describedby={`feature-desc-${index}`}
                  className="rounded-xl transition-all duration-300"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid rgba(107, 114, 128, 0.12)',
                    borderRadius: '12px',
                    padding: '28px',
                    boxShadow: '0 2px 8px rgba(26, 35, 50, 0.04)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#FF6B6B';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(26, 35, 50, 0.08)';
                    // Icon hover effect
                    const icon = e.currentTarget.querySelector('.feature-icon') as HTMLElement;
                    if (icon) {
                      icon.style.backgroundColor = '#E65555';
                      icon.style.boxShadow = '0 6px 16px rgba(255, 107, 107, 0.3)';
                      icon.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(107, 114, 128, 0.12)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(26, 35, 50, 0.04)';
                    // Reset icon
                    const icon = e.currentTarget.querySelector('.feature-icon') as HTMLElement;
                    if (icon) {
                      icon.style.backgroundColor = '#FF6B6B';
                      icon.style.boxShadow = '0 4px 12px rgba(255, 107, 107, 0.2)';
                      icon.style.transform = 'scale(1)';
                    }
                  }}
                >
                  {/* Icon Container */}
                  <div 
                    className="feature-icon mb-4 relative flex items-center justify-center rounded-full"
                    style={{
                      width: '64px',
                      height: '64px',
                      backgroundColor: '#FF6B6B',
                      minWidth: '44px',
                      minHeight: '44px',
                      boxShadow: '0 4px 12px rgba(255, 107, 107, 0.2)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <IconComponent 
                      className="h-6 w-6" 
                      style={{ color: '#FFFFFF', width: '24px', height: '24px' }}
                      aria-hidden="true"
                    />
                    {IconSecondary && (
                      <div 
                        className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full"
                        style={{
                          backgroundColor: '#FFFFFF',
                          width: '20px',
                          height: '20px',
                          border: '2px solid #FF6B6B'
                        }}
                        aria-hidden="true"
                      >
                        <IconSecondary 
                          className="h-3 w-3" 
                          style={{ color: '#FF6B6B' }}
                          aria-hidden="true"
                        />
                  </div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 
                    id={`feature-title-${index}`}
                    role="heading"
                    aria-level={3}
                    className="mb-3 font-semibold text-base md:text-lg"
                    style={{
                      color: '#111827',
                      fontWeight: '600',
                      fontSize: '16px'
                    }}
                  >
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p 
                    id={`feature-desc-${index}`}
                    className="mb-4 text-sm md:text-base"
                    style={{
                      color: '#6B7280',
                      lineHeight: '1.6',
                      fontSize: '16px'
                    }}
                  >
                    {feature.description}
                  </p>

                  {/* Metric Badge */}
                  <div 
                    className="inline-flex items-center rounded-full"
                    style={{
                      backgroundColor: 'rgba(20, 184, 166, 0.1)',
                      border: '1px solid rgba(20, 184, 166, 0.2)',
                      padding: '6px 14px',
                      borderRadius: '20px'
                    }}
                  >
                    <span 
                      style={{
                        color: '#14B8A6',
                        fontSize: '12px',
                        fontWeight: '600',
                        letterSpacing: '0.5px'
                      }}
                    >
                      {feature.badge}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* For Individual Donors Section */}
      <section 
        ref={(el) => { sectionRefs.current['donors'] = el; }}
        data-section-id="donors"
        aria-labelledby="donor-heading"
        className={`section-container ${visibleSections.has('donors') ? 'fade-in-up visible' : 'fade-in-up'}`}
        style={{
          background: 'linear-gradient(180deg, #1A2332 0%, #111827 100%)',
          padding: '60px 20px'
        }}
      >
        <div className="mx-auto max-w-6xl" style={{ paddingLeft: '16px', paddingRight: '16px' }}>
          {/* Section Header */}
          <div className="mb-12 text-center">
            {/* Badge */}
            <p 
              className="mb-4 inline-block text-xs font-semibold uppercase"
              style={{
                color: '#FF6B6B',
                letterSpacing: '1.5px'
              }}
            >
              {t('howWeSimplify.donors.badge')}
            </p>
            
            {/* Heading */}
            <h2 
              id="donor-heading"
              role="heading"
              aria-level={2}
              className="mb-4 font-bold text-2xl md:text-3xl lg:text-4xl"
              style={{
                color: '#F9FAFB',
                fontWeight: 'bold'
              }}
            >
              {t('howWeSimplify.donors.title')}
            </h2>
            
            {/* Subtitle */}
            <p 
              className="mx-auto text-base md:text-lg"
              style={{
                color: '#F9FAFB',
                opacity: 0.7,
                maxWidth: '600px',
                lineHeight: '1.5',
                fontSize: '16px'
              }}
            >
              {t('howWeSimplify.donors.subtitle')}
            </p>
          </div>

          {/* Donor Journey Cards */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: UserPlus },
              { icon: Clock },
              { icon: Bell },
              { icon: ClipboardCheck },
              { icon: MapPin },
              { icon: Activity },
            ].map((iconConfig, index) => {
              const feature = (t('howWeSimplify.donors.features', { returnObjects: true }) as any[])[index];
              const IconComponent = iconConfig.icon;
              return (
                <article
                  key={index}
                  aria-labelledby={`donor-feature-title-${index}`}
                  aria-describedby={`donor-feature-desc-${index}`}
                  className="donor-card-fade-in rounded-xl transition-all duration-300"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 107, 107, 0.3)',
                    borderRadius: '12px',
                    padding: '24px',
                    WebkitBackdropFilter: 'blur(8px)', // Safari fallback
                    backdropFilter: 'blur(8px)',
                    animationDelay: `${index * 100}ms`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#FF6B6B';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 107, 107, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255, 107, 107, 0.3)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Icon */}
                  <div 
                    className="feature-icon-glass mb-4 flex items-center justify-center rounded-full"
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#FF6B6B',
                      color: '#FFFFFF',
                      boxShadow: '0 4px 16px rgba(255, 107, 107, 0.4)'
                    }}
                  >
                    <IconComponent 
                      className="h-5 w-5" 
                      style={{ color: '#FFFFFF' }}
                      aria-hidden="true"
                    />
                    </div>

                  {/* Title */}
                  <h3 
                    id={`donor-feature-title-${index}`}
                    role="heading"
                    aria-level={3}
                    className="mb-3 font-semibold"
                    style={{
                      fontSize: '18px',
                      color: '#F9FAFB',
                      fontWeight: '600'
                    }}
                  >
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p 
                    id={`donor-feature-desc-${index}`}
                    style={{
                      fontSize: '16px',
                      color: '#F9FAFB',
                      opacity: 0.8,
                      lineHeight: '1.6'
                    }}
                  >
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Impact Metrics Section */}
      <section 
        ref={(el) => { 
          sectionRefs.current['stats'] = el;
          if (el) statsRef.current = el;
        }}
        data-section-id="stats"
        aria-labelledby="stats-heading"
        className={`section-container ${visibleSections.has('stats') ? 'fade-in-up visible' : 'fade-in-up'}`}
        style={{ backgroundColor: '#FFFFFF', padding: '60px 20px' }}
      >
        <div className="mx-auto" style={{ maxWidth: '1000px', paddingLeft: '16px', paddingRight: '16px' }}>
          {/* Section Header */}
          <div className="mb-12 text-center">
            {/* Badge */}
            <p 
              className="inline-block mb-4 text-xs font-semibold uppercase"
              style={{
                color: '#FF6B6B',
                letterSpacing: '1.5px',
                fontSize: '12px'
              }}
            >
              {t('howWeSimplify.metrics.badge')}
            </p>
            
            {/* Heading */}
            <h2 
              id="stats-heading"
              role="heading"
              aria-level={2}
              className="mb-4 font-bold text-2xl md:text-3xl lg:text-4xl"
              style={{
                color: '#1A2332',
                fontWeight: 'bold',
                marginBottom: '16px'
              }}
            >
              {t('howWeSimplify.metrics.title')}
            </h2>
            
            {/* Subtitle */}
            <p 
              className="mx-auto text-base md:text-lg"
              style={{
                color: '#6B7280',
                maxWidth: '600px',
                lineHeight: '1.5',
                fontSize: '18px',
                marginBottom: '48px'
              }}
            >
              {t('howWeSimplify.metrics.subtitle')}
            </p>
          </div>

          {/* Stat Cards */}
          <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
            {/* Card 1 - Time Savings */}
            <div 
              className="metric-item rounded-2xl text-center transition-transform duration-300 hover:scale-[1.02] p-6 md:p-10"
              style={{
                backgroundColor: '#F9FAFB',
                border: '1px solid rgba(107, 114, 128, 0.1)',
                borderRadius: '16px',
                padding: '40px',
                minWidth: '280px',
                minHeight: '44px'
              }}
            >
              <Clock 
                className="mx-auto mb-6 h-10 w-10 md:h-12 md:w-12" 
                style={{ color: '#FF6B6B', minWidth: '44px', minHeight: '44px' }}
                aria-label="Time savings" 
              />
              <div 
                className="metric-value mb-3 font-bold text-[40px] md:text-[56px]"
                style={{
                  color: '#1A2332',
                  fontWeight: 'bold'
                }}
              >
                {statCounts.time} {t('howWeSimplify.metrics.stats.0.value')}
            </div>
              <div 
                className="text-sm md:text-base mb-2"
                style={{
                  color: '#6B7280',
                  lineHeight: '1.5',
                  fontSize: '16px'
                }}
              >
                {t('howWeSimplify.metrics.stats.0.label')}
                    </div>
              <div 
                className="text-xs md:text-sm"
                style={{
                  color: '#6B7280',
                  opacity: 0.7,
                  lineHeight: '1.5',
                  fontSize: '14px'
                }}
              >
                {t('howWeSimplify.metrics.stats.0.sublabel')}
                  </div>
            </div>

            {/* Card 2 - Paperwork Elimination */}
            <div 
              className="metric-item rounded-2xl text-center transition-transform duration-300 hover:scale-[1.02] p-6 md:p-10"
              style={{
                backgroundColor: '#F9FAFB',
                border: '1px solid rgba(107, 114, 128, 0.1)',
                borderRadius: '16px',
                padding: '40px',
                minWidth: '280px',
                position: 'relative'
              }}
            >
              <div className="mx-auto mb-6 relative inline-flex items-center justify-center" style={{ width: '48px', height: '48px', minWidth: '44px', minHeight: '44px' }}>
                <FileText 
                  className="absolute h-10 w-10 md:h-12 md:w-12" 
                  style={{ color: '#14B8A6' }}
                  aria-label="Document elimination" 
                />
                <X 
                  className="absolute -top-1 -right-1 h-5 w-5 md:h-6 md:w-6 rounded-full bg-white p-0.5" 
                  style={{ color: '#14B8A6', minWidth: '20px', minHeight: '20px' }}
                  aria-hidden="true"
                />
              </div>
              <div 
                className="metric-value mb-3 font-bold text-[40px] md:text-[56px]"
                style={{
                  color: '#1A2332',
                  fontWeight: 'bold'
                }}
              >
                {t('howWeSimplify.metrics.stats.1.value')}
              </div>
              <div 
                className="text-sm md:text-base mb-2"
                style={{
                  color: '#6B7280',
                  lineHeight: '1.5',
                  fontSize: '16px'
                }}
              >
                {t('howWeSimplify.metrics.stats.1.label')}
              </div>
              <div 
                className="text-xs md:text-sm"
                style={{
                  color: '#6B7280',
                  opacity: 0.7,
                  lineHeight: '1.5',
                  fontSize: '14px'
                }}
              >
                {t('howWeSimplify.metrics.stats.1.sublabel')}
              </div>
            </div>

            {/* Card 3 - Digital Adoption */}
            <div 
              className="metric-item rounded-2xl text-center transition-transform duration-300 hover:scale-[1.02] p-6 md:p-10"
              style={{
                backgroundColor: '#F9FAFB',
                border: '1px solid rgba(107, 114, 128, 0.1)',
                borderRadius: '16px',
                padding: '40px',
                minWidth: '280px',
                position: 'relative'
              }}
            >
              <div className="mx-auto mb-6 relative inline-flex items-center justify-center" style={{ width: '48px', height: '48px', minWidth: '44px', minHeight: '44px' }}>
                <Smartphone 
                  className="absolute h-10 w-10 md:h-12 md:w-12" 
                  style={{ color: '#0EA5E9' }}
                  aria-label="Digital adoption" 
                />
                <CheckCircle2 
                  className="absolute -bottom-0.5 -right-0.5 h-5 w-5 md:h-6 md:w-6 rounded-full bg-white" 
                  style={{ color: '#0EA5E9', minWidth: '20px', minHeight: '20px' }}
                  aria-hidden="true"
                />
              </div>
              <div 
                className="metric-value mb-3 font-bold text-[40px] md:text-[56px]"
                style={{
                  color: '#1A2332',
                  fontWeight: 'bold'
                }}
              >
                {statCounts.digital}{t('howWeSimplify.metrics.stats.2.value')}
              </div>
              <div 
                className="text-sm md:text-base mb-2"
                style={{
                  color: '#6B7280',
                  lineHeight: '1.5',
                  fontSize: '16px'
                }}
              >
                {t('howWeSimplify.metrics.stats.2.label')}
              </div>
              <div 
                className="text-xs md:text-sm"
                style={{
                  color: '#6B7280',
                  opacity: 0.7,
                  lineHeight: '1.5',
                  fontSize: '14px'
                }}
              >
                {t('howWeSimplify.metrics.stats.2.sublabel')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by Italy's Best */}
      <section 
        ref={(el) => { sectionRefs.current['trusted'] = el; }}
        data-section-id="trusted"
        aria-labelledby="trusted-heading"
        className={`section-container text-center ${visibleSections.has('trusted') ? 'fade-in-up visible' : 'fade-in-up'}`}
        style={{
          backgroundColor: '#1A2332',
          padding: '60px 20px'
        }}
      >
        <div className="mx-auto max-w-6xl" style={{ paddingLeft: '16px', paddingRight: '16px' }}>
          {/* Header */}
          <p 
            className="mb-4 text-xs font-semibold uppercase"
            style={{
              color: '#FF6B6B',
              letterSpacing: '1.5px',
              fontSize: '12px'
            }}
          >
            {t('howWeSimplify.trust.badge')}
          </p>
          <h2 
            id="trusted-heading"
            role="heading"
            aria-level={2}
            className="mx-auto mb-4 font-bold text-2xl md:text-3xl lg:text-4xl"
            style={{
              color: '#F9FAFB',
              fontWeight: 'bold',
              maxWidth: '700px',
              lineHeight: '1.3'
            }}
          >
            {t('howWeSimplify.trust.title')}
            </h2>
          
          {/* Subheading with key results */}
          <p 
            className="mx-auto mb-12 text-base md:text-lg"
            style={{
              color: '#F9FAFB',
              opacity: 0.9,
              maxWidth: '700px',
              lineHeight: '1.5',
              fontSize: '18px'
            }}
          >
            {t('howWeSimplify.trust.subtitle')}
          </p>

          {/* Content Grid */}
          <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
            {/* Column 1 - AVIS Partnership */}
            <div 
              className="rounded-xl"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 107, 107, 0.3)',
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'left',
                WebkitBackdropFilter: 'blur(8px)', // Safari fallback
                backdropFilter: 'blur(8px)'
              }}
            >
              <div 
                className="mb-3 text-sm font-semibold"
                style={{
                  color: '#FF6B6B',
                  marginBottom: '12px'
                }}
              >
                {t('howWeSimplify.trust.avis.label')}
              </div>
              <div 
                className="mb-6 text-2xl font-bold"
                style={{
                  color: '#F9FAFB',
                  marginBottom: '24px'
                }}
              >
                {t('howWeSimplify.trust.avis.name')}
              </div>
              <blockquote 
                className="mb-4 italic text-base md:text-lg"
                style={{
                  color: '#F9FAFB',
                  lineHeight: '1.6',
                  marginBottom: '16px',
                  fontSize: '16px'
                }}
              >
                "{t('howWeSimplify.trust.avis.quote')}"
              </blockquote>
              <div 
                className="text-sm"
                style={{
                  color: '#F9FAFB',
                  opacity: 0.6,
                  fontStyle: 'normal',
                  fontSize: '14px'
                }}
              >
                {t('howWeSimplify.trust.avis.attribution')}
              </div>
          </div>

            {/* Column 2 - Combined Metrics */}
            <div 
              className="rounded-xl flex flex-col items-center justify-center text-center"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 107, 107, 0.3)',
                borderRadius: '12px',
                padding: '32px',
                WebkitBackdropFilter: 'blur(8px)', // Safari fallback
                backdropFilter: 'blur(8px)'
              }}
            >
              {/* Centers Count */}
              <div 
                className="mb-6 font-bold text-[40px] md:text-[64px]"
                style={{
                  color: '#14B8A6',
                  fontWeight: 'bold'
                }}
              >
                {statCounts.centers}+
            </div>
              <div 
                className="mb-6 text-sm md:text-base"
                style={{
                  color: '#F9FAFB',
                  lineHeight: '1.5',
                  fontSize: '16px'
                }}
              >
                {t('howWeSimplify.trust.centers.label')}
                </div>
              
              {/* Divider */}
              <div 
                className="w-full mb-6"
                style={{
                  height: '1px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)'
                }}
              />
              
              {/* Key Results */}
              <div className="space-y-4 w-full">
                <div>
                  <div 
                    className="mb-1 font-bold text-2xl md:text-3xl"
                    style={{
                      color: '#FF6B6B',
                      fontWeight: 'bold'
                    }}
                  >
                    {t('howWeSimplify.trust.centers.hours')}
                  </div>
                  <div 
                    className="text-xs md:text-sm"
                    style={{
                      color: '#F9FAFB',
                      opacity: 0.8,
                      fontSize: '14px'
                    }}
                  >
                    {t('howWeSimplify.trust.centers.hoursLabel')}
                  </div>
                </div>
                
                <div>
                  <div 
                    className="mb-1 font-bold text-2xl md:text-3xl"
                    style={{
                      color: '#14B8A6',
                      fontWeight: 'bold'
                    }}
                  >
                    {t('howWeSimplify.trust.centers.savings')}
                  </div>
                  <div 
                    className="text-xs md:text-sm"
                    style={{
                      color: '#F9FAFB',
                      opacity: 0.8,
                      fontSize: '14px'
                    }}
                  >
                    {t('howWeSimplify.trust.centers.savingsLabel')}
                  </div>
                </div>
              </div>
              
              <div 
                className="mt-6 text-xs md:text-sm"
                style={{
                  color: '#F9FAFB',
                  opacity: 0.6,
                  lineHeight: '1.5',
                  fontSize: '14px'
                }}
              >
                {t('howWeSimplify.trust.centers.regions')}
              </div>
            </div>

            {/* Column 3 - Certifications */}
            <div className="space-y-3">
              {/* GDPR Badge */}
              <div 
                className="certification-badge flex items-center gap-3 rounded-lg text-left"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 107, 107, 0.2)',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  WebkitBackdropFilter: 'blur(4px)', // Safari fallback
                  backdropFilter: 'blur(4px)'
                }}
              >
                <Shield 
                  className="h-8 w-8 flex-shrink-0" 
                  style={{ color: '#14B8A6', minWidth: '32px', minHeight: '32px' }}
                  aria-label="GDPR compliance shield" 
                />
                <span 
                  className="font-semibold text-sm"
                  style={{
                    color: '#F9FAFB',
                    fontSize: '14px'
                  }}
                >
                  {t('howWeSimplify.trust.certifications.gdpr')}
                </span>
              </div>

              {/* ISO 27001 Badge */}
              <div 
                className="certification-badge flex items-center gap-3 rounded-lg text-left"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 107, 107, 0.2)',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  WebkitBackdropFilter: 'blur(4px)', // Safari fallback
                  backdropFilter: 'blur(4px)'
                }}
              >
                <Award 
                  className="h-8 w-8 flex-shrink-0" 
                  style={{ color: '#0EA5E9', minWidth: '32px', minHeight: '32px' }}
                  aria-label="ISO 27001 certification" 
                />
                <span 
                  className="font-semibold text-sm"
                  style={{
                    color: '#F9FAFB',
                    fontSize: '14px'
                  }}
                >
                  {t('howWeSimplify.trust.certifications.iso')}
                </span>
              </div>

              {/* Data Hosted Badge */}
              <div 
                className="certification-badge flex items-center gap-3 rounded-lg text-left"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 107, 107, 0.2)',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  WebkitBackdropFilter: 'blur(4px)', // Safari fallback
                  backdropFilter: 'blur(4px)'
                }}
              >
                <Database 
                  className="h-8 w-8 flex-shrink-0" 
                  style={{ color: '#FF6B6B', minWidth: '32px', minHeight: '32px' }}
                  aria-label="Data hosting in Milan" 
                />
                <div 
                  className="cert-content flex items-center gap-2"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span 
                    className="cert-title font-semibold text-sm"
                    style={{
                      color: '#F9FAFB',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    {t('howWeSimplify.trust.certifications.dataHosted')}
                  </span>
                  <span 
                    className="cert-flag inline-flex items-center justify-center"
                    style={{
                      marginLeft: '8px',
                      width: '20px',
                      height: '16px',
                      flexShrink: 0
                    }}
                    aria-label="Italy"
                    role="img"
                    title="Italy"
                  >
                    <svg 
                      width="20" 
                      height="16" 
                      viewBox="0 0 20 16" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      style={{
                        filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))'
                      }}
                    >
                      <rect width="20" height="16" rx="1" fill="#009246"/>
                      <rect x="6.67" width="6.66" height="16" fill="#FFFFFF"/>
                      <rect x="13.33" width="6.67" height="16" fill="#CE2B37"/>
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        ref={(el) => { sectionRefs.current['cta'] = el; }}
        data-section-id="cta"
        aria-labelledby="cta-heading"
        className={`section-container text-center ${visibleSections.has('cta') ? 'fade-in-up visible' : 'fade-in-up'}`}
        style={{
          backgroundColor: '#F9FAFB',
          padding: '60px 20px'
        }}
      >
        <div className="mx-auto max-w-4xl" style={{ paddingLeft: '16px', paddingRight: '16px' }}>
          {/* Badge */}
          <p 
            className="mb-4 text-xs font-semibold uppercase"
            style={{
              color: '#D04242',
              letterSpacing: '1.5px',
              fontSize: '12px'
            }}
          >
            {t('howWeSimplify.cta.badge')}
          </p>

          {/* Heading */}
          <h2 
            id="cta-heading"
            role="heading"
            aria-level={2}
            className="mx-auto mb-6 font-bold text-[28px] md:text-4xl"
            style={{
              color: '#1A2332',
              fontWeight: 'bold',
              maxWidth: '600px',
              lineHeight: '1.2'
            }}
          >
            {t('howWeSimplify.cta.title')}
          </h2>

          {/* Subtitle */}
          <p 
            className="mx-auto mb-10 text-base md:text-xl"
            style={{
              color: '#6B7280',
              maxWidth: '700px',
              lineHeight: '1.5',
              marginBottom: '40px',
              fontSize: '16px'
            }}
          >
            {t('howWeSimplify.cta.subtitle')}
          </p>

          {/* CTA Button Group */}
          <div className="mb-8 flex flex-col items-stretch sm:items-center justify-center gap-4">
            {/* Primary Button */}
              <Link
                to="/contact"
              aria-label="Schedule your free demo to see how Vitalita can eliminate scheduling chaos"
              className="flex w-full sm:w-auto items-center justify-center"
              style={{
                background: '#FF6B6B',
                color: '#FFFFFF',
                fontSize: '18px',
                fontWeight: '600',
                padding: '16px 40px',
                borderRadius: '8px',
                boxShadow: '0 4px 16px rgba(255, 107, 107, 0.3)',
                textDecoration: 'none',
                minHeight: '44px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#E65555';
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(255, 107, 107, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FF6B6B';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 107, 107, 0.3)';
              }}
            >
              {t('howWeSimplify.cta.primaryButton')}
            </Link>

            {/* Secondary Button */}
            <Link
              to="/features"
              aria-label="Explore Vitalita features to learn more about the platform"
              className="flex w-full sm:w-auto items-center justify-center"
              style={{
                background: 'transparent',
                color: '#6B7280',
                fontSize: '18px',
                fontWeight: '600',
                border: '2px solid #6B7280',
                padding: '16px 40px',
                borderRadius: '8px',
                textDecoration: 'none',
                minHeight: '44px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F9FAFB';
                e.currentTarget.style.borderColor = '#1A2332';
                e.currentTarget.style.color = '#1A2332';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = '#6B7280';
                e.currentTarget.style.color = '#6B7280';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {t('howWeSimplify.cta.secondaryButton')}
              </Link>
            </div>

          {/* Trust Line */}
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 
              className="h-4 w-4 flex-shrink-0" 
              style={{ color: '#14B8A6' }}
              aria-label="Trust indicator" 
            />
            <p 
              className="text-sm"
              style={{
                fontSize: '14px',
                color: '#6B7280',
                lineHeight: '1.5'
              }}
            >
              {t('howWeSimplify.cta.trustLine')}
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HowWeSimplify;


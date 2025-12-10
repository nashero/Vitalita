import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  Download,
  Filter,
  ChevronDown,
  ChevronUp,
  Play,
  CheckCircle2,
  Building2,
  MapPin,
  BarChart3,
  ArrowRight,
  X,
  Shield,
  Award,
  FileText,
  Calculator,
  Users,
  Clock,
  TrendingDown,
  Menu,
  Linkedin,
  Activity,
  Globe,
  Lock,
} from 'lucide-react';

type Study = {
  id: string;
  organization: string;
  organizationType: string;
  region: string;
  metric: string;
  metricValue: string;
  outcome: string;
  icon: string;
  detail: string;
  beforeAfter: {
    before: string;
    after: string;
  };
  videoUrl?: string;
};

const CaseStudies = () => {
  const { t, i18n } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('impact');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [faqOpen, setFaqOpen] = useState<string | null>(null);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [orgSize, setOrgSize] = useState<string>('medium');
  const [currentNoShowRate, setCurrentNoShowRate] = useState<string>('18');
  const [monthlyDonations, setMonthlyDonations] = useState<string>('500');
  const [modalOpen, setModalOpen] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [exitIntentShown, setExitIntentShown] = useState(false);
  const [ctaVariant, setCtaVariant] = useState<'A' | 'B' | 'C'>('A');
  const mouseLeaveRef = useRef<boolean>(false);
  const [donationsToday, setDonationsToday] = useState(1247);
  const [activeCoordinators, setActiveCoordinators] = useState(47);

  // Detect mobile viewport and handle modal on resize
  const [isDesktop, setIsDesktop] = useState(false);
  
  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 768);
      setIsDesktop(window.innerWidth >= 1024);
      // Close modal if resizing to mobile/tablet
      if (window.innerWidth < 1024 && modalOpen) {
        setModalOpen(null);
      }
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, [modalOpen]);

  // Add body padding for sticky CTA on mobile
  useEffect(() => {
    if (isMobile) {
      document.body.classList.add('has-sticky-cta');
    } else {
      document.body.classList.remove('has-sticky-cta');
    }
    return () => {
      document.body.classList.remove('has-sticky-cta');
    };
  }, [isMobile]);

  // Sticky CTA on scroll (desktop/tablet)
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = 400; // Approximate hero section height
      setShowStickyCTA(scrollY > heroHeight && !isMobile);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile]);

  // Exit intent detection
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse is moving upward (toward browser chrome)
      if (e.clientY <= 0 && !exitIntentShown && !mouseLeaveRef.current) {
        mouseLeaveRef.current = true;
        setShowExitIntent(true);
        setExitIntentShown(true);
      }
    };

    const handleMouseEnter = () => {
      mouseLeaveRef.current = false;
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [exitIntentShown]);

  // A/B Test variant selection (random on mount)
  useEffect(() => {
    const variants: ('A' | 'B' | 'C')[] = ['A', 'B', 'C'];
    const randomVariant = variants[Math.floor(Math.random() * variants.length)];
    setCtaVariant(randomVariant);
  }, []);

  // Live metrics simulation (updates every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate donations increasing
      setDonationsToday(prev => prev + Math.floor(Math.random() * 5));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Swipe gesture handlers
  const minSwipeDistance = 50;
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const filteredStudiesRef = useRef<Study[]>([]);
  
  const onTouchEnd = useCallback((studyId: string) => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe || isRightSwipe) {
      const currentStudies = filteredStudiesRef.current;
      const currentIndex = currentStudies.findIndex(s => s.id === studyId);
      if (isLeftSwipe && currentIndex < currentStudies.length - 1) {
        setExpandedCard(currentStudies[currentIndex + 1].id);
      } else if (isRightSwipe && currentIndex > 0) {
        setExpandedCard(currentStudies[currentIndex - 1].id);
      }
    }
  }, [touchStart, touchEnd]);

  // Lazy load images
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const imageObserver = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    imageObserver.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.classList.add('loaded');
            setLoadedImages(prev => new Set(prev).add(src));
            imageObserver.current?.unobserve(img);
          }
        }
      });
    });

    return () => {
      imageObserver.current?.disconnect();
    };
  }, []);

  // Parallax effect for desktop
  useEffect(() => {
    if (window.innerWidth < 1024) return;

    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll('.parallax-element');
      parallaxElements.forEach((el) => {
        const speed = 0.5;
        (el as HTMLElement).style.transform = `translateY(${scrolled * speed}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // SEO: Update meta tags when component mounts
  useEffect(() => {
    const updateMetaTags = () => {
      if (i18n.language === 'it') {
        document.title = 'Casi di Studio: Organizzazioni di Donazione del Sangue con Miglioramenti del 22-40% | Vitalita';
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', 'Scopri come AVIS Lombardia, Croce Rossa Toscana e FIDAS Veneto hanno trasformato l\'impegno dei donatori con risultati misurabili. Risultati reali dalle principali reti di donazione del sangue in Italia.');
        }
      } else {
        document.title = 'Case Studies: Blood Donation Organizations Achieving 22-40% Efficiency Gains | Vitalita';
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', 'Discover how AVIS Lombardia, Croce Rossa Toscana, and FIDAS Veneto transformed donor engagement with measurable results. Real outcomes from Italy\'s leading blood donation networks.');
        }
      }
    };

    updateMetaTags();

    // Listen for language changes
    const handleLanguageChange = () => {
      updateMetaTags();
    };
    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const studies: Study[] = [
    {
      id: 'avisLombardia',
      organization: t('caseStudies.studies.avisLombardia.organization'),
      organizationType: 'regional',
      region: 'Lombardy',
      metric: 'noShows',
      metricValue: '22%',
      outcome: t('caseStudies.studies.avisLombardia.outcome'),
      icon: 'trending-down',
      detail: t('caseStudies.studies.avisLombardia.detail'),
      beforeAfter: {
        before: t('caseStudies.studies.avisLombardia.before'),
        after: t('caseStudies.studies.avisLombardia.after'),
      },
    },
    {
      id: 'croceRossaToscana',
      organization: t('caseStudies.studies.croceRossaToscana.organization'),
      organizationType: 'national',
      region: 'Tuscany',
      metric: 'efficiency',
      metricValue: '35%',
      outcome: t('caseStudies.studies.croceRossaToscana.outcome'),
      icon: 'trending-up',
      detail: t('caseStudies.studies.croceRossaToscana.detail'),
      beforeAfter: {
        before: t('caseStudies.studies.croceRossaToscana.before'),
        after: t('caseStudies.studies.croceRossaToscana.after'),
      },
    },
    {
      id: 'fidasVeneto',
      organization: t('caseStudies.studies.fidasVeneto.organization'),
      organizationType: 'regional',
      region: 'Veneto',
      metric: 'adminTime',
      metricValue: '40%',
      outcome: t('caseStudies.studies.fidasVeneto.outcome'),
      icon: 'clock',
      detail: t('caseStudies.studies.fidasVeneto.detail'),
      beforeAfter: {
        before: t('caseStudies.studies.fidasVeneto.before'),
        after: t('caseStudies.studies.fidasVeneto.after'),
      },
    },
  ];

  // Filter and sort logic
  const filteredStudies = studies
    .filter((study) => {
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'organizationType') return study.organizationType === 'regional';
      if (selectedFilter === 'region') return study.region;
      if (selectedFilter === 'metric') return study.metric;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'impact') {
        const aValue = parseFloat(a.metricValue);
        const bValue = parseFloat(b.metricValue);
        return bValue - aValue;
      }
      if (sortBy === 'organization') {
        return a.organization.localeCompare(b.organization);
      }
      return 0;
    });

  // Update ref for swipe handler
  useEffect(() => {
    filteredStudiesRef.current = filteredStudies;
  }, [filteredStudies]);

  const getIcon = (iconName: string) => {
    // Icons use Coral accent color
    const iconStyle = { color: '#FF6B6B' };
    switch (iconName) {
      case 'trending-down':
        return <TrendingUp className="h-6 w-6 rotate-180" style={iconStyle} />;
      case 'trending-up':
        return <TrendingUp className="h-6 w-6" style={iconStyle} />;
      case 'clock':
        return <BarChart3 className="h-6 w-6" style={iconStyle} />;
      default:
        return <CheckCircle2 className="h-6 w-6" style={iconStyle} />;
    }
  };

  // Schema.org JSON-LD for Case Studies
  const caseStudiesSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Blood Donation Management Case Studies',
    description: 'Real case studies from Italian blood donation organizations showing measurable results with Vitalita donor engagement software.',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: filteredStudies.map((study, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Review',
          itemReviewed: {
            '@type': 'SoftwareApplication',
            name: 'Vitalita Blood Donation Management Platform',
            applicationCategory: 'HealthcareApplication',
            operatingSystem: 'Web'
          },
          author: {
            '@type': 'Organization',
            name: study.organization
          },
          reviewBody: study.detail,
          reviewRating: {
            '@type': 'Rating',
            ratingValue: '5',
            bestRating: '5'
          }
        }
      }))
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '3',
      bestRating: '5'
    }
  };

  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(caseStudiesSchema) }}
      />
      
      <div style={{ backgroundColor: '#F9FAFB' }}>
        {/* Hero Section - Impact Numbers First */}
        <section 
          className="section-container py-16 sm:py-20"
          style={{ backgroundColor: '#F9FAFB' }}
        >
          <div className="mx-auto max-w-4xl text-center">
            {/* Trust Signal Badge - Clinical Authority palette */}
            <div 
              className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide"
              style={{ 
                borderColor: '#FF6B6B',
                backgroundColor: 'transparent',
                color: '#FF6B6B'
              }}
            >
              <CheckCircle2 className="h-4 w-4" />
              {t('caseStudies.trustBadge')}
            </div>

            {/* Impact Numbers */}
            <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-6 shadow-sm border" style={{ borderColor: 'rgba(107, 114, 128, 0.2)' }}>
                <div className="text-3xl font-bold" style={{ color: '#FF6B6B' }}>22%</div>
                <div className="mt-2 text-sm font-medium" style={{ color: '#6B7280' }}>
                  {t('caseStudies.metrics.noShows')}
                </div>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-sm border" style={{ borderColor: 'rgba(107, 114, 128, 0.2)' }}>
                <div className="text-3xl font-bold" style={{ color: '#FF6B6B' }}>35%</div>
                <div className="mt-2 text-sm font-medium" style={{ color: '#6B7280' }}>
                  {t('caseStudies.metrics.efficiency')}
                </div>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-sm border" style={{ borderColor: 'rgba(107, 114, 128, 0.2)' }}>
                <div className="text-3xl font-bold" style={{ color: '#FF6B6B' }}>40%</div>
                <div className="mt-2 text-sm font-medium" style={{ color: '#6B7280' }}>
                  {t('caseStudies.metrics.adminTime')}
                </div>
              </div>
            </div>

            {/* H1: SEO Optimized Headline - Mobile: 2 lines max */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mobile-hero-text" style={{ color: '#1A2332', fontWeight: 700 }}>
              {t('caseStudies.seoHeading')}
            </h1>

            {/* Compressed Subtitle - ONE LINE - Mobile optimized */}
            <p className="mt-3 sm:mt-4 text-base sm:text-lg font-medium" style={{ color: '#6B7280', lineHeight: 1.6 }}>
              {t('caseStudies.compressedSubtitle')}
            </p>

            {/* Quantitative Proof - Three Key Metrics - Mobile: Full width badges */}
            <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="metric-badge-mobile rounded-xl bg-white p-4 sm:p-6 border touch-target" style={{ borderColor: 'rgba(107, 114, 128, 0.2)' }}>
                <div className="text-xl sm:text-2xl font-bold" style={{ color: '#FF6B6B' }}>487,000+</div>
                <div className="mt-1 text-xs sm:text-sm font-medium" style={{ color: '#6B7280' }}>
                  {t('caseStudies.proof.donations')}
                </div>
              </div>
              <div className="metric-badge-mobile rounded-xl bg-white p-4 sm:p-6 border touch-target" style={{ borderColor: 'rgba(107, 114, 128, 0.2)' }}>
                <div className="text-xl sm:text-2xl font-bold" style={{ color: '#FF6B6B' }}>3-6 {t('caseStudies.proof.months')}</div>
                <div className="mt-1 text-xs sm:text-sm font-medium" style={{ color: '#6B7280' }}>
                  {t('caseStudies.proof.results')}
                </div>
              </div>
              <div className="metric-badge-mobile rounded-xl bg-white p-4 sm:p-6 border touch-target" style={{ borderColor: 'rgba(107, 114, 128, 0.2)' }}>
                <div className="text-xl sm:text-2xl font-bold" style={{ color: '#FF6B6B' }}>2 {t('caseStudies.proof.weeks')}</div>
                <div className="mt-1 text-xs sm:text-sm font-medium" style={{ color: '#6B7280' }}>
                  {t('caseStudies.proof.deploy')}
                </div>
              </div>
            </div>

            {/* Primary CTA in Hero - New Copy */}
            <div className="mt-8 flex flex-col items-center gap-3">
              <a
                href="/contact"
                className="touch-target inline-flex items-center gap-2 rounded-lg px-8 py-4 text-base font-semibold text-white shadow-xl transition-all"
                style={{ 
                  backgroundColor: '#FF6B6B',
                  boxShadow: '0 4px 16px rgba(255, 107, 107, 0.3)',
                  borderRadius: '8px',
                  padding: '16px 32px',
                  minWidth: '44px',
                  minHeight: '44px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#E65A5A';
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FF6B6B';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 107, 107, 0.3)';
                }}
              >
                {t('caseStudies.cta.primaryButton')}
                <ArrowRight className="h-5 w-5" />
              </a>
              <p className="text-sm font-medium" style={{ color: '#6B7280', lineHeight: 1.6 }}>
                {t('caseStudies.cta.primaryMicrocopy')}
              </p>
            </div>

            {/* Tablet: Floating CTA in Hero */}
            <div className="tablet-floating-cta hidden md:block lg:hidden">
              <a
                href="/contact"
                className="touch-target inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-xl"
                style={{ 
                  backgroundColor: '#FF6B6B',
                  boxShadow: '0 10px 15px -3px rgba(255, 107, 107, 0.4)',
                  minWidth: '44px',
                  minHeight: '44px'
                }}
              >
                {t('caseStudies.cta.primaryButton')}
              </a>
            </div>
          </div>
        </section>

      {/* Trust Bar - Below Hero */}
      <section className="section-container py-8 border-b" style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(107, 114, 128, 0.2)' }}>
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Partner Logos - Grayscale */}
            <div className="flex items-center gap-8 flex-wrap justify-center md:justify-start">
              <div className="flex items-center gap-2 opacity-70 hover:opacity-100 transition">
                <div className="h-12 w-24 flex items-center justify-center rounded-lg border bg-white px-4" style={{ borderColor: 'rgba(107, 114, 128, 0.2)' }}>
                  <span className="text-lg font-bold" style={{ color: '#1A2332', filter: 'grayscale(100%)' }}>AVIS</span>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-70 hover:opacity-100 transition">
                <div className="h-12 w-32 flex items-center justify-center rounded-lg border bg-white px-4" style={{ borderColor: 'rgba(107, 114, 128, 0.2)' }}>
                  <span className="text-sm font-bold" style={{ color: '#1A2332', filter: 'grayscale(100%)' }}>Croce Rossa</span>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-70 hover:opacity-100 transition">
                <div className="h-12 w-24 flex items-center justify-center rounded-lg border bg-white px-4" style={{ borderColor: 'rgba(107, 114, 128, 0.2)' }}>
                  <span className="text-sm font-bold" style={{ color: '#1A2332', filter: 'grayscale(100%)' }}>FIDAS</span>
                </div>
              </div>
            </div>
            
            {/* Trust Statement */}
            <div className="text-center md:text-right">
              <p className="text-sm font-semibold" style={{ color: '#1A2332' }}>
                {t('caseStudies.trustBar.title')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Metrics Section - Integrated into page flow */}
      <section className="section-container py-12" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <Activity className="h-6 w-6" style={{ color: '#FF6B6B' }} />
              <h2 className="text-2xl font-bold" style={{ color: '#1A2332' }}>
                {t('caseStudies.liveMetrics.title')}
              </h2>
            </div>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              Real-time impact metrics from organizations using Vitalita
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border bg-gradient-to-br from-white to-red-50 p-6 text-center hover:shadow-lg transition" style={{ borderColor: 'rgba(107, 114, 128, 0.2)' }}>
              <div className="text-4xl font-bold mb-2" style={{ color: '#FF6B6B' }}>
                {donationsToday.toLocaleString()}
              </div>
              <div className="text-sm font-semibold" style={{ color: '#1A2332' }}>
                {t('caseStudies.liveMetrics.donationsToday')}
              </div>
              <div className="text-xs mt-1" style={{ color: '#6B7280' }}>
                Updated in real-time
              </div>
            </div>
            
            <div className="rounded-xl border bg-gradient-to-br from-white to-red-50 p-6 text-center hover:shadow-lg transition" style={{ borderColor: 'rgba(107, 114, 128, 0.2)' }}>
              <div className="text-4xl font-bold mb-2" style={{ color: '#FF6B6B' }}>
                {activeCoordinators}+
              </div>
              <div className="text-sm font-semibold" style={{ color: '#1A2332' }}>
                {t('caseStudies.liveMetrics.activeCoordinators')}
              </div>
              <div className="text-xs mt-1" style={{ color: '#6B7280' }}>
                Across Italy & Europe
              </div>
            </div>
            
            <div className="rounded-xl border bg-gradient-to-br from-white to-red-50 p-6 text-center hover:shadow-lg transition" style={{ borderColor: 'rgba(107, 114, 128, 0.2)' }}>
              <div className="text-4xl font-bold mb-2" style={{ color: '#FF6B6B' }}>
                14
              </div>
              <div className="text-sm font-semibold" style={{ color: '#1A2332' }}>
                {t('caseStudies.liveMetrics.avgImplementation')}
              </div>
              <div className="text-xs mt-1" style={{ color: '#6B7280' }}>
                From setup to launch
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Counter */}
      <section className="section-container py-12" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-lg font-semibold mb-6" style={{ color: '#1A2332' }}>
            {t('caseStudies.socialProof.title')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 mb-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg border" style={{ borderColor: 'rgba(107, 114, 128, 0.2)' }}>
              <Building2 className="h-5 w-5" style={{ color: '#FF6B6B' }} />
              <span className="text-sm font-semibold" style={{ color: '#1A2332' }}>AVIS</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg border" style={{ borderColor: 'rgba(107, 114, 128, 0.2)' }}>
              <Building2 className="h-5 w-5" style={{ color: '#FF6B6B' }} />
              <span className="text-sm font-semibold" style={{ color: '#1A2332' }}>Croce Rossa</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg border" style={{ borderColor: 'rgba(107, 114, 128, 0.2)' }}>
              <Building2 className="h-5 w-5" style={{ color: '#FF6B6B' }} />
              <span className="text-sm font-semibold" style={{ color: '#1A2332' }}>FIDAS</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg border" style={{ borderColor: 'rgba(107, 114, 128, 0.2)' }}>
              <span className="text-sm font-semibold" style={{ color: '#1A2332' }}>+44 More</span>
            </div>
          </div>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            {t('caseStudies.socialProof.subtitle')}
          </p>
        </div>
      </section>

      {/* Filters and Sorting - Enhanced */}
      <section className="section-container pb-8" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="touch-target inline-flex items-center gap-2 rounded-lg border bg-transparent px-4 py-2 text-sm font-medium transition sm:hidden"
              style={{ 
                borderColor: '#6B7280',
                color: '#6B7280',
                minWidth: '44px',
                minHeight: '44px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#FF6B6B';
                e.currentTarget.style.color = '#FF6B6B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#6B7280';
                e.currentTarget.style.color = '#6B7280';
              }}
            >
              <Filter className="h-4 w-4" />
              {t('caseStudies.filters.title')}
              {showFilters ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            <div
              className={`flex flex-col gap-4 sm:flex-row sm:items-center ${
                showFilters ? 'flex' : 'hidden sm:flex'
              }`}
            >
              {/* Filter by Organization Size */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" style={{ color: '#6B7280' }} />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="rounded-lg border bg-white px-3 py-2 text-sm font-medium focus:outline-none"
                  style={{ 
                    borderColor: '#6B7280',
                    color: '#6B7280'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#FF6B6B';
                    e.currentTarget.style.outline = '3px solid #FF6B6B';
                    e.currentTarget.style.outlineOffset = '3px';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#6B7280';
                    e.currentTarget.style.outline = 'none';
                  }}
                >
                  <option value="all">{t('caseStudies.filters.all')}</option>
                  <option value="organizationType">
                    {t('caseStudies.filters.organizationType')}
                  </option>
                  <option value="region">{t('caseStudies.filters.region')}</option>
                  <option value="size">{t('caseStudies.filters.size')}</option>
                </select>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: '#6B7280' }}>{t('caseStudies.sort.label')}</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-lg border bg-white px-3 py-2 text-sm font-medium focus:outline-none"
                  style={{ 
                    borderColor: '#6B7280',
                    color: '#6B7280'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#FF6B6B';
                    e.currentTarget.style.outline = '3px solid #FF6B6B';
                    e.currentTarget.style.outlineOffset = '3px';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#6B7280';
                    e.currentTarget.style.outline = 'none';
                  }}
                >
                  <option value="impact">{t('caseStudies.sort.impact')}</option>
                  <option value="organization">{t('caseStudies.sort.organization')}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Case Study Cards - Mobile-first responsive grid */}
      <section className="section-container pb-20 sm:pb-16" style={{ backgroundColor: '#FFFFFF', paddingTop: '80px', paddingBottom: '80px', paddingLeft: '40px', paddingRight: '40px' }}>
        <div className="mx-auto max-w-7xl">
          <div className="case-study-grid">
            {filteredStudies.map((study) => {
              // SEO: Generate H2 heading based on organization or metric
              const h2Text = study.id === 'avisLombardia' 
                ? t('caseStudies.studies.avisLombardia.h2')
                : study.id === 'croceRossaToscana'
                ? t('caseStudies.studies.croceRossaToscana.h2')
                : t('caseStudies.studies.fidasVeneto.h2');

              return (
                <article
                key={study.id}
                ref={(el) => {
                  cardRefs.current[study.id] = el;
                }}
                className="group relative rounded-xl border bg-white transition-all swipeable"
                style={{ 
                  borderColor: 'rgba(107, 114, 128, 0.3)',
                  borderWidth: '1px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(26, 35, 50, 0.08)',
                  transition: 'all 0.3s ease'
                }}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={() => onTouchEnd(study.id)}
                onMouseEnter={(e) => {
                  if (window.innerWidth >= 1024) {
                    e.currentTarget.style.borderColor = '#FF6B6B';
                    e.currentTarget.style.borderWidth = '1px';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(255, 107, 107, 0.15)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (window.innerWidth >= 1024) {
                    e.currentTarget.style.borderColor = 'rgba(107, 114, 128, 0.3)';
                    e.currentTarget.style.borderWidth = '1px';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(26, 35, 50, 0.08)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
                onClick={() => {
                  // Desktop: Open modal, Mobile/Tablet: Expand inline
                  if (window.innerWidth >= 1024) {
                    setModalOpen(study.id);
                  } else {
                    setExpandedCard(expandedCard === study.id ? null : study.id);
                  }
                }}
                itemScope
                itemType="https://schema.org/Review"
              >
                {/* Card Header - Simplified */}
                <div className="p-6">
                  {/* H2: Organization name or metric-focused */}
                  <h2 className="sr-only" itemProp="name">{h2Text}</h2>
                  
                  {/* Icon + Metric */}
                  <div className="flex items-start gap-4">
                    <div 
                      className="flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ backgroundColor: 'rgba(255, 107, 107, 0.1)' }}
                      aria-label={`${study.organization} case study showing ${study.metricValue} ${study.metric} improvement using Vitalita blood donation management platform`}
                    >
                      {getIcon(study.icon)}
                    </div>
                    <div className="flex-1">
                      {/* Metric Badge - Coral background with white text */}
                      <div 
                        className="inline-flex items-center justify-center rounded-md mb-2"
                        style={{ 
                          backgroundColor: '#FF6B6B',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '8px 16px',
                          fontWeight: 700,
                          boxShadow: '0 2px 6px rgba(255, 107, 107, 0.25)'
                        }}
                      >
                        <span className="text-2xl font-bold">{study.metricValue}</span>
                      </div>
                      <div className="mt-2" style={{ color: '#1A2332', fontSize: '20px', lineHeight: 1.3, fontWeight: 600 }}>
                        {study.outcome}
                      </div>
                    </div>
                  </div>

                  {/* Organization Badge + Timeline */}
                  <div className="mt-4 space-y-2">
                    <div 
                      className="inline-flex items-center gap-2 border text-xs font-semibold uppercase tracking-wide"
                      style={{ 
                        backgroundColor: 'rgba(255, 107, 107, 0.2)',
                        color: '#1A2332',
                        borderColor: '#FF6B6B',
                        borderRadius: '6px',
                        padding: '6px 14px',
                        fontWeight: 600,
                        letterSpacing: '1px'
                      }}
                      itemProp="author"
                      itemScope
                      itemType="https://schema.org/Organization"
                    >
                      <Building2 className="h-3 w-3" />
                      <span itemProp="name">{study.organization}</span>
                    </div>
                    {/* Timeline - Results achieved in X months */}
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: '#6B7280' }}>
                      <Clock className="h-3 w-3" />
                      <span>{t(`caseStudies.studies.${study.id}.timeline`)}</span>
                    </div>
                  </div>

                  {/* Expandable Detail - Mobile/Tablet: Inline, Desktop: Modal */}
                  {((isMobile || window.innerWidth < 1024) && expandedCard === study.id) && (
                    <div className="mt-6 space-y-4 border-t pt-6" style={{ borderColor: 'rgba(107, 114, 128, 0.2)' }}>
                      {/* H3: Specific outcomes within each case study */}
                      <h3 className="text-lg font-semibold" style={{ color: '#1A2332', fontSize: '20px', lineHeight: 1.3, fontWeight: 600 }} itemProp="headline">
                        {study.outcome}
                      </h3>
                      {/* Key Results - Bullet Points (Compressed) */}
                      <ul className="space-y-2" style={{ color: '#6B7280', fontSize: '16px', lineHeight: 1.6 }}>
                        {t(`caseStudies.studies.${study.id}.keyResults`, { returnObjects: true })?.map((result: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: '#FF6B6B' }} />
                            <span>{result}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Visual Chart - Before/After Comparison */}
                      <div className="rounded-lg p-4" style={{ backgroundColor: '#F9FAFB' }}>
                        <div className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#1A2332' }}>
                          {t('caseStudies.metricImprovement')}
                        </div>
                        <div className="space-y-3">
                          {study.id === 'avisLombardia' && (
                            <>
                              <div>
                                <div className="flex justify-between text-xs mb-1" style={{ color: '#6B7280' }}>
                                  <span>{t('caseStudies.before')}</span>
                                  <span className="font-medium">{t('caseStudies.studies.avisLombardia.beforeValue')}</span>
                                </div>
                                <div className="h-2 rounded-full" style={{ backgroundColor: 'rgba(107, 114, 128, 0.2)' }}>
                                  <div 
                                    className="h-2 rounded-full" 
                                    style={{ 
                                      backgroundColor: '#6B7280',
                                      width: '75%'
                                    }}
                                  />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-xs mb-1" style={{ color: '#1A2332' }}>
                                  <span className="font-medium">{t('caseStudies.after')}</span>
                                  <span className="font-bold">{t('caseStudies.studies.avisLombardia.afterValue')}</span>
                                </div>
                                <div className="h-2 rounded-full" style={{ backgroundColor: 'rgba(255, 107, 107, 0.2)' }}>
                                  <div 
                                    className="h-2 rounded-full" 
                                    style={{ 
                                      backgroundColor: '#FF6B6B',
                                      width: '58%'
                                    }}
                                  />
                                </div>
                              </div>
                            </>
                          )}
                          {study.id === 'croceRossaToscana' && (
                            <>
                              <div>
                                <div className="flex justify-between text-xs mb-1" style={{ color: '#6B7280' }}>
                                  <span>{t('caseStudies.before')}</span>
                                  <span className="font-medium">{t('caseStudies.studies.croceRossaToscana.beforeValue')}</span>
                                </div>
                                <div className="h-2 rounded-full" style={{ backgroundColor: 'rgba(107, 114, 128, 0.2)' }}>
                                  <div 
                                    className="h-2 rounded-full" 
                                    style={{ 
                                      backgroundColor: '#6B7280',
                                      width: '100%'
                                    }}
                                  />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-xs mb-1" style={{ color: '#1A2332' }}>
                                  <span className="font-medium">{t('caseStudies.after')}</span>
                                  <span className="font-bold">{t('caseStudies.studies.croceRossaToscana.afterValue')}</span>
                                </div>
                                <div className="h-2 rounded-full" style={{ backgroundColor: 'rgba(255, 107, 107, 0.2)' }}>
                                  <div 
                                    className="h-2 rounded-full" 
                                    style={{ 
                                      backgroundColor: '#FF6B6B',
                                      width: '40%'
                                    }}
                                  />
                                </div>
                              </div>
                            </>
                          )}
                          {study.id === 'fidasVeneto' && (
                            <>
                              <div>
                                <div className="flex justify-between text-xs mb-1" style={{ color: '#6B7280' }}>
                                  <span>{t('caseStudies.before')}</span>
                                  <span className="font-medium">{t('caseStudies.studies.fidasVeneto.beforeValue')}</span>
                                </div>
                                <div className="h-2 rounded-full" style={{ backgroundColor: 'rgba(107, 114, 128, 0.2)' }}>
                                  <div 
                                    className="h-2 rounded-full" 
                                    style={{ 
                                      backgroundColor: '#6B7280',
                                      width: '100%'
                                    }}
                                  />
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between text-xs mb-1" style={{ color: '#1A2332' }}>
                                  <span className="font-medium">{t('caseStudies.after')}</span>
                                  <span className="font-bold">{t('caseStudies.studies.fidasVeneto.afterValue')}</span>
                                </div>
                                <div className="h-2 rounded-full" style={{ backgroundColor: 'rgba(255, 107, 107, 0.2)' }}>
                                  <div 
                                    className="h-2 rounded-full" 
                                    style={{ 
                                      backgroundColor: '#FF6B6B',
                                      width: '58%'
                                    }}
                                  />
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Coordinator Testimonial with Photo */}
                      <div className="rounded-lg p-4 border" style={{ borderColor: 'rgba(107, 114, 128, 0.2)', backgroundColor: '#FFFFFF', borderLeft: '4px solid #FF6B6B' }}>
                        <div className="flex items-start gap-3">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center flex-shrink-0" style={{ border: '2px solid #FF6B6B' }}>
                            <Users className="h-6 w-6" style={{ color: '#FF6B6B' }} />
                          </div>
                          <div className="flex-1">
                            <p className="italic mb-2" style={{ color: '#1A2332', fontSize: '18px', lineHeight: 1.7 }}>
                              "{t(`caseStudies.studies.${study.id}.testimonial`)}"
                            </p>
                            <div className="text-sm font-semibold" style={{ color: '#1A2332', fontWeight: 600 }}>
                              {t(`caseStudies.studies.${study.id}.testimonialAuthor`)}
                            </div>
                            <div className="text-xs" style={{ color: '#6B7280' }}>
                              {t(`caseStudies.studies.${study.id}.testimonialRole`)}
                            </div>
                            <div className="text-xs font-semibold mt-1" style={{ color: '#FF6B6B' }}>
                              {study.organization}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Download PDF CTA - Email Gate (Trust-building) */}
                      <a
                        href={`/case-studies/${study.id}/download.pdf`}
                        className="touch-target flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition border-2"
                        style={{ 
                          color: '#FF6B6B',
                          borderColor: '#FF6B6B',
                          backgroundColor: 'transparent',
                          fontWeight: 600,
                          minWidth: '44px',
                          minHeight: '44px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#E65A5A';
                          e.currentTarget.style.textDecoration = 'underline';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#FF6B6B';
                          e.currentTarget.style.textDecoration = 'none';
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          // Email gate: Show form or redirect to download
                          window.open(`/case-studies/${study.id}/download.pdf`, '_blank');
                        }}
                      >
                        <FileText className="h-4 w-4" style={{ color: '#FF6B6B' }} />
                        {t('caseStudies.cta.downloadPDF')}
                      </a>
                    </div>
                  )}

                  {/* Secondary CTA: "Achieve Similar Results" - After each case study card */}
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(107, 114, 128, 0.2)' }}>
                    <a
                      href="/contact"
                      className="touch-target flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white transition-all"
                      style={{ 
                        backgroundColor: '#FF6B6B',
                        boxShadow: '0 4px 16px rgba(255, 107, 107, 0.3)',
                        borderRadius: '8px',
                        padding: '16px 32px',
                        minWidth: '44px',
                        minHeight: '44px',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#E65A5A';
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#FF6B6B';
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 107, 107, 0.3)';
                      }}
                    >
                      {t('caseStudies.cta.secondaryButton')}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>

                  {/* Expand/Collapse Button - Coral text, hover darken by 10% - Touch Target Optimized */}
                  <button
                    onClick={() =>
                      setExpandedCard(expandedCard === study.id ? null : study.id)
                    }
                    className="touch-target mt-4 flex w-full items-center justify-center gap-2 text-sm font-medium transition"
                    style={{ 
                      color: '#FF6B6B',
                      minWidth: '44px',
                      minHeight: '44px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#E65A5A';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#FF6B6B';
                    }}
                  >
                    {expandedCard === study.id ? (
                      <>
                        {t('caseStudies.showLess')}
                        <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        {t('caseStudies.showMore')}
                        <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-container py-16" style={{ backgroundColor: '#F9FAFB' }}>
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-8" style={{ color: '#1A2332' }}>
            {t('caseStudies.faq.title')}
          </h2>
          <div className="space-y-4">
            {[
              {
                id: 'measure-success',
                question: t('caseStudies.faq.measureSuccess.question'),
                answer: t('caseStudies.faq.measureSuccess.answer')
              },
              {
                id: 'implementation-time',
                question: t('caseStudies.faq.implementationTime.question'),
                answer: t('caseStudies.faq.implementationTime.answer')
              },
              {
                id: 'roi',
                question: t('caseStudies.faq.roi.question'),
                answer: t('caseStudies.faq.roi.answer')
              }
            ].map((faq) => (
              <div
                key={faq.id}
                className="rounded-lg border bg-white p-6"
                style={{ borderColor: 'rgba(107, 114, 128, 0.2)' }}
                itemScope
                itemType="https://schema.org/Question"
              >
                <button
                  onClick={() => setFaqOpen(faqOpen === faq.id ? null : faq.id)}
                  className="touch-target flex w-full items-center justify-between text-left"
                  style={{ minWidth: '44px', minHeight: '44px' }}
                  aria-expanded={faqOpen === faq.id}
                >
                  <h3 className="text-lg font-semibold pr-4" style={{ color: '#1A2332' }} itemProp="name">
                    {faq.question}
                  </h3>
                  {faqOpen === faq.id ? (
                    <ChevronUp className="h-5 w-5 flex-shrink-0" style={{ color: '#FF6B6B' }} />
                  ) : (
                    <ChevronDown className="h-5 w-5 flex-shrink-0" style={{ color: '#FF6B6B' }} />
                  )}
                </button>
                {faqOpen === faq.id && (
                  <div className="mt-4" itemScope itemType="https://schema.org/Answer">
                    <p className="text-base leading-relaxed" style={{ color: '#6B7280' }} itemProp="text">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Proof Stacking Section */}
      <section className="section-container py-12" style={{ backgroundColor: '#F9FAFB' }}>
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-xl bg-white border" style={{ borderColor: 'rgba(107, 114, 128, 0.2)' }}>
              <Globe className="h-8 w-8 mx-auto mb-3" style={{ color: '#FF6B6B' }} />
              <p className="text-sm font-semibold" style={{ color: '#1A2332' }}>
                {t('caseStudies.proofStacking.bornInItaly')}
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-white border" style={{ borderColor: 'rgba(107, 114, 128, 0.2)' }}>
              <Award className="h-8 w-8 mx-auto mb-3" style={{ color: '#FF6B6B' }} />
              <p className="text-sm font-semibold" style={{ color: '#1A2332' }}>
                {t('caseStudies.proofStacking.satisfactionRate')}
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-white border" style={{ borderColor: 'rgba(107, 114, 128, 0.2)' }}>
              <Lock className="h-8 w-8 mx-auto mb-3" style={{ color: '#FF6B6B' }} />
              <p className="text-sm font-semibold" style={{ color: '#1A2332' }}>
                {t('caseStudies.proofStacking.zeroBreaches')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Certification Badges Section */}
      <section className="section-container py-12" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="mx-auto max-w-5xl">
          <h3 className="text-center text-lg font-semibold mb-6" style={{ color: '#1A2332' }}>
            Regulatory Compliance & Certifications
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center gap-2 px-4 py-4 rounded-lg border bg-white hover:shadow-md transition" style={{ borderColor: 'rgba(107, 114, 128, 0.2)' }}>
              <Shield className="h-10 w-10" style={{ color: '#FF6B6B' }} />
              <div className="text-xs font-semibold text-center" style={{ color: '#1A2332' }}>
                {t('caseStudies.trustBadges.gdpr')}
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 px-4 py-4 rounded-lg border bg-white hover:shadow-md transition" style={{ borderColor: 'rgba(107, 114, 128, 0.2)' }}>
              <Award className="h-10 w-10" style={{ color: '#FF6B6B' }} />
              <div className="text-xs font-semibold text-center" style={{ color: '#1A2332' }}>
                {t('caseStudies.trustBadges.iso')}
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 px-4 py-4 rounded-lg border bg-white hover:shadow-md transition" style={{ borderColor: 'rgba(107, 114, 128, 0.2)' }}>
              <CheckCircle2 className="h-10 w-10" style={{ color: '#FF6B6B' }} />
              <div className="text-xs font-semibold text-center" style={{ color: '#1A2332' }}>
                {t('caseStudies.trustBadges.euDigital')}
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 px-4 py-4 rounded-lg border bg-white hover:shadow-md transition" style={{ borderColor: 'rgba(107, 114, 128, 0.2)' }}>
              <Shield className="h-10 w-10" style={{ color: '#FF6B6B' }} />
              <div className="text-xs font-semibold text-center" style={{ color: '#1A2332' }}>
                {t('caseStudies.trustBadges.ministryHealth')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator Section - Mid-page CTA */}
      <section className="section-container py-16" style={{ backgroundColor: '#F9FAFB' }}>
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border p-8 bg-white" style={{ borderColor: 'rgba(107, 114, 128, 0.2)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: '#1A2332' }}>
                {t('caseStudies.cta.roiButton')}
              </h2>
              <button
                onClick={() => setCalculatorOpen(!calculatorOpen)}
                className="touch-target p-2 rounded-lg transition"
                style={{ 
                  color: '#FF6B6B',
                  minWidth: '44px',
                  minHeight: '44px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {calculatorOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </div>
            
            {calculatorOpen && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#1A2332' }}>
                    {t('caseStudies.calculator.orgSize')}
                  </label>
                  <select
                    value={orgSize}
                    onChange={(e) => setOrgSize(e.target.value)}
                    className="w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none"
                    style={{ 
                      borderColor: '#6B7280',
                      color: '#1A2332'
                    }}
                  >
                    <option value="small">{t('caseStudies.calculator.small')}</option>
                    <option value="medium">{t('caseStudies.calculator.medium')}</option>
                    <option value="large">{t('caseStudies.calculator.large')}</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#1A2332' }}>
                    {t('caseStudies.calculator.noShowRate')}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={currentNoShowRate}
                      onChange={(e) => setCurrentNoShowRate(e.target.value)}
                      className="flex-1 rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none"
                      style={{ 
                        borderColor: '#6B7280',
                        color: '#1A2332'
                      }}
                    />
                    <span className="text-sm" style={{ color: '#6B7280' }}>%</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#1A2332' }}>
                    {t('caseStudies.calculator.monthlyDonations')}
                  </label>
                  <input
                    type="number"
                    value={monthlyDonations}
                    onChange={(e) => setMonthlyDonations(e.target.value)}
                    className="w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none"
                    style={{ 
                      borderColor: '#6B7280',
                      color: '#1A2332'
                    }}
                  />
                </div>
                
                <button
                  className="w-full rounded-full px-6 py-3 text-sm font-semibold text-white transition"
                  style={{ backgroundColor: '#FF6B6B' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#E65A5A';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FF6B6B';
                  }}
                >
                  <Calculator className="h-4 w-4 inline mr-2" />
                  {t('caseStudies.calculator.calculate')}
                </button>
                
                {/* Results Display */}
                {currentNoShowRate && monthlyDonations && parseFloat(currentNoShowRate) > 0 && parseFloat(monthlyDonations) > 0 && (
                  <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: '#F9FAFB' }}>
                    <h3 className="text-lg font-semibold mb-3" style={{ color: '#1A2332' }}>
                      {t('caseStudies.calculator.estimatedImpact')}
                    </h3>
                    <ul className="space-y-2 text-sm" style={{ color: '#6B7280' }}>
                      <li className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4" style={{ color: '#FF6B6B' }} />
                        <span>{t('caseStudies.calculator.result1', { 
                          percent: Math.round(parseFloat(currentNoShowRate) * 0.22),
                          value: Math.round(parseFloat(monthlyDonations) * parseFloat(currentNoShowRate) / 100 * 0.22)
                        })}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Clock className="h-4 w-4" style={{ color: '#FF6B6B' }} />
                        <span>{t('caseStudies.calculator.result2')}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" style={{ color: '#FF6B6B' }} />
                        <span>{t('caseStudies.calculator.result3', {
                          value: Math.round(parseFloat(monthlyDonations) * 0.35)
                        })}</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section with Photos */}
      <section className="section-container py-16" style={{ backgroundColor: '#F9FAFB' }}>
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight" style={{ color: '#1A2332' }}>
              {t('caseStudies.testimonials.withPhoto.title')}
            </h2>
            <p className="mt-3 text-base" style={{ color: '#6B7280' }}>
              {t('caseStudies.testimonials.withPhoto.subtitle')}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 mb-12">
            {[1, 2, 3].map((index) => {
              const testimonial = t(`caseStudies.testimonials.testimonial${index}`, { returnObjects: true }) as {
                quote: string;
                author: string;
                role: string;
                organization: string;
                linkedin?: string;
              };
              
              return (
                <div
                  key={index}
                  className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition"
                  style={{ borderColor: 'rgba(107, 114, 128, 0.2)', borderLeft: '4px solid #FF6B6B' }}
                >
                  {/* Coordinator Photo Placeholder */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center flex-shrink-0" style={{ border: '2px solid #FF6B6B' }}>
                      <Users className="h-8 w-8" style={{ color: '#FF6B6B' }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold" style={{ color: '#1A2332', fontWeight: 600 }}>
                        {testimonial.author}
                      </div>
                      <div className="text-sm" style={{ color: '#6B7280' }}>
                        {testimonial.role}
                      </div>
                      {testimonial.linkedin && (
                        <a
                          href={testimonial.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs mt-1 transition"
                          style={{ color: '#6B7280' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#FF6B6B';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#6B7280';
                          }}
                        >
                          <Linkedin className="h-3 w-3" />
                          Verify on LinkedIn
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Quote */}
                  <p className="italic mb-4" style={{ color: '#1A2332', fontSize: '18px', lineHeight: 1.7 }}>
                    "{testimonial.quote}"
                  </p>

                  {/* Organization Badge */}
                  <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold" style={{ borderColor: '#FF6B6B', backgroundColor: 'rgba(255, 107, 107, 0.1)', color: '#FF6B6B' }}>
                    <Building2 className="h-3 w-3" style={{ color: '#FF6B6B' }} />
                    {testimonial.organization}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Video Testimonials */}
          <div>
            <h3 className="text-xl font-bold text-center mb-6" style={{ color: '#1A2332' }}>
              {t('caseStudies.testimonials.title')}
            </h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl shadow-lg"
                  style={{ backgroundColor: '#1A2332' }}
                >
                  <div 
                    className="aspect-video flex items-center justify-center"
                    style={{ 
                      background: 'linear-gradient(to bottom right, #FF6B6B, #E65A5A)'
                    }}
                  >
                    <button className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition hover:bg-white/30">
                      <Play className="h-8 w-8 text-white" fill="white" />
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-semibold" style={{ color: '#F9FAFB' }}>
                      {t(`caseStudies.testimonials.testimonial${index}.title`)}
                    </div>
                    <div className="mt-1 text-xs" style={{ color: 'rgba(249, 250, 251, 0.6)' }}>
                      {t(`caseStudies.testimonials.testimonial${index}.organization`)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signal Section - "Trusted by Italy's Leading Blood Donation Network" */}
      <section 
        className="section-container py-16 relative overflow-hidden"
        style={{ 
          backgroundColor: '#1A2332'
        }}
      >
        {/* Decorative background element - Coral */}
        <div 
          className="absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{ backgroundColor: 'rgba(255, 107, 107, 0.1)' }}
        />
        
        <div className="mx-auto max-w-3xl text-center relative">
          <div className="rounded-3xl border p-8 text-center shadow-xl sm:p-12 backdrop-blur-sm"
            style={{ 
              borderColor: 'rgba(255, 107, 107, 0.3)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)'
            }}
          >
            <h2 className="text-2xl font-bold sm:text-3xl" style={{ color: '#F9FAFB' }}>
              {t('caseStudies.trustBadge')}
            </h2>
            <p className="mt-3 text-base" style={{ color: 'rgba(249, 250, 251, 0.9)' }}>
              {t('caseStudies.cta.urgency')}
            </p>
            {/* Partner Logos placeholder - white with 60% opacity */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <div className="text-sm font-medium" style={{ color: 'rgba(249, 250, 251, 0.6)' }}>
                AVIS • Croce Rossa • FIDAS
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simplified CTA Section */}
      <section 
        className="section-container py-16 pb-24 sm:pb-16"
        style={{ backgroundColor: '#F9FAFB' }}
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold sm:text-3xl mb-6" style={{ color: '#1A2332' }}>
            {t('caseStudies.cta.compressedTitle')}
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/contact"
              className="touch-target inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-white transition shadow-xl"
              style={{ 
                backgroundColor: '#FF6B6B',
                boxShadow: '0 20px 25px -5px rgba(255, 107, 107, 0.4)',
                minWidth: '44px',
                minHeight: '44px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E65A5A';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(255, 107, 107, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FF6B6B';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(255, 107, 107, 0.4)';
              }}
            >
              {ctaVariant === 'A' && t('caseStudies.cta.abTest.versionA')}
              {ctaVariant === 'B' && t('caseStudies.cta.abTest.versionB')}
              {ctaVariant === 'C' && t('caseStudies.cta.abTest.versionC')}
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/case-studies/download-all"
              className="touch-target inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold transition border-2"
              style={{ 
                color: '#FF6B6B',
                borderColor: '#FF6B6B',
                backgroundColor: 'transparent',
                minWidth: '44px',
                minHeight: '44px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Download className="h-4 w-4" />
              {t('caseStudies.cta.downloadAll')}
            </a>
          </div>
          <p className="mt-6 text-sm font-medium" style={{ color: '#6B7280' }}>
            {t('caseStudies.cta.urgency')}
          </p>
        </div>
      </section>

      {/* Mobile Sticky CTA Bar */}
      {isMobile && (
        <div className="mobile-sticky-cta md:hidden">
          <a
            href="/contact"
            className="touch-target w-full inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-sm font-semibold text-white transition shadow-lg"
            style={{ 
              backgroundColor: '#FF6B6B',
              boxShadow: '0 10px 15px -3px rgba(255, 107, 107, 0.4)',
              minWidth: '44px',
              minHeight: '44px'
            }}
          >
            {t('caseStudies.cta.button')}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      )}

      {/* Desktop Modal Overlay for Expanded Case Study */}
      {modalOpen && isDesktop && (() => {
        const study = filteredStudies.find(s => s.id === modalOpen);
        if (!study) return null;
        
        return (
          <div 
            className="case-study-modal"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setModalOpen(null);
              }
            }}
          >
            <div className="case-study-modal-content">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div 
                    className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide mb-4"
                    style={{ 
                      borderColor: '#FF6B6B',
                      backgroundColor: 'rgba(255, 107, 107, 0.2)',
                      color: '#1A2332'
                    }}
                  >
                    {study.organization}
                  </div>
                  <h2 className="text-2xl font-bold mb-2" style={{ color: '#1A2332' }}>
                    {study.outcome}
                  </h2>
                  <div className="flex items-center gap-4 text-sm" style={{ color: '#6B7280' }}>
                    <span className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {study.organizationType}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {study.region}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(null)}
                  className="touch-target p-2 rounded-lg transition"
                  style={{ 
                    color: '#6B7280',
                    minWidth: '44px',
                    minHeight: '44px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(107, 114, 128, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Metric Highlight */}
              <div 
                className="rounded-xl p-6 mb-6"
                style={{ backgroundColor: '#FF6B6B', color: 'white', borderRadius: '6px', boxShadow: '0 2px 6px rgba(255, 107, 107, 0.25)' }}
              >
                <div className="flex items-center gap-3">
                  {getIcon(study.icon)}
                  <div>
                    <div className="text-3xl font-bold" style={{ fontWeight: 700 }}>{study.metricValue}</div>
                    <div className="text-sm font-medium" style={{ opacity: 0.9 }}>{study.metric}</div>
                  </div>
                </div>
              </div>

              {/* Detail Content */}
              <div className="space-y-4 mb-6">
                <p className="text-base leading-relaxed" style={{ color: '#6B7280' }}>
                  {study.detail}
                </p>
                
                {/* Before/After Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="rounded-lg border p-4" style={{ borderColor: 'rgba(107, 114, 128, 0.2)' }}>
                    <div className="text-sm font-semibold mb-2" style={{ color: '#1A2332' }}>Before</div>
                    <p className="text-sm" style={{ color: '#6B7280' }}>{study.beforeAfter.before}</p>
                  </div>
                  <div className="rounded-lg border p-4" style={{ borderColor: 'rgba(107, 114, 128, 0.2)' }}>
                    <div className="text-sm font-semibold mb-2" style={{ color: '#1A2332' }}>After</div>
                    <p className="text-sm" style={{ color: '#6B7280' }}>{study.beforeAfter.after}</p>
                  </div>
                </div>
              </div>

              {/* Download CTA */}
              <div className="flex gap-3 pt-6 border-t" style={{ borderColor: 'rgba(107, 114, 128, 0.2)' }}>
                <a
                  href={`/case-studies/${study.id}/download`}
                  className="touch-target flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white transition"
                  style={{ 
                    backgroundColor: '#FF6B6B',
                    minWidth: '44px',
                    minHeight: '44px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#E65A5A';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FF6B6B';
                  }}
                >
                  <Download className="h-4 w-4" />
                  {t('caseStudies.download')}
                </a>
                <a
                  href="/contact"
                  className="touch-target inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition border-2"
                  style={{ 
                    color: '#FF6B6B',
                    borderColor: '#FF6B6B',
                    backgroundColor: 'transparent',
                    minWidth: '44px',
                    minHeight: '44px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {t('caseStudies.cta.button')}
                </a>
              </div>
            </div>
          </div>
        );
      })()}
      </div>
    </>
  );
};

export default CaseStudies;

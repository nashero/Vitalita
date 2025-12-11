import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  Clock, 
  Shield, 
  Award, 
  Globe, 
  Users, 
  Lock, 
  Server, 
  Plus, 
  Minus, 
  Linkedin,
  X
} from 'lucide-react';

const CaseStudy = () => {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState('all');
  const [openFaq, setOpenFaq] = useState<number | null>(0); // First question open by default
  const [showRoiCalculator, setShowRoiCalculator] = useState(false);
  const [roiInputs, setRoiInputs] = useState({
    orgSize: 'medium',
    noShowRate: '18',
    monthlyDonations: '500',
    coordinators: '3'
  });
  const [roiResults, setRoiResults] = useState<{
    hoursSaved: number;
    noShowReduction: number;
    additionalDonations: number;
    roiMonths: number;
  } | null>(null);

  const filters = ['all', 'avis', 'croce-rossa', 'fidas', 'more'];
  const filterLabels = [
    t('caseStudyPage.caseStudyGrid.filters.all'),
    t('caseStudyPage.caseStudyGrid.filters.avis'),
    t('caseStudyPage.caseStudyGrid.filters.croceRossa'),
    t('caseStudyPage.caseStudyGrid.filters.fidas'),
    t('caseStudyPage.caseStudyGrid.filters.more')
  ];

  const caseStudies = [
    {
      id: 1,
      filter: 'fidas',
      badge: t('caseStudyPage.caseStudyGrid.card1.badge'),
      color: '#F59E0B',
      organization: t('caseStudyPage.caseStudyGrid.card1.organization'),
      headline: t('caseStudyPage.caseStudyGrid.card1.headline'),
      challenge: t('caseStudyPage.caseStudyGrid.card1.challenge'),
      solution: t('caseStudyPage.caseStudyGrid.card1.solution'),
      results: [
        t('caseStudyPage.caseStudyGrid.card1.result1'),
        t('caseStudyPage.caseStudyGrid.card1.result2'),
        t('caseStudyPage.caseStudyGrid.card1.result3')
      ],
      timeline: t('caseStudyPage.caseStudyGrid.card1.timeline')
    },
    {
      id: 2,
      filter: 'croce-rossa',
      badge: t('caseStudyPage.caseStudyGrid.card2.badge'),
      color: '#0EA5E9',
      organization: t('caseStudyPage.caseStudyGrid.card2.organization'),
      headline: t('caseStudyPage.caseStudyGrid.card2.headline'),
      challenge: t('caseStudyPage.caseStudyGrid.card2.challenge'),
      solution: t('caseStudyPage.caseStudyGrid.card2.solution'),
      results: [
        t('caseStudyPage.caseStudyGrid.card2.result1'),
        t('caseStudyPage.caseStudyGrid.card2.result2'),
        t('caseStudyPage.caseStudyGrid.card2.result3')
      ],
      timeline: t('caseStudyPage.caseStudyGrid.card2.timeline')
    },
    {
      id: 3,
      filter: 'avis',
      badge: t('caseStudyPage.caseStudyGrid.card3.badge'),
      color: '#14B8A6',
      organization: t('caseStudyPage.caseStudyGrid.card3.organization'),
      headline: t('caseStudyPage.caseStudyGrid.card3.headline'),
      challenge: t('caseStudyPage.caseStudyGrid.card3.challenge'),
      solution: t('caseStudyPage.caseStudyGrid.card3.solution'),
      results: [
        t('caseStudyPage.caseStudyGrid.card3.result1'),
        t('caseStudyPage.caseStudyGrid.card3.result2'),
        t('caseStudyPage.caseStudyGrid.card3.result3')
      ],
      timeline: t('caseStudyPage.caseStudyGrid.card3.timeline')
    }
  ];

  const filteredStudies = activeFilter === 'all' 
    ? caseStudies 
    : caseStudies.filter(study => study.filter === activeFilter);

  const faqs = [
    {
      question: t('caseStudyPage.faq.q1.question'),
      answer: t('caseStudyPage.faq.q1.answer')
    },
    {
      question: t('caseStudyPage.faq.q2.question'),
      answer: t('caseStudyPage.faq.q2.answer')
    },
    {
      question: t('caseStudyPage.faq.q3.question'),
      answer: t('caseStudyPage.faq.q3.answer')
    },
    {
      question: t('caseStudyPage.faq.q4.question'),
      answer: t('caseStudyPage.faq.q4.answer')
    },
    {
      question: t('caseStudyPage.faq.q5.question'),
      answer: t('caseStudyPage.faq.q5.answer')
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const calculateROI = () => {
    const noShowRate = parseFloat(roiInputs.noShowRate);
    const monthlyDonations = parseFloat(roiInputs.monthlyDonations);
    const coordinators = parseFloat(roiInputs.coordinators);

    // Calculations based on case study metrics
    const noShowReduction = Math.round(noShowRate * 0.22); // 22% reduction
    const hoursSavedPerWeek = coordinators * 16; // 16 hours per coordinator per week
    const additionalDonations = Math.round(monthlyDonations * 0.35); // 35% efficiency increase
    const roiMonths = roiInputs.orgSize === 'small' ? 3 : roiInputs.orgSize === 'medium' ? 4 : 6;

    setRoiResults({
      hoursSaved: hoursSavedPerWeek,
      noShowReduction,
      additionalDonations,
      roiMonths
    });
  };

  const handleRoiInputChange = (field: string, value: string) => {
    setRoiInputs(prev => ({ ...prev, [field]: value }));
    setRoiResults(null); // Reset results when inputs change
  };

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showRoiCalculator) {
        setShowRoiCalculator(false);
        setRoiResults(null);
      }
    };

    if (showRoiCalculator) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showRoiCalculator]);

  return (
    <>
      <style>{`
        .case-study-hero {
          padding-top: 80px;
          padding-bottom: 80px;
        }
        @media (min-width: 768px) {
          .case-study-hero {
            padding-top: 120px;
            padding-bottom: 120px;
          }
        }
        .organization-logo img {
          max-height: 60px;
          width: auto;
          height: auto;
          object-fit: contain;
        }
        @media (max-width: 479px) {
          .organization-logo {
            width: 100%;
            justify-content: center;
          }
        }
        
        /* Scroll animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .case-study-card,
        .testimonial-card,
        .certification-card {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
        
        /* Smooth scroll */
        html {
          scroll-behavior: smooth;
        }
        
        /* Lazy loading for images */
        img[loading="lazy"] {
          opacity: 0;
          transition: opacity 0.3s;
        }
        
        img[loading="lazy"].loaded {
          opacity: 1;
        }
      `}</style>
      <div className="w-full">
        {/* Hero Section */}
        <header 
          className="w-full case-study-hero"
          style={{
            background: 'linear-gradient(180deg, #1A2332 0%, #111827 100%)',
            paddingTop: '40px',
            paddingBottom: '60px',
            paddingLeft: '16px',
            paddingRight: '16px'
          }}
        >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center gap-8" style={{ gap: '24px' }}>
            {/* Badge */}
            <div
              className="inline-flex items-center justify-center px-4 py-2 rounded"
              style={{
                border: '2px solid #FF6B6B',
                backgroundColor: 'transparent',
                color: '#F9FAFB',
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                borderRadius: '4px'
              }}
            >
              {t('caseStudyPage.hero.badge')}
            </div>

            {/* Main Headline with accent line */}
            <div className="w-full max-w-[800px]">
              <h1
                className="font-bold text-center text-[24px] sm:text-[28px] md:text-[36px] lg:text-[48px]"
                style={{
                  color: '#F9FAFB',
                  lineHeight: 1.2,
                  fontWeight: 700,
                  marginBottom: '8px',
                  borderBottom: '2px solid rgba(255, 107, 107, 0.6)',
                  paddingBottom: '16px'
                }}
              >
                {t('caseStudyPage.hero.headline')}
              </h1>
            </div>

            {/* Subheadline */}
            <p
              className="text-center max-w-[700px] text-base sm:text-lg md:text-xl px-4"
              style={{
                color: 'rgba(249, 250, 251, 0.8)',
                lineHeight: 1.5,
                fontWeight: 400
              }}
            >
              {t('caseStudyPage.hero.subheadline')}
            </p>

            {/* Statistics Row */}
            <div 
              className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 px-4"
              style={{ gap: '16px' }}
            >
              {/* Card 1 */}
              <div
                className="rounded-xl p-6"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid #FF6B6B',
                  padding: '24px',
                  borderRadius: '12px'
                }}
              >
                <div
                  className="font-bold mb-2"
                  style={{
                    fontSize: '32px',
                    fontWeight: 700,
                    color: '#F9FAFB'
                  }}
                >
                  {t('caseStudyPage.hero.statCard1.value')}
                </div>
                <div
                  className="text-sm"
                  style={{
                    fontSize: '14px',
                    color: 'rgba(249, 250, 251, 0.9)',
                    fontWeight: 400
                  }}
                >
                  {t('caseStudyPage.hero.statCard1.label')}
                </div>
              </div>

              {/* Card 2 */}
              <div
                className="rounded-xl p-6"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid #FF6B6B',
                  padding: '24px',
                  borderRadius: '12px'
                }}
              >
                <div
                  className="font-bold mb-2"
                  style={{
                    fontSize: '32px',
                    fontWeight: 700,
                    color: '#F9FAFB'
                  }}
                >
                  {t('caseStudyPage.hero.statCard2.value')}
                </div>
                <div
                  className="text-sm"
                  style={{
                    fontSize: '14px',
                    color: 'rgba(249, 250, 251, 0.9)',
                    fontWeight: 400
                  }}
                >
                  {t('caseStudyPage.hero.statCard2.label')}
                </div>
              </div>

              {/* Card 3 */}
              <div
                className="rounded-xl p-6"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid #FF6B6B',
                  padding: '24px',
                  borderRadius: '12px'
                }}
              >
                <div
                  className="font-bold mb-2"
                  style={{
                    fontSize: '32px',
                    fontWeight: 700,
                    color: '#F9FAFB'
                  }}
                >
                  {t('caseStudyPage.hero.statCard3.value')}
                </div>
                <div
                  className="text-sm"
                  style={{
                    fontSize: '14px',
                    color: 'rgba(249, 250, 251, 0.9)',
                    fontWeight: 400
                  }}
                >
                  {t('caseStudyPage.hero.statCard3.label')}
                </div>
              </div>
            </div>

            {/* Primary CTA Button */}
            <button
              onClick={() => setShowRoiCalculator(true)}
              className="inline-flex items-center gap-2 rounded-lg font-bold transition-colors px-6 py-3 sm:px-8 sm:py-4"
              style={{
                backgroundColor: '#FF6B6B',
                color: '#FFFFFF',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E55555';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FF6B6B';
              }}
            >
              {t('caseStudyPage.hero.cta')}
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Organization Trust Bar Section */}
      <section 
        className="w-full"
        style={{
          backgroundColor: '#FFFFFF',
          paddingTop: '40px',
          paddingBottom: '40px',
          paddingLeft: '16px',
          paddingRight: '16px'
        }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Heading */}
          <h2
            className="text-center font-bold mb-6 sm:mb-10 text-xl sm:text-2xl md:text-3xl px-4"
            style={{
              fontWeight: 700,
              color: '#111827'
            }}
          >
            {t('caseStudyPage.trustBar.heading')}
          </h2>

          {/* Logo Grid */}
          <div 
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8 px-4"
          >
            {/* AVIS Logo */}
            <div className="flex items-center justify-center">
              <div
                className="organization-logo"
                style={{
                  maxHeight: '60px',
                  filter: 'grayscale(100%)',
                  opacity: 0.7,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '60px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'grayscale(0%)';
                  e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'grayscale(100%)';
                  e.currentTarget.style.opacity = '0.7';
                }}
              >
                <img
                  src="/logos/avis-logo.svg"
                  alt="AVIS Lombardia - Italian Blood Donation Association using Vitalita"
                  style={{
                    maxHeight: '60px',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    // Fallback to text if image doesn't exist
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (!target.parentElement?.querySelector('.logo-fallback')) {
                      const fallback = document.createElement('div');
                      fallback.className = 'logo-fallback';
                      fallback.textContent = 'AVIS';
                      fallback.style.cssText = 'font-size: 24px; font-weight: 700; color: #1A2332;';
                      target.parentElement?.appendChild(fallback);
                    }
                  }}
                />
              </div>
            </div>

            {/* Croce Rossa Logo */}
            <div className="flex items-center justify-center">
              <div
                className="organization-logo"
                style={{
                  maxHeight: '60px',
                  filter: 'grayscale(100%)',
                  opacity: 0.7,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '60px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'grayscale(0%)';
                  e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'grayscale(100%)';
                  e.currentTarget.style.opacity = '0.7';
                }}
              >
                <img
                  src="/logos/croce-rossa-logo.svg"
                  alt="Croce Rossa Italiana - Red Cross Italy donor management"
                  style={{
                    maxHeight: '60px',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (!target.parentElement?.querySelector('.logo-fallback')) {
                      const fallback = document.createElement('div');
                      fallback.className = 'logo-fallback';
                      fallback.textContent = 'Croce Rossa';
                      fallback.style.cssText = 'font-size: 20px; font-weight: 700; color: #1A2332;';
                      target.parentElement?.appendChild(fallback);
                    }
                  }}
                />
              </div>
            </div>

            {/* FIDAS Logo */}
            <div className="flex items-center justify-center">
              <div
                className="organization-logo"
                style={{
                  maxHeight: '60px',
                  filter: 'grayscale(100%)',
                  opacity: 0.7,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '60px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'grayscale(0%)';
                  e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'grayscale(100%)';
                  e.currentTarget.style.opacity = '0.7';
                }}
              >
                <img
                  src="/logos/fidas-logo.svg"
                  alt="FIDAS Veneto - Blood donation federation partner"
                  style={{
                    maxHeight: '60px',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (!target.parentElement?.querySelector('.logo-fallback')) {
                      const fallback = document.createElement('div');
                      fallback.className = 'logo-fallback';
                      fallback.textContent = 'FIDAS';
                      fallback.style.cssText = 'font-size: 24px; font-weight: 700; color: #1A2332;';
                      target.parentElement?.appendChild(fallback);
                    }
                  }}
                />
              </div>
            </div>

            {/* +44 More Badge */}
            <div className="flex items-center justify-center">
              <div
                className="organization-logo"
                style={{
                  maxHeight: '60px',
                  filter: 'grayscale(100%)',
                  opacity: 0.7,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '60px',
                  border: '2px solid #6B7280',
                  borderRadius: '8px',
                  padding: '12px 24px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'grayscale(0%)';
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.borderColor = '#FF6B6B';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'grayscale(100%)';
                  e.currentTarget.style.opacity = '0.7';
                  e.currentTarget.style.borderColor = '#6B7280';
                }}
              >
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#1A2332'
                  }}
                >
                  +44 More
                </span>
              </div>
            </div>
          </div>

          {/* Subtext */}
          <p
            className="text-center"
            style={{
              color: '#6B7280',
              fontSize: '16px',
              fontWeight: 400
            }}
          >
            {t('caseStudyPage.trustBar.subtext')}
          </p>
        </div>
      </section>

      {/* Video Testimonials Section */}
      <section
        className="w-full"
        style={{
          backgroundColor: '#F9FAFB',
          paddingTop: '40px',
          paddingBottom: '40px',
          paddingLeft: '16px',
          paddingRight: '16px'
        }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Heading */}
          <h2
            className="text-center font-bold mb-8 sm:mb-12 text-xl sm:text-2xl md:text-3xl px-4"
            style={{
              fontWeight: 700,
              color: '#111827'
            }}
          >
            {t('caseStudyPage.videoTestimonials.heading')}
          </h2>

          {/* Video Cards Grid */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 px-4"
          >
            {/* Video Card 1 */}
            <div
              className="video-card"
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                backgroundColor: '#FFFFFF'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
              }}
            >
              {/* Video Thumbnail Area */}
              <div
                className="relative aspect-video flex items-center justify-center"
                style={{
                  backgroundColor: '#1A2332',
                  position: 'relative'
                }}
              >
                {/* Play Button Overlay */}
                <div
                  className="play-button-overlay"
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: '#FF6B6B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    zIndex: 10
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 107, 107, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <Play
                    className="text-white"
                    fill="white"
                    style={{
                      width: '32px',
                      height: '32px',
                      marginLeft: '4px'
                    }}
                  />
                </div>
              </div>

              {/* Info Card */}
              <div
                style={{
                  backgroundColor: '#1A2332',
                  padding: '20px',
                  color: '#F9FAFB'
                }}
              >
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#F9FAFB',
                    marginBottom: '8px'
                  }}
                >
                  {t('caseStudyPage.videoTestimonials.card1.title')}
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    color: 'rgba(249, 250, 251, 0.8)',
                    fontWeight: 400
                  }}
                >
                  {t('caseStudyPage.videoTestimonials.card1.organization')}
                </p>
              </div>
            </div>

            {/* Video Card 2 */}
            <div
              className="video-card"
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                backgroundColor: '#FFFFFF'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
              }}
            >
              {/* Video Thumbnail Area */}
              <div
                className="relative aspect-video flex items-center justify-center"
                style={{
                  backgroundColor: '#1A2332',
                  position: 'relative'
                }}
              >
                {/* Play Button Overlay */}
                <div
                  className="play-button-overlay"
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: '#FF6B6B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    zIndex: 10
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 107, 107, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <Play
                    className="text-white"
                    fill="white"
                    style={{
                      width: '32px',
                      height: '32px',
                      marginLeft: '4px'
                    }}
                  />
                </div>
              </div>

              {/* Info Card */}
              <div
                style={{
                  backgroundColor: '#1A2332',
                  padding: '20px',
                  color: '#F9FAFB'
                }}
              >
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#F9FAFB',
                    marginBottom: '8px'
                  }}
                >
                  {t('caseStudyPage.videoTestimonials.card2.title')}
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    color: 'rgba(249, 250, 251, 0.8)',
                    fontWeight: 400
                  }}
                >
                  {t('caseStudyPage.videoTestimonials.card2.organization')}
                </p>
              </div>
            </div>

            {/* Video Card 3 */}
            <div
              className="video-card"
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                backgroundColor: '#FFFFFF'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
              }}
            >
              {/* Video Thumbnail Area */}
              <div
                className="relative aspect-video flex items-center justify-center"
                style={{
                  backgroundColor: '#1A2332',
                  position: 'relative'
                }}
              >
                {/* Play Button Overlay */}
                <div
                  className="play-button-overlay"
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: '#FF6B6B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    zIndex: 10
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 107, 107, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <Play
                    className="text-white"
                    fill="white"
                    style={{
                      width: '32px',
                      height: '32px',
                      marginLeft: '4px'
                    }}
                  />
                </div>
              </div>

              {/* Info Card */}
              <div
                style={{
                  backgroundColor: '#1A2332',
                  padding: '20px',
                  color: '#F9FAFB'
                }}
              >
                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 700,
                    color: '#F9FAFB',
                    marginBottom: '8px'
                  }}
                >
                  {t('caseStudyPage.videoTestimonials.card3.title')}
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    color: 'rgba(249, 250, 251, 0.8)',
                    fontWeight: 400
                  }}
                >
                  {t('caseStudyPage.videoTestimonials.card3.organization')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Metrics Section */}
      <section
        className="w-full"
        style={{
          backgroundColor: '#FFFFFF',
          paddingTop: '80px',
          paddingBottom: '80px',
          paddingLeft: '16px',
          paddingRight: '16px'
        }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Heading */}
          <h2
            className="text-center font-bold mb-14 text-[28px] md:text-[36px]"
            style={{
              fontWeight: 700,
              color: '#111827',
              marginBottom: '56px'
            }}
          >
            {t('caseStudyPage.impactMetrics.heading')}
          </h2>

          {/* Metric Cards Grid */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            style={{
              gap: '32px'
            }}
          >
            {/* Card 1: No-Show Rates (Teal) */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '32px',
                borderLeft: '4px solid #14B8A6'
              }}
            >
              {/* Badge */}
              <div
                style={{
                  backgroundColor: 'rgba(20, 184, 166, 0.1)',
                  border: '2px solid #14B8A6',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  display: 'inline-block',
                  marginBottom: '16px'
                }}
              >
                <span
                  style={{
                    fontSize: '32px',
                    fontWeight: 700,
                    color: '#14B8A6'
                  }}
                >
                  {t('caseStudyPage.impactMetrics.card1.badge')}
                </span>
              </div>

              {/* Headline */}
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#111827',
                  marginTop: '16px',
                  marginBottom: '12px'
                }}
              >
                {t('caseStudyPage.impactMetrics.card1.headline')}
              </h3>

              {/* Context Paragraph */}
              <p
                style={{
                  fontSize: '16px',
                  color: '#6B7280',
                  lineHeight: 1.6,
                  marginBottom: '16px'
                }}
              >
                {t('caseStudyPage.impactMetrics.card1.description')}
              </p>

              {/* Mini-stat */}
              <p
                style={{
                  fontSize: '14px',
                  color: '#111827',
                  fontWeight: 600,
                  marginTop: '16px'
                }}
              >
                {t('caseStudyPage.impactMetrics.card1.ministat')}
              </p>
            </div>

            {/* Card 2: Efficiency (Sky Blue) */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '32px',
                borderLeft: '4px solid #0EA5E9'
              }}
            >
              {/* Badge */}
              <div
                style={{
                  backgroundColor: 'rgba(14, 165, 233, 0.1)',
                  border: '2px solid #0EA5E9',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  display: 'inline-block',
                  marginBottom: '16px'
                }}
              >
                <span
                  style={{
                    fontSize: '32px',
                    fontWeight: 700,
                    color: '#0EA5E9'
                  }}
                >
                  {t('caseStudyPage.impactMetrics.card2.badge')}
                </span>
              </div>

              {/* Headline */}
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#111827',
                  marginTop: '16px',
                  marginBottom: '12px'
                }}
              >
                {t('caseStudyPage.impactMetrics.card2.headline')}
              </h3>

              {/* Context Paragraph */}
              <p
                style={{
                  fontSize: '16px',
                  color: '#6B7280',
                  lineHeight: 1.6,
                  marginBottom: '16px'
                }}
              >
                {t('caseStudyPage.impactMetrics.card2.description')}
              </p>

              {/* Mini-stat */}
              <p
                style={{
                  fontSize: '14px',
                  color: '#111827',
                  fontWeight: 600,
                  marginTop: '16px'
                }}
              >
                {t('caseStudyPage.impactMetrics.card2.ministat')}
              </p>
            </div>

            {/* Card 3: Admin Time (Amber) */}
            <div
              className="md:col-span-2 lg:col-span-1"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '32px',
                borderLeft: '4px solid #F59E0B'
              }}
            >
              {/* Badge */}
              <div
                style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  border: '2px solid #F59E0B',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  display: 'inline-block',
                  marginBottom: '16px'
                }}
              >
                <span
                  style={{
                    fontSize: '32px',
                    fontWeight: 700,
                    color: '#F59E0B'
                  }}
                >
                  {t('caseStudyPage.impactMetrics.card3.badge')}
                </span>
              </div>

              {/* Headline */}
              <h3
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#111827',
                  marginTop: '16px',
                  marginBottom: '12px'
                }}
              >
                {t('caseStudyPage.impactMetrics.card3.headline')}
              </h3>

              {/* Context Paragraph */}
              <p
                style={{
                  fontSize: '16px',
                  color: '#6B7280',
                  lineHeight: 1.6,
                  marginBottom: '16px'
                }}
              >
                {t('caseStudyPage.impactMetrics.card3.description')}
              </p>

              {/* Mini-stat */}
              <p
                style={{
                  fontSize: '14px',
                  color: '#111827',
                  fontWeight: 600,
                  marginTop: '16px'
                }}
              >
                {t('caseStudyPage.impactMetrics.card3.ministat')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Case Study Filter & Grid Section */}
      <section
        className="w-full"
        style={{
          backgroundColor: '#F9FAFB',
          paddingTop: '80px',
          paddingBottom: '80px',
          paddingLeft: '16px',
          paddingRight: '16px'
        }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Heading */}
          <h2
            className="text-center font-bold mb-4 text-[26px] md:text-[32px]"
            style={{
              fontWeight: 700,
              color: '#111827',
              marginBottom: '16px'
            }}
          >
            {t('caseStudyPage.caseStudyGrid.heading')}
          </h2>

          {/* Subheading */}
          <p
            className="text-center mb-12"
            style={{
              fontSize: '18px',
              color: '#6B7280',
              marginBottom: '48px'
            }}
          >
            {t('caseStudyPage.caseStudyGrid.subheading')}
          </p>

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {filters.map((filter, index) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className="px-6 py-3 rounded-t-lg transition-all"
                style={{
                  backgroundColor: activeFilter === filter ? '#FFFFFF' : 'transparent',
                  color: activeFilter === filter ? '#111827' : '#6B7280',
                  borderBottom: activeFilter === filter ? '2px solid #FF6B6B' : '2px solid transparent',
                  borderRadius: '8px 8px 0 0',
                  fontWeight: activeFilter === filter ? 600 : 400,
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (activeFilter !== filter) {
                    e.currentTarget.style.color = '#111827';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeFilter !== filter) {
                    e.currentTarget.style.color = '#6B7280';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {filterLabels[index]}
              </button>
            ))}
          </div>

          {/* Case Study Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStudies.map((study) => (
              <div
                key={study.id}
                className="case-study-card"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '32px',
                  borderLeft: `4px solid ${study.color}`,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
                  e.currentTarget.style.borderLeftWidth = '6px';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderLeftWidth = '4px';
                }}
              >
                {/* Card Header */}
                <div className="flex justify-between items-start mb-4">
                  {/* Percentage Badge */}
                  <div
                    style={{
                      backgroundColor: `${study.color}1A`,
                      border: `2px solid ${study.color}`,
                      borderRadius: '8px',
                      padding: '8px 16px',
                      display: 'inline-block'
                    }}
                  >
                    <span
                      style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        color: study.color
                      }}
                    >
                      {study.badge}
                    </span>
                  </div>

                  {/* Organization Badge */}
                  <div
                    style={{
                      backgroundColor: '#1A2332',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontWeight: 600
                    }}
                  >
                    {study.organization}
                  </div>
                </div>

                {/* Headline */}
                <h3
                  style={{
                    fontSize: '22px',
                    fontWeight: 700,
                    color: '#111827',
                    lineHeight: 1.3,
                    marginTop: '16px',
                    marginBottom: '16px'
                  }}
                >
                  {study.headline}
                </h3>

                {/* Challenge */}
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#6B7280' }}>{t('caseStudyPage.caseStudyGrid.labels.challenge')} </span>
                  <span style={{ fontSize: '14px', color: '#6B7280' }}>{study.challenge}</span>
                </div>

                {/* Solution */}
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#6B7280' }}>{t('caseStudyPage.caseStudyGrid.labels.solution')} </span>
                  <span style={{ fontSize: '14px', color: '#6B7280' }}>{study.solution}</span>
                </div>

                {/* Results */}
                <ul style={{ marginBottom: '16px', listStyle: 'none', padding: 0 }}>
                  {study.results.map((result, idx) => (
                    <li key={idx} style={{ marginBottom: '8px', fontSize: '14px', color: '#111827' }}>
                      <CheckCircle2 
                        style={{ 
                          display: 'inline-block', 
                          marginRight: '8px', 
                          color: study.color,
                          width: '16px',
                          height: '16px',
                          verticalAlign: 'middle'
                        }} 
                      />
                      {result}
                    </li>
                  ))}
                </ul>

                {/* Timeline */}
                <div className="flex items-center gap-2" style={{ color: '#6B7280', fontSize: '12px', fontStyle: 'italic' }}>
                  <Clock style={{ width: '14px', height: '14px' }} />
                  <span>{study.timeline}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Written Testimonials Section */}
      <section
        className="w-full"
        style={{
          backgroundColor: '#FFFFFF',
          paddingTop: '80px',
          paddingBottom: '80px',
          paddingLeft: '16px',
          paddingRight: '16px'
        }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Heading */}
          <h2
            className="text-center font-bold mb-4 text-[26px] md:text-[32px]"
            style={{
              fontWeight: 700,
              color: '#111827',
              marginBottom: '16px'
            }}
          >
            {t('caseStudyPage.testimonials.heading')}
          </h2>

          {/* Subheading */}
          <p
            className="text-center mb-14"
            style={{
              fontSize: '16px',
              color: '#6B7280',
              marginBottom: '56px'
            }}
          >
            {t('caseStudyPage.testimonials.subheading')}
          </p>

          {/* Testimonial Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div
              className="testimonial-card"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderLeft: '4px solid #FF6B6B',
                borderRadius: '12px',
                padding: '32px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderLeftWidth = '6px';
                e.currentTarget.style.backgroundColor = '#F9FAFB';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderLeftWidth = '4px';
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              {/* Card Header */}
              <div className="flex gap-4 mb-6">
                {/* Avatar */}
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    border: '3px solid #FF6B6B',
                    backgroundColor: '#F9FAFB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#1A2332'
                  }}
                >
                  MR
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
                    {t('caseStudyPage.testimonials.testimonial1.name')}
                  </h4>
                  <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>
                    {t('caseStudyPage.testimonials.testimonial1.title')}
                  </p>
                  <div className="flex items-center gap-1">
                    <Linkedin style={{ width: '14px', height: '14px', color: '#14B8A6' }} />
                    <span style={{ fontSize: '12px', color: '#14B8A6' }}>{t('caseStudyPage.testimonials.verified')}</span>
                  </div>
                </div>
              </div>

              {/* Quote */}
              <p
                style={{
                  fontSize: '18px',
                  color: '#111827',
                  lineHeight: 1.7,
                  fontStyle: 'italic',
                  marginBottom: '16px',
                  position: 'relative',
                  paddingLeft: '20px'
                }}
              >
                <span style={{ position: 'absolute', left: 0, fontSize: '32px', lineHeight: 1, color: '#FF6B6B', opacity: 0.3 }}>"</span>
                {t('caseStudyPage.testimonials.testimonial1.quote')}
                <span style={{ fontSize: '32px', lineHeight: 1, color: '#FF6B6B', opacity: 0.3 }}>"</span>
              </p>

              {/* Organization Badge */}
              <div
                style={{
                  backgroundColor: '#1A2332',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  display: 'inline-block',
                  fontWeight: 600
                }}
              >
                {t('caseStudyPage.testimonials.testimonial1.organization')}
              </div>
            </div>

            {/* Testimonial 2 */}
            <div
              className="testimonial-card"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderLeft: '4px solid #FF6B6B',
                borderRadius: '12px',
                padding: '32px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderLeftWidth = '6px';
                e.currentTarget.style.backgroundColor = '#F9FAFB';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderLeftWidth = '4px';
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              <div className="flex gap-4 mb-6">
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    border: '3px solid #FF6B6B',
                    backgroundColor: '#F9FAFB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#1A2332'
                  }}
                >
                  GB
                </div>
                <div className="flex-1">
                  <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
                    {t('caseStudyPage.testimonials.testimonial2.name')}
                  </h4>
                  <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>
                    {t('caseStudyPage.testimonials.testimonial2.title')}
                  </p>
                  <div className="flex items-center gap-1">
                    <Linkedin style={{ width: '14px', height: '14px', color: '#14B8A6' }} />
                    <span style={{ fontSize: '12px', color: '#14B8A6' }}>{t('caseStudyPage.testimonials.verified')}</span>
                  </div>
                </div>
              </div>
              <p
                style={{
                  fontSize: '18px',
                  color: '#111827',
                  lineHeight: 1.7,
                  fontStyle: 'italic',
                  marginBottom: '16px',
                  position: 'relative',
                  paddingLeft: '20px'
                }}
              >
                <span style={{ position: 'absolute', left: 0, fontSize: '32px', lineHeight: 1, color: '#FF6B6B', opacity: 0.3 }}>"</span>
                {t('caseStudyPage.testimonials.testimonial2.quote')}
                <span style={{ fontSize: '32px', lineHeight: 1, color: '#FF6B6B', opacity: 0.3 }}>"</span>
              </p>
              <div
                style={{
                  backgroundColor: '#1A2332',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  display: 'inline-block',
                  fontWeight: 600
                }}
              >
                {t('caseStudyPage.testimonials.testimonial2.organization')}
              </div>
            </div>

            {/* Testimonial 3 */}
            <div
              className="testimonial-card"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderLeft: '4px solid #FF6B6B',
                borderRadius: '12px',
                padding: '32px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderLeftWidth = '6px';
                e.currentTarget.style.backgroundColor = '#F9FAFB';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderLeftWidth = '4px';
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
            >
              <div className="flex gap-4 mb-6">
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    border: '3px solid #FF6B6B',
                    backgroundColor: '#F9FAFB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: '24px',
                    fontWeight: 700,
                    color: '#1A2332'
                  }}
                >
                  LC
                </div>
                <div className="flex-1">
                  <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
                    {t('caseStudyPage.testimonials.testimonial3.name')}
                  </h4>
                  <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>
                    {t('caseStudyPage.testimonials.testimonial3.title')}
                  </p>
                  <div className="flex items-center gap-1">
                    <Linkedin style={{ width: '14px', height: '14px', color: '#14B8A6' }} />
                    <span style={{ fontSize: '12px', color: '#14B8A6' }}>{t('caseStudyPage.testimonials.verified')}</span>
                  </div>
                </div>
              </div>
              <p
                style={{
                  fontSize: '18px',
                  color: '#111827',
                  lineHeight: 1.7,
                  fontStyle: 'italic',
                  marginBottom: '16px',
                  position: 'relative',
                  paddingLeft: '20px'
                }}
              >
                <span style={{ position: 'absolute', left: 0, fontSize: '32px', lineHeight: 1, color: '#FF6B6B', opacity: 0.3 }}>"</span>
                {t('caseStudyPage.testimonials.testimonial3.quote')}
                <span style={{ fontSize: '32px', lineHeight: 1, color: '#FF6B6B', opacity: 0.3 }}>"</span>
              </p>
              <div
                style={{
                  backgroundColor: '#1A2332',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  display: 'inline-block',
                  fontWeight: 600
                }}
              >
                {t('caseStudyPage.testimonials.testimonial3.organization')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Regulatory Compliance Section */}
      <section
        className="w-full"
        style={{
          backgroundColor: '#F9FAFB',
          paddingTop: '80px',
          paddingBottom: '80px',
          paddingLeft: '16px',
          paddingRight: '16px'
        }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Heading */}
          <h2
            className="text-center font-bold mb-4 text-[26px] md:text-[32px]"
            style={{
              fontWeight: 700,
              color: '#111827',
              marginBottom: '16px'
            }}
          >
            {t('caseStudyPage.compliance.heading')}
          </h2>

          {/* Subheading */}
          <p
            className="text-center mb-14"
            style={{
              fontSize: '16px',
              color: '#6B7280',
              marginBottom: '56px'
            }}
          >
            {t('caseStudyPage.compliance.subheading')}
          </p>

          {/* Certification Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Card 1: GDPR */}
            <div
              className="certification-card"
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid #E5E7EB',
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F9FAFB';
                e.currentTarget.style.borderColor = '#FF6B6B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.borderColor = '#E5E7EB';
              }}
            >
              <Shield
                style={{
                  width: '64px',
                  height: '64px',
                  color: '#FF6B6B',
                  strokeWidth: 2,
                  margin: '0 auto 16px',
                  fill: 'none'
                }}
              />
              <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>
                {t('caseStudyPage.compliance.card1.name')}
              </h4>
              <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6 }}>
                {t('caseStudyPage.compliance.card1.description')}
              </p>
            </div>

            {/* Card 2: ISO 27001 */}
            <div
              className="certification-card"
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid #E5E7EB',
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F9FAFB';
                e.currentTarget.style.borderColor = '#FF6B6B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.borderColor = '#E5E7EB';
              }}
            >
              <Award
                style={{
                  width: '64px',
                  height: '64px',
                  color: '#FF6B6B',
                  strokeWidth: 2,
                  margin: '0 auto 16px',
                  fill: 'none'
                }}
              />
              <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>
                {t('caseStudyPage.compliance.card2.name')}
              </h4>
              <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6 }}>
                {t('caseStudyPage.compliance.card2.description')}
              </p>
            </div>

            {/* Card 3: EU Digital Standards */}
            <div
              className="certification-card"
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid #E5E7EB',
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F9FAFB';
                e.currentTarget.style.borderColor = '#FF6B6B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.borderColor = '#E5E7EB';
              }}
            >
              <Globe
                style={{
                  width: '64px',
                  height: '64px',
                  color: '#FF6B6B',
                  strokeWidth: 2,
                  margin: '0 auto 16px',
                  fill: 'none'
                }}
              />
              <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>
                {t('caseStudyPage.compliance.card3.name')}
              </h4>
              <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6 }}>
                {t('caseStudyPage.compliance.card3.description')}
              </p>
            </div>

            {/* Card 4: Ministry of Health */}
            <div
              className="certification-card"
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid #E5E7EB',
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F9FAFB';
                e.currentTarget.style.borderColor = '#FF6B6B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.borderColor = '#E5E7EB';
              }}
            >
              <Shield
                style={{
                  width: '64px',
                  height: '64px',
                  color: '#FF6B6B',
                  strokeWidth: 2,
                  margin: '0 auto 16px',
                  fill: 'none'
                }}
              />
              <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>
                {t('caseStudyPage.compliance.card4.name')}
              </h4>
              <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6 }}>
                {t('caseStudyPage.compliance.card4.description')}
              </p>
            </div>
          </div>

          {/* Additional Trust Signals */}
          <div className="flex flex-wrap justify-center items-center gap-10" style={{ gap: '40px' }}>
            <div className="flex items-center gap-2">
              <Lock style={{ width: '18px', height: '18px', color: '#6B7280' }} />
              <span style={{ fontSize: '14px', color: '#6B7280' }}>{t('caseStudyPage.compliance.trustSignals.breaches')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Server style={{ width: '18px', height: '18px', color: '#6B7280' }} />
              <span style={{ fontSize: '14px', color: '#6B7280' }}>{t('caseStudyPage.compliance.trustSignals.infrastructure')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock style={{ width: '18px', height: '18px', color: '#6B7280' }} />
              <span style={{ fontSize: '14px', color: '#6B7280' }}>{t('caseStudyPage.compliance.trustSignals.uptime')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        className="w-full"
        style={{
          backgroundColor: '#FFFFFF',
          paddingTop: '80px',
          paddingBottom: '80px',
          paddingLeft: '16px',
          paddingRight: '16px'
        }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Heading */}
          <h2
            className="text-center font-bold mb-14 text-[26px] md:text-[32px]"
            style={{
              fontWeight: 700,
              color: '#111827',
              marginBottom: '56px'
            }}
          >
            {t('caseStudyPage.faq.heading')}
          </h2>

          {/* Accordion */}
          <div>
            {faqs.map((faq, index) => (
              <div
                key={index}
                style={{
                  borderBottom: '1px solid #E5E7EB',
                  padding: '24px 0'
                }}
              >
                {/* Question */}
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between text-left"
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#111827',
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                    border: 'none',
                    padding: 0
                  }}
                >
                  <span>{faq.question}</span>
                  {openFaq === index ? (
                    <Minus style={{ width: '20px', height: '20px', color: '#FF6B6B', flexShrink: 0 }} />
                  ) : (
                    <Plus style={{ width: '20px', height: '20px', color: '#FF6B6B', flexShrink: 0 }} />
                  )}
                </button>

                {/* Answer */}
                <div
                  style={{
                    maxHeight: openFaq === index ? '1000px' : '0',
                    opacity: openFaq === index ? 1 : 0,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    paddingTop: openFaq === index ? '16px' : '0'
                  }}
                >
                  <p
                    style={{
                      fontSize: '16px',
                      color: '#6B7280',
                      lineHeight: 1.7
                    }}
                  >
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Footer Section */}
      <section
        className="w-full"
        style={{
          backgroundColor: '#F9FAFB',
          paddingTop: '60px',
          paddingBottom: '60px',
          paddingLeft: '16px',
          paddingRight: '16px'
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 text-center">
            {/* Column 1 */}
            <div>
              <Globe
                style={{
                  width: '48px',
                  height: '48px',
                  color: '#FF6B6B',
                  strokeWidth: 2,
                  margin: '0 auto 16px'
                }}
              />
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>
                {t('caseStudyPage.trustFooter.column1.heading')}
              </h3>
              <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6 }}>
                {t('caseStudyPage.trustFooter.column1.text')}
              </p>
            </div>

            {/* Column 2 */}
            <div>
              <Users
                style={{
                  width: '48px',
                  height: '48px',
                  color: '#14B8A6',
                  strokeWidth: 2,
                  margin: '0 auto 16px'
                }}
              />
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>
                {t('caseStudyPage.trustFooter.column2.heading')}
              </h3>
              <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6 }}>
                {t('caseStudyPage.trustFooter.column2.text')}
              </p>
            </div>

            {/* Column 3 */}
            <div>
              <Shield
                style={{
                  width: '48px',
                  height: '48px',
                  color: '#0EA5E9',
                  strokeWidth: 2,
                  margin: '0 auto 16px',
                  fill: 'none'
                }}
              />
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>
                {t('caseStudyPage.trustFooter.column3.heading')}
              </h3>
              <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6 }}>
                {t('caseStudyPage.trustFooter.column3.text')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section
        className="w-full"
        style={{
          background: 'linear-gradient(180deg, #1A2332 0%, #111827 100%)',
          paddingTop: '60px',
          paddingBottom: '60px',
          paddingLeft: '16px',
          paddingRight: '16px',
          textAlign: 'center'
        }}
      >
        <div className="max-w-4xl mx-auto px-4">
          {/* Heading */}
          <h2
            className="font-bold mb-4 text-2xl sm:text-3xl md:text-4xl"
            style={{
              fontWeight: 700,
              color: '#F9FAFB',
              marginBottom: '16px'
            }}
          >
            {t('caseStudyPage.finalCta.heading')}
          </h2>

          {/* Subheading */}
          <p
            className="mb-6 sm:mb-10 text-base sm:text-lg"
            style={{
              color: 'rgba(249, 250, 251, 0.8)'
            }}
          >
            {t('caseStudyPage.finalCta.subheading')}
          </p>

          {/* CTA Button */}
          <div className="flex justify-center items-center mb-4 sm:mb-6">
            {/* Primary Button */}
            <button
              onClick={() => setShowRoiCalculator(true)}
              className="inline-flex items-center gap-2 px-6 py-3 sm:px-9 sm:py-4 rounded-lg font-bold transition-all text-sm sm:text-base"
              style={{
                backgroundColor: '#FF6B6B',
                color: '#FFFFFF',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E55555';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FF6B6B';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {t('caseStudyPage.finalCta.button')}
              <ArrowRight style={{ width: '20px', height: '20px' }} />
            </button>

          </div>

          {/* Micro-copy */}
          <p
            style={{
              fontSize: '14px',
              color: 'rgba(249, 250, 251, 0.6)',
              marginTop: '24px'
            }}
          >
            {t('caseStudyPage.finalCta.microcopy')}
          </p>
        </div>
      </section>

        {/* Main Content Area - Placeholder for additional sections */}
        <main className="w-full">
          {/* Additional content sections can be added here */}
        </main>
      </div>

      {/* ROI Calculator Modal */}
      {showRoiCalculator && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(4px)'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowRoiCalculator(false);
            }
          }}
        >
          <div
            className="relative w-full max-w-2xl rounded-2xl p-4 sm:p-6 md:p-8 my-4"
            style={{
              backgroundColor: '#FFFFFF',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setShowRoiCalculator(false);
                setRoiResults(null);
              }}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 rounded-lg transition-colors"
              style={{
                color: '#6B7280',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F9FAFB';
                e.currentTarget.style.color = '#111827';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#6B7280';
              }}
              aria-label="Close calculator"
            >
              <X style={{ width: '24px', height: '24px' }} />
            </button>

            {/* Modal Header */}
            <div className="mb-6 sm:mb-8">
              <h2
                className="text-xl sm:text-2xl md:text-3xl"
                style={{
                  fontWeight: 700,
                  color: '#111827',
                  marginBottom: '8px'
                }}
              >
                {t('caseStudyPage.roiCalculator.title')}
              </h2>
              <p style={{ fontSize: '16px', color: '#6B7280' }}>
                {t('caseStudyPage.roiCalculator.subtitle')}
              </p>
            </div>

            {/* Calculator Form */}
            <div className="space-y-6 mb-8">
              {/* Organization Size */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#111827',
                    marginBottom: '8px'
                  }}
                >
                  {t('caseStudyPage.roiCalculator.orgSize')}
                </label>
                <select
                  value={roiInputs.orgSize}
                  onChange={(e) => handleRoiInputChange('orgSize', e.target.value)}
                  className="w-full rounded-lg border px-4 py-3"
                  style={{
                    borderColor: '#E5E7EB',
                    fontSize: '16px',
                    color: '#111827',
                    backgroundColor: '#FFFFFF'
                  }}
                >
                  <option value="small">{t('caseStudyPage.roiCalculator.orgSizeSmall')}</option>
                  <option value="medium">{t('caseStudyPage.roiCalculator.orgSizeMedium')}</option>
                  <option value="large">{t('caseStudyPage.roiCalculator.orgSizeLarge')}</option>
                </select>
              </div>

              {/* Current No-Show Rate */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#111827',
                    marginBottom: '8px'
                  }}
                >
                  {t('caseStudyPage.roiCalculator.noShowRate')}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={roiInputs.noShowRate}
                    onChange={(e) => handleRoiInputChange('noShowRate', e.target.value)}
                    className="flex-1 rounded-lg border px-4 py-3"
                    style={{
                      borderColor: '#E5E7EB',
                      fontSize: '16px',
                      color: '#111827',
                      backgroundColor: '#FFFFFF'
                    }}
                  />
                  <span style={{ fontSize: '16px', color: '#6B7280', minWidth: '20px' }}>%</span>
                </div>
              </div>

              {/* Monthly Donations */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#111827',
                    marginBottom: '8px'
                  }}
                >
                  {t('caseStudyPage.roiCalculator.monthlyDonations')}
                </label>
                <input
                  type="number"
                  min="1"
                  value={roiInputs.monthlyDonations}
                  onChange={(e) => handleRoiInputChange('monthlyDonations', e.target.value)}
                  className="w-full rounded-lg border px-4 py-3"
                  style={{
                    borderColor: '#E5E7EB',
                    fontSize: '16px',
                    color: '#111827',
                    backgroundColor: '#FFFFFF'
                  }}
                />
              </div>

              {/* Number of Coordinators */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#111827',
                    marginBottom: '8px'
                  }}
                >
                  {t('caseStudyPage.roiCalculator.coordinators')}
                </label>
                <input
                  type="number"
                  min="1"
                  value={roiInputs.coordinators}
                  onChange={(e) => handleRoiInputChange('coordinators', e.target.value)}
                  className="w-full rounded-lg border px-4 py-3"
                  style={{
                    borderColor: '#E5E7EB',
                    fontSize: '16px',
                    color: '#111827',
                    backgroundColor: '#FFFFFF'
                  }}
                />
              </div>

              {/* Calculate Button */}
              <button
                onClick={calculateROI}
                disabled={roiResults !== null}
                className="w-full rounded-lg font-bold py-4 transition-all"
                style={{
                  backgroundColor: roiResults !== null ? '#9CA3AF' : '#FF6B6B',
                  color: '#FFFFFF',
                  fontSize: '16px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: roiResults !== null ? 'not-allowed' : 'pointer',
                  opacity: roiResults !== null ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (roiResults === null) {
                    e.currentTarget.style.backgroundColor = '#E55555';
                  }
                }}
                onMouseLeave={(e) => {
                  if (roiResults === null) {
                    e.currentTarget.style.backgroundColor = '#FF6B6B';
                  }
                }}
              >
                {roiResults !== null ? t('caseStudyPage.roiCalculator.calculated') : t('caseStudyPage.roiCalculator.calculate')}
              </button>
            </div>

            {/* Results Display */}
            {roiResults && (
              <div
                className="rounded-xl p-6 mb-6"
                style={{
                  backgroundColor: '#F9FAFB',
                  border: '2px solid #E5E7EB'
                }}
              >
                <h3
                  style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#111827',
                    marginBottom: '20px'
                  }}
                >
                  {t('caseStudyPage.roiCalculator.resultsTitle')}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Hours Saved */}
                  <div
                    className="rounded-lg p-4"
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB'
                    }}
                  >
                    <div
                      style={{
                        fontSize: '32px',
                        fontWeight: 700,
                        color: '#14B8A6',
                        marginBottom: '4px'
                      }}
                    >
                      {roiResults.hoursSaved}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6B7280' }}>
                      {t('caseStudyPage.roiCalculator.hoursSaved')}
                    </div>
                  </div>

                  {/* No-Show Reduction */}
                  <div
                    className="rounded-lg p-4"
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB'
                    }}
                  >
                    <div
                      style={{
                        fontSize: '32px',
                        fontWeight: 700,
                        color: '#14B8A6',
                        marginBottom: '4px'
                      }}
                    >
                      {roiResults.noShowReduction}%
                    </div>
                    <div style={{ fontSize: '14px', color: '#6B7280' }}>
                      {t('caseStudyPage.roiCalculator.noShowReduction')}
                    </div>
                  </div>

                  {/* Additional Donations */}
                  <div
                    className="rounded-lg p-4"
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB'
                    }}
                  >
                    <div
                      style={{
                        fontSize: '32px',
                        fontWeight: 700,
                        color: '#0EA5E9',
                        marginBottom: '4px'
                      }}
                    >
                      +{roiResults.additionalDonations}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6B7280' }}>
                      {t('caseStudyPage.roiCalculator.additionalDonations')}
                    </div>
                  </div>

                  {/* ROI Timeline */}
                  <div
                    className="rounded-lg p-4"
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB'
                    }}
                  >
                    <div
                      style={{
                        fontSize: '32px',
                        fontWeight: 700,
                        color: '#F59E0B',
                        marginBottom: '4px'
                      }}
                    >
                      {roiResults.roiMonths} months
                    </div>
                    <div style={{ fontSize: '14px', color: '#6B7280' }}>
                      {t('caseStudyPage.roiCalculator.roiTimeline')}
                    </div>
                  </div>
                </div>

                {/* CTA to Contact */}
                <a
                  href="/contact"
                  className="inline-flex items-center gap-2 w-full justify-center rounded-lg font-bold py-4 transition-all"
                  style={{
                    backgroundColor: '#FF6B6B',
                    color: '#FFFFFF',
                    fontSize: '16px',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#E55555';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FF6B6B';
                  }}
                >
                  {t('caseStudyPage.roiCalculator.cta')}
                  <ArrowRight style={{ width: '20px', height: '20px' }} />
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CaseStudy;


import { useState, useEffect } from 'react';
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
  const filterLabels = ['All Studies', 'AVIS', 'Croce Rossa', 'FIDAS', '+44 More'];

  const caseStudies = [
    {
      id: 1,
      filter: 'fidas',
      badge: '40%',
      color: '#F59E0B',
      organization: 'FIDAS VENETO',
      headline: 'FIDAS Veneto Eliminated Paperwork in 60 Days—Now Manages 3x Donors Per Week',
      challenge: 'Managing 15,000+ donors across 12 provinces using disconnected spreadsheets and phone calls',
      solution: 'Unified Vitalita platform with automated scheduling, SMS reminders, and real-time inventory tracking',
      results: [
        '40% reduction in admin time',
        '22% fewer no-shows',
        '100% digital in 2 months'
      ],
      timeline: 'Results achieved in 3 months'
    },
    {
      id: 2,
      filter: 'croce-rossa',
      badge: '35%',
      color: '#0EA5E9',
      organization: 'CROCE ROSSA TOSCANA',
      headline: 'Croce Rossa Toscana Tracks 487K Donations in Real-Time—Zero Stock-Outs',
      challenge: 'No visibility into inventory across 8 regional centers, frequent emergency shortages',
      solution: 'Real-time inventory tracking and AI-powered scheduling across all collection sites',
      results: [
        'Real-time tracking across all centers',
        '35% efficiency increase',
        'Zero stock-outs in 4 months'
      ],
      timeline: 'Results achieved in 4 months'
    },
    {
      id: 3,
      filter: 'avis',
      badge: '22%',
      color: '#14B8A6',
      organization: 'AVIS LOMBARDIA',
      headline: 'AVIS Lombardia Unified 12 Provinces—22% Fewer No-Shows in 3 Months',
      challenge: 'Fragmented communication across chapters, 30% no-show rate',
      solution: 'Unified scheduling platform with automated SMS reminders and donor preference management',
      results: [
        '22% no-show reduction',
        'Unified scheduling',
        'SMS automation'
      ],
      timeline: 'Results achieved in 3 months'
    }
  ];

  const filteredStudies = activeFilter === 'all' 
    ? caseStudies 
    : caseStudies.filter(study => study.filter === activeFilter);

  const faqs = [
    {
      question: 'How do organizations measure success with Vitalita?',
      answer: 'Organizations track three primary metrics: no-show rate reduction (average 22% decrease), coordinator efficiency (3x more donors managed per staff member), and administrative time savings (40% reduction). We provide a custom ROI calculator and real-time analytics dashboard showing your specific results compared to baseline.'
    },
    {
      question: 'How long does it take to see results?',
      answer: 'Most organizations see measurable improvements within 2-4 weeks of implementation. Initial setup takes 2 weeks on average, including data migration, staff training, and system configuration. Coordinators report time savings immediately, while donor-facing improvements (reduced no-shows, better scheduling) typically show impact within the first month.'
    },
    {
      question: 'What is the return on investment for blood donation management software?',
      answer: 'The average organization recoups their investment within 3-6 months through reduced administrative costs, fewer missed appointments, and better resource utilization. AVIS chapters report saving 16 hours per week per coordinator, while Croce Rossa regions handle 35% more donations with existing staff. We provide a custom ROI calculator based on your organization\'s size and current processes.'
    },
    {
      question: 'Is Vitalita compatible with existing systems and workflows?',
      answer: 'Yes. Vitalita integrates with existing donor databases, national registries, and scheduling systems used by AVIS, Croce Rossa, and FIDAS. We handle data migration from spreadsheets, legacy software, and paper records. Our API connects to laboratory systems, inventory management, and communication platforms already in use.'
    },
    {
      question: 'What support is provided during and after implementation?',
      answer: 'Full implementation support includes: dedicated onboarding specialist, data migration assistance, staff training (in-person or virtual), customized workflow setup, and 24/7 technical support. Post-launch, you get ongoing training, feature updates, priority support, and quarterly optimization reviews.'
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
            paddingLeft: '16px',
            paddingRight: '16px'
          }}
        >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center gap-8" style={{ gap: '32px' }}>
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
              TRUSTED BY 47+ AVIS CHAPTERS
            </div>

            {/* Main Headline with accent line */}
            <div className="w-full max-w-[800px]">
              <h1
                className="font-bold text-center text-[32px] md:text-[48px]"
                style={{
                  color: '#F9FAFB',
                  lineHeight: 1.2,
                  fontWeight: 700,
                  marginBottom: '8px',
                  borderBottom: '2px solid rgba(255, 107, 107, 0.6)',
                  paddingBottom: '16px'
                }}
              >
                47+ Organizations. 487,000+ Lives Saved. Zero Spreadsheets.
              </h1>
            </div>

            {/* Subheadline */}
            <p
              className="text-center max-w-[700px] text-lg md:text-xl"
              style={{
                color: 'rgba(249, 250, 251, 0.8)',
                lineHeight: 1.5,
                fontWeight: 400
              }}
            >
              See exactly how Italian blood networks eliminated chaos and scaled impact with Vitalita.
            </p>

            {/* Statistics Row */}
            <div 
              className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3"
              style={{ gap: '24px' }}
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
                  487,000+
                </div>
                <div
                  className="text-sm"
                  style={{
                    fontSize: '14px',
                    color: 'rgba(249, 250, 251, 0.9)',
                    fontWeight: 400
                  }}
                >
                  Donations Managed Annually
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
                  3-6 months
                </div>
                <div
                  className="text-sm"
                  style={{
                    fontSize: '14px',
                    color: 'rgba(249, 250, 251, 0.9)',
                    fontWeight: 400
                  }}
                >
                  Average Results Timeline
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
                  2 weeks
                </div>
                <div
                  className="text-sm"
                  style={{
                    fontSize: '14px',
                    color: 'rgba(249, 250, 251, 0.9)',
                    fontWeight: 400
                  }}
                >
                  Typical Implementation
                </div>
              </div>
            </div>

            {/* Primary CTA Button */}
            <button
              onClick={() => setShowRoiCalculator(true)}
              className="inline-flex items-center gap-2 rounded-lg font-bold transition-colors"
              style={{
                backgroundColor: '#FF6B6B',
                color: '#FFFFFF',
                padding: '16px 32px',
                borderRadius: '8px',
                fontSize: '16px',
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
              Calculate Your Organization's ROI
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
          paddingTop: '60px',
          paddingBottom: '60px',
          paddingLeft: '16px',
          paddingRight: '16px'
        }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Heading */}
          <h2
            className="text-center font-bold mb-10"
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#111827',
              marginBottom: '40px'
            }}
          >
            Organizations Using Vitalita for Donor Management
          </h2>

          {/* Logo Grid */}
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-8"
            style={{
              gap: '32px'
            }}
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
            Join 47+ organizations already saving time
          </p>
        </div>
      </section>

      {/* Video Testimonials Section */}
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
            className="text-center font-bold mb-12 text-[28px] md:text-[36px]"
            style={{
              fontWeight: 700,
              color: '#111827',
              marginBottom: '48px'
            }}
          >
            Watch How Coordinators Saved 16 Hours Per Week
          </h2>

          {/* Video Cards Grid */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            style={{
              gap: '32px'
            }}
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
                  How Maria Eliminated 3 Spreadsheets
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    color: 'rgba(249, 250, 251, 0.8)',
                    fontWeight: 400
                  }}
                >
                  AVIS Lombardia
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
                  Real-Time Tracking Across 12 Provinces
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    color: 'rgba(249, 250, 251, 0.8)',
                    fontWeight: 400
                  }}
                >
                  Croce Rossa Toscana
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
                  2-Month Digital Transformation Timeline
                </h3>
                <p
                  style={{
                    fontSize: '14px',
                    color: 'rgba(249, 250, 251, 0.8)',
                    fontWeight: 400
                  }}
                >
                  FIDAS Veneto
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
            Measured Impact Across Italian Blood Networks
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
                  22%
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
                Reduction in No-Show Rates
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
                Blood donation centers using Vitalita reduced missed appointments from 30% to 8% within 3 months through automated SMS reminders and donor preference scheduling.
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
                From 30% → 8% in 3 months
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
                  35%
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
                Increase in Coordinator Efficiency
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
                Real-time inventory tracking and AI-powered scheduling allowed coordinators to manage 3x more donors without additional staff.
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
                3x donors per coordinator
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
                  40%
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
                Less Administrative Time
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
                Automated appointment confirmations, rescheduling, and reporting freed up 16 hours per week per coordinator for patient care and donor engagement.
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
                16 hours saved weekly
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
            Blood Donation Management Success Stories by Organization
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
            Real implementations, measurable outcomes, documented timelines
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
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#6B7280' }}>Challenge: </span>
                  <span style={{ fontSize: '14px', color: '#6B7280' }}>{study.challenge}</span>
                </div>

                {/* Solution */}
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#6B7280' }}>Solution: </span>
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
            What Blood Donation Coordinators Say About Vitalita
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
            Verified coordinators from leading organizations
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
                    Maria Rossi
                  </h4>
                  <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>
                    Coordinator, AVIS Lombardia
                  </p>
                  <div className="flex items-center gap-1">
                    <Linkedin style={{ width: '14px', height: '14px', color: '#14B8A6' }} />
                    <span style={{ fontSize: '12px', color: '#14B8A6' }}>Verified on LinkedIn</span>
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
                Vitalita transformed our coordination. We now handle 3x more donors with the same staff. Real-time inventory tracking eliminated our biggest headache.
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
                AVIS LOMBARDIA
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
                    Giovanni Bianchi
                  </h4>
                  <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>
                    Director, Croce Rossa Toscana
                  </p>
                  <div className="flex items-center gap-1">
                    <Linkedin style={{ width: '14px', height: '14px', color: '#14B8A6' }} />
                    <span style={{ fontSize: '12px', color: '#14B8A6' }}>Verified on LinkedIn</span>
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
                We process 35% more donations with the same resources. Real-time inventory tracking eliminated delays. Our coordinators finally have time to focus on donors, not paperwork.
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
                CROCE ROSSA TOSCANA
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
                    Laura Conti
                  </h4>
                  <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>
                    Operations Manager, FIDAS Veneto
                  </p>
                  <div className="flex items-center gap-1">
                    <Linkedin style={{ width: '14px', height: '14px', color: '#14B8A6' }} />
                    <span style={{ fontSize: '12px', color: '#14B8A6' }}>Verified on LinkedIn</span>
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
                Digital transformation completed in 2 months. Staff now focuses on donor engagement instead of paperwork. The ROI was immediate—we saw results in week one.
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
                FIDAS VENETO
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
            Regulatory Compliance & Certifications
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
            Built to meet Italian and EU healthcare data standards
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
                GDPR Compliant
              </h4>
              <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6 }}>
                Full compliance with EU General Data Protection Regulation. Your donor data is encrypted, access-controlled, and stored within EU borders.
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
                ISO 27001
              </h4>
              <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6 }}>
                International standard for information security management. Regular third-party audits ensure your data is protected at the highest level.
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
                EU Digital Standards
              </h4>
              <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6 }}>
                Meets European Interoperability Framework requirements. Seamless integration with national healthcare systems and donor registries.
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
                Ministry of Health Approved
              </h4>
              <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6 }}>
                Certified by Italian Ministry of Health for blood donation management. Meets all national healthcare data handling requirements.
              </p>
            </div>
          </div>

          {/* Additional Trust Signals */}
          <div className="flex flex-wrap justify-center items-center gap-10" style={{ gap: '40px' }}>
            <div className="flex items-center gap-2">
              <Lock style={{ width: '18px', height: '18px', color: '#6B7280' }} />
              <span style={{ fontSize: '14px', color: '#6B7280' }}>Zero data breaches since launch</span>
            </div>
            <div className="flex items-center gap-2">
              <Server style={{ width: '18px', height: '18px', color: '#6B7280' }} />
              <span style={{ fontSize: '14px', color: '#6B7280' }}>EU-hosted infrastructure</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock style={{ width: '18px', height: '18px', color: '#6B7280' }} />
              <span style={{ fontSize: '14px', color: '#6B7280' }}>99.9% uptime guarantee</span>
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
            Frequently Asked Questions
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
                Born in Italy, proven across Europe
              </h3>
              <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6 }}>
                Developed in collaboration with Italian blood donation networks. GDPR-compliant and EU-certified from day one.
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
                97% coordinator satisfaction rate
              </h3>
              <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6 }}>
                Blood donation coordinators report significant time savings, better donor engagement, and reduced stress after implementing Vitalita.
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
                Zero data breaches since launch
              </h3>
              <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.6 }}>
                ISO 27001 certified, GDPR compliant, Ministry of Health approved. Your donor data is protected at the highest security standards.
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
          paddingTop: '100px',
          paddingBottom: '100px',
          paddingLeft: '16px',
          paddingRight: '16px',
          textAlign: 'center'
        }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Heading */}
          <h2
            className="font-bold mb-4 text-[30px] md:text-[40px]"
            style={{
              fontWeight: 700,
              color: '#F9FAFB',
              marginBottom: '16px'
            }}
          >
            Ready to See These Results?
          </h2>

          {/* Subheading */}
          <p
            className="mb-10"
            style={{
              fontSize: '18px',
              color: 'rgba(249, 250, 251, 0.8)',
              marginBottom: '40px'
            }}
          >
            Join 47+ organizations already saving time
          </p>

          {/* CTA Button */}
          <div className="flex justify-center items-center mb-6">
            {/* Primary Button */}
            <button
              onClick={() => setShowRoiCalculator(true)}
              className="inline-flex items-center gap-2 px-9 py-4 rounded-lg font-bold transition-all"
              style={{
                backgroundColor: '#FF6B6B',
                color: '#FFFFFF',
                fontSize: '16px',
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
              Get Your Custom ROI Analysis
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
            Free demo. No credit card. Setup in 2 weeks.
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
            className="relative w-full max-w-2xl rounded-2xl p-8"
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
              className="absolute top-4 right-4 p-2 rounded-lg transition-colors"
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
            <div className="mb-8">
              <h2
                style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#111827',
                  marginBottom: '8px'
                }}
              >
                Calculate Your Organization's ROI
              </h2>
              <p style={{ fontSize: '16px', color: '#6B7280' }}>
                See how much time and money you'll save with Vitalita
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
                  Organization Size
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
                  <option value="small">Small (&lt;100 donations/month)</option>
                  <option value="medium">Medium (100-500 donations/month)</option>
                  <option value="large">Large (&gt;500 donations/month)</option>
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
                  Current No-Show Rate (%)
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
                  Monthly Donations
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
                  Number of Coordinators
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
                {roiResults !== null ? 'ROI Calculated' : 'Calculate ROI'}
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
                  Your Estimated Impact with Vitalita
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
                      Hours saved per week
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
                      Reduction in no-shows
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
                      More donations per month
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
                      Estimated ROI timeline
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
                  Get Your Custom Implementation Plan
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


import { useState, useEffect, useRef, lazy, Suspense, memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ChevronDown,
  ChevronUp,
  Settings,
  Workflow,
  Send,
  BarChart3,
  Users,
  CheckCircle2,
  MessageSquare,
  Mail,
  Smartphone,
  TrendingUp,
  MapPin,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

// Visual mockup components for each step - Memoized for performance
const ConfigurationDashboardMockup = memo(() => {
  const { t } = useTranslation();
  return (
    <div 
      className="w-full" 
      style={{ 
        // Widget Styling - Clinical Authority Design System
        backgroundColor: '#FFFFFF', // Background: white
        border: '1px solid #E5E7EB', // Border: 1px solid #E5E7EB
        borderRadius: '12px', // Border Radius: 12px
        boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)', // Match card shadow
        padding: '24px', // Padding: 24px
        maxWidth: '100%', 
        overflowX: 'hidden' 
      }}
    >
      <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 flex-shrink-0" style={{ color: '#FF6B6B' }} aria-label="Organization setup configuration icon" />
          <h3 
            className="font-semibold" 
            style={{ 
              color: '#1A2332', // Header: #1A2332
              fontSize: '18px', // 18px
              fontWeight: 600, // 600 font-weight
              wordWrap: 'break-word' 
            }}
          >
            {t('howItWorks.mockups.organizationSetup')}
          </h3>
        </div>
        <div 
          className="h-2 w-2 rounded-full flex-shrink-0" 
          style={{ 
            backgroundColor: '#14B8A6', // Status indicator: #14B8A6 (Success Teal)
            border: '1px solid #0D9488' 
          }} 
          aria-label="Configuration status: active" 
          role="status" 
          title="Active"
        >
          <span className="sr-only">Status: Active</span>
        </div>
      </div>
      <div className="space-y-3 sm:space-y-4">
        <div className="rounded-lg border p-3 sm:p-4" style={{ borderColor: '#F3F4F6', backgroundColor: '#F9FAFB' }}>
          <div className="mb-2 flex items-center justify-between flex-wrap gap-1">
            <span 
              className="font-medium" 
              style={{ 
                color: '#6B7280', 
                fontSize: '14px' // "3 configured" text: #6B7280, 14px
              }}
            >
              {t('howItWorks.mockups.donationCenters')}
            </span>
            <span 
              className="whitespace-nowrap" 
              style={{ 
                color: '#6B7280', 
                fontSize: '14px' 
              }}
            >
              3 {t('howItWorks.mockups.configured')}
            </span>
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            {['Central Hospital', 'Regional Clinic', 'Mobile Unit'].map((center, i) => (
              <div key={i} className="flex items-center gap-2 rounded bg-white p-2">
                <MapPin className="h-4 w-4 flex-shrink-0" style={{ color: '#6B7280' }} aria-label={`${center} location marker`} />
                <span 
                  className="flex-1 truncate" 
                  style={{ 
                    color: '#111827', // Location names: #111827
                    fontSize: '15px' // 15px
                  }}
                >
                  {center}
                </span>
                <CheckCircle2 
                  className="ml-auto h-4 w-4 flex-shrink-0" 
                  style={{ 
                    color: '#14B8A6' // Checkmark icons: #14B8A6 (Success Teal)
                  }} 
                  aria-label={`${center} configured successfully`} 
                />
              </div>
            ))}
          </div>
        </div>
          <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border p-3" style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}>
            <div 
              className="uppercase" 
              style={{ 
                color: '#6B7280', // Capacity/Hours labels: #6B7280
                fontSize: '13px', // 13px
                fontWeight: 400
              }}
            >
              {t('howItWorks.mockups.capacity')}
            </div>
            <div 
              className="mt-1 font-semibold" 
              style={{ 
                color: '#1A2332', // Capacity/Hours values: #1A2332
                fontSize: '16px', // 16px
                fontWeight: 600 // 600 font-weight
              }}
            >
              150/day
            </div>
          </div>
          <div className="rounded-lg border p-3" style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}>
            <div 
              className="uppercase" 
              style={{ 
                color: '#6B7280', 
                fontSize: '13px',
                fontWeight: 400
              }}
            >
              {t('howItWorks.mockups.hours')}
            </div>
            <div 
              className="mt-1 font-semibold" 
              style={{ 
                color: '#1A2332', 
                fontSize: '16px', 
                fontWeight: 600 
              }}
            >
              8:00 - 18:00
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ConfigurationDashboardMockup.displayName = 'ConfigurationDashboardMockup';

const WorkflowBuilderMockup = memo(() => {
  const { t } = useTranslation();
  return (
    <div 
      className="w-full" 
      style={{ 
        // Widget Styling - Clinical Authority Design System
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
        padding: '24px',
        maxWidth: '100%', 
        overflowX: 'hidden' 
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Workflow className="h-5 w-5 flex-shrink-0" style={{ color: '#FF6B6B' }} aria-label="Healthcare workflow automation builder icon" />
          <h3 
            className="font-semibold" 
            style={{ 
              color: '#1A2332', // Widget header: #1A2332
              fontSize: '16px', // 16px
              fontWeight: 600, // 600 font-weight
              wordWrap: 'break-word' 
            }}
          >
            {t('howItWorks.mockups.workflowBuilder')}
          </h3>
        </div>
      </div>
      <div className="space-y-2 sm:space-y-3">
        {[
          { labelKey: 'eligibilityCriteria', status: 'configured', Icon: CheckCircle2 },
          { labelKey: 'healthScreening', status: 'configured', Icon: CheckCircle2 },
          { labelKey: 'notificationTemplates', status: 'active', Icon: MessageSquare },
          { labelKey: 'userRoles', status: 'pending', Icon: Users },
        ].map((item, i) => {
          const IconComponent = item.Icon;
          // Data Visualization Colors - Clinical Authority palette
          const statusColors = {
            configured: '#14B8A6', // Success (Teal)
            active: '#0EA5E9', // Info (Sky Blue)
            pending: '#F59E0B' // Warning (Amber)
          };
          return (
            <div key={i} className="flex items-center gap-3 rounded-lg border p-3" style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}>
              <IconComponent className="h-4 w-4 flex-shrink-0" style={{ color: '#FF6B6B' }} />
              <div className="flex-1 min-w-0">
                <div 
                  className="font-medium truncate" 
                  style={{ 
                    color: '#111827', // Item labels: #111827
                    fontSize: '14px' // 14px
                  }}
                >
                  {t(`howItWorks.mockups.${item.labelKey}`)}
                </div>
                <div 
                  className="text-xs" 
                  style={{ 
                    color: '#6B7280', // Status text: #6B7280
                    fontSize: '12px' // 12px
                  }}
                >
                  {t(`howItWorks.mockups.${item.status}`)}
                </div>
              </div>
              <div
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ 
                  backgroundColor: statusColors[item.status as keyof typeof statusColors],
                  border: `1px solid ${statusColors[item.status as keyof typeof statusColors]}`
                }}
                aria-label={`Status: ${item.status}`}
                title={item.status}
              >
                <span className="sr-only">Status: {item.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

WorkflowBuilderMockup.displayName = 'WorkflowBuilderMockup';

const CommunicationDashboardMockup = memo(() => {
  const { t } = useTranslation();
  return (
    <div 
      className="w-full" 
      style={{ 
        // Invitations Widget - Clinical Authority Design System
        background: 'linear-gradient(to bottom, #FFE5E5, #FFFFFF)', // Gradient from #FFE5E5 (light coral) to white
        border: '1px solid rgba(255, 107, 107, 0.2)', // Border: 1px solid #FF6B6B with 20% opacity
        borderRadius: '12px', // Border Radius: 12px
        padding: '24px', // Padding: 24px
        maxWidth: '100%', 
        overflowX: 'hidden' 
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Send className="h-5 w-5 flex-shrink-0" style={{ color: '#FF6B6B' }} aria-label="Donor engagement communication icon" />
          <h3 
            className="font-semibold" 
            style={{ 
              color: '#1A2332', // Header "Invitations Sent": #1A2332
              fontSize: '16px', // 16px
              fontWeight: 600, // 600 font-weight
              wordWrap: 'break-word' 
            }}
          >
            {t('howItWorks.mockups.invitationsSent')}
          </h3>
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-lg p-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
          <div 
            className="uppercase" 
            style={{ 
              color: '#6B7280', // "Total Invitations" label: #6B7280
              fontSize: '13px' // 13px, uppercase
            }}
          >
            {t('howItWorks.mockups.totalInvitations')}
          </div>
          <div 
            className="mt-1 font-bold" 
            style={{ 
              color: '#FF6B6B', // Number "1,247": #FF6B6B (Coral)
              fontSize: '36px', // 36px
              fontWeight: 700 // 700 font-weight
            }}
          >
            1,247
          </div>
          <div className="mt-2 flex gap-4 text-xs flex-wrap" style={{ color: '#6B7280' }}>
            <span className="flex items-center gap-1 whitespace-nowrap">
              <Mail className="h-4 w-4 flex-shrink-0" style={{ color: '#FF6B6B' }} aria-label="Email invitations" /> 892
            </span>
            <span className="flex items-center gap-1 whitespace-nowrap">
              <Smartphone className="h-4 w-4 flex-shrink-0" style={{ color: '#FF6B6B' }} aria-label="SMS invitations" /> 355
            </span>
          </div>
        </div>
        <div className="space-y-1.5 sm:space-y-2">
          {['emailCampaign', 'smsBlast', 'portalAccess'].map((itemKey, i) => (
            <div key={i} className="flex items-center justify-between rounded p-2 gap-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
              <span 
                className="truncate flex-1" 
                style={{ 
                  color: '#111827', // Campaign names: #111827
                  fontSize: '14px' // 14px
                }}
              >
                {t(`howItWorks.mockups.${itemKey}`)}
              </span>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="h-1.5 w-16 rounded-full" style={{ backgroundColor: '#E5E7EB' }}>
                  <div
                    className="h-1.5 rounded-full"
                    style={{ 
                      width: `${60 + i * 15}%`,
                      backgroundColor: '#FF6B6B' // Progress bars: #FF6B6B fill
                    }}
                  ></div>
                </div>
                <span 
                  className="whitespace-nowrap" 
                  style={{ 
                    color: '#6B7280', // Percentage text: #6B7280
                    fontSize: '13px' // 13px
                  }}
                >
                  {60 + i * 15}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

CommunicationDashboardMockup.displayName = 'CommunicationDashboardMockup';

const AnalyticsDashboardMockup = memo(() => {
  const { t } = useTranslation();
  return (
    <div 
      className="w-full" 
      style={{ 
        // Performance Metrics Widget - Clinical Authority Design System
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
        padding: '24px',
        maxWidth: '100%', 
        overflowX: 'hidden' 
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 flex-shrink-0" style={{ color: '#FF6B6B' }} aria-label="Blood donation analytics dashboard icon" />
          <h3 
            className="font-semibold" 
            style={{ 
              color: '#1A2332', // "Performance Metrics" header: #1A2332
              fontSize: '16px', // 16px
              fontWeight: 600, // 600 font-weight
              wordWrap: 'break-word' 
            }}
          >
            {t('howItWorks.mockups.performanceMetrics')}
          </h3>
        </div>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { labelKey: 'appointments', value: '92%', trend: '+12%', color: '#FF6B6B' },
            { labelKey: 'utilization', value: '87%', trend: '+8%', color: '#0EA5E9' }, // Info (Sky Blue)
          ].map((metric, i) => (
            <div key={i} className="rounded-lg border p-3" style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}>
              <div 
                className="uppercase" 
                style={{ 
                  color: '#6B7280', // Metric labels: #6B7280
                  fontSize: '13px' // 13px, uppercase
                }}
              >
                {t(`howItWorks.mockups.${metric.labelKey}`)}
              </div>
              <div 
                className="mt-1 font-bold" 
                style={{ 
                  color: '#1A2332', // Metric values: #1A2332
                  fontSize: '32px', // 32px
                  fontWeight: 700 // 700 font-weight
                }}
              >
                {metric.value}
              </div>
              <div 
                className="mt-1 flex items-center gap-1 text-sm" 
                style={{ 
                  color: '#14B8A6' // Growth indicators: #14B8A6 (green up arrow)
                }}
              >
                <TrendingUp className="h-4 w-4 flex-shrink-0" aria-label="Performance trend indicator" />
                <span style={{ fontSize: '14px' }}>{metric.trend}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-lg border p-3" style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}>
          <div 
            className="mb-2 uppercase" 
            style={{ 
              color: '#6B7280', 
              fontSize: '13px' 
            }}
          >
            {t('howItWorks.mockups.weeklyCapacity')}
          </div>
          <div className="flex items-end gap-1">
            {[65, 78, 82, 75, 88, 92, 85].map((height, i) => (
              <div key={i} className="flex-1">
                <div
                  className="w-full rounded-t"
                  style={{ 
                    height: `${Math.max(height * 0.6, 20)}px`,
                    backgroundColor: '#FF6B6B' // Bar chart: All bars #FF6B6B
                  }}
                ></div>
              </div>
            ))}
          </div>
          <div 
            className="mt-2 flex justify-between text-xs overflow-hidden" 
            style={{ 
              color: '#6B7280', // Day labels: #6B7280
              fontSize: '12px' // 12px
            }}
          >
            <span className="truncate">{t('howItWorks.mockups.monday')}</span>
            <span className="truncate">{t('howItWorks.mockups.tuesday')}</span>
            <span className="truncate">{t('howItWorks.mockups.wednesday')}</span>
            <span className="truncate">{t('howItWorks.mockups.thursday')}</span>
            <span className="truncate">{t('howItWorks.mockups.friday')}</span>
            <span className="truncate">{t('howItWorks.mockups.saturday')}</span>
            <span className="truncate">{t('howItWorks.mockups.sunday')}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

AnalyticsDashboardMockup.displayName = 'AnalyticsDashboardMockup';

const FAQAccordion = memo(() => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: t('howItWorks.faq.questions.setupTime.question'),
      answer: t('howItWorks.faq.questions.setupTime.answer'),
    },
    {
      question: t('howItWorks.faq.questions.technicalExpertise.question'),
      answer: t('howItWorks.faq.questions.technicalExpertise.answer'),
    },
    {
      question: t('howItWorks.faq.questions.support.question'),
      answer: t('howItWorks.faq.questions.support.answer'),
    },
    {
      question: t('howItWorks.faq.questions.staffRequired.question'),
      answer: (
        <div className="space-y-3">
          <p className="text-base leading-relaxed" style={{ color: '#6B7280' }}>
            {t('howItWorks.faq.questions.staffRequired.answer').split('\n')[0]}
          </p>
          <ul className="ml-4 list-disc space-y-2 text-base leading-relaxed" style={{ color: '#6B7280' }}>
            {t('howItWorks.faq.questions.staffRequired.answer').split('\n').slice(1).map((item, i) => (
              <li key={i}>{item.replace(/^•\s*/, '')}</li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      question: t('howItWorks.faq.questions.dataMigration.question'),
      answer: t('howItWorks.faq.questions.dataMigration.answer'),
    },
  ];

  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className="transition-all"
            style={{ 
              // Accordion Items - Clinical Authority Design System
              backgroundColor: '#FFFFFF', // Background: white
              border: `1px solid ${isOpen ? '#FF6B6B' : '#E5E7EB'}`, // Border: 1px solid #E5E7EB, Active: #FF6B6B
              borderRadius: '8px', // Border Radius: 8px
              padding: '20px 24px', // Padding: 20px 24px
              marginBottom: '12px', // Margin-bottom: 12px between items
              transition: prefersReducedMotion ? 'none' : 'border-color 0.2s ease, max-height 0.3s ease',
              maxWidth: '100%',
              overflowX: 'hidden'
            }}
            itemScope
            itemType="https://schema.org/Question"
            onMouseEnter={(e) => {
              if (!prefersReducedMotion && !isOpen) {
                e.currentTarget.style.borderColor = 'rgba(255, 107, 107, 0.4)'; // Hover: Border color changes to #FF6B6B with 40% opacity
              }
            }}
            onMouseLeave={(e) => {
              if (!prefersReducedMotion && !isOpen) {
                e.currentTarget.style.borderColor = '#E5E7EB';
              }
            }}
          >
            <button
              onClick={() => {
                toggleFAQ(index);
                // Accessibility: Announce FAQ state change
                const liveRegion = document.getElementById('live-region');
                if (liveRegion) {
                  liveRegion.textContent = isOpen 
                    ? `Closed: ${faq.question}` 
                    : `Opened: ${faq.question}`;
                  setTimeout(() => {
                    liveRegion.textContent = '';
                  }, 1000);
                }
              }}
              className="flex w-full items-center justify-between p-4 sm:p-6 md:p-8 text-left touch-manipulation focus:outline focus:outline-3 focus:outline-blue-500 focus:outline-offset-2"
              style={{ 
                backgroundColor: 'transparent',
                transition: prefersReducedMotion ? 'none' : 'background-color 0.3s ease',
                minHeight: '48px',
                WebkitTapHighlightColor: 'rgba(255, 107, 107, 0.1)'
              }}
              onMouseEnter={(e) => {
                if (!prefersReducedMotion) {
                  e.currentTarget.style.backgroundColor = 'rgba(249, 250, 251, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!prefersReducedMotion) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
              onKeyDown={(e) => {
                // Accessibility: Keyboard navigation support
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleFAQ(index);
                }
              }}
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${index}`}
              aria-label={`${faq.question} - ${isOpen ? 'Hide answer' : 'Show answer'}`}
            >
              <h3 
                id={`faq-question-${index}`} 
                className="pr-3 flex-1 text-left" 
                style={{ 
                  color: '#1A2332', // Question text: #1A2332
                  fontSize: '17px', // 17px
                  fontWeight: 600, // 600 font-weight
                  wordWrap: 'break-word' 
                }} 
                itemProp="name"
              >
                {faq.question}
              </h3>
              <div className="flex-shrink-0" style={{ minWidth: '24px', minHeight: '24px' }}>
                <ChevronUp 
                  className="h-5 w-5 transition-transform duration-300 ease-in-out" 
                  style={{ 
                    color: isOpen ? '#FF6B6B' : '#6B7280', // Chevron icon: #6B7280, Active: #FF6B6B
                    transform: isOpen ? 'rotate(0deg)' : 'rotate(180deg)', // Active/Expanded: chevron rotates 180deg
                    transition: prefersReducedMotion 
                      ? 'none' 
                      : 'transform 0.3s ease, color 0.2s ease', // Chevron rotation: transform 0.3s ease
                    minWidth: '20px',
                    minHeight: '20px'
                  }}
                  aria-label={isOpen ? 'Collapse answer' : 'Expand answer'}
                />
              </div>
            </button>
            <div
              id={`faq-answer-${index}`}
              className="overflow-hidden transition-all duration-300 ease-in-out"
              role="region"
              aria-labelledby={`faq-question-${index}`}
              style={{
                maxHeight: isOpen ? '1000px' : '0',
                opacity: isOpen ? 1 : 0,
                transition: prefersReducedMotion 
                  ? 'none' 
                  : 'max-height 0.3s ease-in-out, opacity 0.3s ease-in-out, padding 0.3s ease-in-out',
                paddingTop: isOpen ? '0' : '0',
                paddingBottom: isOpen ? '0' : '0'
              }}
            >
              <div className="px-0 pb-0" itemProp="acceptedAnswer" itemScope itemType="https://schema.org/Answer">
                {typeof faq.answer === 'string' ? (
                  <p 
                    className="leading-relaxed whitespace-pre-line" 
                    style={{ 
                      color: '#111827', // Answer text: #111827
                      fontSize: '15px', // 15px
                      fontWeight: 400, // 400 font-weight
                      lineHeight: '1.7', // line-height 1.7
                      paddingTop: '16px', // 16px padding-top
                      wordWrap: 'break-word' 
                    }}
                  >
                    <span itemProp="text">{faq.answer}</span>
                  </p>
                ) : (
                  <div 
                    style={{ 
                      paddingTop: '16px' // 16px padding-top
                    }}
                  >
                    <span itemProp="text">{faq.answer}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

FAQAccordion.displayName = 'FAQAccordion';

const HowItWorks = () => {
  const { t } = useTranslation();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set());
  const [timelineAnimated, setTimelineAnimated] = useState(false);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const liveRegionRef = useRef<HTMLDivElement | null>(null);
  
  // Accessibility: Announce status updates to screen readers
  const announceToScreenReader = (message: string) => {
    const liveRegion = document.getElementById('live-region');
    if (liveRegion) {
      liveRegion.textContent = message;
      // Clear after announcement to allow re-announcement
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  };

  // SEO: Update meta tags for this page
  useEffect(() => {
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Learn how Vitalita streamlines blood donation management in Italy. 4-step implementation process for AVIS integration, donor scheduling system, and healthcare workflow automation.');
    }
    
    // Update page title
    document.title = 'How It Works | Vitalita Blood Donation Management Platform';
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    // Animate timeline on mount
    if (!mediaQuery.matches) {
      setTimeout(() => setTimelineAnimated(true), 200);
    }

    // Intersection Observer for scroll-triggered animations - Optimized for performance
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = stepRefs.current.indexOf(entry.target as HTMLDivElement);
            if (index !== -1) {
              setVisibleSteps((prev) => new Set([...prev, index]));
              // Unobserve after animation triggers to improve performance
              observer.unobserve(entry.target);
            }
          }
        });
      },
      {
        threshold: 0.15, // Slightly higher threshold for better performance
        rootMargin: '50px 0px -100px 0px' // Start loading earlier for smoother experience
      }
    );

    stepRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      observer.disconnect();
    };
  }, []);

  const implementationSteps = [
    {
      step: 1,
      title: t('howItWorks.steps.step1.title'),
      timeframe: t('howItWorks.steps.step1.timeframe'),
      icon: Settings,
      description: t('howItWorks.steps.step1.description'),
      details: [
        t('howItWorks.steps.step1.details.0'),
        t('howItWorks.steps.step1.details.1'),
        t('howItWorks.steps.step1.details.2'),
        t('howItWorks.steps.step1.details.3'),
      ],
      visual: <ConfigurationDashboardMockup />,
    },
    {
      step: 2,
      title: t('howItWorks.steps.step2.title'),
      timeframe: t('howItWorks.steps.step2.timeframe'),
      icon: Workflow,
      description: t('howItWorks.steps.step2.description'),
      details: [
        t('howItWorks.steps.step2.details.0'),
        t('howItWorks.steps.step2.details.1'),
        t('howItWorks.steps.step2.details.2'),
        t('howItWorks.steps.step2.details.3'),
      ],
      visual: <WorkflowBuilderMockup />,
    },
    {
      step: 3,
      title: t('howItWorks.steps.step3.title'),
      timeframe: t('howItWorks.steps.step3.timeframe'),
      icon: Send,
      description: t('howItWorks.steps.step3.description'),
      details: [
        t('howItWorks.steps.step3.details.0'),
        t('howItWorks.steps.step3.details.1'),
        t('howItWorks.steps.step3.details.2'),
        t('howItWorks.steps.step3.details.3'),
      ],
      visual: <CommunicationDashboardMockup />,
    },
    {
      step: 4,
      title: t('howItWorks.steps.step4.title'),
      timeframe: t('howItWorks.steps.step4.timeframe'),
      icon: BarChart3,
      description: t('howItWorks.steps.step4.description'),
      details: [
        t('howItWorks.steps.step4.details.0'),
        t('howItWorks.steps.step4.details.1'),
        t('howItWorks.steps.step4.details.2'),
        t('howItWorks.steps.step4.details.3'),
      ],
      visual: <AnalyticsDashboardMockup />,
    },
  ];

  // Step color themes - Clinical Authority Design System
  // All cards use white background, #E5E7EB borders, consistent styling
  const stepThemes = [
    { 
      bg: '#FFFFFF', // Universal: white card background
      border: '#E5E7EB', // Universal: light gray border
      accent: '#FF6B6B', // Coral accent for icons and badges
      iconBg: 'rgba(255, 107, 107, 0.1)', // Badge background with 10% opacity
      borderOpacity: '#E5E7EB'
    },
    { 
      bg: '#FFFFFF',
      border: '#E5E7EB',
      accent: '#FF6B6B',
      iconBg: 'rgba(255, 107, 107, 0.1)',
      borderOpacity: '#E5E7EB'
    },
    { 
      bg: '#FFFFFF',
      border: '#E5E7EB',
      accent: '#FF6B6B',
      iconBg: 'rgba(255, 107, 107, 0.1)',
      borderOpacity: '#E5E7EB'
    },
    { 
      bg: '#FFFFFF',
      border: '#E5E7EB',
      accent: '#FF6B6B',
      iconBg: 'rgba(255, 107, 107, 0.1)',
      borderOpacity: '#E5E7EB'
    },
  ];

  // Schema.org HowTo markup for the 4-step process
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Blood Donation Management System Implementation",
    "description": "4-step process to implement Vitalita blood donation management software for Italian healthcare organizations and AVIS integration",
    "step": implementationSteps.map((step, index) => ({
      "@type": "HowToStep",
      "position": step.step,
      "name": step.title,
      "text": step.description,
      "itemListElement": step.details.map((detail, detailIndex) => ({
        "@type": "HowToDirection",
        "position": detailIndex + 1,
        "text": detail
      }))
    }))
  };

  // Schema.org FAQPage markup
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": t('howItWorks.faq.questions.setupTime.question'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('howItWorks.faq.questions.setupTime.answer')
        }
      },
      {
        "@type": "Question",
        "name": t('howItWorks.faq.questions.technicalExpertise.question'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('howItWorks.faq.questions.technicalExpertise.answer')
        }
      },
      {
        "@type": "Question",
        "name": t('howItWorks.faq.questions.support.question'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('howItWorks.faq.questions.support.answer')
        }
      },
      {
        "@type": "Question",
        "name": t('howItWorks.faq.questions.staffRequired.question'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": typeof t('howItWorks.faq.questions.staffRequired.answer') === 'string' 
            ? t('howItWorks.faq.questions.staffRequired.answer').split('\n').join(' ')
            : t('howItWorks.faq.questions.staffRequired.answer')
        }
      },
      {
        "@type": "Question",
        "name": t('howItWorks.faq.questions.dataMigration.question'),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t('howItWorks.faq.questions.dataMigration.answer')
        }
      }
    ]
  };

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div style={{ backgroundColor: '#F9FAFB', maxWidth: '100vw', overflowX: 'hidden' }}>
        {/* Critical CSS inline for above-the-fold content */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media (prefers-reduced-motion: no-preference) {
            [data-animate] {
              will-change: transform, opacity;
            }
          }
        `}} />
        
        {/* Hero Section - Clinical Authority Design System */}
        <section 
          className="section-container relative overflow-hidden" 
          style={{ 
            maxWidth: '100%', 
            overflowX: 'hidden',
            backgroundColor: '#F9FAFB',
            paddingTop: '120px',
            paddingBottom: '80px'
          }} 
          aria-label="How It Works introduction"
        >
          <div className="mx-auto max-w-[800px] text-center px-4 sm:px-6">
            {/* Badge: #FF6B6B text, #FF6B6B border with 10% opacity fill, 16px padding, rounded corners */}
            <p 
              className="inline-block mb-4 px-4 py-2 rounded-lg border uppercase tracking-[0.05em]"
              style={{ 
                color: '#FF6B6B',
                borderColor: '#FF6B6B',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.5px'
              }}
            >
              {t('howItWorks.hero.badge')}
            </p>
            
            {/* Main Heading: #1A2332 (Navy), 48px font-size, 700 font-weight, line-height 1.1 */}
            <h1 
              className="mb-6"
              style={{ 
                color: '#1A2332',
                fontSize: '48px',
                fontWeight: 700,
                lineHeight: '1.1',
                letterSpacing: '-0.02em',
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
              }}
            >
              {t('howItWorks.hero.title')}
            </h1>
            
            {/* Subheading: #6B7280 (Cool Gray), 20px font-size, 400 font-weight, 24px margin-top */}
            <p 
              className="mb-0"
              style={{ 
                color: '#6B7280',
                fontSize: '20px',
                fontWeight: 400,
                lineHeight: '1.6',
                wordWrap: 'break-word',
                marginTop: '24px'
              }}
            >
              {t('howItWorks.hero.description')}
            </p>
          </div>
        </section>

      {/* Implementation Timeline - Optimized with integrated progression */}
      <section className="section-container py-8 sm:py-12 md:py-16 lg:py-20" style={{ maxWidth: '100%', overflowX: 'hidden' }} aria-labelledby="implementation-steps-heading">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 id="implementation-steps-heading" className="sr-only">Blood Donation Management Implementation Steps</h2>
          
          {/* Desktop Timeline Connector - Integrated with animations */}
          <nav className="hidden lg:block mb-8" aria-label="Implementation timeline navigation">
            <div className="relative">
              <div 
                className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2"
                style={{ 
                  background: 'linear-gradient(to right, rgba(255, 107, 107, 0.3), rgba(255, 107, 107, 0.5), rgba(255, 107, 107, 0.3))',
                  opacity: prefersReducedMotion || timelineAnimated ? 1 : 0,
                  transform: prefersReducedMotion || timelineAnimated 
                    ? 'translateY(-50%) scaleX(1)' 
                    : 'translateY(-50%) scaleX(0)',
                  transformOrigin: 'left',
                  transition: prefersReducedMotion 
                    ? 'none' 
                    : 'opacity 0.8s ease 0.2s, transform 1s cubic-bezier(0.4, 0, 0.2, 1) 0.2s'
                }}
                aria-hidden="true"
              ></div>
              <div className="relative flex justify-between" role="list">
                {implementationSteps.map((step, idx) => {
                  const isStepVisible = visibleSteps.has(idx);
                  const stepDelay = prefersReducedMotion ? 0 : idx * 150;
                  return (
                    <div key={step.step} className="relative z-10 flex flex-col items-center" role="listitem">
                      <div 
                        className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white shadow-lg transition-all duration-500"
                        style={{ 
                          backgroundColor: stepThemes[idx].iconBg,
                          opacity: prefersReducedMotion ? 1 : (isStepVisible ? 1 : 0),
                          transform: prefersReducedMotion 
                            ? 'none' 
                            : isStepVisible 
                              ? 'scale(1)' 
                              : 'scale(0)',
                          transition: prefersReducedMotion 
                            ? 'none' 
                            : `opacity 0.5s ease ${stepDelay}ms, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${stepDelay}ms`
                        }}
                        aria-label={`Step ${step.step}: ${step.title}`}
                      >
                        <step.icon 
                          className="h-6 w-6 transition-transform duration-300" 
                          style={{ 
                            color: stepThemes[idx].accent,
                            transform: prefersReducedMotion ? 'none' : isStepVisible ? 'rotate(0deg)' : 'rotate(-180deg)'
                          }}
                          aria-hidden="true"
                        />
                      </div>
                      {idx < implementationSteps.length - 1 && (
                        <ArrowRight 
                          className="absolute left-full top-1/2 h-5 w-5 -translate-y-1/2 translate-x-4 transition-all duration-400" 
                          style={{ 
                            color: 'rgba(255, 107, 107, 0.5)',
                            opacity: prefersReducedMotion ? 1 : (isStepVisible ? 1 : 0),
                            transform: prefersReducedMotion 
                              ? 'translate(-50%, -50%)' 
                              : isStepVisible 
                                ? 'translate(-50%, -50%) translateX(16px)' 
                                : 'translate(-50%, -50%) translateX(0px)',
                            transition: prefersReducedMotion 
                              ? 'none' 
                              : `opacity 0.4s ease ${stepDelay + 300}ms, transform 0.4s ease ${stepDelay + 300}ms`
                          }}
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Steps with improved visual hierarchy */}
          <div className="space-y-12 sm:space-y-16 md:space-y-20" role="list">
            {implementationSteps.map((step, index) => {
              const theme = stepThemes[index];
              const isVisible = visibleSteps.has(index);
              const animationDelay = prefersReducedMotion ? 0 : index * 100;
              
              return (
                <article
                  key={step.step}
                  ref={(el) => {
                    if (el) stepRefs.current[index] = el;
                  }}
                  className="relative transition-all focus-within:outline focus-within:outline-3 focus-within:outline-[#FF6B6B] focus-within:outline-offset-2"
                  style={{ 
                    // Universal Card Styling - Clinical Authority Design System
                    backgroundColor: '#FFFFFF', // Card Background: white
                    border: '1px solid #E5E7EB', // Card Border: 1px solid #E5E7EB
                    borderRadius: '12px', // Card Border Radius: 12px
                    padding: '32px', // Card Padding: 32px
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)', // Card Shadow
                    opacity: prefersReducedMotion ? 1 : (isVisible ? 1 : 0),
                    transform: prefersReducedMotion 
                      ? 'none' 
                      : isVisible 
                        ? 'translateY(0)' 
                        : 'translateY(20px)',
                    transition: prefersReducedMotion 
                      ? 'box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
                      : `opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${animationDelay}ms, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${animationDelay}ms, box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)`,
                    maxWidth: '100%',
                    overflowX: 'hidden',
                    willChange: prefersReducedMotion || isVisible ? 'auto' : 'transform, opacity'
                  }}
                  onMouseEnter={(e) => {
                    if (!prefersReducedMotion) {
                      // Hover Effect: Shadow increases, lift by 2px
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!prefersReducedMotion) {
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)';
                      e.currentTarget.style.transform = isVisible ? 'translateY(0)' : 'translateY(20px)';
                    }
                  }}
                  onFocus={(e) => {
                    // Accessibility: Announce step when focused via keyboard
                    if (e.target === e.currentTarget || e.currentTarget.contains(e.target as Node)) {
                      announceToScreenReader(`Step ${step.step}: ${step.title}. ${step.description}`);
                    }
                  }}
                  itemScope
                  itemType="https://schema.org/HowToStep"
                  aria-labelledby={`step-${index}-heading`}
                >
                  {/* Step Badge - Clinical Authority Design System */}
                  <div 
                    className="inline-flex items-center gap-2 transition-all"
                    style={{ 
                      // Step Badge Styling
                      backgroundColor: 'rgba(255, 107, 107, 0.1)', // Background: #FF6B6B with 10% opacity
                      border: '1px solid #FF6B6B', // Border: 1px solid #FF6B6B
                      borderRadius: '8px', // Border Radius: 8px
                      padding: '8px 16px', // Padding: 8px 16px
                      opacity: prefersReducedMotion ? 1 : (isVisible ? 1 : 0),
                      transform: prefersReducedMotion 
                        ? 'none' 
                        : isVisible 
                          ? 'scale(1)' 
                          : 'scale(0.9)',
                      transition: prefersReducedMotion 
                        ? 'none' 
                        : `opacity 0.4s ease ${animationDelay + 200}ms, transform 0.4s ease ${animationDelay + 200}ms`
                    }}
                    aria-label={`Step ${step.step} of ${implementationSteps.length}: ${step.title} - ${step.timeframe}`}
                  >
                    <step.icon 
                      className="h-4 w-4 flex-shrink-0" 
                      style={{ 
                        color: '#FF6B6B' // Icon Color: #FF6B6B
                      }}
                      aria-label={`${step.title} implementation icon`}
                    />
                    <span 
                      className="whitespace-nowrap uppercase" 
                      itemProp="position"
                      style={{
                        color: '#FF6B6B', // Text: #FF6B6B
                        fontSize: '14px', // 14px
                        fontWeight: 600, // 600 font-weight
                        letterSpacing: '0.5px' // letter-spacing: 0.5px
                      }}
                    >
                      {t('howItWorks.steps.stepLabel')} {step.step}
                    </span>
                    <span style={{ color: 'rgba(255, 107, 107, 0.6)' }} aria-hidden="true">•</span>
                    <span 
                      className="whitespace-nowrap uppercase"
                      style={{
                        color: '#FF6B6B',
                        fontSize: '14px',
                        fontWeight: 600,
                        letterSpacing: '0.5px'
                      }}
                    >
                      {step.timeframe}
                    </span>
                  </div>

                  <div className={`grid gap-6 sm:gap-8 md:gap-12 lg:grid-cols-2 lg:items-center mt-6 sm:mt-8 ${
                    index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                  }`}>
                    {/* Content - Always first on mobile */}
                    <div className="order-1 lg:order-none" style={{ marginTop: '20px' }}>
                      {/* Step Heading - Clinical Authority Design System */}
                      <h2 
                        id={`step-${index}-heading`} 
                        className="mb-3"
                        style={{ 
                          color: '#1A2332', // Color: #1A2332 (Navy)
                          fontSize: '28px', // Font-size: 28px
                          fontWeight: 700, // Font-weight: 700
                          lineHeight: '1.1', // Line-height: 1.1
                          letterSpacing: '-0.02em',
                          wordWrap: 'break-word'
                        }} 
                        itemProp="name"
                      >
                        {step.title}
                      </h2>
                      
                      {/* Step Subheading - Clinical Authority Design System */}
                      <p 
                        className="mb-5"
                        style={{ 
                          color: '#6B7280', // Color: #6B7280 (Cool Gray)
                          fontSize: '16px', // Font-size: 16px
                          fontWeight: 400, // Font-weight: 400
                          lineHeight: '1.6', // Line-height: 1.6
                          wordWrap: 'break-word',
                          marginBottom: '20px'
                        }} 
                        itemProp="text"
                      >
                        {step.description}
                      </p>
                      
                      {/* Bullet Points - Clinical Authority Design System */}
                      <ul 
                        className="space-y-3" 
                        style={{ 
                          listStyle: 'none',
                          paddingLeft: 0
                        }}
                        itemProp="itemListElement" 
                        itemScope 
                        itemType="https://schema.org/ItemList"
                      >
                        {step.details.map((detail, detailIndex) => {
                          const detailDelay = prefersReducedMotion ? 0 : animationDelay + 300 + (detailIndex * 50);
                          return (
                            <li 
                              key={detailIndex} 
                              className="flex items-start gap-3"
                              style={{ 
                                color: '#111827', // Color: #111827 (Neutral Dark)
                                fontSize: '15px', // Font-size: 15px
                                fontWeight: 400, // Font-weight: 400
                                lineHeight: '1.8', // Line-height: 1.8
                                marginBottom: '12px', // Spacing: 12px between items
                                opacity: prefersReducedMotion ? 1 : (isVisible ? 1 : 0),
                                transform: prefersReducedMotion 
                                  ? 'none' 
                                  : isVisible 
                                    ? 'translateX(0)' 
                                    : 'translateX(-10px)',
                                transition: prefersReducedMotion 
                                  ? 'none' 
                                  : `opacity 0.4s ease ${detailDelay}ms, transform 0.4s ease ${detailDelay}ms`,
                                wordWrap: 'break-word'
                              }}
                              itemProp="itemListElement"
                              itemScope
                              itemType="https://schema.org/HowToDirection"
                            >
                              <CheckCircle 
                                className="h-5 w-5 flex-shrink-0 mt-0.5 transition-all duration-300" 
                                style={{ 
                                  color: '#FF6B6B', // Bullet color: #FF6B6B
                                  minWidth: '20px',
                                  minHeight: '20px',
                                  transform: prefersReducedMotion 
                                    ? 'none' 
                                    : isVisible 
                                      ? 'scale(1)' 
                                      : 'scale(0)',
                                  transition: prefersReducedMotion 
                                    ? 'none' 
                                    : `transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) ${detailDelay}ms`
                                }}
                                aria-label="Step completed"
                              />
                              <span className="flex-1" itemProp="text">{detail}</span>
                            </li>
                          );
                        })}
                      </ul>
                      
                      {/* Internal linking for related content */}
                      <aside className="mt-6 text-sm" style={{ color: '#6B7280' }}>
                        <p className="mb-2">Learn more about our <Link to="/features" className="font-semibold hover:underline" style={{ color: '#FF6B6B' }}>donor scheduling system</Link> and <Link to="/case-studies" className="font-semibold hover:underline" style={{ color: '#FF6B6B' }}>AVIS integration success stories</Link>.</p>
                      </aside>
                    </div>

                    {/* Visual - Always second on mobile - Lazy loaded for performance */}
                    <div className="order-2 lg:order-none" style={{ minHeight: '200px' }}> {/* Prevent CLS */}
                      <div className="relative">
                        <div 
                          className="absolute -inset-2 sm:-inset-4 rounded-2xl sm:rounded-3xl blur-2xl opacity-50 transition-opacity duration-500"
                          style={{ 
                            backgroundColor: theme.bg,
                            opacity: prefersReducedMotion ? 0.5 : (isVisible ? 0.5 : 0),
                            transition: prefersReducedMotion 
                              ? 'none' 
                              : `opacity 0.6s ease ${animationDelay + 200}ms`
                          }}
                          aria-hidden="true"
                        ></div>
                        <div 
                          className="relative transition-all duration-500 w-full"
                          style={{
                            opacity: prefersReducedMotion ? 1 : (isVisible ? 1 : 0),
                            transform: prefersReducedMotion 
                              ? 'none' 
                              : isVisible 
                                ? 'translateY(0) scale(1)' 
                                : 'translateY(20px) scale(0.95)',
                            transition: prefersReducedMotion 
                              ? 'none' 
                              : `opacity 0.6s ease ${animationDelay + 300}ms, transform 0.6s ease ${animationDelay + 300}ms`,
                            maxWidth: '100%',
                            overflowX: 'hidden',
                            willChange: prefersReducedMotion || isVisible ? 'auto' : 'transform, opacity' // Performance optimization
                          }}
                        >
                          <Suspense fallback={<div style={{ minHeight: '200px', backgroundColor: '#F9FAFB' }} aria-label="Loading visualization" />}>
                            {step.visual}
                          </Suspense>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Progress Indicator with animation */}
                  {index < implementationSteps.length - 1 && (
                    <nav className="lg:hidden mt-6 sm:mt-8 flex items-center justify-center px-4" aria-label="Progress to next step">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div 
                          className="h-1.5 w-8 sm:w-12 rounded-full transition-all duration-500"
                          style={{ 
                            backgroundColor: theme.bg,
                            opacity: prefersReducedMotion ? 1 : (isVisible ? 1 : 0),
                            transform: prefersReducedMotion ? 'none' : isVisible ? 'scaleX(1)' : 'scaleX(0)',
                            transformOrigin: 'left',
                            transition: prefersReducedMotion ? 'none' : `opacity 0.5s ease ${animationDelay + 400}ms, transform 0.5s ease ${animationDelay + 400}ms`
                          }}
                          aria-hidden="true"
                        ></div>
                        <ArrowRight 
                          className="h-4 w-4 sm:h-5 sm:w-5 transition-all duration-300 flex-shrink-0" 
                          style={{ 
                            color: '#9CA3AF',
                            opacity: prefersReducedMotion ? 1 : (isVisible ? 1 : 0),
                            transform: prefersReducedMotion ? 'none' : isVisible ? 'translateX(0)' : 'translateX(-10px)',
                            transition: prefersReducedMotion ? 'none' : `opacity 0.4s ease ${animationDelay + 500}ms, transform 0.4s ease ${animationDelay + 500}ms`
                          }}
                          aria-label="Next step"
                        />
                        <div 
                          className="h-1.5 w-8 sm:w-12 rounded-full transition-all duration-500"
                          style={{ 
                            backgroundColor: stepThemes[index + 1].bg,
                            opacity: prefersReducedMotion ? 1 : 0,
                            transform: prefersReducedMotion ? 'none' : 'scaleX(0)',
                            transformOrigin: 'left',
                            transition: prefersReducedMotion ? 'none' : `opacity 0.5s ease ${animationDelay + 600}ms, transform 0.5s ease ${animationDelay + 600}ms`
                          }}
                          aria-hidden="true"
                        ></div>
                      </div>
                    </nav>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Transition Section */}
      <aside className="section-container py-6 sm:py-8" style={{ maxWidth: '100%', overflowX: 'hidden' }} aria-label="Call to action transition">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm" style={{ color: '#6B7280' }}>
              <div className="h-px w-8 sm:w-12" style={{ backgroundColor: '#9CA3AF' }} aria-hidden="true"></div>
              <span className="whitespace-nowrap">Ready to get started?</span>
              <div className="h-px w-8 sm:w-12" style={{ backgroundColor: '#9CA3AF' }} aria-hidden="true"></div>
            </div>
          </div>
        </div>
      </aside>

      {/* FAQ Section - Clinical Authority Design System */}
      <section 
        className="section-container" 
        style={{ 
          maxWidth: '100%', 
          overflowX: 'hidden',
          backgroundColor: '#FFFFFF', // Background: white
          paddingTop: '100px', // Padding: 100px vertical
          paddingBottom: '100px'
        }} 
        aria-labelledby="faq-heading"
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <header className="text-center">
            {/* "FAQS" badge: #FF6B6B text, #FF6B6B border with 10% opacity fill, centered */}
            <p 
              className="inline-block mb-4 px-4 py-2 rounded-lg border uppercase tracking-[0.05em]"
              style={{ 
                color: '#FF6B6B',
                borderColor: '#FF6B6B',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.5px'
              }}
            >
              {t('howItWorks.faq.badge')}
            </p>
            {/* Section Heading "Implementation Questions": #1A2332, 40px, 700 font-weight, centered */}
            <h2 
              id="faq-heading" 
              className="mb-4"
              style={{ 
                color: '#1A2332', 
                fontSize: '40px',
                fontWeight: 700,
                lineHeight: '1.1',
                letterSpacing: '-0.02em',
                wordWrap: 'break-word' 
              }}
            >
              {t('howItWorks.faq.title')}
            </h2>
            {/* Section Subheading: #6B7280, 18px, 400 font-weight, centered, 16px margin-top */}
            <p 
              className="mb-0"
              style={{ 
                color: '#6B7280', 
                fontSize: '18px',
                fontWeight: 400,
                lineHeight: '1.6',
                marginTop: '16px',
                wordWrap: 'break-word' 
              }}
            >
              {t('howItWorks.faq.description')}
            </p>
          </header>
          <div className="mt-8 sm:mt-10 md:mt-12">
            <FAQAccordion />
          </div>
        </div>
      </section>

      {/* CTA Section - Clinical Authority Design System */}
      <section 
        className="section-container" 
        style={{ 
          maxWidth: '100%', 
          overflowX: 'hidden',
          marginTop: '80px',
          marginBottom: '0'
        }} 
        aria-labelledby="cta-heading"
      >
        <div className="mx-auto max-w-[900px] px-4 sm:px-6">
          <div 
            className="relative overflow-hidden border-2" 
            style={{ 
              // Final CTA Section - Clinical Authority Design System
              background: '#FFE5E5', // Background: #FFE5E5 (light coral tint, 10% opacity of #FF6B6B)
              border: '1px solid rgba(255, 107, 107, 0.2)', // Border: 1px solid #FF6B6B with 20% opacity
              borderRadius: '16px', // Border Radius: 16px
              padding: '48px', // Padding: 48px
              boxShadow: '0 4px 6px rgba(255, 107, 107, 0.1)'
            }}
          >
            <div className="grid items-center gap-8 lg:grid-cols-[2fr_1fr]">
              <div className="space-y-4 text-center lg:text-left">
                {/* "READY TO GET STARTED?" badge: #FF6B6B text, #FF6B6B border with 10% opacity fill */}
                <p 
                  className="inline-block mb-4 px-4 py-2 rounded-lg border uppercase tracking-[0.05em]"
                  style={{ 
                    color: '#FF6B6B',
                    borderColor: '#FF6B6B',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '0.5px'
                  }}
                >
                  {t('howItWorks.cta.badge')}
                </p>
                
                {/* Heading "See Your Implementation Plan": #1A2332, 36px, 700 font-weight */}
                <h2 
                  id="cta-heading" 
                  className="mb-4"
                  style={{ 
                    color: '#1A2332', 
                    fontSize: '36px',
                    fontWeight: 700,
                    lineHeight: '1.1',
                    letterSpacing: '-0.02em',
                    wordWrap: 'break-word' 
                  }}
                >
                  {t('howItWorks.cta.title')}
                </h2>
                
                {/* Description text: #6B7280, 16px, 400 font-weight, max-width 600px */}
                <p 
                  className="mb-6"
                  style={{ 
                    color: '#6B7280', 
                    fontSize: '16px',
                    fontWeight: 400,
                    lineHeight: '1.6',
                    maxWidth: '600px',
                    wordWrap: 'break-word' 
                  }}
                >
                  {t('howItWorks.cta.description')}
                </p>
                
                {/* Feature pills */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                  {[
                    { key: 'setupTimeline' },
                    { key: 'noTechnicalExpertise' },
                    { key: 'fullSupport' }
                  ].map((tag) => (
                    <span 
                      key={tag.key}
                      className="inline-flex items-center rounded-full border px-4 py-2"
                      style={{ 
                        backgroundColor: '#FFFFFF', // Background: white
                        border: '1px solid #E5E7EB', // Border: 1px solid #E5E7EB
                        borderRadius: '24px', // Border Radius: 24px
                        padding: '8px 16px', // Padding: 8px 16px
                        color: '#111827', // Text: #111827
                        fontSize: '14px', // 14px
                        fontWeight: 500 // 500 font-weight
                      }}
                    >
                      {t(`howItWorks.cta.tags.${tag.key}`)}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* CTA Button - Right side on desktop, full-width on mobile */}
              <div className="flex justify-center lg:justify-end">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center rounded-lg w-full sm:w-auto px-8 py-4 font-semibold text-white focus:outline focus:outline-3 focus:outline-[#FF6B6B] focus:outline-offset-2"
                  style={{ 
                    backgroundColor: '#FF6B6B', // Background: #FF6B6B
                    color: '#FFFFFF', // Text: white
                    fontSize: '16px', // 16px
                    fontWeight: 600, // 600 font-weight
                    padding: '16px 32px', // Padding: 16px 32px
                    borderRadius: '8px', // Border Radius: 8px
                    boxShadow: '0 4px 6px rgba(255,107,107,0.3)', // Shadow: 0 4px 6px rgba(255,107,107,0.3)
                    minHeight: '48px',
                    minWidth: '44px',
                    transition: prefersReducedMotion 
                      ? 'none' 
                      : 'background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!prefersReducedMotion) {
                      e.currentTarget.style.backgroundColor = '#E85555'; // Hover: Background darkens to #E85555
                      e.currentTarget.style.transform = 'scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 6px 8px rgba(255,107,107,0.4)'; // Shadow increases
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!prefersReducedMotion) {
                      e.currentTarget.style.backgroundColor = '#FF6B6B';
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(255,107,107,0.3)';
                    }
                  }}
                  aria-label="Request implementation demo for blood donation management system. Opens contact page."
                >
                  {t('howItWorks.cta.button')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
    </>
  );
};

export default HowItWorks;

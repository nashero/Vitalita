import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, Users, X, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ImplementationStepCardProps {
  stepNumber: number;
  stepBadge: string;
  headline: string;
  description: string;
  bulletPoints: string[];
  dashboardImage: string;
  isActive?: boolean;
  customerQuote?: {
    text: string;
    author: string;
  };
  trustSignal?: {
    text: string;
    position?: 'above' | 'below';
  };
  expandableFeature?: {
    linkText: string;
    examples: Array<{
      title: string;
      description: string;
    }>;
  };
  socialProof?: {
    text: string;
  };
  successMetric?: {
    value: string;
    label: string;
    icon?: React.ReactNode;
  };
  additionalCTA?: {
    text: string;
    link: string;
  };
  dataQualityBadge?: {
    text: string;
  };
  performanceImprovement?: {
    before: Array<{
      label: string;
      value: string;
    }>;
    after: Array<{
      label: string;
      value: string;
    }>;
  };
}

const ImplementationStepCard: React.FC<ImplementationStepCardProps> = ({
  stepNumber,
  stepBadge,
  headline,
  description,
  bulletPoints,
  dashboardImage,
  isActive = false,
  customerQuote,
  trustSignal,
  expandableFeature,
  socialProof,
  successMetric,
  additionalCTA,
  dataQualityBadge,
  performanceImprovement,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <article
      className="relative rounded-2xl border bg-white p-6 sm:p-8 md:p-12"
      style={{
        backgroundColor: isActive ? '#FF6B6B05' : '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderLeft: isActive ? '4px solid #FF6B6B' : '1px solid #E5E7EB',
        borderRadius: '16px',
        marginBottom: '32px',
        boxShadow: isActive 
          ? '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)' 
          : 'none',
      }}
      aria-labelledby={`step-${stepNumber}-headline`}
    >
      {/* Large Step Number Background Element */}
      <div
        className="absolute top-0 left-0 pointer-events-none select-none text-[48px] md:text-[72px]"
        style={{
          fontWeight: 700,
          color: '#FF6B6B',
          opacity: 0.1,
          lineHeight: 1,
          padding: '16px',
          zIndex: 0,
        }}
        aria-hidden="true"
      >
        {stepNumber}
      </div>

      {/* Content Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-[60%_40%] gap-6 md:gap-8 lg:gap-12">
        {/* Left Column: Content */}
        <div className="flex flex-col">
          {/* Step Badge */}
          <div
            className="mb-4 inline-flex items-center rounded-full border"
            style={{
              backgroundColor: '#FF6B6B1A',
              border: '1px solid #FF6B6B',
              color: '#FF6B6B',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              padding: '6px 12px',
              width: 'fit-content',
              marginBottom: '16px',
            }}
          >
            {stepBadge}
          </div>

          {/* Headline (H2) with Data Quality Badge */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-3">
            <h2
              id={`step-${stepNumber}-headline`}
              className="text-[20px] sm:text-[24px] md:text-[28px] lg:text-[32px] font-bold flex-1"
              style={{
                color: '#111827',
                marginBottom: '12px',
                marginTop: 0,
                lineHeight: '1.2',
              }}
            >
              {headline}
            </h2>
            {/* Data Quality Badge - Near headline */}
            {dataQualityBadge && (
              <div
                className="flex-shrink-0 inline-flex items-center rounded-full border px-3 py-1 mt-1"
                style={{
                  border: '1px solid #9CA3AF',
                  color: '#6B7280',
                  fontSize: '12px',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  height: 'fit-content'
                }}
              >
                {dataQualityBadge.text}
              </div>
            )}
          </div>

          {/* Description */}
          <p
            style={{
              fontSize: '18px',
              fontWeight: 400,
              color: '#6B7280',
              lineHeight: 1.6,
              marginBottom: '24px',
              marginTop: 0,
            }}
          >
            {description}
          </p>

          {/* Trust Signal - Above bullets */}
          {trustSignal && trustSignal.position !== 'below' && (
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-lg border px-3 py-2"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #FF6B6B',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                width: 'fit-content',
                marginBottom: '24px',
              }}
            >
              <ShieldCheck className="h-4 w-4 flex-shrink-0" style={{ color: '#FF6B6B' }} aria-hidden="true" />
              <span>{trustSignal.text}</span>
            </div>
          )}

          {/* Bullet Points */}
          <ul 
            className="space-y-3"
            style={{ 
              listStyle: 'none', 
              padding: 0, 
              margin: 0,
            }}
          >
            {bulletPoints.map((point, index) => (
              <li
                key={index}
                className="flex items-start gap-3"
                style={{
                  marginBottom: '12px',
                }}
              >
                <CheckCircle2
                  className="mt-0.5 flex-shrink-0"
                  style={{
                    color: '#FF6B6B',
                    width: '18px',
                    height: '18px',
                  }}
                  aria-label="Completed"
                />
                <span
                  className="text-sm md:text-base"
                  style={{
                    color: '#374151',
                    lineHeight: 1.6,
                  }}
                >
                  {point}
                </span>
              </li>
            ))}
          </ul>

          {/* Customer Quote */}
          {customerQuote && (
            <div
              className="mt-6 md:mt-6"
              style={{
                fontStyle: 'italic',
                fontSize: '16px',
                color: '#6B7280',
                borderLeft: '3px solid #FF6B6B',
                paddingLeft: '16px',
                marginTop: '24px',
                marginBottom: '0',
              }}
            >
              <blockquote style={{ margin: 0 }}>
                "{customerQuote.text}" — {customerQuote.author}
              </blockquote>
            </div>
          )}

          {/* Expandable Feature Link */}
          {expandableFeature && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-4 text-left"
              style={{
                fontSize: '14px',
                color: '#FF6B6B',
                textDecoration: 'underline',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                padding: 0,
                marginTop: '16px',
              }}
              aria-expanded={isExpanded}
              aria-controls={`expandable-${stepNumber}`}
            >
              {expandableFeature.linkText}
            </button>
          )}
        </div>

        {/* Right Column: Dashboard Mockup */}
        <div className="flex items-center justify-center relative mt-6 md:mt-0">
          <div
            className="w-full overflow-hidden rounded-lg border relative"
            style={{
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
            }}
          >
            <img
              src={dashboardImage}
              alt={stepNumber === 1 
                ? "Vitalita onboarding dashboard showing three configured donation centers with capacity settings and operating hours"
                : stepNumber === 2
                ? "Workflow builder interface showing eligibility criteria configuration, health screening rules, and notification templates with active status indicators"
                : stepNumber === 3
                ? "Donor invitation campaign dashboard showing 1,247 total invitations sent with breakdown by channel: 60% email, 25% SMS, 15% portal access"
                : stepNumber === 4
                ? "Performance metrics dashboard showing 92% appointment rate, 87% utilization rate, and weekly capacity chart with upward trend"
                : `Dashboard mockup for ${headline}`
              }
              className="h-auto w-full object-contain"
              loading="lazy"
            />
            {/* Success Metric Callout - Overlaid on bottom-right of mockup (desktop) */}
            {successMetric && (
              <div
                className="hidden md:block absolute bottom-4 right-4 rounded-lg border bg-white p-4 shadow-lg"
                style={{
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
                  maxWidth: '200px',
                  zIndex: 10,
                }}
              >
                <div className="flex items-start gap-2">
                  {successMetric.icon && (
                    <div className="flex-shrink-0 mt-1">
                      {successMetric.icon}
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: '48px', fontWeight: 700, color: '#FF6B6B', lineHeight: 1 }}>
                      {successMetric.value}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
                      {successMetric.label}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Improvement Highlight - Below mockup */}
      {performanceImprovement && (
        <div
          className="mt-6 rounded-lg border bg-white p-6"
          style={{
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            backgroundColor: '#F9FAFB'
          }}
        >
          <h3 className="text-center mb-6 font-semibold" style={{ color: '#111827', fontSize: '16px' }}>
            Before Vitalita vs After Vitalita
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Before Column */}
            <div className="space-y-4">
              {performanceImprovement.before.map((item, index) => (
                <div key={index} className="text-center">
                  <div style={{ fontSize: '24px', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>
                    {item.value}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6B7280' }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Arrow Icon */}
            <div className="flex justify-center">
              <ArrowRight className="h-8 w-8" style={{ color: '#FF6B6B' }} aria-hidden="true" />
            </div>
            
            {/* After Column */}
            <div className="space-y-4">
              {performanceImprovement.after.map((item, index) => (
                <div key={index} className="text-center">
                  <div style={{ fontSize: '24px', fontWeight: 600, color: '#FF6B6B', marginBottom: '4px' }}>
                    {item.value}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6B7280' }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Expandable Feature Modal/Expansion */}
      {expandableFeature && isExpanded && (
        <div
          id={`expandable-${stepNumber}`}
          className="mt-6 rounded-lg border bg-white p-6"
          style={{
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            backgroundColor: '#F9FAFB',
          }}
        >
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold" style={{ color: '#111827' }}>
              Workflow Examples
            </h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="flex-shrink-0"
              aria-label="Close workflow examples"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X className="h-5 w-5" style={{ color: '#6B7280' }} />
            </button>
          </div>
          <div className="space-y-4">
            {expandableFeature.examples.map((example, index) => (
              <div
                key={index}
                className="rounded-lg border p-4"
                style={{
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <h4 className="font-semibold mb-2" style={{ color: '#111827', fontSize: '16px' }}>
                  {example.title}
                </h4>
                <p style={{ color: '#6B7280', fontSize: '14px', lineHeight: 1.6 }}>
                  {example.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Metric Callout - Below card (mobile) */}
      {successMetric && (
        <div
          className="md:hidden mt-6 rounded-lg border bg-white p-6"
          style={{
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
          }}
        >
          <div className="flex items-start gap-3">
            {successMetric.icon && (
              <div className="flex-shrink-0">
                {successMetric.icon}
              </div>
            )}
            <div>
              <div style={{ fontSize: '48px', fontWeight: 700, color: '#FF6B6B', lineHeight: 1 }}>
                {successMetric.value}
              </div>
              <div style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
                {successMetric.label}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Social Proof */}
      {socialProof && (
        <div
          className="flex items-center justify-center gap-2 mt-4"
          style={{
            fontSize: '14px',
            color: '#6B7280',
            textAlign: 'center',
            marginTop: '16px',
          }}
        >
          <Users className="h-4 w-4 flex-shrink-0" style={{ color: '#6B7280' }} aria-hidden="true" />
          <span>
            {socialProof.text.split(/(\d+)/).map((part, i) => 
              /^\d+$/.test(part) ? (
                <span key={i} style={{ color: '#FF6B6B', fontWeight: 600 }}>{part}</span>
              ) : (
                part
              )
            )}
          </span>
        </div>
      )}

      {/* Trust Signal - Below card (with coral numbers) */}
      {trustSignal && trustSignal.position === 'below' && (
        <div
          className="flex items-center justify-center gap-2 mt-4"
          style={{
            fontSize: '14px',
            color: '#6B7280',
            textAlign: 'center',
            marginTop: '16px',
          }}
        >
          <span>
            {trustSignal.text.split(/(\d+)/).map((part, i) => 
              /^\d+$/.test(part) ? (
                <span key={i} style={{ color: '#FF6B6B', fontWeight: 600 }}>{part}</span>
              ) : (
                part
              )
            )}
          </span>
        </div>
      )}

      {/* Additional CTA */}
      {additionalCTA && (
        <div className="mt-6 flex justify-center">
          <Link
            to={additionalCTA.link}
            className="inline-flex items-center justify-center rounded-lg border-2 px-6 py-3 font-semibold transition-colors focus:outline focus:outline-3 focus:outline-[#FF6B6B] focus:outline-offset-2"
            style={{
              borderColor: '#FF6B6B',
              backgroundColor: 'transparent',
              color: '#FF6B6B',
              fontSize: '16px',
              fontWeight: 600,
              minHeight: '48px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FF6B6B';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#FF6B6B';
            }}
          >
            {additionalCTA.text}
          </Link>
        </div>
      )}
    </article>
  );
};

export default ImplementationStepCard;

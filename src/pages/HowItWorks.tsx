import { Shield, CheckCircle2, Award, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ImplementationTimeline from '../components/ImplementationTimeline';
import ImplementationStepCard from '../components/ImplementationStepCard';
import FAQAccordion from '../components/FAQAccordion';
import ImplementationCTA from '../components/ImplementationCTA';

const HowItWorks = () => {
  const { t } = useTranslation();

  const handleCTAClick = () => {
    // Scroll to implementation timeline section
    const timelineSection = document.getElementById('implementation-timeline');
    if (timelineSection) {
      timelineSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const trustBadges = [
    {
      text: t('howItWorksPage.hero.trustBadges.avisCertified'),
      icon: <Award className="w-4 h-4" aria-hidden="true" />,
      ariaLabel: t('howItWorksPage.hero.trustBadges.avisCertified'),
    },
    {
      text: t('howItWorksPage.hero.trustBadges.gdprCompliant'),
      icon: <Shield className="w-4 h-4" aria-hidden="true" />,
      ariaLabel: t('howItWorksPage.hero.trustBadges.gdprCompliant'),
    },
    {
      text: t('howItWorksPage.hero.trustBadges.isoPending'),
      icon: <CheckCircle2 className="w-4 h-4" aria-hidden="true" />,
      ariaLabel: t('howItWorksPage.hero.trustBadges.isoPending'),
    },
  ];

  return (
    <div>
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#FF6B6B] focus:text-white focus:rounded-lg focus:font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:ring-offset-2"
        style={{
          position: 'absolute',
          left: '-9999px',
        }}
        onFocus={(e) => {
          e.currentTarget.style.left = '16px';
          e.currentTarget.style.top = '16px';
        }}
        onBlur={(e) => {
          e.currentTarget.style.left = '-9999px';
        }}
      >
        {t('common.skipToContent')}
      </a>

      {/* Hero Section */}
      <section
        id="main-content"
        className="w-full px-6 py-[60px] lg:pt-[120px] lg:pb-[80px]"
        style={{
          background: 'linear-gradient(to bottom, #1A2332, #111827)',
        }}
        aria-labelledby="how-it-works-hero-heading"
      >
        <div className="max-w-[1280px] mx-auto text-center">
          {/* Badge */}
          <div className="mb-6 sm:mb-6">
            <span
              className="inline-block px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-full border border-[#FF6B6B] bg-transparent"
              style={{
                color: '#FF6B6B',
                fontSize: '12px',
                padding: '8px 16px',
              }}
            >
              {t('howItWorksPage.hero.badge')}
            </span>
          </div>

          {/* Main Headline (H1) */}
          <h1
            id="how-it-works-hero-heading"
            className="text-[28px] sm:text-[36px] md:text-[48px] lg:text-[56px] font-bold leading-[1.1] text-[#F9FAFB]"
            style={{
              marginTop: '24px',
              marginBottom: '16px',
            }}
          >
            {t('howItWorksPage.hero.headline')}
          </h1>

          {/* Subtitle */}
          <p
            className="text-[16px] sm:text-[18px] md:text-[20px] font-normal text-[#6B7280] leading-[1.6] max-w-[720px] mx-auto"
            style={{
              marginTop: '16px',
              lineHeight: '1.7', // Increased for mobile readability
            }}
          >
            {t('howItWorksPage.hero.subtitle')}
          </p>

          {/* Trust Badge Strip */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center sm:gap-8 gap-4"
            role="list"
            aria-label="Trust badges and certifications"
            style={{
              marginTop: '40px',
            }}
          >
            {trustBadges.map((badge, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-[#FF6B6B] text-sm"
                role="listitem"
                aria-label={badge.ariaLabel}
              >
                {badge.icon}
                <span className="font-medium">{badge.text}</span>
              </div>
            ))}
          </div>

          {/* Implementation Timeline */}
          <div className="mt-10">
            <ImplementationTimeline />
          </div>

          {/* CTA Button */}
          <div
            className="w-full sm:w-auto"
            style={{
              marginTop: '32px',
            }}
          >
            <button
              onClick={handleCTAClick}
              className="w-full sm:w-auto text-base font-semibold text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-[#FF6B6B] focus:ring-opacity-50 min-h-[48px] hover:bg-[#E55B5B]"
              style={{
                backgroundColor: '#FF6B6B',
                padding: '16px 32px',
                minHeight: '48px', // Touch-friendly
              }}
              aria-label={t('howItWorksPage.hero.ctaButton')}
            >
              {t('howItWorksPage.hero.ctaButton')}
            </button>
          </div>
        </div>
      </section>

      {/* Implementation Steps Section */}
      <section 
        id="implementation-timeline"
        className="w-full px-6 py-12 md:py-16 bg-white"
        aria-labelledby="implementation-steps-heading"
      >
        <div className="max-w-[1280px] mx-auto">
          <h2 id="implementation-steps-heading" className="sr-only">
            Implementation Steps
          </h2>

          {/* Step 1: Week 1 Configuration */}
          <div className="mb-12">
            {/* Stats Callout */}
            <div 
              className="mx-auto mb-8 text-center rounded-lg"
              style={{
                backgroundColor: '#F9FAFB',
                padding: '16px',
                borderRadius: '8px',
                maxWidth: '600px',
              }}
            >
              <p style={{ fontSize: '14px', color: '#374151', margin: 0 }}>
                {t('howItWorksPage.step1.statsCallout')}
              </p>
            </div>

            {/* Step 1 Card */}
            <ImplementationStepCard
              stepNumber={1}
              stepBadge={t('howItWorksPage.step1.badge')}
              headline={t('howItWorksPage.step1.headline')}
              description={t('howItWorksPage.step1.description')}
              bulletPoints={t('howItWorksPage.step1.bullets', { returnObjects: true }) as string[]}
              dashboardImage="/images/onboarding-dashboard.png"
              isActive={true}
              customerQuote={{
                text: t('howItWorksPage.step1.customerQuote.text'),
                author: t('howItWorksPage.step1.customerQuote.author')
              }}
            />

            {/* Schema Markup for SEO */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "HowToStep",
                  "position": 1,
                  "name": t('howItWorksPage.step1.headline'),
                  "text": t('howItWorksPage.step1.description'),
                  "itemListElement": (t('howItWorksPage.step1.bullets', { returnObjects: true }) as string[]).map((text) => ({
                    "@type": "HowToDirection",
                    "text": text
                  }))
                })
              }}
            />
          </div>

          {/* Step 2: Week 1-2 Workflow Customization */}
          <div className="mb-12">
            {/* Step 2 Card */}
            <ImplementationStepCard
              stepNumber={2}
              stepBadge={t('howItWorksPage.step2.badge')}
              headline={t('howItWorksPage.step2.headline')}
              description={t('howItWorksPage.step2.description')}
              bulletPoints={t('howItWorksPage.step2.bullets', { returnObjects: true }) as string[]}
              dashboardImage="/images/workflow-builder.png"
              isActive={false}
              trustSignal={{
                text: t('howItWorksPage.step2.trustSignal'),
                position: 'above'
              }}
              expandableFeature={{
                linkText: t('howItWorksPage.step2.expandableFeature.linkText'),
                examples: [
                  {
                    title: t('howItWorksPage.step2.expandableFeature.examples.eligibility.title'),
                    description: t('howItWorksPage.step2.expandableFeature.examples.eligibility.description')
                  },
                  {
                    title: t('howItWorksPage.step2.expandableFeature.examples.autoNotification.title'),
                    description: t('howItWorksPage.step2.expandableFeature.examples.autoNotification.description')
                  }
                ]
              }}
              socialProof={{
                text: t('howItWorksPage.step2.socialProof')
              }}
            />

            {/* Schema Markup for SEO */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "HowToStep",
                  "position": 2,
                  "name": t('howItWorksPage.step2.headline'),
                  "text": t('howItWorksPage.step2.description'),
                  "itemListElement": (t('howItWorksPage.step2.bullets', { returnObjects: true }) as string[]).map((text) => ({
                    "@type": "HowToDirection",
                    "text": text
                  })),
                  "keywords": "Healthcare workflows, donor eligibility automation, blood donation software"
                })
              }}
            />
          </div>

          {/* Step 3: Week 2 Donor Enrollment Launch */}
          <div className="mb-12">
            {/* Step 3 Card */}
            <ImplementationStepCard
              stepNumber={3}
              stepBadge={t('howItWorksPage.step3.badge')}
              headline={t('howItWorksPage.step3.headline')}
              description={t('howItWorksPage.step3.description')}
              bulletPoints={t('howItWorksPage.step3.bullets', { returnObjects: true }) as string[]}
              dashboardImage="/images/invitations-dashboard.png"
              isActive={false}
              customerQuote={{
                text: t('howItWorksPage.step3.customerQuote.text'),
                author: t('howItWorksPage.step3.customerQuote.author')
              }}
              successMetric={{
                value: t('howItWorksPage.step3.successMetric.value'),
                label: t('howItWorksPage.step3.successMetric.label'),
                icon: <TrendingUp className="h-5 w-5" style={{ color: '#14B8A6' }} aria-hidden="true" />
              }}
            />

            {/* Schema Markup for SEO */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "HowToStep",
                  "position": 3,
                  "name": t('howItWorksPage.step3.headline'),
                  "text": t('howItWorksPage.step3.description'),
                  "itemListElement": (t('howItWorksPage.step3.bullets', { returnObjects: true }) as string[]).map((text) => ({
                    "@type": "HowToDirection",
                    "text": text
                  })),
                  "keywords": "blood donor outreach, SMS donor invitations, automated donor enrollment"
                })
              }}
            />
          </div>

          {/* Step 4: Ongoing Performance Management */}
          <div className="mb-12">
            {/* Step 4 Card */}
            <ImplementationStepCard
              stepNumber={4}
              stepBadge={t('howItWorksPage.step4.badge')}
              headline={t('howItWorksPage.step4.headline')}
              description={t('howItWorksPage.step4.description')}
              bulletPoints={t('howItWorksPage.step4.bullets', { returnObjects: true }) as string[]}
              dashboardImage="/images/kpi-dashboard.png"
              isActive={false}
              dataQualityBadge={{
                text: t('howItWorksPage.step4.dataQualityBadge')
              }}
              performanceImprovement={{
                before: [
                  {
                    value: t('howItWorksPage.step4.performanceImprovement.before.utilization'),
                    label: t('howItWorksPage.step4.performanceImprovement.before.utilizationLabel')
                  },
                  {
                    value: t('howItWorksPage.step4.performanceImprovement.before.reporting'),
                    label: t('howItWorksPage.step4.performanceImprovement.before.reportingLabel')
                  }
                ],
                after: [
                  {
                    value: t('howItWorksPage.step4.performanceImprovement.after.utilization'),
                    label: t('howItWorksPage.step4.performanceImprovement.after.utilizationLabel')
                  },
                  {
                    value: t('howItWorksPage.step4.performanceImprovement.after.reporting'),
                    label: t('howItWorksPage.step4.performanceImprovement.after.reportingLabel')
                  }
                ]
              }}
              trustSignal={{
                text: t('howItWorksPage.step4.trustSignal'),
                position: 'below'
              }}
            />

            {/* Schema Markup for SEO */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "HowToStep",
                  "position": 4,
                  "name": t('howItWorksPage.step4.headline'),
                  "text": t('howItWorksPage.step4.description'),
                  "itemListElement": (t('howItWorksPage.step4.bullets', { returnObjects: true }) as string[]).map((text) => ({
                    "@type": "HowToDirection",
                    "text": text
                  })),
                  "keywords": "donor management KPIs, compliance monitoring healthcare, blood donation analytics"
                })
              }}
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQAccordion
        badge={t('howItWorksPage.faq.badge')}
        headline={t('howItWorksPage.faq.headline')}
        subtitle={t('howItWorksPage.faq.subtitle')}
        items={[
          {
            question: t('howItWorksPage.faq.questions.setupTime.question'),
            answer: t('howItWorksPage.faq.questions.setupTime.answer')
          },
          {
            question: t('howItWorksPage.faq.questions.technicalExpertise.question'),
            answer: t('howItWorksPage.faq.questions.technicalExpertise.answer')
          },
          {
            question: t('howItWorksPage.faq.questions.databaseImport.question'),
            answer: t('howItWorksPage.faq.questions.databaseImport.answer')
          }
        ]}
      />

      {/* Final CTA Section */}
      <ImplementationCTA />
    </div>
  );
};

export default HowItWorks;

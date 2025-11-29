import { useState } from 'react';
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
} from 'lucide-react';

// Visual mockup components for each step
const ConfigurationDashboardMockup = () => {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-red-600" />
          <h3 className="text-sm font-semibold text-slate-900">{t('howItWorks.mockups.organizationSetup')}</h3>
        </div>
        <div className="h-2 w-2 rounded-full bg-green-500"></div>
      </div>
      <div className="space-y-4">
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">{t('howItWorks.mockups.donationCenters')}</span>
            <span className="text-xs text-slate-500">3 {t('howItWorks.mockups.configured')}</span>
          </div>
          <div className="space-y-2">
            {['Central Hospital', 'Regional Clinic', 'Mobile Unit'].map((center, i) => (
              <div key={i} className="flex items-center gap-2 rounded bg-white p-2">
                <MapPin className="h-3 w-3 text-red-500" />
                <span className="text-xs text-slate-700">{center}</span>
                <CheckCircle2 className="ml-auto h-3 w-3 text-green-500" />
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <div className="text-xs text-slate-500">{t('howItWorks.mockups.capacity')}</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">150/day</div>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <div className="text-xs text-slate-500">{t('howItWorks.mockups.hours')}</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">8:00 - 18:00</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const WorkflowBuilderMockup = () => {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Workflow className="h-5 w-5 text-red-600" />
          <h3 className="text-sm font-semibold text-slate-900">{t('howItWorks.mockups.workflowBuilder')}</h3>
        </div>
      </div>
      <div className="space-y-3">
        {[
          { labelKey: 'eligibilityCriteria', status: 'configured', Icon: CheckCircle2 },
          { labelKey: 'healthScreening', status: 'configured', Icon: CheckCircle2 },
          { labelKey: 'notificationTemplates', status: 'active', Icon: MessageSquare },
          { labelKey: 'userRoles', status: 'pending', Icon: Users },
        ].map((item, i) => {
          const IconComponent = item.Icon;
          return (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
              <IconComponent className="h-4 w-4 text-red-500" />
              <div className="flex-1">
                <div className="text-xs font-medium text-slate-700">{t(`howItWorks.mockups.${item.labelKey}`)}</div>
                <div className="text-xs text-slate-500">{t(`howItWorks.mockups.${item.status}`)}</div>
              </div>
              <div
                className={`h-2 w-2 rounded-full ${
                  item.status === 'configured' ? 'bg-green-500' : item.status === 'active' ? 'bg-blue-500' : 'bg-yellow-500'
                }`}
              ></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CommunicationDashboardMockup = () => {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Send className="h-5 w-5 text-red-600" />
          <h3 className="text-sm font-semibold text-slate-900">{t('howItWorks.mockups.invitationsSent')}</h3>
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-lg bg-gradient-to-r from-red-50 to-red-100 p-4">
          <div className="text-xs text-slate-600">{t('howItWorks.mockups.totalInvitations')}</div>
          <div className="mt-1 text-2xl font-bold text-red-600">1,247</div>
          <div className="mt-2 flex gap-4 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" /> 892
            </span>
            <span className="flex items-center gap-1">
              <Smartphone className="h-3 w-3" /> 355
            </span>
          </div>
        </div>
        <div className="space-y-2">
          {['emailCampaign', 'smsBlast', 'portalAccess'].map((itemKey, i) => (
            <div key={i} className="flex items-center justify-between rounded bg-slate-50 p-2">
              <span className="text-xs text-slate-700">{t(`howItWorks.mockups.${itemKey}`)}</span>
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-16 rounded-full bg-slate-200">
                  <div
                    className="h-1.5 rounded-full bg-red-500"
                    style={{ width: `${60 + i * 15}%` }}
                  ></div>
                </div>
                <span className="text-xs text-slate-500">{60 + i * 15}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AnalyticsDashboardMockup = () => {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-red-600" />
          <h3 className="text-sm font-semibold text-slate-900">{t('howItWorks.mockups.performanceMetrics')}</h3>
        </div>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { labelKey: 'appointments', value: '92%', trend: '+12%', color: 'text-red-600' },
            { labelKey: 'utilization', value: '87%', trend: '+8%', color: 'text-blue-600' },
          ].map((metric, i) => (
            <div key={i} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <div className="text-xs text-slate-500">{t(`howItWorks.mockups.${metric.labelKey}`)}</div>
              <div className={`mt-1 text-xl font-bold ${metric.color}`}>{metric.value}</div>
              <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="h-3 w-3" />
                {metric.trend}
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
          <div className="mb-2 text-xs text-slate-500">{t('howItWorks.mockups.weeklyCapacity')}</div>
          <div className="flex items-end gap-1">
            {[65, 78, 82, 75, 88, 92, 85].map((height, i) => (
              <div key={i} className="flex-1">
                <div
                  className="w-full rounded-t bg-red-500"
                  style={{ height: `${height}px` }}
                ></div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-slate-400">
            <span>{t('howItWorks.mockups.monday')}</span>
            <span>{t('howItWorks.mockups.tuesday')}</span>
            <span>{t('howItWorks.mockups.wednesday')}</span>
            <span>{t('howItWorks.mockups.thursday')}</span>
            <span>{t('howItWorks.mockups.friday')}</span>
            <span>{t('howItWorks.mockups.saturday')}</span>
            <span>{t('howItWorks.mockups.sunday')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const FAQAccordion = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
        <div className="space-y-2">
          <p className="text-sm leading-relaxed text-slate-600">
            {t('howItWorks.faq.questions.staffRequired.answer').split('\n')[0]}
          </p>
          <ul className="ml-4 list-disc space-y-2 text-sm leading-relaxed text-slate-600">
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
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
        >
          <button
            onClick={() => toggleFAQ(index)}
            className="flex w-full items-center justify-between p-6 text-left"
          >
            <h3 className="text-lg font-semibold text-slate-900">{faq.question}</h3>
            {openIndex === index ? (
              <ChevronUp className="h-5 w-5 flex-shrink-0 text-slate-400" />
            ) : (
              <ChevronDown className="h-5 w-5 flex-shrink-0 text-slate-400" />
            )}
          </button>
          {openIndex === index && (
            <div className="px-6 pb-6">
              {typeof faq.answer === 'string' ? (
                <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-line">{faq.answer}</p>
              ) : (
                faq.answer
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const HowItWorks = () => {
  const { t } = useTranslation();

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

  return (
    <div className="bg-slate-50">
      {/* Hero Section */}
      <section className="section-container relative overflow-hidden py-20">
        <div className="absolute left-1/2 top-0 -z-10 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-red-500/10 blur-[120px]" />
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">{t('howItWorks.hero.badge')}</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            {t('howItWorks.hero.title')}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">
            {t('howItWorks.hero.description')}
          </p>
        </div>
      </section>

      {/* Implementation Timeline */}
      <section className="section-container py-16">
        <div className="mx-auto max-w-6xl">
          <div className="space-y-24">
            {implementationSteps.map((step, index) => (
              <div
                key={step.step}
                className={`grid gap-12 lg:grid-cols-2 lg:items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Content */}
                <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50/80 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-red-600 shadow-sm">
                    <step.icon className="h-4 w-4" />
                    <span>{t('howItWorks.steps.stepLabel')} {step.step}</span>
                    <span className="text-red-400">•</span>
                    <span>{step.timeframe}</span>
                  </div>
                  <h2 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                    {step.title}
                  </h2>
                  <p className="mt-4 text-lg leading-relaxed text-slate-600">{step.description}</p>
                  <ul className="mt-6 ml-6 list-disc space-y-3">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="text-sm leading-relaxed text-slate-600">
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual */}
                <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="relative">
                    <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-red-100/50 to-slate-100/50 blur-2xl"></div>
                    <div className="relative">{step.visual}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Connector (Visual Element) */}
      <section className="section-container py-8">
        <div className="mx-auto max-w-6xl">
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-red-200 via-red-300 to-red-200"></div>
              <div className="relative flex justify-around">
                {implementationSteps.map((step) => (
                  <div
                    key={step.step}
                    className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-red-500 shadow-lg"
                  >
                    <span className="text-sm font-bold text-white">{step.step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-container py-16">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">{t('howItWorks.faq.badge')}</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {t('howItWorks.faq.title')}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              {t('howItWorks.faq.description')}
            </p>
          </div>
          <div className="mt-12">
            <FAQAccordion />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-container pb-12 sm:pb-16">
        <div className="relative overflow-hidden rounded-[40px] border border-slate-200 bg-gradient-to-br from-red-50 via-white to-slate-50 px-6 py-10 sm:px-10 sm:py-12 shadow-xl shadow-red-100/50">
          <div className="grid items-center gap-8 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-600">{t('howItWorks.cta.badge')}</p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{t('howItWorks.cta.title')}</h2>
              <p className="text-sm leading-relaxed text-slate-600">
                {t('howItWorks.cta.description')}
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                <span className="rounded-full border border-red-200 bg-white/80 px-3 py-1">{t('howItWorks.cta.tags.setupTimeline')}</span>
                <span className="rounded-full border border-red-200 bg-white/80 px-3 py-1">{t('howItWorks.cta.tags.noTechnicalExpertise')}</span>
                <span className="rounded-full border border-red-200 bg-white/80 px-3 py-1">{t('howItWorks.cta.tags.fullSupport')}</span>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-[12px] bg-gradient-to-r from-red-500 via-orange-500 to-red-600 px-10 py-5 text-base font-semibold text-white shadow-lg shadow-red-500/30 transition hover:from-red-600 hover:via-orange-600 hover:to-red-700 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5"
              >
                {t('howItWorks.cta.button')}
              </Link>
            </div>
          </div>
          <div className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-red-200/30 blur-3xl" />
          <div className="pointer-events-none absolute left-0 top-0 h-40 w-40 rounded-full bg-red-100/40 blur-3xl" />
        </div>
      </section>

    </div>
  );
};

export default HowItWorks;

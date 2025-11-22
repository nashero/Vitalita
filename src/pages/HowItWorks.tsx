import { useState } from 'react';
import { Link } from 'react-router-dom';
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
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-red-600" />
          <h3 className="text-sm font-semibold text-slate-900">Organization Setup</h3>
        </div>
        <div className="h-2 w-2 rounded-full bg-green-500"></div>
      </div>
      <div className="space-y-4">
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Donation Centers</span>
            <span className="text-xs text-slate-500">3 configured</span>
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
            <div className="text-xs text-slate-500">Capacity</div>
            <div className="mt-1 text-lg font-semibold text-slate-900">150/day</div>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <div className="text-xs text-slate-500">Hours</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">8:00 - 18:00</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const WorkflowBuilderMockup = () => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Workflow className="h-5 w-5 text-red-600" />
          <h3 className="text-sm font-semibold text-slate-900">Workflow Builder</h3>
        </div>
      </div>
      <div className="space-y-3">
        {[
          { label: 'Eligibility Criteria', status: 'configured', Icon: CheckCircle2 },
          { label: 'Health Screening', status: 'configured', Icon: CheckCircle2 },
          { label: 'Notification Templates', status: 'active', Icon: MessageSquare },
          { label: 'User Roles', status: 'pending', Icon: Users },
        ].map((item, i) => {
          const IconComponent = item.Icon;
          return (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
              <IconComponent className="h-4 w-4 text-red-500" />
              <div className="flex-1">
                <div className="text-xs font-medium text-slate-700">{item.label}</div>
                <div className="text-xs text-slate-500">{item.status}</div>
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
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Send className="h-5 w-5 text-red-600" />
          <h3 className="text-sm font-semibold text-slate-900">Invitations Sent</h3>
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-lg bg-gradient-to-r from-red-50 to-red-100 p-4">
          <div className="text-xs text-slate-600">Total Invitations</div>
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
          {['Email Campaign', 'SMS Blast', 'Portal Access'].map((item, i) => (
            <div key={i} className="flex items-center justify-between rounded bg-slate-50 p-2">
              <span className="text-xs text-slate-700">{item}</span>
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
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-red-600" />
          <h3 className="text-sm font-semibold text-slate-900">Performance Metrics</h3>
        </div>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Appointments', value: '92%', trend: '+12%', color: 'text-red-600' },
            { label: 'Utilization', value: '87%', trend: '+8%', color: 'text-blue-600' },
          ].map((metric, i) => (
            <div key={i} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <div className="text-xs text-slate-500">{metric.label}</div>
              <div className={`mt-1 text-xl font-bold ${metric.color}`}>{metric.value}</div>
              <div className="mt-1 flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="h-3 w-3" />
                {metric.trend}
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
          <div className="mb-2 text-xs text-slate-500">Weekly Capacity</div>
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
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const implementationSteps = [
  {
    step: 1,
    title: 'Setup Your Organization',
    timeframe: 'Week 1',
    icon: Settings,
    description: 'Get your organization configured and ready to go',
    details: [
      'Configure donation centers and locations',
      'Set capacity limits per location',
      'Define operating hours and schedules',
      'Import existing donor database (CSV/Excel support)',
    ],
    visual: <ConfigurationDashboardMockup />,
  },
  {
    step: 2,
    title: 'Customize Your Workflows',
    timeframe: 'Week 1-2',
    icon: Workflow,
    description: 'Tailor the platform to your organization\'s needs',
    details: [
      'Establish eligibility criteria',
      'Configure health screening questions',
      'Set up notification templates',
      'Define user roles and permissions',
    ],
    visual: <WorkflowBuilderMockup />,
  },
  {
    step: 3,
    title: 'Launch & Invite Donors',
    timeframe: 'Week 2',
    icon: Send,
    description: 'Go live and start engaging your donor community',
    details: [
      'Send enrollment invitations via email/SMS',
      'Provide donors with portal access link',
      'Train staff on platform usage (we provide training)',
      'Go live with first appointments',
    ],
    visual: <CommunicationDashboardMockup />,
  },
  {
    step: 4,
    title: 'Manage, Optimize ( Key Performance Indicators)',
    timeframe: 'Ongoing',
    icon: BarChart3,
    description: 'Continuously improve your operations with data-driven insights',
    details: [
      'Monitor appointments in real-time',
      'Track center capacity and utilization',
      'Analyze performance metrics',
      'Continuously improve based on data',
    ],
    visual: <AnalyticsDashboardMockup />,
  },
];

const faqs = [
  {
    question: 'How long does setup take?',
    answer:
      'Most organizations can complete the initial setup in 1-2 weeks. The timeline depends on the complexity of your organization structure and the number of donation centers you need to configure. Our team works closely with you to ensure a smooth and efficient setup process.',
  },
  {
    question: 'Do we need technical expertise?',
    answer:
      'No technical expertise is required. Vitalita is designed to be user-friendly and intuitive. Our implementation team provides comprehensive training for all staff members, and we offer ongoing support to ensure your team feels confident using the platform. However, if you have IT staff who want to be involved, we\'re happy to work with them.',
  },
  {
    question: 'What support do you provide?',
    answer:
      'We provide comprehensive support throughout your implementation and beyond. This includes dedicated implementation specialists, Italian-speaking success managers, bi-weekly adoption pulse checks, quarterly optimization reviews, and 24/7 technical support. We also offer training materials, documentation, and on-site or remote training sessions for your staff.',
  },
  {
    question: 'Can we migrate existing donor data?',
    answer:
      'Yes! Vitalita supports importing existing donor databases in CSV and Excel formats. Our team will help you map your existing data fields to our system and ensure a smooth migration. We can handle donor information, donation history, contact preferences, and more. Data migration is typically completed during the setup phase.',
  },
];

const FAQAccordion = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
              <p className="text-sm leading-relaxed text-slate-600">{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const HowItWorks = () => {
  return (
    <div className="bg-slate-50">
      {/* Hero Section */}
      <section className="section-container relative overflow-hidden py-20">
        <div className="absolute left-1/2 top-0 -z-10 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-red-500/10 blur-[120px]" />
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">Implementation Process</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
          Streamline Your Blood Donation Management
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">
            Our streamlined implementation process gets your organization live quickly and efficiently. With dedicated
            support and intuitive setup tools, you'll be managing donations in no time.
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
                    <span>Step {step.step}</span>
                    <span className="text-red-400">•</span>
                    <span>{step.timeframe}</span>
                  </div>
                  <h2 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                    {step.title}
                  </h2>
                  <p className="mt-4 text-lg leading-relaxed text-slate-600">{step.description}</p>
                  <ul className="mt-6 space-y-3">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                        <span className="text-sm leading-relaxed text-slate-600">{detail}</span>
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
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">FAQs</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Implementation Questions
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Everything you need to know about getting started with Vitalita
            </p>
          </div>
          <div className="mt-12">
            <FAQAccordion />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-container pb-12 sm:pb-16">
        <div className="relative overflow-hidden rounded-[40px] border border-slate-200 bg-slate-900 px-6 py-10 sm:px-10 sm:py-12 text-white shadow-2xl shadow-red-500/30">
          <div className="grid items-center gap-8 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-300">Take the next step</p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">See It in Action - Request a Demo</h2>
              <p className="text-sm leading-relaxed text-white/80">
                Ready to streamline your blood donation management? Partner with Vitalita to simplify your operations
                with our intelligent platform. Our team will tailor a walkthrough to your organization&apos;s
                implementation timeline, workflow requirements, and operational needs.
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-white/70">
                <span className="rounded-full border border-white/20 px-3 py-1">Implementation roadmap</span>
                <span className="rounded-full border border-white/20 px-3 py-1">Setup walkthrough</span>
                <span className="rounded-full border border-white/20 px-3 py-1">Customization demo</span>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-[12px] bg-gradient-to-r from-red-500 via-orange-500 to-red-600 px-10 py-5 text-base font-semibold text-white shadow-xl shadow-red-500/50 transition hover:from-red-600 hover:via-orange-600 hover:to-red-700 hover:shadow-2xl hover:shadow-red-500/60 hover:-translate-y-0.5"
              >
                Request a Demo
              </Link>
            </div>
          </div>
          <div className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-red-500/40 blur-3xl" />
          <div className="pointer-events-none absolute left-0 top-0 h-40 w-40 rounded-full bg-red-400/40 blur-3xl" />
        </div>
      </section>

    </div>
  );
};

export default HowItWorks;

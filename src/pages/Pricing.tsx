import { useState } from 'react';
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const plans = [
  {
    id: 'starter',
    name: 'Starter Plan',
    price: '€299',
    cadence: 'per month',
    description: 'For: Small local organizations (1-2 centers)',
    features: [
      'Up to 500 active donors',
      '1,000 appointments/month',
      '2 donation centers',
      'Email & SMS notifications',
      'Basic analytics',
      'Email support',
    ],
    cta: 'Start Free Trial',
    ctaLink: '/contact',
  },
  {
    id: 'professional',
    name: 'Professional Plan',
    price: '€799',
    cadence: 'per month',
    description: 'For: Regional organizations (3-10 centers)',
    highlighted: true,
    features: [
      'Up to 5,000 active donors',
      'Unlimited appointments',
      'Up to 10 donation centers',
      'Advanced scheduling features',
      'Full analytics suite',
      'Multi-channel communication',
      'Priority support',
      'Custom branding',
    ],
    cta: 'Request Demo',
    ctaLink: '/contact',
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: '€1,999',
    cadence: 'per month',
    description: 'For: National organizations (AVIS, Red Cross scale)',
    features: [
      'Unlimited donors',
      'Unlimited appointments',
      'Unlimited centers',
      'All Professional features',
      'API access',
      'Custom integrations',
      'Dedicated account manager',
      '24/7 phone support',
      'Advanced security features',
    ],
    cta: 'Contact Sales',
    ctaLink: '/contact',
  },
  {
    id: 'custom',
    name: 'Custom Plan',
    price: "Let's Talk",
    cadence: '',
    description: 'For: Organizations with specific needs',
    features: [
      'Everything in Enterprise',
      'Custom development',
      'White-label options',
      'SLA guarantees',
    ],
    cta: 'Schedule Consultation',
    ctaLink: '/contact',
  },
];

const comparisonFeatures = [
  {
    feature: 'Active Donors',
    starter: 'Up to 500',
    professional: 'Up to 5,000',
    enterprise: 'Unlimited',
    custom: 'Unlimited',
  },
  {
    feature: 'Appointments/Month',
    starter: '1,000',
    professional: 'Unlimited',
    enterprise: 'Unlimited',
    custom: 'Unlimited',
  },
  {
    feature: 'Donation Centers',
    starter: '2',
    professional: 'Up to 10',
    enterprise: 'Unlimited',
    custom: 'Unlimited',
  },
  {
    feature: 'Email & SMS Notifications',
    starter: true,
    professional: true,
    enterprise: true,
    custom: true,
  },
  {
    feature: 'Multi-channel Communication',
    starter: false,
    professional: true,
    enterprise: true,
    custom: true,
  },
  {
    feature: 'Basic Analytics',
    starter: true,
    professional: false,
    enterprise: false,
    custom: false,
  },
  {
    feature: 'Full Analytics Suite',
    starter: false,
    professional: true,
    enterprise: true,
    custom: true,
  },
  {
    feature: 'Advanced Scheduling',
    starter: false,
    professional: true,
    enterprise: true,
    custom: true,
  },
  {
    feature: 'Custom Branding',
    starter: false,
    professional: true,
    enterprise: true,
    custom: true,
  },
  {
    feature: 'API Access',
    starter: false,
    professional: false,
    enterprise: true,
    custom: true,
  },
  {
    feature: 'Custom Integrations',
    starter: false,
    professional: false,
    enterprise: true,
    custom: true,
  },
  {
    feature: 'Priority Support',
    starter: false,
    professional: true,
    enterprise: true,
    custom: true,
  },
  {
    feature: 'Dedicated Account Manager',
    starter: false,
    professional: false,
    enterprise: true,
    custom: true,
  },
  {
    feature: '24/7 Phone Support',
    starter: false,
    professional: false,
    enterprise: true,
    custom: true,
  },
  {
    feature: 'Advanced Security Features',
    starter: false,
    professional: false,
    enterprise: true,
    custom: true,
  },
  {
    feature: 'Custom Development',
    starter: false,
    professional: false,
    enterprise: false,
    custom: true,
  },
  {
    feature: 'White-label Options',
    starter: false,
    professional: false,
    enterprise: false,
    custom: true,
  },
  {
    feature: 'SLA Guarantees',
    starter: false,
    professional: false,
    enterprise: false,
    custom: true,
  },
];

const faqs = [
  {
    question: 'Can we try before buying?',
    answer:
      'Yes! We offer a 30-day free trial for our Starter and Professional plans. No credit card required. You can explore all features and see if Vitalita is the right fit for your organization.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, American Express), bank transfers, and purchase orders for Enterprise and Custom plans. All payments are processed securely through our encrypted payment gateway.',
  },
  {
    question: 'Can we upgrade or downgrade?',
    answer:
      'Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we prorate the billing for the current month. Downgrades will be applied at the start of your next billing cycle.',
  },
  {
    question: 'Is training included?',
    answer:
      'Yes, all plans include comprehensive onboarding and training materials. Professional and Enterprise plans include live training sessions with our team. Enterprise and Custom plans include dedicated training sessions and ongoing support.',
  },
];

const PricingPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="bg-slate-50">
      {/* Hero Section */}
      <section className="section-container py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Plans That Scale With Your Organization
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-600">
            Choose the plan that fits your organization's needs today, and scale as you grow.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="section-container pb-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-3xl border bg-white p-8 shadow-xl transition hover:-translate-y-2 hover:shadow-2xl ${
                plan.highlighted
                  ? 'border-red-200 ring-2 ring-red-100 lg:-mt-4 lg:mb-4'
                  : 'border-slate-100 hover:border-red-100'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-red-600 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="mt-2">
                <h2 className="text-xl font-bold text-slate-900">{plan.name}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{plan.description}</p>
                <div className="mt-6 flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  {plan.cadence && <span className="text-sm text-slate-500">{plan.cadence}</span>}
                </div>
                <ul className="mt-8 space-y-4 text-sm text-slate-600">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.ctaLink}
                  className={`mt-10 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                    plan.highlighted
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/40 hover:bg-red-700'
                      : plan.id === 'custom'
                        ? 'border-2 border-red-600 text-red-600 hover:bg-red-50'
                        : 'border border-slate-200 text-slate-700 hover:border-red-200 hover:text-red-600'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Guarantee & Billing Info */}
        <div className="mt-12 text-center">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">All plans include 30-day money-back guarantee</span> •{' '}
            <span className="font-semibold text-red-600">Annual billing saves 20%</span>
          </p>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="section-container py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Compare Plans</h2>
            <p className="mt-2 text-slate-600">See how our plans stack up against each other</p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Feature</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Starter</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-red-600">Professional</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Enterprise</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Custom</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comparisonFeatures.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.feature}</td>
                      <td className="px-6 py-4 text-center text-sm text-slate-600">
                        {typeof item.starter === 'boolean' ? (
                          item.starter ? (
                            <Check className="mx-auto h-5 w-5 text-red-500" />
                          ) : (
                            <X className="mx-auto h-5 w-5 text-slate-300" />
                          )
                        ) : (
                          item.starter
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-slate-600">
                        {typeof item.professional === 'boolean' ? (
                          item.professional ? (
                            <Check className="mx-auto h-5 w-5 text-red-500" />
                          ) : (
                            <X className="mx-auto h-5 w-5 text-slate-300" />
                          )
                        ) : (
                          item.professional
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-slate-600">
                        {typeof item.enterprise === 'boolean' ? (
                          item.enterprise ? (
                            <Check className="mx-auto h-5 w-5 text-red-500" />
                          ) : (
                            <X className="mx-auto h-5 w-5 text-slate-300" />
                          )
                        ) : (
                          item.enterprise
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-slate-600">
                        {typeof item.custom === 'boolean' ? (
                          item.custom ? (
                            <Check className="mx-auto h-5 w-5 text-red-500" />
                          ) : (
                            <X className="mx-auto h-5 w-5 text-slate-300" />
                          )
                        ) : (
                          item.custom
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-container py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Frequently Asked Questions</h2>
            <p className="mt-2 text-slate-600">Everything you need to know about our pricing</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:shadow-md"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="flex w-full items-center justify-between p-6 text-left"
                >
                  <span className="text-lg font-semibold text-slate-900">{faq.question}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="h-5 w-5 text-slate-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-500" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="border-t border-slate-100 px-6 pb-6 pt-4">
                    <p className="text-slate-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;

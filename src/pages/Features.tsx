import { Link } from 'react-router-dom';
import { Activity, BarChart3, CalendarRange, CheckCircle2, FileLock2, Layers, MailCheck, ShieldCheck, Users2 } from 'lucide-react';

const features = [
  {
    id: 'smart-scheduling',
    title: 'Smart Scheduling System',
    icon: CalendarRange,
    description:
      'Give coordinators a live command center to balance donation slots, staff, and equipment across every location with confidence.',
    bullets: [
      'Real-time availability tracking',
      'Automated capacity management',
      'Multi-location coordination',
      'Conflict detection and prevention',
    ],
    benefits: 'Reduce scheduling conflicts by 90%, save 15 hours per week',
    mockup: (
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-red-500/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Today</p>
            <p className="text-lg font-semibold text-slate-900">Rome Collection Center</p>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">92% full</span>
        </div>
        <div className="mt-6 grid grid-cols-7 gap-2 text-xs text-slate-500">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="flex flex-col items-center rounded-xl border border-slate-100 bg-slate-50 py-3">
              <span className="font-medium text-slate-600">{day}</span>
              <span className="mt-2 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-600">
                On Track
              </span>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-2 text-xs font-medium text-slate-500">
          <div className="flex items-center justify-between rounded-2xl bg-slate-900/90 px-4 py-3 text-white">
            <span>Fiumicino Mobile Unit</span>
            <span className="text-emerald-300">No conflicts</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-red-50 px-4 py-3 text-red-600">
            <span>Trastevere Clinic</span>
            <span>Staff shortage detected</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'donor-management',
    title: 'Comprehensive Donor Management',
    icon: Users2,
    description:
      'Maintain a complete view of every donor—from health history to eligibility windows—so teams can focus on relationships, not spreadsheets.',
    bullets: [
      'Complete donor profiles',
      'Medical history tracking',
      'Eligibility status monitoring',
      'Automated health screening',
    ],
    benefits: 'Track 10,000+ donors effortlessly, ensure compliance automatically',
    mockup: (
      <div className="rounded-3xl border border-slate-100 bg-gradient-to-br from-white via-slate-50 to-red-50 p-6 shadow-lg shadow-red-500/10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Donor Profile</p>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">Giulia Rossi</h3>
            <p className="text-xs text-slate-500">Donated 11 times • Rome</p>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Eligible</span>
        </div>
        <dl className="mt-6 space-y-3">
          <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
            <dt className="font-medium text-slate-500">Blood Type</dt>
            <dd className="font-semibold text-slate-900">O+</dd>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
            <dt className="font-medium text-slate-500">Last Donation</dt>
            <dd className="font-semibold text-slate-900">15 Jan 2025</dd>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
            <dt className="font-medium text-slate-500">Next Eligible</dt>
            <dd className="font-semibold text-emerald-600">29 Mar 2025</dd>
          </div>
        </dl>
        <div className="mt-6 rounded-2xl bg-slate-900/90 p-4 text-xs text-white">
          <p className="font-semibold uppercase tracking-[0.3em] text-slate-300">Automated Screening</p>
          <div className="mt-3 space-y-2">
            <p className="flex items-center justify-between text-white/80">
              Hb Check • 13.8 g/dL <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-300">OK</span>
            </p>
            <p className="flex items-center justify-between text-white/80">
              Travel Deferment • Cleared <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-300">OK</span>
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'communication-tools',
    title: 'Intelligent Communication Tools',
    icon: MailCheck,
    description:
      'Launch multi-channel, personalized outreach that keeps donors engaged—without adding work for coordinators.',
    bullets: [
      'Automated appointment reminders (Email, SMS, Calendar)',
      'Customizable notification templates',
      'Donor recall campaigns',
      'Emergency blood request broadcasts',
    ],
    benefits: 'Increase show-up rates by 40%, reduce no-shows dramatically',
    mockup: (
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg shadow-red-500/10">
        <div className="border-b border-slate-100 bg-slate-900 px-6 py-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-300">Campaign Composer</p>
          <h3 className="mt-1 text-lg font-semibold">AVIS Rome - Weekend Recall</h3>
        </div>
        <div className="grid gap-6 p-6 lg:grid-cols-2">
          <div className="space-y-4 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span className="font-medium text-slate-500">Channels</span>
              <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                Email • SMS • Calendar
              </span>
            </div>
            <div className="rounded-2xl border border-dashed border-red-200 bg-red-50/60 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-400">Reminder template</p>
              <p className="mt-2 font-medium text-slate-700">
                Ciao {`{donor_first_name}`}, ci vediamo sabato alle 09:30 presso AVIS Roma - Via Veneto.
              </p>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
              <span>Automated follow-up enabled</span>
              <span className="rounded-full bg-white px-2 py-1 font-semibold text-emerald-600">+40% attendance</span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-900 p-4 text-xs text-white shadow-inner">
            <p className="font-semibold uppercase tracking-[0.4em] text-slate-300">Live delivery status</p>
            <ul className="mt-4 space-y-3">
              {['SMS sent • 1,248 donors', 'Emails scheduled • 1,248', 'Calendar invites confirmed • 842'].map(
                (item) => (
                  <li key={item} className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
                    <span>{item}</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'analytics-dashboard',
    title: 'Advanced Analytics Dashboard',
    icon: BarChart3,
    description:
      'Measure donation performance, understand donor behavior, and forecast demand with clear visualizations tailored to your network.',
    bullets: [
      'Real-time donation metrics',
      'Donor demographic insights',
      'Center performance tracking',
      'Inventory forecasting',
      'Custom report generation',
    ],
    benefits: 'Make data-driven decisions, optimize operations',
    mockup: (
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-red-500/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Dashboard</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">National Performance</h3>
          </div>
          <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
            <Activity className="h-3.5 w-3.5" />
            Live
          </span>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-900 p-5 text-white">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-300">Donations</p>
            <p className="mt-4 text-3xl font-semibold">+18%</p>
            <p className="mt-2 text-xs text-white/70">vs. previous 30 days</p>
            <div className="mt-6 flex items-center justify-between text-xs text-white/80">
              <span>785 units collected</span>
              <span>Forecast: 820</span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Inventory Forecast</p>
            <div className="mt-4 space-y-3">
              {['O+', 'A+', 'B+', 'AB-'].map((type) => (
                <div key={type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{type}</span>
                    <span>Safe for 8 days</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-red-500" style={{ width: type === 'O+' ? '78%' : '54%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-2 rounded-2xl border border-dashed border-red-200 bg-red-50/60 p-5 text-xs text-slate-600">
            <p className="font-semibold uppercase tracking-[0.3em] text-red-400">Custom report generation</p>
            <p className="mt-3 text-sm text-slate-600">
              Export executive-ready PDF summaries or schedule CSV pushes to your BI stack—tailored to regions, centers, or
              campaigns.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'integration-security',
    title: 'Integration & Security',
    icon: ShieldCheck,
    description:
      'Connect Vitalita with clinical systems while keeping donor data secure with enterprise-grade controls built for healthcare.',
    bullets: [
      'Medical record system integration',
      'GDPR compliant data handling',
      'Secure encrypted storage',
      'Role-based access control',
    ],
    benefits: 'Confidence to scale with ironclad security guardrails',
    mockup: (
      <div className="rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-900 via-slate-800 to-red-800 p-6 text-white shadow-xl shadow-red-500/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-200">Security Center</p>
            <h3 className="mt-1 text-lg font-semibold text-white">Access Overview</h3>
          </div>
          <ShieldCheck className="h-6 w-6 text-emerald-300" />
        </div>
        <div className="mt-6 grid gap-4 text-xs">
          <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
            <span className="text-white/80">Encrypted at rest</span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-300">
              AES-256
            </span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
            <span className="text-white/80">GDPR processing log</span>
            <span className="rounded-full bg-white/10 px-2 py-1 font-semibold text-white">Compliant</span>
          </div>
          <div className="rounded-2xl bg-black/30 p-4">
            <p className="text-[10px] uppercase tracking-[0.4em] text-red-200">Role matrix</p>
            <div className="mt-3 grid grid-cols-3 gap-3 text-[10px]">
              {['Admin', 'Coordinator', 'Volunteer'].map((role) => (
                <div key={role} className="rounded-xl bg-white/10 p-3 text-center">
                  <p className="font-semibold text-white">{role}</p>
                  <p className="mt-2 text-white/60">SAML • SSO enforced</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
            <span className="text-white/80">Hospital EHR sync</span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-1 font-semibold text-emerald-300">Live</span>
          </div>
        </div>
      </div>
    ),
  },
];

const FeaturesPage = () => {
  return (
    <div className="bg-slate-50">
      <section className="relative overflow-hidden bg-white">
        <div className="section-container relative z-10 flex flex-col items-start gap-10 py-24 sm:py-32">
          <span className="flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-red-600">
            <Layers className="h-3.5 w-3.5 text-red-500" />
            Platform
          </span>
          <div className="max-w-3xl space-y-6">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              Everything You Need to Manage Blood Donations Efficiently
            </h1>
            <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
              Vitalita unifies scheduling, donor engagement, and analytics into a single operating platform tailored for
              AVIS and Italian healthcare networks. Give every coordinator and volunteer a modern workspace designed for
              faster decisions and safer collections.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-medium text-slate-500">
            <span className="rounded-full border border-slate-200 px-3 py-1">Enterprise-ready cloud</span>
            <span className="rounded-full border border-slate-200 px-3 py-1">Built with clinical compliance</span>
            <span className="rounded-full border border-slate-200 px-3 py-1">Trusted by leading donor centers</span>
          </div>
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-red-100 via-white to-slate-100" />
        <div className="absolute -right-24 top-20 -z-10 h-64 w-64 rounded-full bg-red-200/40 blur-3xl" />
        <div className="absolute bottom-10 left-20 -z-10 h-40 w-40 rounded-full bg-red-300/30 blur-3xl" />
      </section>

      <section className="section-container space-y-24 py-24 sm:py-32">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          const isOdd = index % 2 !== 0;

          return (
            <div
              key={feature.id}
              className="rounded-[32px] border border-slate-200 bg-white/80 p-10 shadow-sm shadow-red-200/20 backdrop-blur-sm transition duration-300 hover:shadow-xl"
            >
              <div className="grid items-center gap-12 lg:grid-cols-2">
                <div className={`space-y-6 ${isOdd ? 'lg:order-2' : ''}`}>
                  <div className="flex items-center gap-3 rounded-full bg-red-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-red-600">
                    <Icon className="h-4 w-4 text-red-500" />
                    {feature.title}
                  </div>
                  <p className="text-2xl font-semibold tracking-tight text-slate-900">{feature.title}</p>
                  <p className="text-base leading-relaxed text-slate-600">{feature.description}</p>
                  <ul className="space-y-3 text-sm text-slate-600">
                    {feature.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                    <FileLock2 className="h-4 w-4" />
                    {feature.benefits}
                  </div>
                </div>
                <div className={`relative ${isOdd ? 'lg:order-1' : ''}`}>
                  <div className={`pointer-events-none absolute -inset-6 rounded-[36px] bg-gradient-to-br from-red-200/40 via-transparent to-slate-200/30 ${isOdd ? 'lg:-left-10 lg:right-0' : ''}`} />
                  <div className="relative">{feature.mockup}</div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="section-container pb-24 sm:pb-32">
        <div className="relative overflow-hidden rounded-[40px] border border-slate-200 bg-slate-900 px-10 py-16 text-white shadow-2xl shadow-red-500/30">
          <div className="grid items-center gap-10 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-300">Take the next step</p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">See It in Action - Request a Demo</h2>
              <p className="text-sm leading-relaxed text-white/80">
                Partner with Vitalita to equip every donation center with a connected, intelligent operating system. Our team
                will tailor a walkthrough to your organization&apos;s workflows, data needs, and integration landscape.
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-white/70">
                <span className="rounded-full border border-white/20 px-3 py-1">Live product tour</span>
                <span className="rounded-full border border-white/20 px-3 py-1">Implementation roadmap</span>
                <span className="rounded-full border border-white/20 px-3 py-1">Security deep dive</span>
              </div>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-full bg-red-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/50 transition hover:bg-red-600"
            >
              Request a Demo
            </Link>
          </div>
          <div className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-red-500/40 blur-3xl" />
          <div className="pointer-events-none absolute left-0 top-0 h-40 w-40 rounded-full bg-red-400/40 blur-3xl" />
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;


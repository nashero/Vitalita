import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Users,
  Calendar,
  FileText,
  Bell,
  BarChart3,
  Zap,
  Smartphone,
  MapPin,
  Shield,
  Heart,
  Building2,
  UserCheck,
} from 'lucide-react';

const HowWeSimplify = () => {
  return (
    <div className="bg-slate-50">
      {/* Hero Section */}
      <section className="section-container relative overflow-hidden py-12">
        <div className="absolute left-1/2 top-0 -z-10 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-red-500/10 blur-[120px]" />
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">Innovation</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            How We Transform Blood Donation
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Vitalita reimagines the complex world of blood donation into a streamlined, intuitive experience for
            organizations and donors alike. Discover how we've simplified every step of the process.
          </p>
        </div>
      </section>

      {/* For Organizations Section */}
      <section className="section-container py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50/80 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-red-600 shadow-sm">
              <Building2 className="h-4 w-4" />
              <span>For Organizations</span>
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Streamlined Blood Donation Management
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-slate-600">
              Eliminate complexity. Automate processes. Save time.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Before/After Comparison */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-red-600" />
                <h3 className="text-xl font-semibold text-slate-900">Before Vitalita</h3>
              </div>
              <ul className="space-y-2">
                {[
                  'Manual scheduling & phone calls',
                  'Time-consuming eligibility checks',
                  'Multiple disconnected systems',
                  'Paper forms & manual reminders',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="mt-1 text-red-300">✗</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-white p-6 shadow-lg">
              <div className="mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-red-600" />
                <h3 className="text-xl font-semibold text-slate-900">With Vitalita</h3>
              </div>
              <ul className="space-y-2">
                {[
                  'Automated scheduling with real-time availability',
                  'Instant eligibility checks',
                  'Unified platform - one login',
                  'Automated notifications & digital screening',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Key Innovations for Organizations */}
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Calendar,
                title: 'One-Click Scheduling',
                description: 'Donors book in seconds. Your team sees everything in real-time.',
                benefit: 'Save 15+ hours/week',
              },
              {
                icon: Users,
                title: 'Automated Donor Management',
                description: 'Complete profiles with automatic eligibility tracking. No spreadsheets.',
                benefit: 'Manage 10,000+ donors',
              },
              {
                icon: Bell,
                title: 'Smart Notifications',
                description: 'Automated SMS and email reminders keep donors engaged.',
                benefit: '90% fewer no-shows',
              },
              {
                icon: BarChart3,
                title: 'Real-Time Analytics',
                description: 'Instant insights into capacity and performance.',
                benefit: 'No IT support needed',
              },
              {
                icon: Shield,
                title: 'Compliance Made Simple',
                description: 'Automated health screening ensures compliance effortlessly.',
                benefit: '100% compliance',
              },
              {
                icon: Clock,
                title: 'Quick Setup',
                description: 'Up and running in 1-2 weeks. We handle everything.',
                benefit: 'Minimal training',
              },
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-red-200 hover:shadow-lg"
                >
                  <div className="mb-3 inline-flex items-center justify-center rounded-xl bg-red-50 p-3">
                    <IconComponent className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
                  <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" />
                    {feature.benefit}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* For Individual Donors Section */}
      <section className="section-container bg-white py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50/80 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-red-600 shadow-sm">
              <UserCheck className="h-4 w-4" />
              <span>For Individual Donors</span>
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Stress-Free Donation Experience
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-slate-600">
              Book, donate, and track your impact—all in minutes.
            </p>
          </div>

          {/* Donor Journey */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                step: '1',
                icon: Smartphone,
                title: 'Easy Registration',
                description: 'Sign up in minutes. Your profile is saved securely.',
              },
              {
                step: '2',
                icon: Calendar,
                title: 'Book in Seconds',
                description: 'See available slots in real-time. Choose location, date, and time.',
              },
              {
                step: '3',
                icon: Bell,
                title: 'Smart Reminders',
                description: 'Automatic reminders before your appointment.',
              },
              {
                step: '4',
                icon: FileText,
                title: 'Digital Screening',
                description: 'Complete health questionnaire online. No paper forms.',
              },
              {
                step: '5',
                icon: MapPin,
                title: 'Easy Navigation',
                description: 'Get directions and know exactly what to expect.',
              },
              {
                step: '6',
                icon: Heart,
                title: 'Track Your Impact',
                description: 'See donation history and the lives you\'ve helped save.',
              },
            ].map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div
                  key={index}
                  className="group relative rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm transition hover:border-red-200 hover:shadow-lg"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-sm font-bold text-white">
                      {step.step}
                    </div>
                    <IconComponent className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
                </div>
              );
            })}
          </div>

          {/* Donor Benefits Summary */}
          <div className="mt-10 rounded-3xl border border-red-200 bg-gradient-to-br from-red-50 via-white to-red-50 p-6 shadow-lg">
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-slate-900">Simple by Design</h3>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {[
                {
                  stat: '5 minutes',
                  label: 'To book an appointment',
                  icon: Clock,
                },
                {
                  stat: 'Zero',
                  label: 'Paper forms',
                  icon: FileText,
                },
                {
                  stat: '100%',
                  label: 'Digital experience',
                  icon: Smartphone,
                },
              ].map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="mx-auto mb-3 inline-flex items-center justify-center rounded-xl bg-white p-3 shadow-sm">
                      <IconComponent className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="text-3xl font-bold text-red-600">{benefit.stat}</div>
                    <div className="mt-1 text-sm text-slate-600">{benefit.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Overall Benefits */}
      <section className="section-container py-12">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">The Result</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Simple for Everyone
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-slate-600">
              From complex processes to streamlined experiences that work for everyone.
            </p>
          </div>

          {/* Key Metrics */}
          <div className="mt-8 rounded-3xl border border-red-200 bg-gradient-to-br from-red-600 to-red-700 p-6 text-white shadow-xl">
            <div className="text-center">
              <h3 className="text-2xl font-semibold">The Impact</h3>
            </div>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {[
                { value: '80%', label: 'Reduction in admin time' },
                { value: '90%', label: 'Fewer scheduling conflicts' },
                { value: '95%', label: 'Donor satisfaction rate' },
              ].map((metric, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold">{metric.value}</div>
                  <div className="mt-1 text-sm text-red-100">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-container pb-12 sm:pb-16">
        <div className="relative overflow-hidden rounded-[40px] border border-slate-200 bg-gradient-to-br from-red-50 via-white to-slate-50 px-6 py-10 sm:px-10 sm:py-12 shadow-xl shadow-red-100/50">
          <div className="grid items-center gap-8 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-600">See it in action</p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Experience the Simplification</h2>
              <p className="text-sm leading-relaxed text-slate-600">
                See how we transform complex processes into simple, automated workflows. Watch hours of manual work become minutes of effortless automation.
              </p>
            </div>
            <div className="flex justify-center lg:justify-end">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-[12px] bg-gradient-to-r from-red-500 via-orange-500 to-red-600 px-10 py-5 text-base font-semibold text-white shadow-lg shadow-red-500/30 transition hover:from-red-600 hover:via-orange-600 hover:to-red-700 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5"
              >
                See Demo
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

export default HowWeSimplify;


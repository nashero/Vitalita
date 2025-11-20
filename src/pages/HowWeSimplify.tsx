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
  Mail,
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
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">Simplification</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            How We Simplify Blood Donation
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Vitalita transforms the complex world of blood donation into a streamlined, intuitive experience for
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
              Simplified Blood Donation Management
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-slate-600">
              Vitalita eliminates complexity, reduces manual work, and automates processes that used to take hours.
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
                  'Manual scheduling with spreadsheets and phone calls',
                  'Time-consuming donor eligibility verification',
                  'Disconnected systems requiring multiple logins',
                  'Manual reminder calls and emails',
                  'Paper-based health screening forms',
                  'Complex reporting requiring IT support',
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
                  'Instant eligibility checks with automated rules',
                  'Unified platform - one login for everything',
                  'Automated SMS and email notifications',
                  'Digital health screening with instant validation',
                  'Real-time dashboards and automated reports',
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Key Simplifications for Organizations */}
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Calendar,
                title: 'One-Click Scheduling',
                description:
                  'Donors book appointments in seconds. Your team sees everything in real-time without manual coordination.',
                benefit: 'Save 15+ hours per week',
              },
              {
                icon: Users,
                title: 'Automated Donor Management',
                description:
                  'Complete donor profiles with automatic eligibility tracking. No more manual calculations or spreadsheets.',
                benefit: 'Manage 10,000+ donors effortlessly',
              },
              {
                icon: Bell,
                title: 'Smart Notifications',
                description:
                  'Automated reminders via SMS and email. Donors stay engaged without your team lifting a finger.',
                benefit: '90% reduction in no-shows',
              },
              {
                icon: BarChart3,
                title: 'Real-Time Analytics',
                description:
                  'Instant insights into capacity, utilization, and performance. Make data-driven decisions effortlessly.',
                benefit: 'No IT support needed',
              },
              {
                icon: Shield,
                title: 'Compliance Made Simple',
                description:
                  'Automated health screening and eligibility rules ensure compliance without complex manual processes.',
                benefit: '100% compliance confidence',
              },
              {
                icon: Clock,
                title: 'Quick Setup',
                description:
                  'Get up and running in 1-2 weeks. Our team handles the heavy lifting so you can focus on saving lives.',
                benefit: 'Minimal training required',
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
              A Simple, Stress-Free Donation Experience
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-slate-600">
              We've removed all the friction from blood donation. Book, donate, and track your impact in minutes.
            </p>
          </div>

          {/* Donor Journey */}
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              {
                step: '1',
                icon: Smartphone,
                title: 'Easy Registration',
                description:
                  'Sign up in minutes with a simple form. Your profile is saved securely, so you never have to re-enter information.',
                details: ['Quick online registration', 'Secure profile storage', 'One-time setup'],
              },
              {
                step: '2',
                icon: Calendar,
                title: 'Book in Seconds',
                description:
                  'See available slots in real-time. Choose your preferred location, date, and time with just a few taps.',
                details: ['Real-time availability', 'Multiple locations', 'Instant confirmation'],
              },
              {
                step: '3',
                icon: Bell,
                title: 'Smart Reminders',
                description:
                  'Get automatic reminders before your appointment. Never miss a donation opportunity again.',
                details: ['SMS and email reminders', '24-hour advance notice', 'Easy rescheduling'],
              },
              {
                step: '4',
                icon: FileText,
                title: 'Digital Health Screening',
                description:
                  'Complete your health questionnaire online before arriving. No more waiting in line with paper forms.',
                details: ['Pre-appointment screening', 'Instant eligibility check', 'Paperless process'],
              },
              {
                step: '5',
                icon: MapPin,
                title: 'Easy Navigation',
                description:
                  'Get directions to your donation center. Know exactly where to go and what to expect.',
                details: ['Clear directions', 'Parking information', 'What to bring guide'],
              },
              {
                step: '6',
                icon: Heart,
                title: 'Track Your Impact',
                description:
                  'See your donation history, eligibility status, and the lives you\'ve helped save - all in one place.',
                details: ['Donation history', 'Eligibility calendar', 'Impact tracking'],
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
                  <ul className="mt-3 space-y-1.5">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start gap-2 text-xs text-slate-600">
                        <CheckCircle2 className="mt-0.5 h-3 w-3 flex-shrink-0 text-red-500" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Donor Benefits Summary */}
          <div className="mt-10 rounded-3xl border border-red-200 bg-gradient-to-br from-red-50 via-white to-red-50 p-6 shadow-lg">
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-slate-900">What This Means for You</h3>
              <p className="mt-2 text-slate-600">Donating blood has never been this simple</p>
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
                  label: 'Paper forms to fill',
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

      {/* Overall Simplification Benefits */}
      <section className="section-container py-12">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">The Result</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              A Completely Simplified Process
            </h2>
            <p className="mt-3 text-lg leading-relaxed text-slate-600">
              Vitalita has transformed blood donation from a complex, time-consuming process into a streamlined
              experience that works for everyone.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {[
              {
                title: 'For Organizations',
                benefits: [
                  'Reduce administrative time by 80%',
                  'Eliminate scheduling conflicts',
                  'Automate compliance and reporting',
                  'Improve donor engagement',
                  'Make data-driven decisions easily',
                ],
              },
              {
                title: 'For Donors',
                benefits: [
                  'Book appointments in minutes',
                  'No more waiting or paperwork',
                  'Get reminders automatically',
                  'Track your donation history',
                  'See your impact in real-time',
                ],
              },
            ].map((section, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg"
              >
                <h3 className="text-xl font-semibold text-slate-900">{section.title}</h3>
                <ul className="mt-4 space-y-2">
                  {section.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                      <span className="text-sm leading-relaxed text-slate-600">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Key Metrics */}
          <div className="mt-8 rounded-3xl border border-red-200 bg-gradient-to-br from-red-600 to-red-700 p-6 text-white shadow-xl">
            <div className="text-center">
              <h3 className="text-2xl font-semibold">The Impact of Simplification</h3>
              <p className="mt-2 text-red-100">Real results from organizations using Vitalita</p>
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

    </div>
  );
};

export default HowWeSimplify;


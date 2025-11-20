import { Mail, MessageCircle, PieChart, Workflow } from 'lucide-react';

const featureList = [
  {
    icon: <Workflow className="h-6 w-6" />,
    title: 'Smart Scheduling',
    description:
      'Orchestrate phlebotomy, volunteers, and mobile units with AI-assisted capacity planning that respects regional regulations and donation cadence.',
  },
  {
    icon: <PieChart className="h-6 w-6" />,
    title: 'Donor Management',
    description:
      'Maintain a single donor record with eligibility windows, donation history, blood type matching, and automated deferral management.',
  },
  {
    icon: <MessageCircle className="h-6 w-6" />,
    title: 'Multi-Channel Communication',
    description:
      'Trigger campaigns across SMS, Telegram, email, and voice with localized messaging templates aligned to Italian privacy requirements.',
  },
  {
    icon: <Mail className="h-6 w-6" />,
    title: 'Actionable Analytics',
    description:
      'Track KPIs across provinces, measure campaign conversion, and share executive-ready insights in seconds—not spreadsheets.',
  },
];

const Features = () => {
  return (
    <section className="section-container py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">Platform Pillars</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Built for complex donation networks
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          Vitalita connects every team—from recruitment to transfusion—with a modern operating system that keeps donors
          engaged and blood supply reliable.
        </p>
      </div>
      <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {featureList.map((feature) => (
          <div
            key={feature.title}
            className="fade-in-up rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-lg shadow-slate-200/40 backdrop-blur transition duration-300 hover:-translate-y-2 hover:border-red-100 hover:shadow-red-100/60"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              {feature.icon}
            </div>
            <h3 className="mt-6 text-lg font-semibold text-slate-900">{feature.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;


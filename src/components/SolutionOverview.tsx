import { BrainCircuit, Building2, Sparkles } from 'lucide-react';

const benefits = [
  {
    icon: <Building2 className="h-6 w-6" />,
    title: 'One operating system',
    description:
      'Configurable for regional structures, supporting AVIS provincial chapters, Croce Rossa hubs, FIDAS associations, and FRATRES federations.',
  },
  {
    icon: <BrainCircuit className="h-6 w-6" />,
    title: 'Intelligent automation',
    description:
      'Adaptive outreach cadences, automated donor follow-ups, and availability matching reduce manual work by up to 40%.',
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: 'Trustworthy experience',
    description:
      'ISO27001-ready security, GDPR-compliant consent tracking, and full audit trails keep donors and regulators confident.',
  },
];

const SolutionOverview = () => {
  return (
    <section className="section-container py-20">
      <div className="overflow-hidden rounded-[40px] bg-gradient-to-r from-slate-900 via-slate-800 to-red-700 text-white shadow-2xl">
        <div className="grid gap-12 p-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-200">Our Promise</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              A modern platform designed with Italian donor networks
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/80">
              Vitalita harmonizes donor engagement, operational logistics, and data visibility across every region. From
              recruitment to retention, we provide the digital backbone to sustain life-saving blood supply.
            </p>
          </div>
          <div className="grid gap-6">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="scale-in rounded-3xl border border-white/10 bg-white/5 p-6 transition duration-300 hover:border-white/30 hover:bg-white/10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                  {benefit.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{benefit.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/80">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionOverview;


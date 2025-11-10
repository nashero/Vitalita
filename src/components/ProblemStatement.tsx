import { AlertTriangle, BarChart2, ClipboardList } from 'lucide-react';

const painPoints = [
  {
    icon: <ClipboardList className="h-6 w-6" />,
    title: 'Fragmented workflows',
    description:
      'Regional chapters juggle spreadsheets, paper forms, and legacy booking tools, leading to double bookings and donor drop-offs.',
  },
  {
    icon: <BarChart2 className="h-6 w-6" />,
    title: 'Limited visibility',
    description:
      'Leadership lacks real-time view of campaign performance, deferrals, and capacity, making planning reactive instead of proactive.',
  },
  {
    icon: <AlertTriangle className="h-6 w-6" />,
    title: 'Compliance pressure',
    description:
      'GDPR, ISO standards, and regional health regulations demand traceability and secure donor data stewardship.',
  },
];

const ProblemStatement = () => {
  return (
    <section className="section-container py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">The Challenge</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Donation networks deserve better than manual coordination
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          Italian blood organizations manage thousands of donors, rotating medical teams, and mobile units—often with
          disconnected systems. Vitalita unifies people, processes, and data in a single command center.
        </p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {painPoints.map((pain) => (
          <div
            key={pain.title}
            className="fade-in-up rounded-3xl border border-slate-100 bg-white p-6 text-left shadow-sm transition duration-300 hover:-translate-y-2 hover:border-red-100 hover:shadow-xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              {pain.icon}
            </div>
            <h3 className="mt-5 text-lg font-semibold text-slate-900">{pain.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{pain.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProblemStatement;


import { Link } from 'react-router-dom';
import { Calendar, LineChart, Shield, Users } from 'lucide-react';

const Hero = () => {
  return (
    <section className="section-container relative overflow-hidden py-20">
      <div className="absolute left-1/2 top-0 -z-10 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-red-500/10 blur-[120px]" />
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center space-x-2 rounded-full border border-red-100 bg-red-50/80 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-red-600 shadow-sm shadow-red-100">
            <span>Purpose-built for blood donation organizations</span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Streamline Your Blood Donation Management
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-slate-600">
            Vitalita replaces spreadsheets and siloed tools with a unified platform designed for AVIS. Coordinate donor outreach, manage capacity, and prove impact with confidence.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-full bg-red-600 px-8 py-3 text-sm font-semibold text-white shadow-xl shadow-red-600/40 transition hover:bg-red-700 hover:shadow-red-600/50"
            >
              Schedule a Demo
            </Link>
            <Link
              to="/how-it-works"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-8 py-3 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:text-red-600"
            >
              See How It Works
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: <Users className="h-5 w-5 text-red-600" />,
                title: 'Donor Retention',
                description: '+18% average yearly retention gains',
              },
              {
                icon: <Calendar className="h-5 w-5 text-red-600" />,
                title: 'Smart Scheduling',
                description: 'Automated capacity with SMS, email, Telegram',
              },
              {
                icon: <LineChart className="h-5 w-5 text-red-600" />,
                title: 'Impact Analytics',
                description: 'Real-time reporting across the national network',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-100 bg-white/70 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:border-red-100 hover:shadow-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg">
          <div className="absolute -inset-2 -z-10 rounded-[32px] bg-gradient-to-tr from-red-200 via-sky-100 to-white blur-2xl" />
          <div className="rounded-[32px] border border-slate-100 bg-white/80 p-6 shadow-[0_40px_120px_-50px_rgba(220,38,38,0.45)] backdrop-blur-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Campaign Dashboard</p>
                <p className="text-xs text-slate-500">Regional view • Updated 2 min ago</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                <Shield className="h-4 w-4" />
                ISO27001 Ready
              </div>
            </div>
            <div className="space-y-6">
              <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-inner">
                <p className="text-xs uppercase tracking-wider text-white/70">Next 7 Days Capacity</p>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-4xl font-semibold text-white">92%</p>
                    <p className="text-xs text-white/70">Slots filled</p>
                  </div>
                  <div className="grid w-40 grid-cols-7 gap-1 text-[10px]">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                      <div key={day} className="space-y-2">
                        <div className="h-16 w-full rounded-full bg-white/10">
                          <div
                            className="h-full w-full rounded-full bg-gradient-to-t from-red-500 to-red-300"
                            style={{ height: `${50 + index * 7}%` }}
                          />
                        </div>
                        <p className="text-center text-white/60">{day}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  {
                    label: 'Donor Show Rate',
                    value: '96%',
                    trend: '+12%',
                    caption: 'vs. last quarter',
                  },
                  {
                    label: 'Multi-channel Outreach',
                    value: '3.2x',
                    trend: '+2.1x',
                    caption: 'more responses with automation',
                  },
                  {
                    label: 'NPS Score',
                    value: '74',
                    trend: '+18',
                    caption: 'donor satisfaction uplift',
                  },
                  {
                    label: 'Turnaround Time',
                    value: '45m',
                    trend: '-28%',
                    caption: 'faster data availability',
                  },
                ].map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-2xl border border-slate-100 bg-white p-4 text-sm shadow-sm transition hover:-translate-y-1 hover:border-red-100 hover:shadow-lg"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{metric.label}</p>
                    <div className="mt-2 flex items-baseline space-x-2">
                      <span className="text-2xl font-semibold text-slate-900">{metric.value}</span>
                      <span className="text-xs font-semibold text-emerald-500">{metric.trend}</span>
                    </div>
                    <p className="text-xs text-slate-500">{metric.caption}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;


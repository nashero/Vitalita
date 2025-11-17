import { Link } from 'react-router-dom';

const CTA = () => {
  return (
    <section className="section-container relative overflow-hidden py-12">
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-red-600 via-red-500 to-slate-900" />
      <div className="relative mx-auto max-w-3xl text-center text-white">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">Next Steps</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
          Ready to elevate every donation experience?
        </h2>
        <p className="mt-3 text-base leading-relaxed text-slate-700">
          Join the Italian organizations modernizing their operations with Vitalita. Let's orchestrate recruitment,
          logistics, and donor loyalty with one adaptive platform.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/contact"
            className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-red-600 shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-slate-100 hover:text-red-700"
          >
            Request a Demo
          </Link>
          <Link
            to="/pricing"
            className="inline-flex items-center justify-center rounded-full border border-white/40 px-8 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white hover:bg-white/10"
          >
            View Pricing
          </Link>
        </div>
        <p className="mt-4 text-xs uppercase tracking-[0.3em] text-white/60">
          Trusted hand-in-hand with donor organizations nationwide
        </p>
      </div>
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-20 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
    </section>
  );
};

export default CTA;


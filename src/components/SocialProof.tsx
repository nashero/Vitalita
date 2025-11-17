const organizations = [
  { name: 'AVIS Nazionale', description: 'National coordination & regional integrations' },
];

const SocialProof = () => {
  return (
    <section className="section-container py-16">
      <div className="rounded-[36px] border border-slate-100 bg-white/90 p-10 shadow-xl shadow-slate-200/40 backdrop-blur">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-red-500">
          Trusted by leading Italian organizations
        </p>
        <div className="mt-8 flex justify-center">
          {organizations.map((org) => (
            <div
              key={org.name}
              className="fade-in flex flex-col items-center rounded-2xl border border-transparent bg-slate-50/60 p-6 text-center transition hover:-translate-y-1 hover:border-red-100 hover:bg-red-50/70 max-w-md"
            >
              <span className="text-lg font-semibold text-slate-900">{org.name}</span>
              <span className="mt-2 text-xs uppercase tracking-[0.2em] text-red-500">Partner Highlight</span>
              <p className="mt-4 text-sm text-slate-600">{org.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;


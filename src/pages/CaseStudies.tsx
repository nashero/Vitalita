const studies = [
  {
    organization: 'AVIS Lombardia',
    summary:
      'Unified donor CRM and dynamic scheduling across 12 provinces, reducing no-shows by 22% and improving staff utilization.',
    highlight: '22% fewer no-shows',
    detail: 'Automated reminders via Telegram and SMS replaced manual phone trees, freeing coordinators for outreach.',
  },
  {
    organization: 'Croce Rossa Toscana',
    summary:
      'Streamlined mobile blood drive coordination with real-time inventory tracking, increasing collection efficiency by 35% across regional campaigns.',
    highlight: '35% efficiency increase',
    detail: 'Integrated scheduling system enabled better resource allocation and reduced wait times, resulting in higher donor satisfaction and retention rates.',
  },
  {
    organization: 'FIDAS Veneto',
    summary:
      'Digital transformation of donor registration and eligibility management, cutting administrative overhead by 40% while improving data accuracy.',
    highlight: '40% less admin time',
    detail: 'Automated eligibility checks and digital forms eliminated paper-based processes, allowing staff to focus on donor engagement and community outreach.',
  },
];

const CaseStudies = () => {
  return (
    <div className="bg-slate-50">
      <section className="section-container py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">Case Studies</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Transforming donor engagement across Italy
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Vitalita partners with blood donation organizations to create measurable impact quickly. Explore selected
            initiatives from our community.
          </p>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-6 lg:grid lg:grid-cols-3">
          {studies.map((study) => (
            <div
              key={study.organization}
              className="fade-in-up w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-lg transition hover:-translate-y-2 hover:border-red-100 hover:shadow-red-100/40 lg:max-w-full"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">{study.organization}</p>
              <h2 className="mt-3 text-xl font-semibold text-slate-900">{study.summary}</h2>
              <div className="mt-4 inline-flex items-center rounded-full bg-red-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-red-600">
                {study.highlight}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{study.detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-[36px] border border-slate-100 bg-white/90 p-6 sm:p-8 text-center shadow-xl">
          <h2 className="text-2xl font-semibold text-slate-900">See Vitalita in action</h2>
          <p className="mt-2 text-sm text-slate-600">
            Request a tailored demo to explore how we can replicate these outcomes within your organization.
          </p>
          <a
            href="/contact"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/40 transition hover:bg-red-700"
          >
            Request a Demo
          </a>
        </div>
      </section>
    </div>
  );
};

export default CaseStudies;


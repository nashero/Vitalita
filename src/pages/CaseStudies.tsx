import { useTranslation } from 'react-i18next';

const CaseStudies = () => {
  const { t } = useTranslation();

  const studies = [
    {
      organization: t('caseStudies.studies.avisLombardia.organization'),
      summary: t('caseStudies.studies.avisLombardia.summary'),
      highlight: t('caseStudies.studies.avisLombardia.highlight'),
      detail: t('caseStudies.studies.avisLombardia.detail'),
    },
    {
      organization: t('caseStudies.studies.croceRossaToscana.organization'),
      summary: t('caseStudies.studies.croceRossaToscana.summary'),
      highlight: t('caseStudies.studies.croceRossaToscana.highlight'),
      detail: t('caseStudies.studies.croceRossaToscana.detail'),
    },
    {
      organization: t('caseStudies.studies.fidasVeneto.organization'),
      summary: t('caseStudies.studies.fidasVeneto.summary'),
      highlight: t('caseStudies.studies.fidasVeneto.highlight'),
      detail: t('caseStudies.studies.fidasVeneto.detail'),
    },
  ];

  return (
    <div className="bg-slate-50">
      <section className="section-container py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">
            {t('caseStudies.title')}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            {t('caseStudies.heading')}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            {t('caseStudies.subtitle')}
          </p>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-6 lg:grid lg:grid-cols-3">
          {studies.map((study) => (
            <div
              key={study.organization}
              className="fade-in-up w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-lg transition hover:-translate-y-2 hover:border-red-100 hover:shadow-red-100/40 lg:max-w-full"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">
                {study.organization}
              </p>
              <h2 className="mt-3 text-xl font-semibold text-slate-900">{study.summary}</h2>
              <div className="mt-4 inline-flex items-center rounded-full bg-red-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-red-600">
                {study.highlight}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{study.detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-[36px] border border-slate-100 bg-white/90 p-6 sm:p-8 text-center shadow-xl">
          <h2 className="text-2xl font-semibold text-slate-900">{t('caseStudies.seeInAction')}</h2>
          <p className="mt-2 text-sm text-slate-600">
            {t('caseStudies.demoDescription')}
          </p>
          <a
            href="/contact"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/40 transition hover:bg-red-700"
          >
            {t('caseStudies.requestDemo')}
          </a>
        </div>
      </section>
    </div>
  );
};

export default CaseStudies;


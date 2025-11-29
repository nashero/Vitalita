import { AlertTriangle, BarChart2, ClipboardList } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ProblemStatement = () => {
  const { t } = useTranslation();
  
  const painPoints = [
    {
      icon: <AlertTriangle className="h-6 w-6" />,
      key: 'compliancePressure',
    },
    {
      icon: <ClipboardList className="h-6 w-6" />,
      key: 'fragmentedWorkflows',
    },
    {
      icon: <BarChart2 className="h-6 w-6" />,
      key: 'limitedVisibility',
    },
  ];
  return (
    <section className="section-container py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">{t('home.problemStatement.badge')}</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
        {t('home.problemStatement.title')}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          {t('home.problemStatement.description')}
        </p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {painPoints.map((pain) => {
          const painData = t(`home.problemStatement.painPoints.${pain.key}`, { returnObjects: true }) as { title: string; description: string };
          return (
          <div
            key={pain.key}
            className="fade-in-up rounded-3xl border border-slate-100 bg-white p-6 text-left shadow-sm transition duration-300 hover:-translate-y-2 hover:border-red-100 hover:shadow-xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              {pain.icon}
            </div>
            <h3 className="mt-5 text-lg font-semibold text-slate-900">{painData.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{painData.description}</p>
          </div>
          );
        })}
      </div>
    </section>
  );
};

export default ProblemStatement;


import { BrainCircuit, Building2, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SolutionOverview = () => {
  const { t } = useTranslation();
  
  const benefits = [
    {
      icon: <Building2 className="h-6 w-6" />,
      key: 'oneOperatingSystem',
    },
    {
      icon: <BrainCircuit className="h-6 w-6" />,
      key: 'intelligentAutomation',
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      key: 'trustworthyExperience',
    },
  ];
  return (
    <section className="section-container py-20">
      <div className="overflow-hidden rounded-[40px] bg-gradient-to-r from-slate-900 via-slate-800 to-red-700 text-white shadow-2xl">
        <div className="grid gap-12 p-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-200">{t('home.solutionOverview.badge')}</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {t('home.solutionOverview.title')}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/80">
            {t('home.solutionOverview.description')}
            </p>
          </div>
          <div className="grid gap-6">
            {benefits.map((benefit) => {
              const benefitData = t(`home.solutionOverview.benefits.${benefit.key}`, { returnObjects: true }) as { title: string; description: string };
              return (
              <div
                key={benefit.key}
                className="scale-in rounded-3xl border border-white/10 bg-white/5 p-6 transition duration-300 hover:border-white/30 hover:bg-white/10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                  {benefit.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{benefitData.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/80">{benefitData.description}</p>
              </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionOverview;


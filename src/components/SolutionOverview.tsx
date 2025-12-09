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
    <section className="section-container py-10 md:py-20 px-5 md:px-0">
      <div className="overflow-hidden rounded-[40px] shadow-2xl" style={{ backgroundColor: '#1A2332' }}>
        <div className="grid gap-8 md:gap-12 p-6 md:p-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#F9FAFB]/70">{t('home.solutionOverview.badge')}</p>
            <h2 className="mt-4 text-2xl md:text-[32px] font-semibold tracking-tight text-[#F9FAFB]">
            {t('home.solutionOverview.title')}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-[#F9FAFB]/80">
            {t('home.solutionOverview.description')}
            </p>
          </div>
          <div className="grid gap-6">
            {benefits.map((benefit) => {
              const benefitData = t(`home.solutionOverview.benefits.${benefit.key}`, { returnObjects: true }) as { title: string; description: string };
              return (
              <div
                key={benefit.key}
                className="scale-in rounded-3xl border border-[#FF6B6B] p-6 transition duration-300 hover:border-[#FF6B6B] hover:bg-white/10"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-[#FF6B6B]" style={{ backgroundColor: 'rgba(255, 107, 107, 0.1)' }}>
                  {benefit.icon}
                </div>
                <h3 className="mt-4 text-xl md:text-2xl font-semibold text-[#F9FAFB]">{benefitData.title}</h3>
                <p className="mt-3 text-base md:text-sm leading-relaxed text-[#F9FAFB]/80">{benefitData.description}</p>
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


import { Mail, MessageCircle, PieChart, Workflow } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Features = () => {
  const { t } = useTranslation();
  
  const featureList = [
    {
      icon: <Workflow className="h-6 w-6" />,
      key: 'smartScheduling',
    },
    {
      icon: <PieChart className="h-6 w-6" />,
      key: 'donorManagement',
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      key: 'multiChannelCommunication',
    },
    {
      icon: <Mail className="h-6 w-6" />,
      key: 'actionableAnalytics',
    },
  ];
  return (
    <section className="section-container py-12 md:py-20 px-5 md:px-0" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="mx-auto max-w-2xl text-center px-5 md:px-0">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#FF6B6B]">{t('home.features.badge')}</p>
        <h2 className="mt-3 text-2xl md:text-[32px] font-semibold tracking-tight text-[#111827]">
          {t('home.features.title')}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-[#111827]">
{t('home.features.description')}
        </p>
      </div>
      <div className="mt-12 md:mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4 px-5 md:px-0">
        {featureList.map((feature) => {
          const featureData = t(`home.features.featureList.${feature.key}`, { returnObjects: true }) as { title: string; description: string };
          return (
          <div
            key={feature.key}
            className="fade-in-up rounded-3xl border border-[#6B7280] bg-white p-6 md:p-6 shadow-lg backdrop-blur transition duration-300 hover:-translate-y-2 hover:border-[#FF6B6B] hover:shadow-[#FF6B6B]/20"
          >
            <div className="flex h-8 w-8 md:h-11 md:w-11 items-center justify-center rounded-2xl bg-[#FF6B6B]/10 text-[#FF6B6B]">
              {feature.icon}
            </div>
            <h3 className="mt-6 text-xl md:text-2xl font-semibold text-[#111827]">{featureData.title}</h3>
            <p className="mt-3 text-base md:text-sm leading-relaxed text-[#111827]">{featureData.description}</p>
          </div>
          );
        })}
      </div>
    </section>
  );
};

export default Features;


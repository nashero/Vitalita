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
    <section className="section-container py-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">{t('home.features.badge')}</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          {t('home.features.title')}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-slate-600">
          {t('home.features.description')}
        </p>
      </div>
      <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {featureList.map((feature) => {
          const featureData = t(`home.features.featureList.${feature.key}`, { returnObjects: true }) as { title: string; description: string };
          return (
          <div
            key={feature.key}
            className="fade-in-up rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-lg shadow-slate-200/40 backdrop-blur transition duration-300 hover:-translate-y-2 hover:border-red-100 hover:shadow-red-100/60"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              {feature.icon}
            </div>
            <h3 className="mt-6 text-lg font-semibold text-slate-900">{featureData.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{featureData.description}</p>
          </div>
          );
        })}
      </div>
    </section>
  );
};

export default Features;


import { useTranslation } from 'react-i18next';

const ByTheNumbers = () => {
  const { t } = useTranslation();
  
  const stats = [
    {
      key: 'donorsCoordinated',
    },
    {
      key: 'avisChapters',
    },
    {
      key: 'avgResponseTime',
    },
  ];

  return (
    <section className="py-12 md:py-20 px-5 md:px-0" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="mx-auto max-w-6xl px-5 md:px-6">
        <div className="grid gap-4 md:gap-8 md:grid-cols-3">
          {stats.map((stat) => {
            const statData = t(`home.byTheNumbers.stats.${stat.key}`, { returnObjects: true }) as { number: string; label: string; description: string };
            return (
              <div
                key={stat.key}
                className="rounded-2xl bg-white p-6 md:p-8 shadow-sm transition duration-300 hover:shadow-md"
              >
                <div className="text-4xl md:text-5xl font-bold mb-3" style={{ color: '#1A2332' }}>
                  {statData.number}
                </div>
                <div className="text-base md:text-lg font-medium mb-2" style={{ color: '#6B7280' }}>
                  {statData.label}
                </div>
                <div className="text-base md:text-sm leading-relaxed" style={{ color: '#6B7280' }}>
                  {statData.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ByTheNumbers;


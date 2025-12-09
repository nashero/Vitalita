import { useTranslation } from 'react-i18next';

const SocialProof = () => {
  const { t } = useTranslation();
  
  const orgData = t('home.socialProof.organizations.avisNazionale', { returnObjects: true }) as { name: string; description: string };
  const testimonial = t('home.socialProof.testimonial', { returnObjects: true }) as { quote: string; author: string; role: string };
  const stats = [
    {
      key: 'donorsConnected',
    },
    {
      key: 'avgResponseTime',
    },
    {
      key: 'donorRetention',
    },
  ];

  return (
    <section className="section-container py-12 md:py-20 bg-white px-5 md:px-0">
      <div className="mx-auto max-w-6xl px-5 md:px-6">
        {/* Heading */}
        <h2 className="text-center text-2xl md:text-[32px] font-semibold text-slate-900 mb-8 md:mb-12">
          {t('home.socialProof.title')}
        </h2>

        {/* Featured Partner Card */}
        <div className="rounded-3xl border border-slate-200 bg-[#F9FAFB] p-6 md:p-8 lg:p-12 shadow-lg mb-8 md:mb-12">
          <div className="flex flex-col items-center text-center">
            {/* AVIS Logo Placeholder - You can replace this with actual logo */}
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-md">
              <span className="text-4xl font-bold text-red-600">AVIS</span>
            </div>
            
            {/* Badge */}
            <div className="mb-4 inline-flex items-center rounded-full px-4 py-2" style={{ backgroundColor: 'rgba(255, 107, 107, 0.2)' }}>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#FF6B6B]">
                {t('home.socialProof.badge')}
              </span>
            </div>
            
            {/* Description */}
            <p className="text-base md:text-lg text-slate-700 max-w-2xl">
              {orgData.description}
            </p>
          </div>
        </div>

        {/* Testimonial */}
        <div className="mb-8 md:mb-12 text-center px-5 md:px-0">
          <blockquote className="text-base md:text-lg italic leading-relaxed" style={{ color: '#6B7280' }}>
            "{testimonial.quote}"
          </blockquote>
          <cite className="mt-4 block text-base font-medium text-slate-700 not-italic">
            — {testimonial.author}, {testimonial.role}
          </cite>
        </div>

        {/* Impact Stats */}
        <div className="grid gap-6 md:gap-8 md:grid-cols-3">
          {stats.map((stat) => {
            const statData = t(`home.socialProof.impactStats.${stat.key}`, { returnObjects: true }) as { number: string; label: string };
            return (
              <div
                key={stat.key}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1A2332' }}>
                  {statData.number}
                </div>
                <div className="text-base font-medium" style={{ color: '#6B7280' }}>
                  {statData.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, CheckCircle2, Award } from 'lucide-react';

const CTA = () => {
  const { t } = useTranslation();
  
  const certifications = [
    {
      key: 'iso27001',
      icon: <Shield className="h-4 w-4" />,
    },
    {
      key: 'gdprCompliant',
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
    {
      key: 'avisApproved',
      icon: <Award className="h-4 w-4" />,
    },
  ];

  return (
    <section className="section-container relative overflow-hidden py-12 md:py-20 px-5 md:px-0" style={{ background: 'linear-gradient(to bottom, #1A2332, #111827)' }}>
      <div className="relative mx-auto max-w-4xl px-5 md:px-6 text-center" style={{ color: '#F9FAFB' }}>
        {/* Badge */}
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#F9FAFB]/70 mb-4">
          {t('home.cta.badge')}
        </p>
        
        {/* Heading */}
        <h2 className="text-2xl md:text-[32px] font-semibold tracking-tight text-[#F9FAFB] mb-4 md:mb-6">
          {t('home.cta.title')}
        </h2>
        
        {/* Subheading */}
        <p className="text-base md:text-lg leading-relaxed text-[#F9FAFB]/90 mb-8 md:mb-10 max-w-2xl mx-auto">
          {t('home.cta.description')}
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row mb-8 md:mb-12 w-full">
          <Link
            to="/contact"
            className="inline-flex items-center justify-center rounded-full bg-[#FF6B6B] px-8 py-3 md:py-4 text-base font-semibold text-white shadow-xl shadow-[#FF6B6B]/40 transition hover:-translate-y-0.5 hover:bg-[#E65A5A] hover:shadow-[#FF6B6B]/50 min-h-[48px] w-full sm:w-auto"
          >
            {t('home.cta.primaryButton')}
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center rounded-full border-2 border-[#6B7280] px-8 py-3 md:py-4 text-base font-semibold bg-transparent transition hover:border-[#9CA3AF] hover:text-[#9CA3AF] min-h-[48px] w-full sm:w-auto"
            style={{ color: '#6B7280' }}
          >
            {t('home.cta.secondaryButton')}
          </Link>
        </div>
        
        {/* Trust Elements */}
        <div className="flex flex-col items-center gap-6">
          {/* Certification Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6">
            {certifications.map((cert) => (
              <div
                key={cert.key}
                className="flex items-center gap-2 rounded-full border border-[#F9FAFB]/20 bg-[#F9FAFB]/5 px-4 py-2 backdrop-blur-sm"
              >
                <div className="text-[#F9FAFB]/80">
                  {cert.icon}
                </div>
                <span className="text-sm font-medium text-[#F9FAFB]/90">
                  {t(`home.cta.certifications.${cert.key}`)}
                </span>
              </div>
            ))}
          </div>
          
          {/* Trust Text */}
          <p className="text-sm text-[#F9FAFB]/70">
            {t('home.cta.trustText')}
          </p>
        </div>
      </div>
      
      {/* Decorative Background Element */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />
    </section>
  );
};

export default CTA;

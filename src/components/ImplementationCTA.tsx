import { Clock, Zap, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ImplementationCTA = () => {
  const { t } = useTranslation();
  
  const valueProps = [
    {
      icon: <Clock className="w-4 h-4" style={{ color: '#FF6B6B' }} aria-hidden="true" />,
      text: t('howItWorksPage.finalCTA.valueProps.setupTimeline')
    },
    {
      icon: <Zap className="w-4 h-4" style={{ color: '#FF6B6B' }} aria-hidden="true" />,
      text: t('howItWorksPage.finalCTA.valueProps.noTechnicalExpertise')
    },
    {
      icon: <Headphones className="w-4 h-4" style={{ color: '#FF6B6B' }} aria-hidden="true" />,
      text: t('howItWorksPage.finalCTA.valueProps.fullSupport')
    }
  ];

  return (
    <section
      className="w-full px-6 md:px-12"
      style={{
        backgroundColor: 'rgba(255, 107, 107, 0.05)',
        paddingTop: '48px',
        paddingBottom: '48px',
      }}
      aria-labelledby="cta-heading"
    >
      <div
        className="mx-auto rounded-2xl"
        style={{
          maxWidth: '1000px',
          borderRadius: '16px',
        }}
      >
        <div className="text-center">
          {/* Badge */}
          <div className="mb-6">
            <span
              className="inline-block px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-full border border-[#FF6B6B] bg-transparent"
              style={{
                color: '#FF6B6B',
                fontSize: '12px',
                padding: '8px 16px',
              }}
            >
              {t('howItWorksPage.finalCTA.badge')}
            </span>
          </div>

          {/* Headline */}
          <h2
            id="cta-heading"
            className="text-[28px] sm:text-[32px] md:text-[40px] font-bold"
            style={{
              color: '#111827',
              marginTop: '16px',
              marginBottom: '12px',
            }}
          >
            {t('howItWorksPage.finalCTA.headline')}
          </h2>

          {/* Description */}
          <p
            className="mx-auto text-[18px] font-normal"
            style={{
              color: '#6B7280',
              lineHeight: 1.6,
              maxWidth: '600px',
              marginBottom: '32px',
              marginTop: 0,
            }}
          >
            {t('howItWorksPage.finalCTA.description')}
          </p>

          {/* Value Props */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            {valueProps.map((prop, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2"
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  color: '#374151',
                }}
              >
                {prop.icon}
                <span>{prop.text}</span>
              </div>
            ))}
          </div>

          {/* Primary CTA Button */}
          <div className="mb-4">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-lg font-bold text-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#FF6B6B] focus:ring-opacity-50 w-full sm:w-auto"
              style={{
                backgroundColor: '#FF6B6B',
                fontSize: '18px',
                padding: '18px 40px',
                minHeight: '56px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
                marginTop: '32px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E55B5B';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 8px rgba(0, 0, 0, 0.15), 0 4px 6px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FF6B6B';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)';
              }}
              aria-label={t('howItWorksPage.finalCTA.primaryButton')}
            >
              {t('howItWorksPage.finalCTA.primaryButton')}
            </Link>
          </div>

          {/* Trust Reinforcement */}
          <div className="mt-8">
            <p
              className="text-xs"
              style={{
                color: '#6B7280',
                fontSize: '12px',
                marginBottom: '8px',
              }}
            >
              {t('howItWorksPage.finalCTA.trustReinforcement')}
            </p>
            {/* Logo placeholders - can be replaced with actual logos */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <div
                className="flex items-center justify-center rounded px-3 py-2 bg-white"
                style={{
                  fontSize: '10px',
                  color: '#6B7280',
                  fontWeight: 600,
                  border: '1px solid #E5E7EB',
                }}
                aria-label="AVIS"
              >
                AVIS
              </div>
              <div
                className="flex items-center justify-center rounded px-3 py-2 bg-white"
                style={{
                  fontSize: '10px',
                  color: '#6B7280',
                  fontWeight: 600,
                  border: '1px solid #E5E7EB',
                }}
                aria-label="Organization 1"
              >
                Org 1
              </div>
              <div
                className="flex items-center justify-center rounded px-3 py-2 bg-white"
                style={{
                  fontSize: '10px',
                  color: '#6B7280',
                  fontWeight: 600,
                  border: '1px solid #E5E7EB',
                }}
                aria-label="Organization 2"
              >
                Org 2
              </div>
              <div
                className="flex items-center justify-center rounded px-3 py-2 bg-white"
                style={{
                  fontSize: '10px',
                  color: '#6B7280',
                  fontWeight: 600,
                  border: '1px solid #E5E7EB',
                }}
                aria-label="Organization 3"
              >
                Org 3
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImplementationCTA;


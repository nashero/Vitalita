import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const isHowItWorksPage = location.pathname === '/how-it-works';

  return (
    <footer 
      className="border-t bg-white"
      style={{ 
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E5E7EB',
        paddingTop: '64px',
        paddingBottom: '64px',
        paddingLeft: '48px',
        paddingRight: '48px'
      }}
      role="contentinfo"
    >
      <div className="mx-auto max-w-[1280px]">
        {/* 4-column grid on desktop, stack on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1 - Branding */}
          <div className="space-y-4" style={{ maxWidth: '280px' }}>
            <Link 
              to="/" 
              className="flex items-center space-x-3 focus:outline focus:outline-2 focus:outline-[#FF6B6B] focus:outline-offset-2 rounded"
              aria-label="Vitalita home"
            >
              {/* Logo with coral heart icon */}
              <div 
                className="flex items-center justify-center rounded-full"
                style={{ 
                  backgroundColor: '#FF6B6B',
                  width: '48px',
                  height: '48px'
                }}
              >
                <Heart className="h-6 w-6 text-white" fill="white" aria-hidden="true" />
              </div>
              <div>
                {/* Brand name: "Powered by Vitalita" */}
                <p 
                  className="font-bold"
                  style={{ 
                    color: '#111827',
                    fontSize: '16px',
                    fontWeight: 700
                  }}
                >
                  {t('footer.poweredBy')}
                </p>
                {/* Tagline */}
                <p 
                  className="text-sm"
                  style={{ 
                    color: '#6B7280',
                    fontSize: '14px',
                    fontWeight: 400
                  }}
                >
                  {t('footer.platformDescription')}
                </p>
              </div>
            </Link>
            {/* Description */}
            <p 
              className="leading-relaxed"
              style={{ 
                color: '#6B7280',
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '1.6',
                maxWidth: '280px'
              }}
            >
              {t('footer.description')}
            </p>
          </div>
          
          {/* Column 2 - Product */}
          <nav className="space-y-3" aria-label="Product navigation">
            {/* Column header */}
            <p 
              className="uppercase font-semibold"
              style={{ 
                color: '#6B7280',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.5px'
              }}
            >
              {t('footer.sections.product')}
            </p>
            {/* Links */}
            <Link 
              to="/features" 
              className="block transition-colors focus:outline focus:outline-2 focus:outline-[#FF6B6B] focus:outline-offset-2 rounded"
              style={{ 
                color: '#374151',
                fontSize: '14px',
                fontWeight: 400
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FF6B6B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#374151';
              }}
            >
              {t('footer.links.features')}
            </Link>
            <Link 
              to="/how-it-works" 
              className="block transition-colors focus:outline focus:outline-2 focus:outline-[#FF6B6B] focus:outline-offset-2 rounded"
              style={{ 
                color: isHowItWorksPage ? '#FF6B6B' : '#374151',
                fontSize: '14px',
                fontWeight: isHowItWorksPage ? 600 : 400
              }}
              onMouseEnter={(e) => {
                if (!isHowItWorksPage) {
                  e.currentTarget.style.color = '#FF6B6B';
                }
              }}
              onMouseLeave={(e) => {
                if (!isHowItWorksPage) {
                  e.currentTarget.style.color = '#374151';
                }
              }}
              aria-current={isHowItWorksPage ? 'page' : undefined}
            >
              {t('footer.links.howItWorks')}
            </Link>
            <Link 
              to="/case-studies" 
              className="block transition-colors focus:outline focus:outline-2 focus:outline-[#FF6B6B] focus:outline-offset-2 rounded"
              style={{ 
                color: '#374151',
                fontSize: '14px',
                fontWeight: 400
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FF6B6B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#374151';
              }}
            >
              {t('footer.links.caseStudies')}
            </Link>
            <Link 
              to="/partnerships" 
              className="block transition-colors focus:outline focus:outline-2 focus:outline-[#FF6B6B] focus:outline-offset-2 rounded"
              style={{ 
                color: '#374151',
                fontSize: '14px',
                fontWeight: 400
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FF6B6B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#374151';
              }}
            >
              {t('footer.links.partnerships')}
            </Link>
          </nav>
          
          {/* Column 3 - Company */}
          <nav className="space-y-3" aria-label="Company navigation">
            {/* Column header */}
            <p 
              className="uppercase font-semibold"
              style={{ 
                color: '#6B7280',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.5px'
              }}
            >
              {t('footer.sections.company')}
            </p>
            {/* Links */}
            <Link 
              to="/contact" 
              className="block transition-colors focus:outline focus:outline-2 focus:outline-[#FF6B6B] focus:outline-offset-2 rounded"
              style={{ 
                color: '#374151',
                fontSize: '14px',
                fontWeight: 400
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FF6B6B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#374151';
              }}
            >
              {t('footer.links.contact')}
            </Link>
            <Link 
              to="/partnerships" 
              className="block transition-colors focus:outline focus:outline-2 focus:outline-[#FF6B6B] focus:outline-offset-2 rounded"
              style={{ 
                color: '#374151',
                fontSize: '14px',
                fontWeight: 400
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FF6B6B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#374151';
              }}
            >
              {t('footer.links.partnerships')}
            </Link>
            <a 
              href="#news" 
              className="block transition-colors focus:outline focus:outline-2 focus:outline-[#FF6B6B] focus:outline-offset-2 rounded"
              style={{ 
                color: '#374151',
                fontSize: '14px',
                fontWeight: 400
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FF6B6B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#374151';
              }}
            >
              {t('footer.links.newsroom')}
            </a>
            <a 
              href="#careers" 
              className="block transition-colors focus:outline focus:outline-2 focus:outline-[#FF6B6B] focus:outline-offset-2 rounded"
              style={{ 
                color: '#374151',
                fontSize: '14px',
                fontWeight: 400
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FF6B6B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#374151';
              }}
            >
              {t('footer.links.careers')}
            </a>
          </nav>
          
          {/* Column 4 - Portals */}
          <nav className="space-y-3" aria-label="Portals navigation">
            {/* Column header */}
            <p 
              className="uppercase font-semibold"
              style={{ 
                color: '#6B7280',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.5px'
              }}
            >
              {t('footer.sections.portals')}
            </p>
            {/* Links */}
            <a 
              href={import.meta.env.VITE_DONOR_PORTAL_URL || "http://localhost:5174"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block transition-colors focus:outline focus:outline-2 focus:outline-[#FF6B6B] focus:outline-offset-2 rounded"
              style={{ 
                color: '#374151',
                fontSize: '14px',
                fontWeight: 400
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FF6B6B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#374151';
              }}
            >
              {t('footer.links.donorPortal')}
            </a>
            <a 
              href="#coordinator-login" 
              className="block transition-colors focus:outline focus:outline-2 focus:outline-[#FF6B6B] focus:outline-offset-2 rounded"
              style={{ 
                color: '#374151',
                fontSize: '14px',
                fontWeight: 400
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FF6B6B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#374151';
              }}
            >
              {t('footer.links.coordinatorConsole')}
            </a>
            <a 
              href={import.meta.env.VITE_STAFF_PORTAL_URL || "http://localhost:5175"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block transition-colors focus:outline focus:outline-2 focus:outline-[#FF6B6B] focus:outline-offset-2 rounded"
              style={{ 
                color: '#374151',
                fontSize: '14px',
                fontWeight: 400
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FF6B6B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#374151';
              }}
            >
              {t('footer.links.staffPortal')}
            </a>
            <a 
              href="#api" 
              className="block transition-colors focus:outline focus:outline-2 focus:outline-[#FF6B6B] focus:outline-offset-2 rounded"
              style={{ 
                color: '#374151',
                fontSize: '14px',
                fontWeight: 400
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FF6B6B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#374151';
              }}
            >
              {t('footer.links.developerApi')}
            </a>
          </nav>
        </div>
        
        {/* Bottom Bar */}
        <div 
          className="border-t mt-8"
          style={{ 
            borderTop: '1px solid #E5E7EB',
            marginTop: '32px',
            paddingTop: '32px'
          }}
        >
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            {/* Left side - Copyright */}
            <p 
              style={{ 
                color: '#6B7280',
                fontSize: '14px'
              }}
            >
              &copy; 2025 Vitalita. {t('footer.copyright')}
            </p>
            {/* Right side - Legal links */}
            <nav className="flex items-center gap-6" aria-label="Legal navigation" style={{ gap: '24px' }}>
              <a 
                href="#privacy" 
                className="transition-colors focus:outline focus:outline-2 focus:outline-[#FF6B6B] focus:outline-offset-2 rounded"
                style={{ 
                  color: '#6B7280',
                  fontSize: '14px',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#111827';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#6B7280';
                }}
              >
                {t('footer.links.privacyPolicy')}
              </a>
              <a 
                href="#terms" 
                className="transition-colors focus:outline focus:outline-2 focus:outline-[#FF6B6B] focus:outline-offset-2 rounded"
                style={{ 
                  color: '#6B7280',
                  fontSize: '14px',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#111827';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#6B7280';
                }}
              >
                {t('footer.links.termsOfService')}
              </a>
              <a 
                href="#security" 
                className="transition-colors focus:outline focus:outline-2 focus:outline-[#FF6B6B] focus:outline-offset-2 rounded"
                style={{ 
                  color: '#6B7280',
                  fontSize: '14px',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#111827';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#6B7280';
                }}
              >
                {t('footer.links.security')}
              </a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer 
      className="border-t bg-white"
      style={{ 
        // Footer Section - Clinical Authority Design System
        backgroundColor: '#FFFFFF', // Background: white
        borderTop: '1px solid #E5E7EB', // Border-top: 1px solid #E5E7EB
        paddingTop: '60px', // Padding: 60px 0
        paddingBottom: '60px'
      }}
    >
      <div className="section-container flex flex-col gap-6 py-8 md:flex-row md:justify-between">
        <div className="max-w-[400px] space-y-3">
          <div className="flex items-center space-x-3">
            {/* Logo background: #FF6B6B circle, 48px diameter */}
            <div 
              className="flex items-center justify-center rounded-full text-white"
              style={{ 
                backgroundColor: '#FF6B6B',
                width: '48px',
                height: '48px',
                fontSize: '16px',
                fontWeight: 700
              }}
            >
              VT
            </div>
            <div>
              {/* "Powered by Vitalita": #1A2332, 18px, 600 font-weight */}
              <p 
                className="font-semibold"
                style={{ 
                  color: '#1A2332',
                  fontSize: '18px',
                  fontWeight: 600
                }}
              >
                {t('footer.poweredBy')}
              </p>
              {/* "Blood Donation Management Platform": #6B7280, 14px, 400 font-weight */}
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
          </div>
          {/* Description text: #6B7280, 14px, 400 font-weight, line-height 1.6, max-width 400px */}
          <p 
            className="leading-relaxed"
            style={{ 
              color: '#6B7280',
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '1.6',
              maxWidth: '400px'
            }}
          >
            {t('footer.description')}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
          <div className="space-y-3">
            {/* Column headers: #6B7280, 12px, 700 font-weight, uppercase, letter-spacing 1px */}
            <p 
              className="uppercase"
              style={{ 
                color: '#6B7280',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '1px'
              }}
            >
              {t('footer.sections.product')}
            </p>
            {/* Links: #111827, 15px, 400 font-weight */}
            <Link 
              to="/features" 
              className="block transition"
              style={{ 
                color: '#111827',
                fontSize: '15px',
                fontWeight: 400
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FF6B6B'; // Link hover: #FF6B6B
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#111827';
              }}
            >
              {t('footer.links.features')}
            </Link>
            <Link 
              to="/how-it-works" 
              className="block transition"
              style={{ 
                color: '#111827',
                fontSize: '15px',
                fontWeight: 400
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FF6B6B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#111827';
              }}
            >
              {t('footer.links.howItWorks')}
            </Link>
            <Link 
              to="/case-studies" 
              className="block transition"
              style={{ 
                color: '#111827',
                fontSize: '15px',
                fontWeight: 400
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FF6B6B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#111827';
              }}
            >
              {t('footer.links.caseStudies')}
            </Link>
          </div>
          <div className="space-y-3">
            <p 
              className="uppercase"
              style={{ 
                color: '#6B7280',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '1px'
              }}
            >
              {t('footer.sections.company')}
            </p>
            <Link 
              to="/contact" 
              className="block transition"
              style={{ 
                color: '#111827',
                fontSize: '15px',
                fontWeight: 400
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FF6B6B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#111827';
              }}
            >
              {t('footer.links.contact')}
            </Link>
            <a 
              href="mailto:partnerships@vitalita.it" 
              className="block transition"
              style={{ 
                color: '#111827',
                fontSize: '15px',
                fontWeight: 400
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FF6B6B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#111827';
              }}
            >
              {t('footer.links.partnerships')}
            </a>
            <a 
              href="#news" 
              className="block transition"
              style={{ 
                color: '#111827',
                fontSize: '15px',
                fontWeight: 400
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FF6B6B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#111827';
              }}
            >
              {t('footer.links.newsroom')}
            </a>
            <a 
              href="#careers" 
              className="block transition"
              style={{ 
                color: '#111827',
                fontSize: '15px',
                fontWeight: 400
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FF6B6B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#111827';
              }}
            >
              {t('footer.links.careers')}
            </a>
          </div>
          <div className="space-y-3">
            <p 
              className="uppercase"
              style={{ 
                color: '#6B7280',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '1px'
              }}
            >
              {t('footer.sections.portals')}
            </p>
            <a 
              href={import.meta.env.VITE_DONOR_PORTAL_URL || "http://localhost:5174"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block transition"
              style={{ 
                color: '#111827',
                fontSize: '15px',
                fontWeight: 400
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FF6B6B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#111827';
              }}
            >
              {t('footer.links.donorPortal')}
            </a>
            <a 
              href="#coordinator-login" 
              className="block transition"
              style={{ 
                color: '#111827',
                fontSize: '15px',
                fontWeight: 400
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FF6B6B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#111827';
              }}
            >
              {t('footer.links.coordinatorConsole')}
            </a>
            <a 
              href={import.meta.env.VITE_STAFF_PORTAL_URL || "http://localhost:5175"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block transition"
              style={{ 
                color: '#111827',
                fontSize: '15px',
                fontWeight: 400
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FF6B6B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#111827';
              }}
            >
              {t('footer.links.staffPortal')}
            </a>
            <a 
              href="#api" 
              className="block transition"
              style={{ 
                color: '#111827',
                fontSize: '15px',
                fontWeight: 400
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FF6B6B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#111827';
              }}
            >
              {t('footer.links.developerApi')}
            </a>
          </div>
        </div>
      </div>
      {/* Copyright & Legal */}
      <div 
        className="border-t"
        style={{ 
          borderTop: '1px solid #E5E7EB', // Border-top: 1px solid #E5E7EB
          paddingTop: '40px' // 40px padding-top
        }}
      >
        <div className="section-container flex flex-col items-center justify-between gap-3 md:flex-row">
          {/* Text: #6B7280, 13px */}
          <p 
            style={{ 
              color: '#6B7280',
              fontSize: '13px'
            }}
          >
            &copy; {new Date().getFullYear()} Vitalita. {t('footer.copyright')}
          </p>
          <div className="flex items-center gap-4">
            {/* Links: #6B7280, underline on hover */}
            <a 
              href="#privacy" 
              className="transition"
              style={{ 
                color: '#6B7280',
                fontSize: '13px',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              {t('footer.links.privacyPolicy')}
            </a>
            <a 
              href="#terms" 
              className="transition"
              style={{ 
                color: '#6B7280',
                fontSize: '13px',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              {t('footer.links.termsOfService')}
            </a>
            <a 
              href="#security" 
              className="transition"
              style={{ 
                color: '#6B7280',
                fontSize: '13px',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              {t('footer.links.security')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


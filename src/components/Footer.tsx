import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="section-container flex flex-col gap-6 py-8 md:flex-row md:justify-between">
        <div className="max-w-sm space-y-3">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/30">
              VT
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">{t('footer.poweredBy')}</p>
              <p className="text-sm text-slate-500">{t('footer.platformDescription')}</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-slate-500">
            {t('footer.description')}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6 text-sm text-slate-500 md:grid-cols-3">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {t('footer.sections.product')}
            </p>
            <Link to="/features" className="block transition hover:text-red-600">
              {t('footer.links.features')}
            </Link>
            <Link to="/how-it-works" className="block transition hover:text-red-600">
              {t('footer.links.howItWorks')}
            </Link>
            <Link to="/case-studies" className="block transition hover:text-red-600">
              {t('footer.links.caseStudies')}
            </Link>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {t('footer.sections.company')}
            </p>
            <Link to="/contact" className="block transition hover:text-red-600">
              {t('footer.links.contact')}
            </Link>
            <a href="mailto:partnerships@vitalita.it" className="block transition hover:text-red-600">
              {t('footer.links.partnerships')}
            </a>
            <a href="#news" className="block transition hover:text-red-600">
              {t('footer.links.newsroom')}
            </a>
            <a href="#careers" className="block transition hover:text-red-600">
              {t('footer.links.careers')}
            </a>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {t('footer.sections.portals')}
            </p>
            <a 
              href={import.meta.env.VITE_DONOR_PORTAL_URL || "http://localhost:5174"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block transition hover:text-red-600"
            >
              {t('footer.links.donorPortal')}
            </a>
            <a href="#coordinator-login" className="block transition hover:text-red-600">
              {t('footer.links.coordinatorConsole')}
            </a>
            <a 
              href={import.meta.env.VITE_STAFF_PORTAL_URL || "http://localhost:5175"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block transition hover:text-red-600"
            >
              {t('footer.links.staffPortal')}
            </a>
            <a href="#api" className="block transition hover:text-red-600">
              {t('footer.links.developerApi')}
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-100 bg-slate-50 py-4">
        <div className="section-container flex flex-col items-center justify-between gap-3 text-sm text-slate-500 md:flex-row">
          <p>&copy; {new Date().getFullYear()} Vitalita. {t('footer.copyright')}</p>
          <div className="flex items-center gap-4">
            <a href="#privacy" className="transition hover:text-red-600">
              {t('footer.links.privacyPolicy')}
            </a>
            <a href="#terms" className="transition hover:text-red-600">
              {t('footer.links.termsOfService')}
            </a>
            <a href="#security" className="transition hover:text-red-600">
              {t('footer.links.security')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


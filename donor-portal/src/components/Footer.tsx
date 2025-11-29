import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Footer() {
  const { t } = useTranslation();
  
  return (
    <footer className="footer" aria-label="Footer">
      <nav aria-label="Footer links">
        <ul className="footer-links">
          <li>
            <Link to="/help">{t('footer.help')}</Link>
          </li>
          <li>
            <a href="https://www.vitalita.com/privacy" target="_blank" rel="noreferrer">
              {t('footer.privacy')}
            </a>
          </li>
          <li>
            <a href="https://www.vitalita.com/contact" target="_blank" rel="noreferrer">
              {t('footer.contact')}
            </a>
          </li>
        </ul>
      </nav>
      <a className="footer-home" href="https://www.vitalita.com" target="_blank" rel="noreferrer">
        {t('footer.backToVitalita')}
      </a>
    </footer>
  );
}

export default Footer;


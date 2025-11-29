import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function HelpSection() {
  const { t } = useTranslation();
  
  return (
    <section className="help" id="help" aria-labelledby="help-title">
      <div className="help-card">
        <h2 id="help-title">{t('help.title')}</h2>
        <p>{t('help.description')}</p>
        <div className="help-actions">
          <Link className="button primary" to="/help">
            {t('help.viewCommonQuestions')}
          </Link>
          <a className="button secondary" href="tel:+391800123456">
            {t('help.callUs')}
          </a>
        </div>
        <p className="help-note">{t('help.supportHours')}</p>
      </div>
    </section>
  );
}

export default HelpSection;


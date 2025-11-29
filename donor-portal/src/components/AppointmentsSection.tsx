import { useTranslation } from 'react-i18next';

function AppointmentsSection() {
  const { t } = useTranslation();
  
  return (
    <section className="appointments" id="appointments" aria-labelledby="appointments-title">
      <div className="appointments-card">
        <h2 id="appointments-title">{t('appointments.title')}</h2>
        <p>{t('appointments.description')}</p>
        <a className="button primary" href="/login">
          {t('appointments.logInToContinue')}
        </a>
        <p className="appointments-note">
          {t('appointments.note')}
        </p>
      </div>
    </section>
  );
}

export default AppointmentsSection;


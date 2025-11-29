import { useTranslation } from 'react-i18next';

function FirstTimeDonorSection() {
  const { t } = useTranslation();
  
  const facts = [
    'firstTimeDonor.fact1',
    'firstTimeDonor.fact2',
    'firstTimeDonor.fact3'
  ];

  const eligibility = [
    'firstTimeDonor.eligibility1',
    'firstTimeDonor.eligibility2',
    'firstTimeDonor.eligibility3'
  ];
  
  return (
    <section className="first-time" id="first-time" aria-labelledby="first-time-title">
      <div className="card">
        <h2 id="first-time-title">{t('firstTimeDonor.title')}</h2>
        <p className="card-intro">{t('firstTimeDonor.intro')}</p>
        <div className="card-content">
          <div>
            <h3>{t('firstTimeDonor.whatHappensTitle')}</h3>
            <ul className="simple-list">
              {facts.map((factKey) => (
                <li key={factKey}>{t(factKey)}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>{t('firstTimeDonor.whoCanDonateTitle')}</h3>
            <ul className="simple-list">
              {eligibility.map((itemKey) => (
                <li key={itemKey}>{t(itemKey)}</li>
              ))}
            </ul>
          </div>
        </div>
        <a className="button secondary card-button" href="/help">
          {t('firstTimeDonor.learnMore')}
        </a>
      </div>
    </section>
  );
}

export default FirstTimeDonorSection;


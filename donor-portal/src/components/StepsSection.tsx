import { useTranslation } from 'react-i18next';

function StepsSection() {
  const { t } = useTranslation();
  
  const steps = [
    {
      number: 1,
      titleKey: 'steps.step1Title',
      textKey: 'steps.step1Text',
      icon: '📍'
    },
    {
      number: 2,
      titleKey: 'steps.step2Title',
      textKey: 'steps.step2Text',
      icon: '🗓️'
    },
    {
      number: 3,
      titleKey: 'steps.step3Title',
      textKey: 'steps.step3Text',
      icon: '✅'
    },
    {
      number: 4,
      titleKey: 'steps.step4Title',
      textKey: 'steps.step4Text',
      icon: '❤️'
    }
  ];
  
  return (
    <section className="steps" aria-labelledby="steps-title">
      <h2 id="steps-title">{t('steps.title')}</h2>
      <ol className="steps-list">
        {steps.map((step) => (
          <li key={step.number} className="step-card">
            <span className="step-icon" aria-hidden="true">
              {step.icon}
            </span>
            <div>
              <p className="step-title">
                {step.number}. {t(step.titleKey)}
              </p>
              <p className="step-text">{t(step.textKey)}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default StepsSection;


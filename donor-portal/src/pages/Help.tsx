import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type Category = 'before' | 'during' | 'after' | 'appointment';

interface Question {
  id: string;
  questionKey: string;
  answerKey: string;
}

const HelpPage = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<Category>('before');
  const [openQuestionId, setOpenQuestionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isVoiceHelpOpen, setIsVoiceHelpOpen] = useState(false);

  // Define question structure with translation keys
  const questionStructure: Record<Category, Question[]> = {
    before: [
      { id: 'who-can-donate', questionKey: 'help.page.questions.before.whoCanDonate.question', answerKey: 'help.page.questions.before.whoCanDonate.answer' },
      { id: 'what-to-eat', questionKey: 'help.page.questions.before.whatToEat.question', answerKey: 'help.page.questions.before.whatToEat.answer' },
      { id: 'medications', questionKey: 'help.page.questions.before.medications.question', answerKey: 'help.page.questions.before.medications.answer' },
      { id: 'how-long', questionKey: 'help.page.questions.before.howLong.question', answerKey: 'help.page.questions.before.howLong.answer' },
      { id: 'will-it-hurt', questionKey: 'help.page.questions.before.willItHurt.question', answerKey: 'help.page.questions.before.willItHurt.answer' },
    ],
    during: [
      { id: 'what-to-bring', questionKey: 'help.page.questions.during.whatToBring.question', answerKey: 'help.page.questions.during.whatToBring.answer' },
      { id: 'when-arrive', questionKey: 'help.page.questions.during.whenArrive.question', answerKey: 'help.page.questions.during.whenArrive.answer' },
      { id: 'after-donating', questionKey: 'help.page.questions.during.afterDonating.question', answerKey: 'help.page.questions.during.afterDonating.answer' },
      { id: 'drive-home', questionKey: 'help.page.questions.during.driveHome.question', answerKey: 'help.page.questions.during.driveHome.answer' },
    ],
    after: [
      { id: 'how-will-feel', questionKey: 'help.page.questions.after.howWillFeel.question', answerKey: 'help.page.questions.after.howWillFeel.answer' },
      { id: 'when-donate-again', questionKey: 'help.page.questions.after.whenDonateAgain.question', answerKey: 'help.page.questions.after.whenDonateAgain.answer' },
      { id: 'feel-unwell', questionKey: 'help.page.questions.after.feelUnwell.question', answerKey: 'help.page.questions.after.feelUnwell.answer' },
      { id: 'blood-used', questionKey: 'help.page.questions.after.bloodUsed.question', answerKey: 'help.page.questions.after.bloodUsed.answer' },
    ],
    appointment: [
      { id: 'change-appointment', questionKey: 'help.page.questions.appointment.changeAppointment.question', answerKey: 'help.page.questions.appointment.changeAppointment.answer' },
      { id: 'cancel-appointment', questionKey: 'help.page.questions.appointment.cancelAppointment.question', answerKey: 'help.page.questions.appointment.cancelAppointment.answer' },
      { id: 'no-reminder', questionKey: 'help.page.questions.appointment.noReminder.question', answerKey: 'help.page.questions.appointment.noReminder.answer' },
      { id: 'bring-someone', questionKey: 'help.page.questions.appointment.bringSomeone.question', answerKey: 'help.page.questions.appointment.bringSomeone.answer' },
    ],
  };

  const categories: { id: Category; labelKey: string }[] = [
    { id: 'before', labelKey: 'help.page.categories.before' },
    { id: 'during', labelKey: 'help.page.categories.during' },
    { id: 'after', labelKey: 'help.page.categories.after' },
    { id: 'appointment', labelKey: 'help.page.categories.appointment' },
  ];

  const activeQuestions = useMemo(() => {
    const questions = questionStructure[activeCategory] || [];

    if (!searchQuery.trim()) {
      return questions;
    }

    const query = searchQuery.toLowerCase();
    return questions.filter((q) => {
      const questionText = t(q.questionKey).toLowerCase();
      const answerText = t(q.answerKey).toLowerCase();
      return questionText.includes(query) || answerText.includes(query);
    });
  }, [activeCategory, searchQuery, t]);

  const toggleQuestion = (questionId: string) => {
    setOpenQuestionId(openQuestionId === questionId ? null : questionId);
  };

  const handleVoiceHelpToggle = () => {
    setIsVoiceHelpOpen(!isVoiceHelpOpen);
  };

  return (
    <div className="help-page">
      <div className="help-main">
        {/* Hero Section */}
        <section className="help-hero">
          <h1>{t('help.page.heroTitle')}</h1>
          <p>{t('help.page.heroDescription')}</p>
        </section>

        {/* Search Bar */}
        <section className="help-search">
          <div className="search-container">
            <input
              type="text"
              placeholder={t('help.page.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <span className="search-icon" aria-hidden="true">
              🔍
            </span>
          </div>
        </section>

        {/* Category Tabs */}
        <section className="help-categories">
          <div className="category-tabs" role="tablist">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={activeCategory === category.id}
                className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveCategory(category.id);
                  setOpenQuestionId(null);
                  setSearchQuery('');
                }}
              >
                {t(category.labelKey)}
              </button>
            ))}
          </div>
        </section>

        {/* Questions Accordion */}
        <section className="help-questions">
          {activeQuestions.length > 0 ? (
            <div className="questions-list">
              {activeQuestions.map((question) => {
                const isOpen = openQuestionId === question.id;
                return (
                  <div key={question.id} className="question-item">
                    <button
                      type="button"
                      className={`question-button ${isOpen ? 'open' : ''}`}
                      onClick={() => toggleQuestion(question.id)}
                      aria-expanded={isOpen}
                    >
                      <span className="question-text">{t(question.questionKey)}</span>
                      <span className="question-icon" aria-hidden="true">
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="question-answer">
                        <p>{t(question.answerKey)}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-results">
              <p>{t('help.page.noResults')}</p>
              <button
                type="button"
                className="text-button"
                onClick={() => setSearchQuery('')}
              >
                {t('help.page.clearSearch')}
              </button>
            </div>
          )}
        </section>

        {/* Contact Section */}
        <section className="help-contact">
          <h2>{t('help.page.contact.title')}</h2>
          <p>{t('help.page.contact.description')}</p>
          <div className="contact-options">
            <a href="tel:+391800123456" className="contact-option phone">
              <span className="contact-icon">📞</span>
              <span className="contact-label">{t('help.page.contact.callUs')}</span>
              <span className="contact-value">+39 1800 123 456</span>
            </a>
            <a
              href="https://t.me/vitalita_support"
              target="_blank"
              rel="noreferrer"
              className="contact-option telegram"
            >
              <span className="contact-icon">💬</span>
              <span className="contact-label">{t('help.page.contact.telegram')}</span>
              <span className="contact-value">{t('help.page.contact.telegramValue')}</span>
            </a>
            <a href="mailto:donations@vitalita.com" className="contact-option email">
              <span className="contact-icon">✉️</span>
              <span className="contact-label">{t('help.page.contact.email')}</span>
              <span className="contact-value">donations@vitalita.com</span>
            </a>
          </div>
          <p className="contact-note">{t('help.page.contact.responseTime')}</p>
        </section>
      </div>

      {/* Voice Help Widget */}
      <div className="voice-help-widget">
        {!isVoiceHelpOpen ? (
          <button
            type="button"
            className="voice-help-button"
            onClick={handleVoiceHelpToggle}
            aria-label={t('help.page.voiceHelp.button')}
          >
            <span className="voice-help-icon" aria-hidden="true">
              🎤
            </span>
            <span className="voice-help-text">{t('help.page.voiceHelp.button')}</span>
          </button>
        ) : (
          <div className="voice-help-panel">
            <button
              type="button"
              className="voice-help-close"
              onClick={handleVoiceHelpToggle}
              aria-label={t('help.page.voiceHelp.close')}
            >
              ×
            </button>
            <div className="voice-help-content">
              <p>{t('help.page.voiceHelp.ready')}</p>
              <div className="voice-help-input">
                <input
                  type="text"
                  placeholder={t('help.page.voiceHelp.placeholder')}
                  className="voice-input"
                />
                <button type="button" className="voice-send-button" aria-label={t('help.page.voiceHelp.send')}>
                  →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelpPage;


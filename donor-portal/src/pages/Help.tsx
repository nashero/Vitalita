import { useState, useMemo } from 'react';

type Category = 'before' | 'during' | 'after' | 'appointment';

interface Question {
  id: string;
  question: string;
  answer: string;
}

const categories: { id: Category; label: string; questions: Question[] }[] = [
  {
    id: 'before',
    label: 'Before Donating',
    questions: [
      {
        id: 'who-can-donate',
        question: 'Who can donate blood?',
        answer:
          'Most healthy adults can donate blood. You need to be at least 16 years old (with parental consent) or 17 and older, weigh at least 110 pounds, and feel healthy on the day of donation. Our team will review your health history to make sure it\'s safe for you to donate.',
      },
      {
        id: 'what-to-eat',
        question: 'What should I eat before donating?',
        answer:
          'Have a good meal and drink plenty of water before your appointment. Avoid fatty foods right before donating, as they can affect some of our tests. Staying hydrated is especially important—water helps make the donation process smoother.',
      },
      {
        id: 'medications',
        question: 'Can I donate if I\'m taking medicine?',
        answer:
          'Many medications are perfectly fine, and you can still donate. When you arrive, let our team know what medications you\'re taking. We\'ll check to make sure everything is safe. In most cases, common medications don\'t prevent you from donating.',
      },
      {
        id: 'how-long',
        question: 'How long does a donation take?',
        answer:
          'The actual blood donation takes about 10-15 minutes. Your entire visit, including check-in, a quick health screening, the donation itself, and a short rest afterward, usually takes about 45 minutes total. We want you to feel comfortable and not rushed.',
      },
      {
        id: 'will-it-hurt',
        question: 'Will it hurt?',
        answer:
          'Most people feel only a brief pinch when the needle is inserted, similar to a routine blood test. After that, you shouldn\'t feel any pain. Our staff are experienced and gentle, and we\'ll make sure you\'re comfortable throughout the process.',
      },
    ],
  },
  {
    id: 'during',
    label: 'During Your Appointment',
    questions: [
      {
        id: 'what-to-bring',
        question: 'What should I bring?',
        answer:
          'Bring a valid photo ID, such as a driver\'s license or passport. It\'s also helpful to bring a water bottle to stay hydrated, and you might want to bring something light to eat afterward. Wear comfortable clothing with sleeves that can be rolled up easily.',
      },
      {
        id: 'when-arrive',
        question: 'What happens when I arrive?',
        answer:
          'When you arrive, you\'ll check in at the front desk. We\'ll ask you to fill out a quick health questionnaire, and then one of our team members will take you through a brief screening process. This includes checking your temperature, pulse, and hemoglobin levels. It\'s all very quick and straightforward.',
      },
      {
        id: 'after-donating',
        question: 'What do I do after donating?',
        answer:
          'After donating, we\'ll ask you to rest for about 10-15 minutes and have a snack and something to drink. This helps your body adjust and makes sure you feel good before you leave. Take it easy for the rest of the day and avoid heavy lifting or intense exercise.',
      },
      {
        id: 'drive-home',
        question: 'Can I drive home after?',
        answer:
          'Yes, most people can drive home after donating. However, if you feel lightheaded or unwell, please let our team know. We\'ll make sure you\'re feeling okay before you leave, and we can arrange for someone to pick you up if needed. It\'s always better to be safe.',
      },
    ],
  },
  {
    id: 'after',
    label: 'After Donating',
    questions: [
      {
        id: 'how-will-feel',
        question: 'How will I feel after?',
        answer:
          'Most people feel great after donating! You might feel a little tired, which is normal. Make sure to drink plenty of fluids, eat a good meal, and get some rest. Some people feel energized knowing they\'ve helped save lives. If you have any concerns, don\'t hesitate to reach out to us.',
      },
      {
        id: 'when-donate-again',
        question: 'When can I donate again?',
        answer:
          'You can donate whole blood every 8 weeks (56 days). This gives your body enough time to replenish the blood you donated. We\'ll remind you when you\'re eligible to donate again, and you can always check your donation history in your account.',
      },
      {
        id: 'feel-unwell',
        question: 'What if I feel unwell?',
        answer:
          'If you feel unwell after donating, please contact us right away. You can call our support line or reach out through our website. Most reactions are minor and resolve quickly, but we\'re here to help if you need us. Don\'t hesitate to get in touch—your wellbeing is our priority.',
      },
      {
        id: 'blood-used',
        question: 'How is my blood used?',
        answer:
          'Your donated blood goes through careful testing and processing, then it\'s used to help patients who need it. This includes people having surgery, those being treated for cancer, accident victims, and patients with chronic illnesses. One donation can help save up to three lives. Thank you for making a difference!',
      },
    ],
  },
  {
    id: 'appointment',
    label: 'Appointment Questions',
    questions: [
      {
        id: 'change-appointment',
        question: 'How do I change my appointment?',
        answer:
          'You can change your appointment easily through your account on our website. Just go to "My Appointments" and select the appointment you want to change. You\'ll be able to choose a new date and time that works better for you. If you need help, give us a call and we\'ll assist you.',
      },
      {
        id: 'cancel-appointment',
        question: 'What if I need to cancel?',
        answer:
          'You can cancel your appointment at any time through your account, or by calling us. We understand that sometimes plans change. If you need to cancel, please let us know as soon as possible so we can offer the slot to someone else. You can always reschedule for another time that works for you.',
      },
      {
        id: 'no-reminder',
        question: 'I didn\'t get a reminder—what do I do?',
        answer:
          'We send reminders via SMS and email the day before your appointment. If you didn\'t receive one, please check that your contact information is correct in your account. You can also check your appointment details online at any time. If you\'re still having issues, give us a call and we\'ll help you sort it out.',
      },
      {
        id: 'bring-someone',
        question: 'Can I bring someone with me?',
        answer:
          'Yes, you\'re welcome to bring a friend or family member with you. They can wait in our comfortable waiting area while you donate. Having someone with you can make the experience more relaxing, especially if it\'s your first time donating.',
      },
    ],
  },
];

const HelpPage = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('before');
  const [openQuestionId, setOpenQuestionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isVoiceHelpOpen, setIsVoiceHelpOpen] = useState(false);

  const activeQuestions = useMemo(() => {
    const category = categories.find((cat) => cat.id === activeCategory);
    if (!category) return [];

    if (!searchQuery.trim()) {
      return category.questions;
    }

    const query = searchQuery.toLowerCase();
    return category.questions.filter(
      (q) =>
        q.question.toLowerCase().includes(query) ||
        q.answer.toLowerCase().includes(query),
    );
  }, [activeCategory, searchQuery]);

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
          <h1>How Can We Help You?</h1>
          <p>Find answers to common questions about donating blood</p>
        </section>

        {/* Search Bar */}
        <section className="help-search">
          <div className="search-container">
            <input
              type="text"
              placeholder="Type your question here"
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
                {category.label}
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
                      <span className="question-text">{question.question}</span>
                      <span className="question-icon" aria-hidden="true">
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="question-answer">
                        <p>{question.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-results">
              <p>No questions found matching your search.</p>
              <button
                type="button"
                className="text-button"
                onClick={() => setSearchQuery('')}
              >
                Clear search
              </button>
            </div>
          )}
        </section>

        {/* Contact Section */}
        <section className="help-contact">
          <h2>Can't find what you're looking for?</h2>
          <p>We're here to help. Reach out to us using any of these methods:</p>
          <div className="contact-options">
            <a href="tel:+391800123456" className="contact-option phone">
              <span className="contact-icon">📞</span>
              <span className="contact-label">Call Us</span>
              <span className="contact-value">+39 1800 123 456</span>
            </a>
            <a
              href="https://t.me/vitalita_support"
              target="_blank"
              rel="noreferrer"
              className="contact-option telegram"
            >
              <span className="contact-icon">💬</span>
              <span className="contact-label">Telegram</span>
              <span className="contact-value">Chat with us</span>
            </a>
            <a href="mailto:donations@vitalita.com" className="contact-option email">
              <span className="contact-icon">✉️</span>
              <span className="contact-label">Email</span>
              <span className="contact-value">donations@vitalita.com</span>
            </a>
          </div>
          <p className="contact-note">We usually respond within 1 hour</p>
        </section>
      </div>

      {/* Voice Help Widget */}
      <div className="voice-help-widget">
        {!isVoiceHelpOpen ? (
          <button
            type="button"
            className="voice-help-button"
            onClick={handleVoiceHelpToggle}
            aria-label="Need help? Start voice chat"
          >
            <span className="voice-help-icon" aria-hidden="true">
              🎤
            </span>
            <span className="voice-help-text">Need help? Start voice chat</span>
          </button>
        ) : (
          <div className="voice-help-panel">
            <button
              type="button"
              className="voice-help-close"
              onClick={handleVoiceHelpToggle}
              aria-label="Close voice chat"
            >
              ×
            </button>
            <div className="voice-help-content">
              <p>Ready to help. What's your question?</p>
              <div className="voice-help-input">
                <input
                  type="text"
                  placeholder="Ask your question..."
                  className="voice-input"
                />
                <button type="button" className="voice-send-button" aria-label="Send">
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


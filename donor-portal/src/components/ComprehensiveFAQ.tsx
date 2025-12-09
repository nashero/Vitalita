import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  MessageCircle,
  HelpCircle,
  Clock,
  Heart,
  Calendar,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

type Category = 'before' | 'during' | 'after' | 'appointment';

interface Question {
  id: string;
  questionKey: string;
  answerKey: string;
  icon?: React.ReactNode;
}

const ComprehensiveFAQ = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<Category>('before');
  const [openQuestionId, setOpenQuestionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Define question structure with translation keys
  const questionStructure: Record<Category, Question[]> = {
    before: [
      {
        id: 'who-can-donate',
        questionKey: 'help.page.questions.before.whoCanDonate.question',
        answerKey: 'help.page.questions.before.whoCanDonate.answer',
        icon: <HelpCircle className="w-5 h-5" />,
      },
      {
        id: 'what-to-eat',
        questionKey: 'help.page.questions.before.whatToEat.question',
        answerKey: 'help.page.questions.before.whatToEat.answer',
        icon: <Heart className="w-5 h-5" />,
      },
      {
        id: 'medications',
        questionKey: 'help.page.questions.before.medications.question',
        answerKey: 'help.page.questions.before.medications.answer',
        icon: <AlertCircle className="w-5 h-5" />,
      },
      {
        id: 'how-long',
        questionKey: 'help.page.questions.before.howLong.question',
        answerKey: 'help.page.questions.before.howLong.answer',
        icon: <Clock className="w-5 h-5" />,
      },
      {
        id: 'will-it-hurt',
        questionKey: 'help.page.questions.before.willItHurt.question',
        answerKey: 'help.page.questions.before.willItHurt.answer',
        icon: <Heart className="w-5 h-5" />,
      },
    ],
    during: [
      {
        id: 'what-to-bring',
        questionKey: 'help.page.questions.during.whatToBring.question',
        answerKey: 'help.page.questions.during.whatToBring.answer',
        icon: <CheckCircle className="w-5 h-5" />,
      },
      {
        id: 'when-arrive',
        questionKey: 'help.page.questions.during.whenArrive.question',
        answerKey: 'help.page.questions.during.whenArrive.answer',
        icon: <Clock className="w-5 h-5" />,
      },
      {
        id: 'after-donating',
        questionKey: 'help.page.questions.during.afterDonating.question',
        answerKey: 'help.page.questions.during.afterDonating.answer',
        icon: <Heart className="w-5 h-5" />,
      },
      {
        id: 'drive-home',
        questionKey: 'help.page.questions.during.driveHome.question',
        answerKey: 'help.page.questions.during.driveHome.answer',
        icon: <AlertCircle className="w-5 h-5" />,
      },
    ],
    after: [
      {
        id: 'how-will-feel',
        questionKey: 'help.page.questions.after.howWillFeel.question',
        answerKey: 'help.page.questions.after.howWillFeel.answer',
        icon: <Heart className="w-5 h-5" />,
      },
      {
        id: 'when-donate-again',
        questionKey: 'help.page.questions.after.whenDonateAgain.question',
        answerKey: 'help.page.questions.after.whenDonateAgain.answer',
        icon: <Calendar className="w-5 h-5" />,
      },
      {
        id: 'feel-unwell',
        questionKey: 'help.page.questions.after.feelUnwell.question',
        answerKey: 'help.page.questions.after.feelUnwell.answer',
        icon: <AlertCircle className="w-5 h-5" />,
      },
      {
        id: 'blood-used',
        questionKey: 'help.page.questions.after.bloodUsed.question',
        answerKey: 'help.page.questions.after.bloodUsed.answer',
        icon: <HelpCircle className="w-5 h-5" />,
      },
    ],
    appointment: [
      {
        id: 'change-appointment',
        questionKey: 'help.page.questions.appointment.changeAppointment.question',
        answerKey: 'help.page.questions.appointment.changeAppointment.answer',
        icon: <Calendar className="w-5 h-5" />,
      },
      {
        id: 'cancel-appointment',
        questionKey: 'help.page.questions.appointment.cancelAppointment.question',
        answerKey: 'help.page.questions.appointment.cancelAppointment.answer',
        icon: <Calendar className="w-5 h-5" />,
      },
      {
        id: 'no-reminder',
        questionKey: 'help.page.questions.appointment.noReminder.question',
        answerKey: 'help.page.questions.appointment.noReminder.answer',
        icon: <AlertCircle className="w-5 h-5" />,
      },
      {
        id: 'bring-someone',
        questionKey: 'help.page.questions.appointment.bringSomeone.question',
        answerKey: 'help.page.questions.appointment.bringSomeone.answer',
        icon: <HelpCircle className="w-5 h-5" />,
      },
    ],
  };

  const categories: { id: Category; labelKey: string; icon: React.ReactNode }[] = [
    { id: 'before', labelKey: 'help.page.categories.before', icon: <Clock className="w-4 h-4" /> },
    { id: 'during', labelKey: 'help.page.categories.during', icon: <CheckCircle className="w-4 h-4" /> },
    { id: 'after', labelKey: 'help.page.categories.after', icon: <Heart className="w-4 h-4" /> },
    { id: 'appointment', labelKey: 'help.page.categories.appointment', icon: <Calendar className="w-4 h-4" /> },
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

  const handleCategoryChange = (categoryId: Category) => {
    setActiveCategory(categoryId);
    setOpenQuestionId(null);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-cream pt-24 pb-8 px-4">
      <div className="max-w-[1000px] mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-[36px] font-bold text-espresso mb-3">
            How Can We Help You?
          </h1>
          <p className="text-[18px] text-taupe">
            Find answers to common questions about donating blood
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mediterranean-blue" />
            <input
              type="text"
              placeholder="Type your question here"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white rounded-xl border-2 border-transparent focus:border-mediterranean-blue focus:border-2 focus:outline-none text-espresso placeholder-taupe transition-all duration-200 shadow-sm"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-start overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {categories.map((category) => {
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-lg sm:rounded-t-lg font-semibold transition-all duration-200 min-h-[44px] touch-manipulation ${
                    isActive
                      ? 'bg-terracotta text-white shadow-md'
                      : 'bg-white text-taupe hover:bg-cream hover:text-espresso'
                  }`}
                >
                  {category.icon}
                  <span className="whitespace-nowrap">{t(category.labelKey)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content - Questions Accordion */}
        <div>
            {activeQuestions.length > 0 ? (
              <div className="space-y-4">
                {activeQuestions.map((question) => {
                  const isOpen = openQuestionId === question.id;
                  return (
                    <div
                      key={question.id}
                      className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg"
                    >
                      <button
                        type="button"
                        onClick={() => toggleQuestion(question.id)}
                        className={`w-full px-6 py-5 flex items-center justify-between text-left transition-all duration-200 ${
                          isOpen
                            ? 'bg-cream border-l-4 border-terracotta'
                            : 'hover:bg-cream/50'
                        }`}
                        aria-expanded={isOpen}
                      >
                        <div className="flex items-start gap-4 flex-1">
                          {question.icon && (
                            <div className="text-terracotta flex-shrink-0 mt-0.5">
                              {question.icon}
                            </div>
                          )}
                          <span className="text-base font-semibold text-espresso flex-1">
                            {t(question.questionKey)}
                          </span>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                          {isOpen ? (
                            <ChevronUp className="w-5 h-5 text-mediterranean-blue" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-taupe" />
                          )}
                        </div>
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-6 pt-2 border-t border-taupe/10">
                          <div className="pl-9">
                            <p className="text-base text-espresso leading-relaxed whitespace-pre-line">
                              {t(question.answerKey)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <HelpCircle className="w-16 h-16 text-taupe mx-auto mb-4" />
                <p className="text-lg font-semibold text-espresso mb-2">
                  No questions found matching your search.
                </p>
                <p className="text-base text-taupe mb-4">
                  Try a different search term or browse by category.
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-mediterranean-blue hover:text-terracotta underline font-medium transition-colors"
                >
                  Clear search
                </button>
              </div>
            )}

            {/* Contact Section at Bottom */}
            <div className="mt-8 bg-white rounded-xl shadow-md p-6 sm:p-8">
              <h2 className="text-xl font-bold text-espresso mb-4">
                Can't find what you're looking for?
              </h2>
              <p className="text-base text-taupe mb-6">
                We're here to help. Reach out to us using any of these methods:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <a
                  href="tel:+391800123456"
                  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-cream rounded-lg hover:bg-terracotta hover:text-white transition-all duration-200 group text-center sm:text-left"
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-terracotta/10 group-hover:bg-white/20 rounded-full flex items-center justify-center mx-auto sm:mx-0">
                    <Phone className="w-6 h-6 sm:w-8 sm:h-8 text-terracotta group-hover:text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-espresso group-hover:text-white mb-1">
                      Call for Help
                    </p>
                    <p className="text-sm text-taupe group-hover:text-white/80">
                      +39 1800 123 456
                    </p>
                  </div>
                </a>
                <a
                  href="https://t.me/vitalita_support"
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-cream rounded-lg hover:bg-mediterranean-blue hover:text-white transition-all duration-200 group text-center sm:text-left"
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-mediterranean-blue/10 group-hover:bg-white/20 rounded-full flex items-center justify-center mx-auto sm:mx-0">
                    <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-mediterranean-blue group-hover:text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-espresso group-hover:text-white mb-1">
                      Chat with Us
                    </p>
                    <p className="text-sm text-taupe group-hover:text-white/80">
                      Chat on Telegram
                    </p>
                  </div>
                </a>
                <a
                  href="mailto:donations@vitalita.com"
                  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-cream rounded-lg hover:bg-olive-green hover:text-white transition-all duration-200 group text-center sm:text-left"
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-olive-green/10 group-hover:bg-white/20 rounded-full flex items-center justify-center mx-auto sm:mx-0">
                    <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-olive-green group-hover:text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-espresso group-hover:text-white mb-1">
                      Send an Inquiry
                    </p>
                    <p className="text-sm text-taupe group-hover:text-white/80">
                      donations@vitalita.com
                    </p>
                  </div>
                </a>
              </div>
              <p className="text-sm text-taupe mt-6 text-center">
                We usually respond within 1 hour
              </p>
            </div>
          </div>
      </div>
    </div>
  );
};

export default ComprehensiveFAQ;


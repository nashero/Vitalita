import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Info,
  AlertCircle,
  Heart,
  Loader2,
} from 'lucide-react';

type Answer = '' | 'yes' | 'no';

interface Question {
  id: string;
  text: string;
  helper: string;
  tooltip: string;
  warningTrigger?: 'yes' | 'no';
  disqualifying?: 'yes' | 'no';
}

const questions: Question[] = [
  {
    id: 'recentDonation',
    text: 'Have you donated blood in the last 8 weeks?',
    helper: 'You need to wait 8 weeks between blood donations.',
    tooltip: 'This waiting period allows your body to fully replenish blood cells.',
    warningTrigger: 'yes',
  },
  {
    id: 'feelsHealthy',
    text: 'Do you feel healthy today?',
    helper: "Feeling unwell? No problem—just reschedule when you're better.",
    tooltip: 'Donating while sick can affect donation quality.',
    disqualifying: 'no',
  },
  {
    id: 'medications',
    text: 'Are you currently taking any medications?',
    helper: 'Some medicines are okay—we can confirm.',
    tooltip: 'Certain medications may temporarily affect eligibility.',
  },
  {
    id: 'travel',
    text: 'Have you traveled outside Italy recently?',
    helper: 'Certain destinations may require a short waiting period.',
    tooltip: 'Travel to some regions may pose infection risk.',
  },
];

interface HealthScreeningProps {
  onComplete?: (answers: Record<string, Answer>) => void;
  onBack?: () => void;
  initialAnswers?: Record<string, Answer>;
}

export default function HealthScreening({
  onComplete,
  onBack,
  initialAnswers = {},
}: HealthScreeningProps) {
  const [answers, setAnswers] = useState<Record<string, Answer>>(initialAnswers);
  const [tooltipVisible, setTooltipVisible] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate current question number (first unanswered question, or last if all answered)
  const answeredCount = Object.values(answers).filter((a) => a !== '').length;
  const currentQuestionNumber = Math.min(answeredCount + 1, questions.length);

  const handleAnswer = (questionId: string, answer: Answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const getQuestionState = (question: Question, answer: Answer) => {
    if (answer === '') return 'normal';
    if (question.disqualifying && answer === question.disqualifying) return 'disqualifying';
    if (question.warningTrigger && answer === question.warningTrigger) return 'warning';
    return 'normal';
  };

  const allAnswered = questions.every((q) => answers[q.id] !== '');

  const handleSubmit = async () => {
    if (!allAnswered || isSubmitting) return;
    setIsSubmitting(true);
    
    // Simulate brief loading
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    if (onComplete) {
      onComplete(answers);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[700px] mx-auto px-4 py-6 md:py-8">
        {/* Progress Indicator - Full Booking Flow */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 md:gap-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-olive-green text-white flex items-center justify-center text-sm font-semibold">
                ✓
              </div>
              <span className="text-xs mt-1 text-taupe hidden md:block">Step 1</span>
            </div>
            <div className="w-12 md:w-24 h-0.5 bg-olive-green" />
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-olive-green text-white flex items-center justify-center text-sm font-semibold">
                ✓
              </div>
              <span className="text-xs mt-1 text-taupe hidden md:block">Step 2</span>
            </div>
            <div className="w-12 md:w-24 h-0.5 bg-olive-green" />
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-olive-green text-white flex items-center justify-center text-sm font-semibold">
                ✓
              </div>
              <span className="text-xs mt-1 text-taupe hidden md:block">Step 3</span>
            </div>
            <div className="w-12 md:w-24 h-0.5 bg-olive-green" />
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-terracotta text-white flex items-center justify-center text-sm font-semibold">
                4
              </div>
              <span className="text-xs mt-1 text-espresso font-semibold hidden md:block">Health Check</span>
            </div>
            <div className="w-12 md:w-24 h-0.5 bg-taupe/30" />
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-taupe text-taupe bg-white flex items-center justify-center text-sm font-semibold">
                5
              </div>
              <span className="text-xs mt-1 text-taupe hidden md:block">Step 5</span>
            </div>
          </div>
        </div>

        {/* Progress Indicator - Question Counter */}
        <div className="mb-6">
          <span className="text-sm font-medium text-mediterranean-blue">
            Question {currentQuestionNumber} of {questions.length}
          </span>
        </div>

        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            type="button"
            className="mb-6 px-4 py-2 border border-taupe text-taupe rounded-lg hover:bg-cream transition-colors duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-mediterranean-blue focus:ring-offset-2"
            aria-label="Go back"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        )}

        {/* Heading */}
        <header className="mb-8">
          <h1 className="text-[28px] md:text-[32px] font-bold text-espresso mb-2">
            Just a few quick questions
          </h1>
          <p className="text-base text-taupe">
            These help us keep everyone safe.
          </p>
        </header>

        {/* Questions */}
        <div className="mb-8">
          {questions.map((question, index) => {
            const answer = answers[question.id] || '';
            const state = getQuestionState(question, answer);
            const isWarning = state === 'warning';
            const isDisqualifying = state === 'disqualifying';

            return (
              <div
                key={question.id}
                className="relative bg-white rounded-[12px] border transition-all duration-300 shadow-sm mb-4 p-6"
                style={{
                  animation: `slideIn 0.4s ease-out ${index * 0.1}s both`,
                  borderWidth: isDisqualifying ? '2px' : '1px',
                  borderColor: isDisqualifying
                    ? '#E67E22'
                    : isWarning
                    ? '#E67E22'
                    : '#A1887F',
                  backgroundColor: isDisqualifying ? '#FDF6E9' : 'white',
                }}
              >
                {/* Left Accent Bar - 4px width */}
                <div
                  className={`absolute left-0 top-0 bottom-0 rounded-l-[12px] ${
                    isDisqualifying || isWarning
                      ? 'bg-burnt-orange'
                      : 'bg-mediterranean-blue'
                  }`}
                  style={{ width: '4px' }}
                />

                <div className="relative pl-6">
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-base text-espresso mb-1">
                        {question.text}
                      </h3>
                      <p
                        className={`text-sm italic transition-colors duration-200 ${
                          isWarning || isDisqualifying
                            ? 'text-burnt-orange'
                            : 'text-taupe'
                        }`}
                      >
                        {isDisqualifying
                          ? "Based on this answer, you may not be eligible today. Please contact us for guidance."
                          : isWarning
                          ? "You may need to wait before donating. We'll confirm at your appointment."
                          : question.helper}
                      </p>
                    </div>

                    {/* Info/Alert Icon */}
                    <div className="relative ml-4 flex-shrink-0">
                      <button
                        type="button"
                        className={`p-1 rounded-full hover:bg-cream transition-colors focus:outline-none focus:ring-2 focus:ring-mediterranean-blue focus:ring-offset-1 ${
                          isWarning || isDisqualifying
                            ? 'text-burnt-orange'
                            : 'text-mediterranean-blue'
                        }`}
                        onMouseEnter={() => setTooltipVisible(question.id)}
                        onMouseLeave={() => setTooltipVisible(null)}
                        onFocus={() => setTooltipVisible(question.id)}
                        onBlur={() => setTooltipVisible(null)}
                        aria-label="More information"
                      >
                        {isWarning || isDisqualifying ? (
                          <AlertCircle className="w-5 h-5" />
                        ) : (
                          <Info className="w-5 h-5" />
                        )}
                      </button>

                      {/* Tooltip */}
                      {tooltipVisible === question.id && (
                        <div
                          className="absolute right-0 top-full mt-2 w-64 p-3 bg-cream border border-taupe rounded-lg shadow-lg z-10"
                          role="tooltip"
                          onMouseEnter={() => setTooltipVisible(question.id)}
                          onMouseLeave={() => setTooltipVisible(null)}
                        >
                          <p className="text-sm text-espresso">
                            <strong>Why we ask this:</strong> {question.tooltip}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Radio Buttons */}
                  <div className="flex gap-4 sm:gap-6">
                    <label
                      className="flex items-center cursor-pointer group py-2 -ml-2 pl-2 pr-4 rounded-lg hover:bg-cream/30 transition-colors min-h-[44px] sm:min-h-[40px]"
                      aria-label={`${question.text} - Yes`}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value="yes"
                        checked={answer === 'yes'}
                        onChange={() => handleAnswer(question.id, 'yes')}
                        className="sr-only"
                        aria-label={`${question.text} - Yes`}
                      />
                      <div
                        className={`w-7 h-7 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                          answer === 'yes'
                            ? 'border-mediterranean-blue bg-mediterranean-blue'
                            : 'border-taupe group-hover:border-mediterranean-blue'
                        }`}
                      >
                        {answer === 'yes' && (
                          <div className="w-3.5 h-3.5 sm:w-3 sm:h-3 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="ml-3 text-base text-espresso font-medium">
                        Yes
                      </span>
                    </label>

                    <label
                      className="flex items-center cursor-pointer group py-2 -ml-2 pl-2 pr-4 rounded-lg hover:bg-cream/30 transition-colors min-h-[44px] sm:min-h-[40px]"
                      aria-label={`${question.text} - No`}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value="no"
                        checked={answer === 'no'}
                        onChange={() => handleAnswer(question.id, 'no')}
                        className="sr-only"
                        aria-label={`${question.text} - No`}
                      />
                      <div
                        className={`w-7 h-7 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                          answer === 'no'
                            ? 'border-mediterranean-blue bg-mediterranean-blue'
                            : 'border-taupe group-hover:border-mediterranean-blue'
                        }`}
                      >
                        {answer === 'no' && (
                          <div className="w-3.5 h-3.5 sm:w-3 sm:h-3 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="ml-3 text-base text-espresso font-medium">
                        No
                      </span>
                    </label>
                  </div>

                  {/* Disqualifying CTA */}
                  {isDisqualifying && (
                    <div className="mt-4 pt-4 border-t border-burnt-orange/20">
                      <div className="flex gap-3 flex-wrap">
                        <button
                          type="button"
                          className="px-4 py-2 border-2 border-mediterranean-blue text-mediterranean-blue rounded-lg hover:bg-mediterranean-blue hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-mediterranean-blue focus:ring-offset-2"
                          onClick={() => (window.location.href = 'tel:+390123456789')}
                        >
                          Call Us
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2 border-2 border-mediterranean-blue text-mediterranean-blue rounded-lg hover:bg-mediterranean-blue hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-mediterranean-blue focus:ring-offset-2"
                          onClick={onBack}
                        >
                          Reschedule
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Reassuring Element */}
        <div className="flex items-center gap-2 text-olive-green mb-8 p-4 bg-cream/30 rounded-lg">
          <Heart className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">
            Your honesty keeps everyone safe. Thank you for being responsible.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t border-taupe/20">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 border border-taupe text-taupe rounded-lg hover:bg-cream transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-mediterranean-blue focus:ring-offset-2"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allAnswered || isSubmitting}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ml-auto flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-terracotta focus:ring-offset-2 min-h-[44px] ${
              allAnswered && !isSubmitting
                ? 'bg-terracotta text-white hover:bg-terracotta/90 shadow-lg hover:shadow-xl'
                : 'bg-taupe/30 text-taupe cursor-not-allowed'
            }`}
            aria-label="Confirm appointment"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm Appointment'
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

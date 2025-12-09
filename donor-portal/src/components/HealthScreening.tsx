import { useState, useEffect, useRef } from 'react';
import {
  ClipboardCheck,
  Info,
  AlertCircle,
  Heart,
  ChevronLeft,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import Footer from './Footer';

type Answer = '' | 'yes' | 'no';

interface Question {
  id: string;
  text: string;
  helper: string;
  tooltip: string;
  warningTrigger?: 'yes' | 'no';
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
    warningTrigger: 'no',
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
  const tooltipRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Calculate current question number (first unanswered question, or last if all answered)
  const answeredCount = Object.values(answers).filter((a) => a !== '').length;
  const currentQuestionNumber = Math.min(answeredCount + 1, questions.length);

  const handleAnswer = (questionId: string, answer: Answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const getQuestionState = (question: Question, answer: Answer) => {
    if (answer === '') return 'normal';
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

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      Object.values(tooltipRefs.current).forEach((ref) => {
        if (ref && !ref.contains(event.target as Node)) {
          setTooltipVisible(null);
        }
      });
    };

    if (tooltipVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [tooltipVisible]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress Indicator - Full Booking Flow */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-taupe/20">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4">
          <div className="hidden md:flex w-full items-center gap-3">
            {/* Step 1 - Completed */}
            <div className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className="w-11 h-11 rounded-full bg-olive-green text-white flex items-center justify-center font-semibold text-sm shadow-md">
                  <CheckCircle2 size={20} strokeWidth={2.5} />
                </div>
                <span className="text-xs mt-2 text-taupe">Step 1</span>
              </div>
              <div className="flex-1 h-[3px] mx-3 rounded-full bg-terracotta" />
            </div>

            {/* Step 2 - Completed */}
            <div className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className="w-11 h-11 rounded-full bg-olive-green text-white flex items-center justify-center font-semibold text-sm shadow-md">
                  <CheckCircle2 size={20} strokeWidth={2.5} />
                </div>
                <span className="text-xs mt-2 text-taupe">Step 2</span>
              </div>
              <div className="flex-1 h-[3px] mx-3 rounded-full bg-terracotta" />
            </div>

            {/* Step 3 - Completed */}
            <div className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className="w-11 h-11 rounded-full bg-olive-green text-white flex items-center justify-center font-semibold text-sm shadow-md">
                  <CheckCircle2 size={20} strokeWidth={2.5} />
                </div>
                <span className="text-xs mt-2 text-taupe">Step 3</span>
              </div>
              <div className="flex-1 h-[3px] mx-3 rounded-full bg-terracotta" />
            </div>

            {/* Step 4 - Active */}
            <div className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className="w-11 h-11 rounded-full bg-terracotta text-white flex items-center justify-center font-semibold text-sm shadow-md">
                  4
                </div>
                <span className="text-xs mt-2 text-espresso font-semibold">Health Check</span>
              </div>
              <div className="flex-1 h-[3px] mx-3 rounded-full bg-taupe/30" />
            </div>

            {/* Step 5 - Upcoming */}
            <div className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className="w-11 h-11 rounded-full border-2 border-taupe text-taupe bg-white flex items-center justify-center font-semibold text-sm">
                  5
                </div>
                <span className="text-xs mt-2 text-taupe">Step 5</span>
              </div>
            </div>
          </div>

          {/* Mobile Progress Dots */}
          <div className="md:hidden flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <span
                key={step}
                className={`w-2.5 h-2.5 rounded-full ${
                  step < 4
                    ? 'bg-olive-green'
                    : step === 4
                    ? 'bg-terracotta w-4'
                    : 'bg-taupe/70'
                }`}
                aria-label={`Step ${step}`}
              />
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-10 w-full">
        {/* Step Indicator Card */}
        <section
          className="bg-cream border-l-4 border-terracotta rounded-lg p-4 md:p-6 flex items-start gap-3 mb-6"
          aria-label="Current step"
        >
          <div className="mt-1 text-terracotta flex-shrink-0">
            <ClipboardCheck className="w-6 h-6 md:w-7 md:h-7" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm md:text-base font-semibold text-espresso">Step 4: Health Check</p>
            <p className="text-sm text-taupe mt-1">Answer a few health screening questions</p>
          </div>
        </section>

        {/* Main Heading */}
        <header className="mb-8" id="health-screening-heading">
          <h1 className="text-[28px] md:text-[32px] font-bold text-espresso mb-2">
            Just a few quick questions
          </h1>
          <p className="text-base text-taupe">These help us keep everyone safe.</p>
        </header>

        {/* Question Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-mediterranean-blue">
              Question {currentQuestionNumber} of {questions.length}
            </span>
          </div>
          <div className="w-full h-2 bg-cream rounded-full overflow-hidden">
            <div
              className="h-full bg-mediterranean-blue transition-all duration-300 ease-out rounded-full"
              style={{ width: `${(currentQuestionNumber / questions.length) * 100}%` }}
              role="progressbar"
              aria-valuenow={currentQuestionNumber}
              aria-valuemin={1}
              aria-valuemax={questions.length}
              aria-label={`Question ${currentQuestionNumber} of ${questions.length}`}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="mb-8 space-y-4" role="group" aria-labelledby="health-screening-heading">
          {questions.map((question, index) => {
            const answer = answers[question.id] || '';
            const state = getQuestionState(question, answer);
            const isWarning = state === 'warning';

            return (
              <article
                key={question.id}
                className={`relative bg-white rounded-[12px] border transition-all duration-300 shadow-sm p-6 ${
                  isWarning ? 'border-burnt-orange' : 'border-taupe'
                }`}
                style={{
                  animation: `slideIn 0.4s ease-out ${index * 0.1}s both`,
                }}
                aria-labelledby={`question-${question.id}`}
              >
                {/* Left Accent Bar - 4px width */}
                <div
                  className={`absolute left-0 top-0 bottom-0 rounded-l-[12px] ${
                    isWarning ? 'bg-burnt-orange' : 'bg-mediterranean-blue'
                  }`}
                  style={{ width: '4px' }}
                  aria-hidden="true"
                />

                <div className="relative pl-6">
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-4 gap-4">
                    <div className="flex-1">
                      <h3
                        id={`question-${question.id}`}
                        className="text-base font-bold text-espresso mb-1"
                      >
                        {question.text}
                      </h3>
                      <p
                        className={`text-sm italic transition-colors duration-200 ${
                          isWarning ? 'text-burnt-orange' : 'text-taupe'
                        }`}
                      >
                        {isWarning
                          ? "You may need to wait before donating. We'll confirm at your appointment."
                          : question.helper}
                      </p>
                    </div>

                    {/* Info/Alert Icon */}
                    <div className="relative flex-shrink-0">
                      <button
                        type="button"
                        className={`p-1 rounded-full hover:bg-cream transition-colors focus:outline-none focus:ring-2 focus:ring-mediterranean-blue focus:ring-offset-1 ${
                          isWarning ? 'text-burnt-orange' : 'text-mediterranean-blue'
                        }`}
                        onMouseEnter={() => setTooltipVisible(question.id)}
                        onFocus={() => setTooltipVisible(question.id)}
                        onMouseLeave={() => {
                          // Delay to allow moving to tooltip
                          setTimeout(() => {
                            if (!tooltipRefs.current[question.id]?.matches(':hover')) {
                              setTooltipVisible(null);
                            }
                          }, 100);
                        }}
                        onBlur={(e) => {
                          // Don't close if focus moves to tooltip
                          if (!tooltipRefs.current[question.id]?.contains(e.relatedTarget as Node)) {
                            setTooltipVisible(null);
                          }
                        }}
                        aria-label={`More information about: ${question.text}`}
                        aria-expanded={tooltipVisible === question.id}
                      >
                        {isWarning ? (
                          <AlertCircle className="w-5 h-5" aria-hidden="true" />
                        ) : (
                          <Info className="w-5 h-5" aria-hidden="true" />
                        )}
                      </button>

                      {/* Tooltip */}
                      {tooltipVisible === question.id && (
                        <div
                          ref={(el) => (tooltipRefs.current[question.id] = el)}
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
                  <div className="flex gap-4 sm:gap-6" role="radiogroup" aria-labelledby={`question-${question.id}`}>
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
                            : 'border-taupe bg-white group-hover:border-mediterranean-blue'
                        }`}
                        aria-hidden="true"
                      >
                        {answer === 'yes' && (
                          <div className="w-3.5 h-3.5 sm:w-3 sm:h-3 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="ml-3 text-base text-espresso font-medium">Yes</span>
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
                            : 'border-taupe bg-white group-hover:border-mediterranean-blue'
                        }`}
                        aria-hidden="true"
                      >
                        {answer === 'no' && (
                          <div className="w-3.5 h-3.5 sm:w-3 sm:h-3 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="ml-3 text-base text-espresso font-medium">No</span>
                    </label>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Reassurance Section */}
        <div className="flex items-start gap-3 text-taupe mb-8 p-4 bg-cream rounded-lg">
          <Heart className="w-5 h-5 flex-shrink-0 text-olive-green mt-0.5" aria-hidden="true" />
          <p className="text-sm">
            Your honesty keeps everyone safe. Thank you for being responsible.
          </p>
        </div>

        {/* Navigation Buttons */}
        <section className="flex flex-col md:flex-row gap-4 md:gap-6 justify-between items-stretch md:items-center pt-4 border-t border-taupe/20">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="h-12 md:h-12 px-4 md:px-6 rounded-lg border-2 border-taupe text-taupe hover:text-espresso hover:border-espresso flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mediterranean-blue min-h-[44px]"
              aria-label="Go back to previous step"
            >
              <ChevronLeft size={18} aria-hidden="true" />
              Back
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allAnswered || isSubmitting}
            className={`h-12 md:h-12 px-4 md:px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mediterranean-blue min-h-[44px] ${
              allAnswered && !isSubmitting
                ? 'bg-terracotta text-white hover:bg-[#C5694A] shadow-md'
                : 'bg-taupe/30 text-taupe cursor-not-allowed opacity-60'
            }`}
            aria-label="Confirm appointment"
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-olive-green" aria-hidden="true" />
                Processing...
              </>
            ) : (
              'Confirm Appointment'
            )}
          </button>
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Animations */}
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

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
  badge?: string;
  headline?: string;
  subtitle?: string;
}

const FAQItem = ({ question, answer, isOpen, onClick }: FAQItem & { isOpen: boolean; onClick: () => void }) => {
  return (
    <div
      className="border rounded-xl bg-white transition-all"
      style={{
        border: '1px solid #E5E7EB',
        borderRadius: '12px',
      }}
    >
      <button
        onClick={onClick}
        className="w-full text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:ring-offset-2 rounded-xl transition-colors"
        style={{
          minHeight: '64px', // Touch-friendly target (44px minimum for WCAG)
          padding: '32px', // Increased for mobile touch targets
        }}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${question.slice(0, 10).replace(/\s/g, '-')}`}
        id={`faq-question-${question.slice(0, 10).replace(/\s/g, '-')}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
      >
        <h3
          className="text-[16px] md:text-[18px] font-semibold pr-4"
          style={{
            color: '#111827',
            fontWeight: 600,
          }}
        >
          {question}
        </h3>
        <ChevronDown
          className="flex-shrink-0 transition-transform duration-300"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            color: '#6B7280',
            width: '20px',
            height: '20px',
            minWidth: '20px', // Ensure visibility on mobile
          }}
          aria-hidden="true"
        />
      </button>
      <div
        id={`faq-answer-${question.slice(0, 10).replace(/\s/g, '-')}`}
        role="region"
        aria-labelledby={`faq-question-${question.slice(0, 10).replace(/\s/g, '-')}`}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isOpen ? '1000px' : '0',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div
          className="px-8 md:px-6 pb-8 md:pb-6"
          style={{
            paddingTop: '0',
          }}
        >
          <p
            className="text-sm md:text-base"
            style={{
              fontWeight: 400,
              color: '#6B7280',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
};

const FAQAccordion: React.FC<FAQAccordionProps> = ({ 
  items, 
  badge = "FAQS",
  headline = "Implementation Questions",
  subtitle = "Everything you need to know about getting started with Vitalita"
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      className="w-full px-6 bg-white"
      aria-labelledby="faq-heading"
      style={{
        paddingTop: '80px',
        paddingBottom: '48px',
      }}
    >
      <div className="max-w-[800px] mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          {/* Badge */}
          <div className="mb-6">
            <span
              className="inline-block px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-full border border-[#FF6B6B] bg-transparent"
              style={{
                color: '#FF6B6B',
                fontSize: '12px',
                padding: '8px 16px',
              }}
            >
              {badge}
            </span>
          </div>

          {/* Headline */}
          <h2
            id="faq-heading"
            className="text-[32px] md:text-[40px] font-bold mb-4"
            style={{
              color: '#111827',
              marginBottom: '16px',
            }}
          >
            {headline}
          </h2>

          {/* Subtitle */}
          <p
            className="text-[18px] md:text-[20px]"
            style={{
              color: '#6B7280',
              lineHeight: 1.6,
              marginBottom: '48px',
            }}
          >
            {subtitle}
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {items.map((item, index) => (
            <FAQItem
              key={index}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === index}
              onClick={() => handleToggle(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQAccordion;


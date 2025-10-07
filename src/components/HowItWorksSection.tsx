import React, { useState, forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface HowItWorksSectionProps {
  className?: string;
}

const HowItWorksSection = forwardRef<HTMLElement, HowItWorksSectionProps>(({ className = '' }, ref) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const processSteps = [
    {
      header: t('landing.processSteps.step1.header'),
      description: t('landing.processSteps.step1.description')
    },
    {
      header: t('landing.processSteps.step2.header'),
      description: t('landing.processSteps.step2.description')
    },
    {
      header: t('landing.processSteps.step3.header'),
      description: t('landing.processSteps.step3.description')
    },
    {
      header: t('landing.processSteps.step4.header'),
      description: t('landing.processSteps.step4.description')
    }
  ];

  return (
    <section ref={ref} className={`max-w-5xl mx-auto px-4 py-8 ${className}`}>
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex flex-col md:flex-row items-start gap-8">
          <div className="flex-1">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">{t('landing.howItWorks')}</h2>
            <p className="text-gray-700 mb-6">{t('landing.howItWorksDesc')}</p>
          </div>
          
          <div className="flex-1">
            <button
              onClick={toggleExpanded}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
              aria-expanded={isExpanded}
              aria-controls="process-steps"
            >
              <span className="font-medium text-gray-800">
                {isExpanded ? t('landing.hideSteps') : t('landing.showSteps')}
              </span>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>
            
            {/* Always show headers */}
            <ol className="space-y-4 mt-4">
              {processSteps.map((step, i) => (
                <li key={i} className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold mr-4 shadow">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <span className="text-gray-800 text-base font-medium">{step.header}</span>
                    {/* Show description only when expanded */}
                    {isExpanded && (
                      <p className="text-gray-600 text-sm mt-1 ml-0">
                        {step.description}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
});

HowItWorksSection.displayName = 'HowItWorksSection';

export default HowItWorksSection;

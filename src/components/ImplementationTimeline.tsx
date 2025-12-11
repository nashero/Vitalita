import React, { useState, useEffect } from 'react';
import { Settings, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ImplementationTimeline = () => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [startPulse, setStartPulse] = useState(false);
  const [endPulse, setEndPulse] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const reducedMotion = mediaQuery.matches;
    setPrefersReducedMotion(reducedMotion);
    
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    // Animation logic
    if (reducedMotion) {
      // Skip animation, set to 100% immediately
      setProgress(100);
      setStartPulse(true);
      setEndPulse(true);
    } else {
      // Animate progress bar from 0% to 100% over 3 seconds
      const duration = 3000; // 3 seconds
      const startTime = Date.now();
      let animationFrameId: number;
      let startPulseTriggered = false;
      let endPulseTriggered = false;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progressRatio = Math.min(elapsed / duration, 1);
        // Apply ease-in-out easing
        const easedProgress = progressRatio < 0.5
          ? 2 * progressRatio * progressRatio
          : 1 - Math.pow(-2 * progressRatio + 2, 2) / 2;
        const newProgress = easedProgress * 100;
        
        setProgress(newProgress);
        
        // Trigger pulse animations at milestones
        if (newProgress >= 0 && !startPulseTriggered) {
          startPulseTriggered = true;
          setStartPulse(true);
        }
        if (newProgress >= 100 && !endPulseTriggered) {
          endPulseTriggered = true;
          setEndPulse(true);
        }
        
        if (newProgress < 100) {
          animationFrameId = requestAnimationFrame(animate);
        }
      };
      
      animationFrameId = requestAnimationFrame(animate);
      
      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        mediaQuery.removeEventListener('change', handleChange);
      };
    }

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return (
    <div className="w-full max-w-[800px] mx-auto">
      {/* Timeline Container */}
      <div className="relative pt-8 pb-4">
        {/* Milestone Markers - Above Bar */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-start">
          {/* Start Marker (Left - 0%) */}
          <div className="flex flex-col items-start">
            {/* Marker Icon */}
            <div
              className={`w-8 h-8 rounded-full bg-[#FF6B6B] flex items-center justify-center mb-2 transition-all ${
                startPulse && !prefersReducedMotion ? 'animate-pulse' : ''
              }`}
              style={{
                boxShadow: startPulse && !prefersReducedMotion 
                  ? '0 0 0 4px rgba(255, 107, 107, 0.3)' 
                  : 'none',
                transition: prefersReducedMotion 
                  ? 'none' 
                  : 'box-shadow 0.3s ease-in-out'
              }}
              aria-label={t('howItWorksPage.hero.timeline.start')}
            >
              <Settings className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            {/* Marker Label */}
            <div className="text-left">
              <div 
                className="text-[11px] sm:text-[12px] md:text-[14px] font-medium"
                style={{ color: '#F9FAFB' }}
              >
                {t('howItWorksPage.hero.timeline.start')}
              </div>
            </div>
          </div>

          {/* End Marker (Right - 100%) */}
          <div className="flex flex-col items-end">
            {/* Marker Icon */}
            <div
              className={`w-8 h-8 rounded-full bg-[#FF6B6B] flex items-center justify-center mb-2 transition-all ${
                endPulse && !prefersReducedMotion ? 'animate-pulse' : ''
              }`}
              style={{
                boxShadow: endPulse && !prefersReducedMotion 
                  ? '0 0 0 4px rgba(255, 107, 107, 0.3)' 
                  : 'none',
                transition: prefersReducedMotion 
                  ? 'none' 
                  : 'box-shadow 0.3s ease-in-out',
                opacity: progress >= 100 ? 1 : 0.5
              }}
              aria-label={t('howItWorksPage.hero.timeline.end')}
            >
              <CheckCircle className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            {/* Marker Label */}
            <div className="text-right">
              <div 
                className="text-[11px] sm:text-[12px] md:text-[14px] font-medium"
                style={{ color: '#F9FAFB' }}
              >
                {t('howItWorksPage.hero.timeline.end')}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar Background */}
        <div 
          className="w-full rounded-full relative"
          style={{ 
            backgroundColor: '#374151',
            height: '4px'
          }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Implementation timeline progress"
        >
          {/* Progress Fill with Gradient */}
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(to right, #FF6B6B, #FF8E8E)',
              height: '4px',
              transition: prefersReducedMotion 
                ? 'none' 
                : 'width 0.1s ease-in-out'
            }}
          />
        </div>
      </div>

      {/* Comparison Callout */}
      <div 
        className="text-center mt-4"
        style={{ 
          marginTop: '16px',
          fontSize: '14px',
          color: '#6B7280'
        }}
      >
        {t('howItWorksPage.hero.timeline.comparison')}
      </div>
    </div>
  );
};

export default ImplementationTimeline;


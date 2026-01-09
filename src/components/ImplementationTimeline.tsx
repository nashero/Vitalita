import React, { useState, useEffect } from 'react';
import { Settings, TestTube2, Rocket, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ImplementationTimeline = () => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [phasePulses, setPhasePulses] = useState({
    setup: false,
    testing: false,
    launch: false,
    operational: false
  });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const phases = [
    {
      key: 'setup',
      icon: Settings,
      translationKey: 'howItWorksPage.hero.timeline.phases.setup'
    },
    {
      key: 'testing',
      icon: TestTube2,
      translationKey: 'howItWorksPage.hero.timeline.phases.testing'
    },
    {
      key: 'launch',
      icon: Rocket,
      translationKey: 'howItWorksPage.hero.timeline.phases.launch'
    },
    {
      key: 'operational',
      icon: CheckCircle,
      translationKey: 'howItWorksPage.hero.timeline.phases.operational'
    }
  ];

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
      setPhasePulses({
        setup: true,
        testing: true,
        launch: true,
        operational: true
      });
    } else {
      // Animate progress bar from 0% to 100% over 3 seconds
      const duration = 3000; // 3 seconds
      const startTime = Date.now();
      let animationFrameId: number;
      const triggeredPhases = {
        setup: false,
        testing: false,
        launch: false,
        operational: false
      };
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progressRatio = Math.min(elapsed / duration, 1);
        // Apply ease-in-out easing
        const easedProgress = progressRatio < 0.5
          ? 2 * progressRatio * progressRatio
          : 1 - Math.pow(-2 * progressRatio + 2, 2) / 2;
        const newProgress = easedProgress * 100;
        
        setProgress(newProgress);
        
        // Trigger pulse animations at phase milestones (0%, 33.33%, 66.67%, 100%)
        if (newProgress >= 0 && !triggeredPhases.setup) {
          triggeredPhases.setup = true;
          setPhasePulses(prev => ({ ...prev, setup: true }));
        }
        if (newProgress >= 33.33 && !triggeredPhases.testing) {
          triggeredPhases.testing = true;
          setPhasePulses(prev => ({ ...prev, testing: true }));
        }
        if (newProgress >= 66.67 && !triggeredPhases.launch) {
          triggeredPhases.launch = true;
          setPhasePulses(prev => ({ ...prev, launch: true }));
        }
        if (newProgress >= 100 && !triggeredPhases.operational) {
          triggeredPhases.operational = true;
          setPhasePulses(prev => ({ ...prev, operational: true }));
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
        {/* Phase Markers - Above Bar */}
        <div className="absolute top-0 left-0 right-0" style={{ height: '100%' }}>
          {phases.map((phase, index) => {
            const IconComponent = phase.icon;
            // Evenly space phases: 0%, 33.33%, 66.67%, 100%
            const phaseProgress = (index * 100) / (phases.length - 1);
            const isActive = progress >= phaseProgress;
            const isPulsing = phasePulses[phase.key as keyof typeof phasePulses] && !prefersReducedMotion;
            const isFirst = index === 0;
            const isLast = index === phases.length - 1;
            
            return (
              <div 
                key={phase.key}
                className="flex flex-col absolute"
                style={{ 
                  left: `${phaseProgress}%`,
                  transform: isFirst ? 'translateX(0)' : isLast ? 'translateX(-100%)' : 'translateX(-50%)',
                  alignItems: isFirst ? 'flex-start' : isLast ? 'flex-end' : 'center'
                }}
              >
                {/* Marker Icon */}
                <div
                  className={`w-8 h-8 rounded-full bg-[#FF6B6B] flex items-center justify-center mb-2 transition-all ${
                    isPulsing ? 'animate-pulse' : ''
                  }`}
                  style={{
                    boxShadow: isPulsing
                      ? '0 0 0 4px rgba(255, 107, 107, 0.3)' 
                      : 'none',
                    transition: prefersReducedMotion 
                      ? 'none' 
                      : 'box-shadow 0.3s ease-in-out, opacity 0.3s ease-in-out',
                    opacity: isActive ? 1 : 0.5
                  }}
                  aria-label={t(phase.translationKey)}
                >
                  <IconComponent className="w-4 h-4 text-white" aria-hidden="true" />
                </div>
                {/* Marker Label */}
                <div 
                  className="whitespace-nowrap"
                  style={{
                    textAlign: isFirst ? 'left' : isLast ? 'right' : 'center'
                  }}
                >
                  <div 
                    className="text-[10px] sm:text-[11px] md:text-[13px] font-medium"
                    style={{ 
                      color: '#F9FAFB'
                    }}
                  >
                    {t(phase.translationKey)}
                  </div>
                </div>
              </div>
            );
          })}
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


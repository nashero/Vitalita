import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, ChevronDown, ChevronUp, Clock, Heart, TrendingDown, Users, XCircle, Shield } from 'lucide-react';
import circularInfographic from '../assets/images/Circular Infographic.jpg';

const Hero = () => {
  const { t } = useTranslation();
  const [isStoryExpanded, setIsStoryExpanded] = useState(false);

  return (
    <section className="section-container relative overflow-hidden py-12 md:py-20 px-5 md:px-0" style={{ background: 'linear-gradient(to bottom, rgba(26, 35, 50, 0.8), rgba(17, 24, 39, 0.8))' }}>
      <div className="absolute left-1/2 top-0 -z-10 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[#FF6B6B]/10 blur-[120px]" />
      
      {/* Main Impact Message */}
      <div className="mx-auto max-w-4xl text-center mb-12 md:mb-16">
        <div className="inline-flex items-center space-x-2 rounded-full border border-[#FF6B6B] bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#FF6B6B] shadow-sm mb-6">
          <Shield className="h-4 w-4" />
          <span>{t('home.hero.trustedByAvis')}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#F9FAFB] sm:text-5xl lg:text-6xl mb-4 md:mb-6">
          {t('home.hero.heading')}
        </h1>
        <p className="max-w-3xl mx-auto text-base md:text-xl leading-relaxed text-[#F9FAFB] font-medium">
          {t('home.hero.subtitle')}
        </p>
        
        {/* AVIS Nazionale Logo */}
        <div className="mt-8 flex justify-center">
          <div className="flex flex-col items-center rounded-2xl border border-[#FF6B6B] p-6 text-center max-w-md backdrop-blur-sm" style={{ backgroundColor: 'rgba(255, 107, 107, 0.2)' }}>
            <span className="text-lg font-semibold text-[#F9FAFB]">{t('home.hero.avisLogo.name')}</span>
            <span className="mt-2 text-xs uppercase tracking-[0.2em] text-[#FF6B6B]">{t('home.hero.avisLogo.highlight')}</span>
            <p className="mt-4 text-sm text-[#F9FAFB]/80">{t('home.hero.avisLogo.description')}</p>
          </div>
        </div>
      </div>

      {/* Circular Infographic */}
      <div className="mb-16">
        <div className="mx-auto max-w-4xl">
          <div className="flex justify-center">
            <img 
              src={circularInfographic} 
              alt={t('home.hero.infographicAlt')}
              className="max-w-2xl w-full h-auto rounded-2xl shadow-xl"
            />
          </div>
        </div>
      </div>

      {/* The Story Section */}
      <div className="mb-16">
        <div className="mx-auto max-w-5xl">
          <div 
            className="rounded-3xl border-2 border-red-100 bg-gradient-to-br from-red-50/50 via-white to-slate-50 p-8 md:p-12 shadow-xl cursor-pointer transition-all duration-300 hover:border-red-200 hover:shadow-2xl"
            onClick={() => setIsStoryExpanded(!isStoryExpanded)}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 flex-shrink-0">
                <Heart className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">{t('home.hero.missionStory.title')}</h2>
                <p className="text-sm text-slate-600">{t('home.hero.missionStory.clickToRead')}</p>
              </div>
              <div className="flex-shrink-0">
                {isStoryExpanded ? (
                  <ChevronUp className="h-6 w-6 text-slate-600" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-slate-600" />
                )}
              </div>
            </div>
            
            {isStoryExpanded && (
              <div className="space-y-6 text-slate-700 transition-all duration-300 ease-in-out">
                <div className="pt-4 border-t border-red-100">
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">{t('home.hero.missionStory.storyTitle')}</h3>
                  <p className="text-sm text-slate-600 mb-6">{t('home.hero.missionStory.storySubtitle')}</p>
                </div>
                <p className="text-lg leading-relaxed">
                  {t('home.hero.missionStory.paragraph1')}
                </p>
                <p className="text-lg leading-relaxed">
                  {t('home.hero.missionStory.paragraph2')}
                </p>
                <p className="text-lg leading-relaxed">
                  {t('home.hero.missionStory.paragraph3')}
                </p>
                <div className="rounded-2xl bg-red-100/50 border border-red-200 p-6 my-8">
                  <p className="text-xl font-semibold text-red-900 text-center">
                    {t('home.hero.missionStory.tragedyMessage')}
                  </p>
                  <p className="text-center text-red-700 mt-2">
                    {t('home.hero.missionStory.tragedySubtext')}
                  </p>
                </div>
                <p className="text-lg leading-relaxed font-medium text-slate-900">
                  {t('home.hero.missionStory.conclusion')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* What You're Losing Section */}
      <div className="mb-12 px-5 md:px-0">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl md:text-[32px] font-semibold text-center text-slate-900 mb-8 md:mb-12">
            {t('home.hero.whatYouLose.title')}
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <Clock className="h-6 w-6 text-red-600" />,
                key: 'operationalWaste',
              },
              {
                icon: <TrendingDown className="h-6 w-6 text-red-600" />,
                key: 'capacityLoss',
              },
              {
                icon: <XCircle className="h-6 w-6 text-red-600" />,
                key: 'livesAtRisk',
              },
              {
                icon: <Users className="h-6 w-6 text-red-600" />,
                key: 'donorAttrition',
              },
            ].map((loss) => {
              const lossData = t(`home.hero.whatYouLose.losses.${loss.key}`, { returnObjects: true }) as { title: string; description: string; stat: string };
              return (
              <div
                key={loss.key}
                className="rounded-2xl border-2 border-red-100 bg-white p-6 shadow-lg transition duration-300 hover:-translate-y-2 hover:border-red-300 hover:shadow-xl min-h-[48px]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 mb-4">
                  {loss.icon}
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2">{lossData.title}</h3>
                <p className="text-base md:text-sm leading-relaxed text-slate-600 mb-4">{lossData.description}</p>
                <p className="text-lg md:text-xs font-semibold uppercase tracking-wide" style={{ color: '#FF6B6B' }}>{lossData.stat}</p>
              </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xl font-semibold text-[#F9FAFB] mb-4">
          {t('home.hero.cta.title')}
        </p>
        <p className="text-lg text-[#F9FAFB]/80 mb-8">
          {t('home.hero.cta.description')}
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            to="/contact"
            className="inline-flex items-center justify-center rounded-full bg-[#FF6B6B] px-8 py-3 md:py-4 text-base font-semibold text-white shadow-xl shadow-[#FF6B6B]/40 transition hover:bg-[#E65A5A] hover:shadow-[#FF6B6B]/50 min-h-[48px]"
          >
            {t('home.hero.cta.getEmergencyReady')}
          </Link>
          <Link
            to="/how-it-works"
            className="inline-flex items-center justify-center rounded-full border-2 border-[#6B7280] px-8 py-3 md:py-4 text-base font-semibold text-[#6B7280] bg-transparent transition hover:border-[#4B5563] hover:text-[#4B5563] min-h-[48px]"
          >
            {t('home.hero.cta.seeHowItWorks')}
          </Link>
        </div>
        
        {/* Trust Badge */}
        <div className="mt-6 md:mt-8 w-full">
          <p className="text-base md:text-sm font-semibold text-[#F9FAFB]/80 uppercase tracking-wider">
            {t('home.hero.trustBadge')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;


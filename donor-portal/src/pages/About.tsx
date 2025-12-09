import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Target,
  Eye,
  Lightbulb,
  Users,
  Rocket,
  TrendingUp,
  Globe,
  Shield,
  Zap,
  BarChart,
  Handshake,
  CheckCircle2,
  Award,
  Accessibility,
} from 'lucide-react';

// Italian Flag SVG Component
const ItalianFlag = ({ className = 'w-16 h-12' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg">
    <rect width="1" height="2" fill="#009246" />
    <rect x="1" width="1" height="2" fill="#FFFFFF" />
    <rect x="2" width="1" height="2" fill="#CE2B37" />
  </svg>
);

function About() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [counts, setCounts] = useState({
    donors: 0,
    lives: 0,
    centers: 0,
    retention: 0,
    scheduling: 0,
    satisfaction: 0,
  });

  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const timelineRefs = useRef<HTMLDivElement[]>([]);
  const statsRef = useRef<HTMLDivElement>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Set document title and meta description
  useEffect(() => {
    document.title = t('about.pageTitle');
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('about.metaDescription'));
    }
  }, [t]);

  // Intersection Observer for section animations
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Show all sections immediately
      Object.keys(sectionRefs.current).forEach((key) => {
        setVisibleSections((prev) => new Set(prev).add(key));
      });
      return;
    }

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('data-section-id');
          if (sectionId) {
            setVisibleSections((prev) => new Set(prev).add(sectionId));
            observer.unobserve(entry.target);
          }
        }
      });
    }, observerOptions);

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  // Timeline animation
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px',
    };

    const timelineObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('animate-fade-in-up');
          }, index * 200);
          timelineObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    timelineRefs.current.forEach((ref) => {
      if (ref) timelineObserver.observe(ref);
    });

    return () => timelineObserver.disconnect();
  }, []);

  // Count-up animation for statistics
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (prefersReducedMotion) {
            setCounts({
              donors: 50000,
              lives: 150000,
              centers: 200,
              retention: 35,
              scheduling: 80,
              satisfaction: 98,
            });
            return;
          }

          const duration = 2000;
          const steps = 60;
          const targets = {
            donors: 50000,
            lives: 150000,
            centers: 200,
            retention: 35,
            scheduling: 80,
            satisfaction: 98,
          };

          let currentStep = 0;
          const timer = setInterval(() => {
            currentStep++;
            const progress = Math.min(currentStep / steps, 1);
            setCounts({
              donors: Math.floor(targets.donors * progress),
              lives: Math.floor(targets.lives * progress),
              centers: Math.floor(targets.centers * progress),
              retention: Math.floor(targets.retention * progress),
              scheduling: Math.floor(targets.scheduling * progress),
              satisfaction: Math.floor(targets.satisfaction * progress),
            });

            if (currentStep >= steps) {
              clearInterval(timer);
              setCounts(targets);
            }
          }, duration / steps);

          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    if (statsRef.current) {
      statsObserver.observe(statsRef.current);
    }

    return () => statsObserver.disconnect();
  }, []);

  return (
    <div className="w-full pt-16 md:pt-20">
      {/* SECTION 1: HERO / INTRODUCTION */}
      <section
        ref={(el) => (sectionRefs.current['hero'] = el)}
        data-section-id="hero"
        className={`w-full bg-cream py-20 px-6 transition-opacity duration-1000 ${
          visibleSections.has('hero') ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center py-20">
            {/* Italian Flag Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <ItalianFlag className="w-24 h-16 md:w-32 md:h-20" aria-label="Italian flag" />
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-olive-green rounded-full"></div>
              </div>
            </div>

            <h1 className="text-[36px] md:text-[48px] font-bold text-espresso mb-6">
              {t('about.hero.title')}
            </h1>
            <p className="text-[18px] md:text-[20px] text-taupe mb-12 max-w-[800px] mx-auto">
              {t('about.hero.subtitle')}
            </p>

            <div className="max-w-[800px] mx-auto space-y-6 text-[18px] text-taupe text-center">
              <p>{t('about.hero.paragraph1')}</p>
              <p>{t('about.hero.paragraph2')}</p>
              <p>{t('about.hero.paragraph3')}</p>
            </div>

            {/* Decorative Mediterranean Pattern Border */}
            <div className="mt-16 pt-8 border-t-2 border-olive-green/30 relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="flex gap-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-olive-green rounded-full"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: OUR MISSION */}
      <section
        ref={(el) => (sectionRefs.current['mission'] = el)}
        data-section-id="mission"
        className={`w-full bg-white py-20 px-6 transition-opacity duration-1000 ${
          visibleSections.has('mission') ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            {/* Left Column - Mission */}
            <div className="text-center md:text-left">
              <div className="flex justify-center md:justify-start mb-6">
                <Target className="w-16 h-16 text-terracotta" aria-hidden="true" />
              </div>
              <h2 className="text-[28px] md:text-[36px] font-bold text-espresso mb-4">
                {t('about.mission.title')}
              </h2>
              <p className="text-[18px] text-taupe">
                {t('about.mission.description')}
              </p>
            </div>

            {/* Right Column - Vision */}
            <div className="text-center md:text-left">
              <div className="flex justify-center md:justify-start mb-6">
                <Eye className="w-16 h-16 text-mediterranean-blue" aria-hidden="true" />
              </div>
              <h2 className="text-[28px] md:text-[36px] font-bold text-espresso mb-4">
                {t('about.vision.title')}
              </h2>
              <p className="text-[18px] text-taupe">
                {t('about.vision.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: THE STORY - TIMELINE */}
      <section
        ref={(el) => (sectionRefs.current['story'] = el)}
        data-section-id="story"
        className={`w-full bg-cream py-20 px-6 transition-opacity duration-1000 ${
          visibleSections.has('story') ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-[28px] md:text-[36px] font-bold text-espresso text-center mb-4">
            {t('about.journey.title')}
          </h2>
          <p className="text-[18px] text-taupe text-center mb-16">
            {t('about.journey.subtitle')}
          </p>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical Timeline Line */}
            <div className="absolute left-8 md:left-1/2 md:transform md:-translate-x-1/2 top-0 bottom-0 w-0.5 md:w-1 bg-mediterranean-blue hidden md:block"></div>
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-mediterranean-blue md:hidden"></div>

            {/* Timeline Events */}
            <div className="space-y-12 md:space-y-16">
              {/* 2024 - Launch */}
              <div
                ref={(el) => {
                  if (el) timelineRefs.current[0] = el;
                }}
                className="relative flex flex-col md:flex-row md:items-center gap-6"
              >
                <div className="md:w-1/2 md:pr-12 md:text-right">
                  <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-olive-green">
                    <div className="flex items-center gap-3 mb-3">
                      <Rocket className="w-8 h-8 text-olive-green" aria-hidden="true" />
                      <h3 className="text-xl font-bold text-espresso">{t('about.journey.timeline.2024Launch.title')}</h3>
                    </div>
                    <p className="text-taupe">
                      {t('about.journey.timeline.2024Launch.description')}
                    </p>
                  </div>
                </div>
                <div className="absolute left-6 md:left-1/2 md:transform md:-translate-x-1/2 w-4 h-4 bg-olive-green rounded-full border-4 border-white shadow-lg z-10"></div>
                <div className="md:w-1/2 md:pl-12"></div>
              </div>

              {/* 2024 - Growing Impact */}
              <div
                ref={(el) => {
                  if (el) timelineRefs.current[1] = el;
                }}
                className="relative flex flex-col md:flex-row md:items-center gap-6"
              >
                <div className="md:w-1/2 md:pr-12"></div>
                <div className="absolute left-6 md:left-1/2 md:transform md:-translate-x-1/2 w-4 h-4 bg-terracotta rounded-full border-4 border-white shadow-lg z-10"></div>
                <div className="md:w-1/2 md:pl-12">
                  <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-terracotta">
                    <div className="flex items-center gap-3 mb-3">
                      <TrendingUp className="w-8 h-8 text-terracotta" aria-hidden="true" />
                      <h3 className="text-xl font-bold text-espresso">{t('about.journey.timeline.2024Impact.title')}</h3>
                    </div>
                    <p className="text-taupe">
                      {t('about.journey.timeline.2024Impact.description')}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2025 */}
              <div
                ref={(el) => {
                  if (el) timelineRefs.current[2] = el;
                }}
                className="relative flex flex-col md:flex-row md:items-center gap-6"
              >
                <div className="md:w-1/2 md:pr-12 md:text-right">
                  <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-mediterranean-blue">
                    <div className="flex items-center gap-3 mb-3">
                      <Globe className="w-8 h-8 text-mediterranean-blue" aria-hidden="true" />
                      <h3 className="text-xl font-bold text-espresso">{t('about.journey.timeline.2025Future.title')}</h3>
                    </div>
                    <p className="text-taupe">
                      {t('about.journey.timeline.2025Future.description')}
                    </p>
                  </div>
                </div>
                <div className="absolute left-6 md:left-1/2 md:transform md:-translate-x-1/2 w-4 h-4 bg-mediterranean-blue rounded-full border-4 border-white shadow-lg z-10"></div>
                <div className="md:w-1/2 md:pl-12"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: PARTNERSHIP WITH AVIS */}
      <section
        ref={(el) => (sectionRefs.current['partnership'] = el)}
        data-section-id="partnership"
        className={`w-full bg-white py-20 px-6 transition-opacity duration-1000 ${
          visibleSections.has('partnership') ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-[28px] md:text-[36px] font-bold text-espresso text-center mb-4">
            {t('about.partnership.title')}
          </h2>
          <p className="text-[18px] text-taupe text-center mb-12">
            {t('about.partnership.subtitle')}
          </p>

          {/* AVIS Content Box */}
          <div className="bg-cream p-10 md:p-12 rounded-lg mb-12 max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-block bg-white p-6 rounded-lg shadow-md mb-6">
                <span className="text-6xl" role="img" aria-label="AVIS logo">
                  🩸
                </span>
                <p className="text-2xl font-bold text-espresso mt-2">AVIS</p>
              </div>
            </div>
            <p className="text-[18px] text-taupe text-center max-w-3xl mx-auto">
              {t('about.partnership.description')}
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white border-t-4 border-terracotta p-6 rounded-lg shadow-md text-center">
              <p className="text-3xl font-bold text-terracotta mb-2">{t('about.partnership.stats.history')}</p>
              <p className="text-taupe">{t('about.partnership.stats.historyLabel')}</p>
            </div>
            <div className="bg-white border-t-4 border-mediterranean-blue p-6 rounded-lg shadow-md text-center">
              <p className="text-3xl font-bold text-mediterranean-blue mb-2">{t('about.partnership.stats.partnership')}</p>
              <p className="text-taupe">{t('about.partnership.stats.partnershipLabel')}</p>
            </div>
            <div className="bg-white border-t-4 border-olive-green p-6 rounded-lg shadow-md text-center">
              <p className="text-3xl font-bold text-olive-green mb-2">{t('about.partnership.stats.centers')}</p>
              <p className="text-taupe">{t('about.partnership.stats.centersLabel')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: OUR VALUES */}
      <section
        ref={(el) => (sectionRefs.current['values'] = el)}
        data-section-id="values"
        className={`w-full bg-cream py-20 px-6 transition-opacity duration-1000 ${
          visibleSections.has('values') ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-[28px] md:text-[36px] font-bold text-espresso text-center mb-16">
            {t('about.values.title')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Value Card 1 */}
            <div className="bg-white border-t-4 border-terracotta p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <Users className="w-10 h-10 text-terracotta mb-4" aria-hidden="true" />
              <h3 className="text-xl font-bold text-espresso mb-3">{t('about.values.communityFirst.title')}</h3>
              <p className="text-taupe">
                {t('about.values.communityFirst.description')}
              </p>
            </div>

            {/* Value Card 2 */}
            <div className="bg-white border-t-4 border-mediterranean-blue p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <Shield className="w-10 h-10 text-mediterranean-blue mb-4" aria-hidden="true" />
              <h3 className="text-xl font-bold text-espresso mb-3">{t('about.values.trust.title')}</h3>
              <p className="text-taupe">
                {t('about.values.trust.description')}
              </p>
            </div>

            {/* Value Card 3 */}
            <div className="bg-white border-t-4 border-olive-green p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <Globe className="w-10 h-10 text-olive-green mb-4" aria-hidden="true" />
              <h3 className="text-xl font-bold text-espresso mb-3">{t('about.values.roots.title')}</h3>
              <p className="text-taupe">
                {t('about.values.roots.description')}
              </p>
            </div>

            {/* Value Card 4 */}
            <div className="bg-white border-t-4 border-terracotta p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <Zap className="w-10 h-10 text-terracotta mb-4" aria-hidden="true" />
              <h3 className="text-xl font-bold text-espresso mb-3">{t('about.values.simplicity.title')}</h3>
              <p className="text-taupe">
                {t('about.values.simplicity.description')}
              </p>
            </div>

            {/* Value Card 5 */}
            <div className="bg-white border-t-4 border-mediterranean-blue p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <BarChart className="w-10 h-10 text-mediterranean-blue mb-4" aria-hidden="true" />
              <h3 className="text-xl font-bold text-espresso mb-3">{t('about.values.evidence.title')}</h3>
              <p className="text-taupe">
                {t('about.values.evidence.description')}
              </p>
            </div>

            {/* Value Card 6 */}
            <div className="bg-white border-t-4 border-olive-green p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <Handshake className="w-10 h-10 text-olive-green mb-4" aria-hidden="true" />
              <h3 className="text-xl font-bold text-espresso mb-3">{t('about.values.partnership.title')}</h3>
              <p className="text-taupe">
                {t('about.values.partnership.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: THE TEAM */}
      <section
        ref={(el) => (sectionRefs.current['team'] = el)}
        data-section-id="team"
        className={`w-full bg-white py-20 px-6 transition-opacity duration-1000 ${
          visibleSections.has('team') ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-[28px] md:text-[36px] font-bold text-espresso text-center mb-4">
            {t('about.team.title')}
          </h2>
          <p className="text-[18px] text-taupe text-center mb-12">
            {t('about.team.subtitle')}
          </p>

          {/* Team Privacy Alternative */}
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-[18px] text-taupe leading-relaxed">
              {t('about.team.description')}
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 7: BY THE NUMBERS */}
      <section
        ref={statsRef}
        className="w-full bg-terracotta py-20 px-6 relative overflow-hidden"
      >
        {/* Subtle Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)`
          }}></div>
        </div>

        <div className="max-w-[1200px] mx-auto relative z-10">
          <h2 className="text-[32px] md:text-[40px] font-bold text-white text-center mb-16">
            {t('about.impact.title')}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="text-center">
              <div className="text-[36px] md:text-[48px] font-bold text-white mb-2">
                {counts.donors.toLocaleString()}+
              </div>
              <div className="text-white/90 text-sm md:text-base">{t('about.impact.activeDonors')}</div>
            </div>
            <div className="text-center">
              <div className="text-[36px] md:text-[48px] font-bold text-white mb-2">
                {counts.lives.toLocaleString()}+
              </div>
              <div className="text-white/90 text-sm md:text-base">{t('about.impact.livesSaved')}</div>
            </div>
            <div className="text-center">
              <div className="text-[36px] md:text-[48px] font-bold text-white mb-2">
                {counts.centers}+
              </div>
              <div className="text-white/90 text-sm md:text-base">{t('about.impact.connectedCenters')}</div>
            </div>
            <div className="text-center">
              <div className="text-[36px] md:text-[48px] font-bold text-white mb-2">
                {counts.retention}%
              </div>
              <div className="text-white/90 text-sm md:text-base">{t('about.impact.retention')}</div>
            </div>
            <div className="text-center">
              <div className="text-[36px] md:text-[48px] font-bold text-white mb-2">
                {counts.scheduling}%
              </div>
              <div className="text-white/90 text-sm md:text-base">{t('about.impact.scheduling')}</div>
            </div>
            <div className="text-center">
              <div className="text-[36px] md:text-[48px] font-bold text-white mb-2">
                {counts.satisfaction}%
              </div>
              <div className="text-white/90 text-sm md:text-base">{t('about.impact.satisfaction')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: CERTIFICATIONS & COMPLIANCE */}
      <section
        ref={(el) => (sectionRefs.current['certifications'] = el)}
        data-section-id="certifications"
        className={`w-full bg-white py-20 px-6 transition-opacity duration-1000 ${
          visibleSections.has('certifications') ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-[28px] md:text-[32px] font-bold text-espresso text-center mb-12">
            {t('about.certifications.title')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-cream border border-taupe/30 p-6 rounded-lg text-center">
              <CheckCircle2 className="w-12 h-12 text-mediterranean-blue mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-lg font-bold text-espresso mb-2">{t('about.certifications.iso27001.title')}</h3>
              <p className="text-sm text-taupe">
                {t('about.certifications.iso27001.description')}
              </p>
            </div>

            <div className="bg-cream border border-taupe/30 p-6 rounded-lg text-center">
              <Shield className="w-12 h-12 text-mediterranean-blue mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-lg font-bold text-espresso mb-2">{t('about.certifications.gdpr.title')}</h3>
              <p className="text-sm text-taupe">
                {t('about.certifications.gdpr.description')}
              </p>
            </div>

            <div className="bg-cream border border-taupe/30 p-6 rounded-lg text-center">
              <Accessibility className="w-12 h-12 text-mediterranean-blue mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-lg font-bold text-espresso mb-2">{t('about.certifications.wcag.title')}</h3>
              <p className="text-sm text-taupe">
                {t('about.certifications.wcag.description')}
              </p>
            </div>

            <div className="bg-cream border border-taupe/30 p-6 rounded-lg text-center">
              <Award className="w-12 h-12 text-mediterranean-blue mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-lg font-bold text-espresso mb-2">{t('about.certifications.healthcare.title')}</h3>
              <p className="text-sm text-taupe">
                {t('about.certifications.healthcare.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9: CONTACT & PARTNERSHIP */}
      <section
        ref={(el) => (sectionRefs.current['contact'] = el)}
        data-section-id="contact"
        className={`w-full bg-cream py-20 px-6 transition-opacity duration-1000 ${
          visibleSections.has('contact') ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-[28px] md:text-[36px] font-bold text-espresso text-center mb-12">
            {t('about.contact.title')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: For Donors */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold text-espresso mb-4">{t('about.contact.forDonors.title')}</h3>
              <p className="text-taupe mb-6">{t('about.contact.forDonors.description')}</p>
              <button
                onClick={() => navigate('/help')}
                className="px-6 py-3 border-2 border-mediterranean-blue text-mediterranean-blue font-semibold rounded-lg hover:bg-mediterranean-blue hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-mediterranean-blue focus:ring-opacity-50"
              >
                {t('about.contact.forDonors.button')}
              </button>
            </div>

            {/* Right: For Organizations */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold text-espresso mb-4">{t('about.contact.forOrganizations.title')}</h3>
              <p className="text-taupe mb-4">
                {t('about.contact.forOrganizations.description')}
              </p>
              <p className="text-taupe mb-6 text-sm">
                {t('about.contact.forOrganizations.details')}
              </p>
              <button
                onClick={() => window.location.href = `mailto:${t('about.contact.forOrganizations.email')}`}
                className="px-6 py-3 bg-terracotta text-white font-semibold rounded-lg hover:bg-terracotta/90 transition-colors focus:outline-none focus:ring-2 focus:ring-terracotta focus:ring-opacity-50 mb-4"
              >
                {t('about.contact.forOrganizations.button')}
              </button>
              <p className="text-sm text-taupe">
                <a
                  href={`mailto:${t('about.contact.forOrganizations.email')}`}
                  className="text-mediterranean-blue hover:underline"
                >
                  {t('about.contact.forOrganizations.email')}
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 10: CALL TO ACTION */}
      <section
        ref={(el) => (sectionRefs.current['cta'] = el)}
        data-section-id="cta"
        className={`w-full bg-gradient-to-br from-terracotta to-terracotta/80 py-20 px-6 transition-opacity duration-1000 ${
          visibleSections.has('cta') ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="max-w-[1200px] mx-auto text-center">
          <h2 className="text-[32px] md:text-[40px] font-bold text-white mb-6">
            {t('about.cta.title')}
          </h2>
          <p className="text-xl text-white/90 mb-12">
            {t('about.cta.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/book')}
              className="px-8 py-4 bg-white text-terracotta font-bold text-lg rounded-lg hover:bg-cream transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 shadow-lg"
            >
              {t('about.cta.primary')}
            </button>
            <button
              onClick={() => navigate('/eligibility')}
              className="px-8 py-4 border-2 border-white text-white font-semibold text-lg rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            >
              {t('about.cta.secondary')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;


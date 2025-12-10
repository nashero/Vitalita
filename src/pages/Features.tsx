import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, TrendingUp, FileText, Shield, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const FeaturesPage = () => {
  const { t } = useTranslation();

  // Smooth scroll behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  // Scroll animations for feature sections
  const donorManagementAnim = useScrollAnimation({ threshold: 0.1, triggerOnce: true });
  const schedulingAnim = useScrollAnimation({ threshold: 0.1, triggerOnce: true });
  const communicationAnim = useScrollAnimation({ threshold: 0.1, triggerOnce: true });
  const analyticsAnim = useScrollAnimation({ threshold: 0.1, triggerOnce: true });
  const securityAnim = useScrollAnimation({ threshold: 0.1, triggerOnce: true });

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="py-12 md:py-16 lg:py-20 px-4 sm:px-6" aria-labelledby="features-hero-heading">
        <div className="max-w-[1200px] mx-auto text-center">
          {/* Badge */}
          <div className="mb-4 md:mb-6">
            <span className="inline-block px-4 py-2 text-[11px] font-semibold uppercase tracking-[1.5px] text-[#FF6B6B] border border-[#FF6B6B] rounded-full bg-transparent">
              🏥 {t('featuresPage.header.badge')}
            </span>
          </div>

          {/* H1 - Responsive */}
          <h1 
            id="features-hero-heading"
            className="text-[32px] sm:text-[36px] md:text-[40px] lg:text-[48px] font-bold leading-[1.1] text-[#1A2332] mb-4 md:mb-6"
          >
            {t('featuresPage.header.title')}
          </h1>

          {/* Subtitle */}
          <p className="text-[18px] leading-[1.6] font-normal text-[#6B7280] mb-8 max-w-4xl mx-auto">
            {t('featuresPage.header.description')}
          </p>

          {/* Trust Badges - Stack on mobile */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 mt-6 md:mt-8">
            <span className="px-4 py-2 text-sm font-medium text-[#1A2332] bg-[#F9FAFB] border border-[#6B7280] rounded-full">
              {t('featuresPage.header.tags.enterpriseCloud')}
            </span>
            <span className="px-4 py-2 text-sm font-medium text-[#1A2332] bg-[#F9FAFB] border border-[#6B7280] rounded-full">
              {t('featuresPage.header.tags.clinicalCompliance')}
            </span>
            <span className="px-4 py-2 text-sm font-medium text-[#1A2332] bg-[#F9FAFB] border border-[#6B7280] rounded-full">
              {t('featuresPage.header.tags.trustedCenters')}
            </span>
          </div>
        </div>
      </section>

      {/* Comprehensive Donor Management Section */}
      <section 
        ref={donorManagementAnim.elementRef as React.RefObject<HTMLElement>}
        className={`py-12 md:py-16 lg:py-[100px] px-4 sm:px-6 scroll-fade-in ${donorManagementAnim.isVisible ? 'visible' : ''}`}
        aria-labelledby="donor-management-heading"
      >
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-8 md:gap-12 lg:gap-[60px] items-center">
            {/* Left Column - Text Content */}
            <div className="order-2 lg:order-1 space-y-4 md:space-y-6">
              {/* Label */}
              <div>
                <span className="inline-block text-[11px] font-semibold uppercase tracking-[1.5px] text-[#FF6B6B]">
                  👤 {t('featuresPage.donorManagement.label')}
                </span>
              </div>

              {/* H2 */}
              <h2 
                id="donor-management-heading"
                className="text-[28px] md:text-[32px] lg:text-[36px] font-bold text-[#1A2332] leading-tight"
              >
                {t('featuresPage.donorManagement.title')}
              </h2>

              {/* Description */}
              <p className="text-[#6B7280] text-base leading-relaxed">
                {t('featuresPage.donorManagement.description')}
              </p>

              {/* Feature List */}
              <ul className="space-y-3 md:space-y-4">
                <li className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF6B6B] flex items-center justify-center mt-0.5 feature-checkmark">
                    <CheckCircle2 className="w-4 h-4 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-[#6B7280] text-sm md:text-base">{t('featuresPage.donorManagement.bullets.completeProfiles')}</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF6B6B] flex items-center justify-center mt-0.5 feature-checkmark">
                    <CheckCircle2 className="w-4 h-4 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-[#6B7280] text-sm md:text-base">{t('featuresPage.donorManagement.bullets.medicalHistory')}</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF6B6B] flex items-center justify-center mt-0.5 feature-checkmark">
                    <CheckCircle2 className="w-4 h-4 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-[#6B7280] text-sm md:text-base">{t('featuresPage.donorManagement.bullets.eligibilityStatus')}</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF6B6B] flex items-center justify-center mt-0.5 feature-checkmark">
                    <CheckCircle2 className="w-4 h-4 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-[#6B7280] text-sm md:text-base">{t('featuresPage.donorManagement.bullets.healthScreening')}</span>
                </li>
              </ul>

              {/* Outcome Callout Box */}
              <div className="bg-[#FEF2F2] border-l-4 border-[#FF6B6B] pl-4 pr-4 py-4 rounded-r outcome-callout">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-[#FF6B6B] flex-shrink-0 mt-0.5" />
                  <p className="text-[15px] font-semibold text-[#1A2332]">
                    {t('featuresPage.donorManagement.benefits')}
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <button 
                type="button"
                className="secondary-cta-button px-6 py-3 border border-[#6B7280] text-[#6B7280] bg-transparent rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:ring-offset-2"
              >
                {t('featuresPage.donorManagement.cta')}
              </button>
            </div>

            {/* Right Column - Dashboard Mockup */}
            <div className="order-1 lg:order-2 overflow-x-auto md:overflow-x-visible">
              <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-sm p-6" style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                {/* Card Header */}
                <div className="mb-6">
                  <span className="inline-block text-[11px] font-semibold uppercase tracking-[1.5px] text-[#FF6B6B] mb-2">
                    {t('featuresPage.donorManagement.mockup.donorProfile')}
                  </span>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-[#1A2332] mb-1">{t('featuresPage.donorManagement.mockup.donorName')}</h3>
                      <p className="text-sm text-[#6B7280]">{t('featuresPage.donorManagement.mockup.donorSubtitle')}</p>
                    </div>
                    <span className="px-3 py-1 text-xs font-semibold text-white bg-[#14B8A6] rounded-full">
                      {t('featuresPage.donorManagement.mockup.eligible')}
                    </span>
                  </div>
                </div>

                {/* Profile Fields */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between py-3 px-4 bg-[#F9FAFB] rounded-lg">
                    <span className="text-sm text-[#6B7280]">{t('featuresPage.donorManagement.mockup.bloodType')}</span>
                    <span className="text-lg font-semibold text-[#1A2332]">O+</span>
                  </div>
                  <div className="flex items-center justify-between py-3 px-4 bg-[#F9FAFB] rounded-lg">
                    <span className="text-sm text-[#6B7280]">{t('featuresPage.donorManagement.mockup.lastDonation')}</span>
                    <span className="text-base font-semibold text-[#1A2332]">15 Jan 2025</span>
                  </div>
                  <div className="flex items-center justify-between py-3 px-4 bg-[#F9FAFB] rounded-lg">
                    <span className="text-sm text-[#6B7280]">{t('featuresPage.donorManagement.mockup.nextEligible')}</span>
                    <span className="text-base font-semibold text-[#14B8A6]">29 Mar 2025</span>
                  </div>
                </div>

                {/* Automated Screening Panel */}
                <div className="bg-[#1A2332] rounded-lg p-4">
                  <span className="inline-block text-[11px] font-semibold uppercase tracking-[1.5px] text-white mb-3">
                    {t('featuresPage.donorManagement.mockup.automatedScreening')}
                  </span>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-white/80">
                      <span>{t('featuresPage.donorManagement.mockup.hbCheck')}</span>
                      <span className="flex items-center gap-1 text-[#14B8A6]">
                        <CheckCircle2 className="w-4 h-4" />
                        {t('featuresPage.donorManagement.mockup.ok')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-white/80">
                      <span>{t('featuresPage.donorManagement.mockup.travelDeferment')}</span>
                      <span className="flex items-center gap-1 text-[#14B8A6]">
                        <CheckCircle2 className="w-4 h-4" />
                        {t('featuresPage.donorManagement.mockup.ok')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Scheduling System Section */}
      <section 
        ref={schedulingAnim.elementRef as React.RefObject<HTMLElement>}
        className={`py-12 md:py-16 lg:py-[100px] px-4 sm:px-6 bg-[#F9FAFB] scroll-fade-in ${schedulingAnim.isVisible ? 'visible' : ''}`}
        aria-labelledby="scheduling-heading"
      >
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-8 md:gap-12 lg:gap-[60px] items-center">
            {/* Left Column - Dashboard Visual */}
            <div className="order-1 lg:order-1 overflow-x-auto md:overflow-x-visible">
              <div className="bg-[#1A2332] rounded-lg p-8">
                {/* Header Bar */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="inline-block text-[11px] font-semibold uppercase tracking-[1.5px] text-white mb-1">
                      {t('featuresPage.smartScheduling.mockup.today')}
                    </span>
                    <p className="text-base font-semibold text-white mt-1">{t('featuresPage.smartScheduling.mockup.romeCenter')}</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold text-white bg-[#14B8A6] rounded-full">
                    {t('featuresPage.smartScheduling.mockup.full')}
                  </span>
                </div>

                {/* Weekly Calendar View */}
                <div className="grid grid-cols-7 gap-3 mb-6">
                  {[t('appointment.monday'), t('appointment.tuesday'), t('appointment.wednesday'), t('appointment.thursday'), t('appointment.friday'), t('appointment.saturday'), t('appointment.sunday')].map((day) => (
                    <div key={day} className="flex flex-col items-center">
                      <span className="text-xs text-white/70 mb-2">{day}</span>
                      <div className="w-full bg-[#2D3748] rounded-lg p-2 flex flex-col items-center">
                        <span className="text-[10px] px-2 py-1 bg-[#14B8A6]/20 text-[#14B8A6] rounded-full font-semibold mb-2">
                          {t('featuresPage.smartScheduling.mockup.onTrack')}
                        </span>
                        <div className="w-full h-1 bg-[#14B8A6] rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Location Status Cards */}
                <div className="space-y-4">
                  {/* Card 1 */}
                  <div className="bg-[#2D3748] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">{t('featuresPage.smartScheduling.mockup.fiumicinoUnit')}</span>
                      <span className="px-2 py-1 text-[10px] font-semibold text-white bg-[#14B8A6] rounded-full">
                        {t('featuresPage.smartScheduling.mockup.noConflicts')}
                      </span>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-[#2D3748] rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">{t('featuresPage.smartScheduling.mockup.trastevereClinic')}</span>
                      <span className="text-xs font-semibold text-[#F59E0B]">
                        {t('featuresPage.smartScheduling.mockup.staffShortage')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Text Content */}
            <div className="order-2 lg:order-2 space-y-4 md:space-y-6">
              {/* Label */}
              <div>
                <span className="inline-block text-[11px] font-semibold uppercase tracking-[1.5px] text-[#FF6B6B]">
                  📅 {t('featuresPage.smartScheduling.label')}
                </span>
              </div>

              {/* H2 */}
              <h2 
                id="scheduling-heading"
                className="text-[28px] md:text-[32px] lg:text-[36px] font-bold text-[#1A2332] leading-tight"
              >
                {t('featuresPage.smartScheduling.title')}
              </h2>

              {/* Description */}
              <p className="text-[#6B7280] text-base leading-relaxed">
                {t('featuresPage.smartScheduling.description')}
              </p>

              {/* Feature List */}
              <ul className="space-y-3 md:space-y-4">
                <li className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF6B6B] flex items-center justify-center mt-0.5 feature-checkmark">
                    <CheckCircle2 className="w-4 h-4 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-[#6B7280] text-sm md:text-base">{t('featuresPage.smartScheduling.bullets.realTimeTracking')}</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF6B6B] flex items-center justify-center mt-0.5 feature-checkmark">
                    <CheckCircle2 className="w-4 h-4 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-[#6B7280] text-sm md:text-base">{t('featuresPage.smartScheduling.bullets.capacityManagement')}</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF6B6B] flex items-center justify-center mt-0.5 feature-checkmark">
                    <CheckCircle2 className="w-4 h-4 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-[#6B7280] text-sm md:text-base">{t('featuresPage.smartScheduling.bullets.multiLocation')}</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF6B6B] flex items-center justify-center mt-0.5 feature-checkmark">
                    <CheckCircle2 className="w-4 h-4 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-[#6B7280] text-sm md:text-base">{t('featuresPage.smartScheduling.bullets.conflictDetection')}</span>
                </li>
              </ul>

              {/* Outcome Callout Box */}
              <div className="bg-[#FEF2F2] border-l-4 border-[#FF6B6B] pl-4 pr-4 py-4 rounded-r outcome-callout">
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0 mt-0.5">⏱️</span>
                  <p className="text-[15px] font-semibold text-[#1A2332]">
                    {t('featuresPage.smartScheduling.benefits')}
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <button 
                type="button"
                className="secondary-cta-button px-6 py-3 border border-[#6B7280] text-[#6B7280] bg-transparent rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:ring-offset-2"
              >
                {t('featuresPage.smartScheduling.cta')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Intelligent Communication Tools Section */}
      <section 
        ref={communicationAnim.elementRef as React.RefObject<HTMLElement>}
        className={`py-12 md:py-16 lg:py-[100px] px-4 sm:px-6 bg-white scroll-fade-in ${communicationAnim.isVisible ? 'visible' : ''}`}
        aria-labelledby="communication-heading"
      >
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-8 md:gap-12 lg:gap-[60px] items-center">
            {/* Left Column - Text Content */}
            <div className="order-2 lg:order-1 space-y-4 md:space-y-6">
              {/* Label */}
              <div>
                <span className="inline-block text-[11px] font-semibold uppercase tracking-[1.5px] text-[#FF6B6B]">
                  💬 {t('featuresPage.communicationTools.label')}
                </span>
              </div>

              {/* H2 */}
              <h2 
                id="communication-heading"
                className="text-[28px] md:text-[32px] lg:text-[36px] font-bold text-[#1A2332] leading-tight"
              >
                {t('featuresPage.communicationTools.title')}
              </h2>

              {/* Description */}
              <p className="text-[#6B7280] text-base leading-relaxed">
                {t('featuresPage.communicationTools.description')}
              </p>

              {/* Feature List */}
              <ul className="space-y-3 md:space-y-4">
                <li className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF6B6B] flex items-center justify-center mt-0.5 feature-checkmark">
                    <CheckCircle2 className="w-4 h-4 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-[#6B7280] text-sm md:text-base">{t('featuresPage.communicationTools.bullets.automatedReminders')}</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF6B6B] flex items-center justify-center mt-0.5 feature-checkmark">
                    <CheckCircle2 className="w-4 h-4 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-[#6B7280] text-sm md:text-base">{t('featuresPage.communicationTools.bullets.customizableTemplates')}</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF6B6B] flex items-center justify-center mt-0.5 feature-checkmark">
                    <CheckCircle2 className="w-4 h-4 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-[#6B7280] text-sm md:text-base">{t('featuresPage.communicationTools.bullets.recallCampaigns')}</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF6B6B] flex items-center justify-center mt-0.5 feature-checkmark">
                    <CheckCircle2 className="w-4 h-4 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-[#6B7280] text-sm md:text-base">{t('featuresPage.communicationTools.bullets.emergencyBroadcasts')}</span>
                </li>
              </ul>

              {/* Outcome Callout Box */}
              <div className="bg-[#FEF2F2] border-l-4 border-[#FF6B6B] pl-4 pr-4 py-4 rounded-r outcome-callout">
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0 mt-0.5">📈</span>
                  <p className="text-[15px] font-semibold text-[#1A2332]">
                    {t('featuresPage.communicationTools.benefits')}
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <button 
                type="button"
                className="px-6 py-3 border border-[#6B7280] text-[#6B7280] bg-transparent rounded-lg font-medium hover:bg-[#F9FAFB] transition-colors"
              >
                {t('featuresPage.communicationTools.cta')}
              </button>
            </div>

            {/* Right Column - Communication Composer Mockup */}
            <div className="order-1 lg:order-2 space-y-4 md:space-y-6 overflow-x-auto md:overflow-x-visible">
              {/* Component 1 - Campaign Composer */}
              <div className="bg-[#1A2332] rounded-lg p-7">
                {/* Header */}
                <div className="mb-6">
                  <span className="inline-block text-[11px] font-semibold uppercase tracking-[1.5px] text-[#FF6B6B] mb-2">
                    {t('featuresPage.communicationTools.mockup.campaignComposer')}
                  </span>
                  <h3 className="text-lg font-semibold text-white mt-2">{t('featuresPage.communicationTools.mockup.campaignTitle')}</h3>
                </div>

                {/* Content Area */}
                <div className="space-y-4">
                  {/* Channels Selector */}
                  <div className="flex flex-wrap gap-2">
                    {t('featuresPage.communicationTools.mockup.channels').split(' • ').map((channel) => (
                      <span key={channel} className="px-3 py-1 text-xs font-medium text-white border border-white rounded-full">
                        {channel}
                      </span>
                    ))}
                  </div>

                  {/* Template Preview Box */}
                  <div className="bg-[#2D3748] rounded-lg p-4 border border-dashed border-[#FF6B6B]/30">
                    <span className="inline-block text-[11px] font-semibold uppercase tracking-[1.5px] text-[#FF6B6B] mb-2">
                      {t('featuresPage.communicationTools.mockup.reminderTemplate')}
                    </span>
                    <p className="text-sm text-white mt-2 leading-relaxed">
                      {t('featuresPage.communicationTools.mockup.templateText')}
                    </p>
                  </div>

                  {/* Automation Toggle */}
                  <div className="pt-2">
                    <p className="text-sm text-[#14B8A6] font-medium">
                      {t('featuresPage.communicationTools.mockup.automatedFollowup')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Component 2 - Live Delivery Status */}
              <div className="bg-[#1A2332] rounded-lg p-7">
                {/* Header */}
                <div className="mb-4">
                  <span className="inline-block text-[11px] font-semibold uppercase tracking-[1.5px] text-white mb-2">
                    {t('featuresPage.communicationTools.mockup.liveDeliveryStatus')}
                  </span>
                </div>

                {/* Status Items */}
                <ul className="space-y-4">
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-white/80">{t('featuresPage.communicationTools.mockup.smsSent')}</span>
                    <CheckCircle2 className="w-5 h-5 text-[#14B8A6] flex-shrink-0" />
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-white/80">{t('featuresPage.communicationTools.mockup.emailsScheduled')}</span>
                    <CheckCircle2 className="w-5 h-5 text-[#14B8A6] flex-shrink-0" />
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-sm text-white/80">{t('featuresPage.communicationTools.mockup.calendarInvitesConfirmed')}</span>
                    <CheckCircle2 className="w-5 h-5 text-[#14B8A6] flex-shrink-0" />
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Advanced Analytics Dashboard Section */}
      <section 
        ref={analyticsAnim.elementRef as React.RefObject<HTMLElement>}
        className={`py-12 md:py-16 lg:py-[100px] px-4 sm:px-6 bg-[#F9FAFB] scroll-fade-in ${analyticsAnim.isVisible ? 'visible' : ''}`}
        aria-labelledby="analytics-heading"
      >
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-8 md:gap-12 lg:gap-[60px] items-center">
            {/* Left Column - Analytics Dashboard */}
            <div className="order-1 lg:order-1 overflow-x-auto md:overflow-x-visible">
              <div className="space-y-6">
                {/* Component 1 - Performance Card */}
                <div className="bg-[#1A2332] rounded-lg p-8">
                  {/* Header Area */}
                  <div className="mb-6">
                    <span className="inline-block text-[11px] font-semibold uppercase tracking-[1.5px] text-[#FF6B6B] mb-2">
                      {t('featuresPage.analyticsDashboard.mockup.dashboard')}
                    </span>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">{t('featuresPage.analyticsDashboard.mockup.nationalPerformance')}</h3>
                      <span className="flex items-center gap-1.5 text-sm text-[#14B8A6] font-medium">
                        <span className="w-2 h-2 bg-[#14B8A6] rounded-full live-indicator"></span>
                        {t('featuresPage.analyticsDashboard.mockup.live')}
                      </span>
                    </div>
                  </div>

                  {/* Main Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Main Metric Card */}
                    <div className="bg-[#2D3748] rounded-lg p-6">
                      <span className="inline-block text-[11px] font-semibold uppercase tracking-[1.5px] text-white/70 mb-4">
                        {t('featuresPage.analyticsDashboard.mockup.donations')}
                      </span>
                      <p className="text-[48px] font-bold text-white leading-none mb-2">+18%</p>
                      <p className="text-xs text-white/60 mb-4">{t('featuresPage.analyticsDashboard.mockup.vsPrevious')}</p>
                      <div className="flex items-center justify-between text-xs text-white/80 pt-4 border-t border-white/10">
                        <span>{t('featuresPage.analyticsDashboard.mockup.unitsCollected')}</span>
                        <span>{t('featuresPage.analyticsDashboard.mockup.forecast')}: 820</span>
                      </div>
                    </div>

                    {/* Component 2 - Inventory Forecast */}
                    <div className="bg-[#2D3748] rounded-lg p-6">
                      <span className="inline-block text-[11px] font-semibold uppercase tracking-[1.5px] text-white/70 mb-4">
                        {t('featuresPage.analyticsDashboard.mockup.inventoryForecast')}
                      </span>
                      <div className="space-y-3">
                        {/* O+ Row */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs text-white/80">
                            <span>O+</span>
                            <span>{t('featuresPage.analyticsDashboard.mockup.safeFor')} 8 {t('featuresPage.analyticsDashboard.mockup.days')}</span>
                          </div>
                          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-[#14B8A6] rounded-full progress-bar-animate" style={{ width: '78%' }}></div>
                          </div>
                        </div>

                        {/* A+ Row */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs text-white/80">
                            <span>A+</span>
                            <span>{t('featuresPage.analyticsDashboard.mockup.safeFor')} 8 {t('featuresPage.analyticsDashboard.mockup.days')}</span>
                          </div>
                          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-[#14B8A6] rounded-full progress-bar-animate" style={{ width: '65%' }}></div>
                          </div>
                        </div>

                        {/* B+ Row */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs text-white/80">
                            <span>B+</span>
                            <span>{t('featuresPage.analyticsDashboard.mockup.safeFor')} 8 {t('featuresPage.analyticsDashboard.mockup.days')}</span>
                          </div>
                          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-[#F59E0B] rounded-full progress-bar-animate" style={{ width: '45%' }}></div>
                          </div>
                        </div>

                        {/* AB+ Row */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs text-white/80">
                            <span>AB+</span>
                            <span>{t('featuresPage.analyticsDashboard.mockup.safeFor')} 8 {t('featuresPage.analyticsDashboard.mockup.days')}</span>
                          </div>
                          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-[#F59E0B] rounded-full progress-bar-animate" style={{ width: '35%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Component 3 - Report Generation */}
                <div className="bg-white rounded-lg p-6 border border-[#E5E7EB] shadow-sm mt-6">
                  <span className="inline-block text-[11px] font-semibold uppercase tracking-[1.5px] text-[#FF6B6B] mb-3">
                    {t('featuresPage.analyticsDashboard.mockup.customReportGeneration')}
                  </span>
                  <p className="text-sm text-[#6B7280] leading-relaxed mb-4">
                    {t('featuresPage.analyticsDashboard.mockup.exportDescription')}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                    <FileText className="w-4 h-4 text-[#FF6B6B]" />
                    <span>{t('featuresPage.analyticsDashboard.mockup.reportFile')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Text Content */}
            <div className="order-2 lg:order-2 space-y-4 md:space-y-6">
              {/* Label */}
              <div>
                <span className="inline-block text-[11px] font-semibold uppercase tracking-[1.5px] text-[#FF6B6B]">
                  📊 {t('featuresPage.analyticsDashboard.label')}
                </span>
              </div>

              {/* H2 */}
              <h2 
                id="analytics-heading"
                className="text-[28px] md:text-[32px] lg:text-[36px] font-bold text-[#1A2332] leading-tight"
              >
                {t('featuresPage.analyticsDashboard.title')}
              </h2>

              {/* Description */}
              <p className="text-[#6B7280] text-base leading-relaxed">
                {t('featuresPage.analyticsDashboard.description')}
              </p>

              {/* Feature List */}
              <ul className="space-y-3 md:space-y-4">
                <li className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF6B6B] flex items-center justify-center mt-0.5 feature-checkmark">
                    <CheckCircle2 className="w-4 h-4 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-[#6B7280] text-sm md:text-base">{t('featuresPage.analyticsDashboard.bullets.realTimeMetrics')}</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF6B6B] flex items-center justify-center mt-0.5 feature-checkmark">
                    <CheckCircle2 className="w-4 h-4 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-[#6B7280] text-sm md:text-base">{t('featuresPage.analyticsDashboard.bullets.demographicInsights')}</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF6B6B] flex items-center justify-center mt-0.5 feature-checkmark">
                    <CheckCircle2 className="w-4 h-4 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-[#6B7280] text-sm md:text-base">{t('featuresPage.analyticsDashboard.bullets.centerPerformance')}</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF6B6B] flex items-center justify-center mt-0.5 feature-checkmark">
                    <CheckCircle2 className="w-4 h-4 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-[#6B7280] text-sm md:text-base">{t('featuresPage.analyticsDashboard.bullets.inventoryForecasting')}</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF6B6B] flex items-center justify-center mt-0.5 feature-checkmark">
                    <CheckCircle2 className="w-4 h-4 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-[#6B7280] text-sm md:text-base">{t('featuresPage.analyticsDashboard.bullets.customReports')}</span>
                </li>
              </ul>

              {/* Outcome Callout Box */}
              <div className="bg-[#FEF2F2] border-l-4 border-[#FF6B6B] pl-4 pr-4 py-4 rounded-r outcome-callout">
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0 mt-0.5">🎯</span>
                  <p className="text-[15px] font-semibold text-[#1A2332]">
                    {t('featuresPage.analyticsDashboard.benefits')}
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <button 
                type="button"
                className="px-6 py-3 border border-[#6B7280] text-[#6B7280] bg-transparent rounded-lg font-medium hover:bg-white transition-colors"
              >
                {t('featuresPage.analyticsDashboard.cta')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Integration & Security Section */}
      <section 
        ref={securityAnim.elementRef as React.RefObject<HTMLElement>}
        className={`py-12 md:py-16 lg:py-[100px] px-4 sm:px-6 bg-white scroll-fade-in ${securityAnim.isVisible ? 'visible' : ''}`}
        aria-labelledby="security-heading"
      >
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-8 md:gap-12 lg:gap-[60px] items-center">
            {/* Left Column - Text Content */}
            <div className="order-2 lg:order-1 space-y-4 md:space-y-6">
              {/* Label */}
              <div>
                <span className="inline-block text-[11px] font-semibold uppercase tracking-[1.5px] text-[#FF6B6B]">
                  🔒 {t('featuresPage.integrationSecurity.label')}
                </span>
              </div>

              {/* H2 */}
              <h2 
                id="security-heading"
                className="text-[28px] md:text-[32px] lg:text-[36px] font-bold text-[#1A2332] leading-tight"
              >
                {t('featuresPage.integrationSecurity.title')}
              </h2>

              {/* Description */}
              <p className="text-[#6B7280] text-base leading-relaxed">
                {t('featuresPage.integrationSecurity.description')}
              </p>

              {/* Feature List */}
              <ul className="space-y-3 md:space-y-4">
                <li className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF6B6B] flex items-center justify-center mt-0.5 feature-checkmark">
                    <CheckCircle2 className="w-4 h-4 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-[#6B7280] text-sm md:text-base">{t('featuresPage.integrationSecurity.bullets.medicalRecordIntegration')}</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF6B6B] flex items-center justify-center mt-0.5 feature-checkmark">
                    <CheckCircle2 className="w-4 h-4 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-[#6B7280] text-sm md:text-base">{t('featuresPage.integrationSecurity.bullets.gdprCompliant')}</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF6B6B] flex items-center justify-center mt-0.5 feature-checkmark">
                    <CheckCircle2 className="w-4 h-4 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-[#6B7280] text-sm md:text-base">{t('featuresPage.integrationSecurity.bullets.encryptedStorage')}</span>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF6B6B] flex items-center justify-center mt-0.5 feature-checkmark">
                    <CheckCircle2 className="w-4 h-4 text-white" aria-hidden="true" />
                  </div>
                  <span className="text-[#6B7280] text-sm md:text-base">{t('featuresPage.integrationSecurity.bullets.roleBasedAccess')}</span>
                </li>
              </ul>

              {/* Outcome Callout Box */}
              <div className="bg-[#FEF2F2] border-l-4 border-[#FF6B6B] pl-4 pr-4 py-4 rounded-r outcome-callout">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#FF6B6B] flex-shrink-0 mt-0.5" />
                  <p className="text-[15px] font-semibold text-[#1A2332]">
                    {t('featuresPage.integrationSecurity.benefits')}
                  </p>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="px-3 py-2 text-xs font-medium text-[#1A2332] border border-[#E5E7EB] rounded-lg text-center">
                  {t('featuresPage.integrationSecurity.trustBadges.gdprCompliant')}
                </div>
                <div className="px-3 py-2 text-xs font-medium text-[#1A2332] border border-[#E5E7EB] rounded-lg text-center">
                  {t('featuresPage.integrationSecurity.trustBadges.iso27001')}
                </div>
                <div className="px-3 py-2 text-xs font-medium text-[#1A2332] border border-[#E5E7EB] rounded-lg text-center">
                  {t('featuresPage.integrationSecurity.trustBadges.aes256')}
                </div>
                <div className="px-3 py-2 text-xs font-medium text-[#1A2332] border border-[#E5E7EB] rounded-lg text-center">
                  {t('featuresPage.integrationSecurity.trustBadges.euHealthcare')}
                </div>
              </div>

              {/* CTA Button */}
              <button 
                type="button"
                className="px-6 py-3 border border-[#6B7280] text-[#6B7280] bg-transparent rounded-lg font-medium hover:bg-[#F9FAFB] transition-colors"
              >
                {t('featuresPage.integrationSecurity.cta')}
              </button>
            </div>

            {/* Right Column - Security Dashboard */}
            <div className="order-1 lg:order-2 overflow-x-auto md:overflow-x-visible">
              <div 
                className="rounded-lg p-8 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(to bottom, #1A2332, #111827)',
                  boxShadow: '0 0 40px rgba(255, 107, 107, 0.05), inset 0 0 40px rgba(255, 107, 107, 0.02)'
                }}
              >
                {/* Header */}
                <div className="mb-6 relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-block text-[11px] font-semibold uppercase tracking-[1.5px] text-[#FF6B6B] mb-2">
                        {t('featuresPage.integrationSecurity.mockup.securityCenter')}
                      </span>
                      <h3 className="text-xl font-semibold text-white">{t('featuresPage.integrationSecurity.mockup.accessOverview')}</h3>
                    </div>
                    <Shield className="w-6 h-6 text-[#14B8A6] flex-shrink-0" />
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="space-y-4 mb-6 relative z-10">
                  {/* Card 1 */}
                  <div className="bg-white/10 rounded-lg p-4 flex items-center justify-between">
                    <span className="text-sm text-white/80">{t('featuresPage.integrationSecurity.mockup.encryptedAtRest')}</span>
                    <span className="px-2 py-1 text-[10px] font-semibold text-white bg-[#14B8A6] rounded-full status-badge-pulse">
                      {t('featuresPage.integrationSecurity.mockup.aes256')}
                    </span>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-white/10 rounded-lg p-4 flex items-center justify-between">
                    <span className="text-sm text-white/80">{t('featuresPage.integrationSecurity.mockup.gdprProcessingLog')}</span>
                    <span className="px-2 py-1 text-xs font-semibold text-white bg-[#14B8A6] rounded-full status-badge-pulse">
                      {t('featuresPage.integrationSecurity.mockup.compliant')}
                    </span>
                  </div>
                </div>

                {/* Role Matrix Section */}
                <div className="mb-6 relative z-10">
                  <span className="inline-block text-[11px] font-semibold uppercase tracking-[1.5px] text-white mb-3">
                    {t('featuresPage.integrationSecurity.mockup.roleMatrix')}
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-[#2D3748] rounded-lg p-3 text-center">
                      <p className="text-xs font-semibold text-white mb-1">{t('featuresPage.integrationSecurity.mockup.admin')}</p>
                      <p className="text-[10px] text-white/60">{t('featuresPage.integrationSecurity.mockup.samlSso')}</p>
                    </div>
                    <div className="bg-[#2D3748] rounded-lg p-3 text-center">
                      <p className="text-xs font-semibold text-white mb-1">{t('featuresPage.integrationSecurity.mockup.coordinator')}</p>
                      <p className="text-[10px] text-white/60">{t('featuresPage.integrationSecurity.mockup.samlSso')}</p>
                    </div>
                    <div className="bg-[#2D3748] rounded-lg p-3 text-center">
                      <p className="text-xs font-semibold text-white mb-1">{t('featuresPage.integrationSecurity.mockup.volunteer')}</p>
                      <p className="text-[10px] text-white/60">{t('featuresPage.integrationSecurity.mockup.samlSso')}</p>
                    </div>
                  </div>
                </div>

                {/* Integration Status */}
                <div className="relative z-10">
                  <div className="bg-white/10 rounded-lg p-4 flex items-center justify-between">
                    <span className="text-sm text-white/80">{t('featuresPage.integrationSecurity.mockup.hospitalEhrSync')}</span>
                    <span className="flex items-center gap-1.5 text-sm text-[#14B8A6] font-medium">
                      <span className="w-2 h-2 bg-[#14B8A6] rounded-full live-indicator"></span>
                      {t('featuresPage.integrationSecurity.mockup.live')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-12 md:py-16 lg:py-20 px-4 sm:px-6 bg-[#FEF2F2]" aria-labelledby="cta-heading">
        <div className="max-w-[800px] mx-auto text-center">
          {/* Label */}
          <div className="mb-4">
            <span className="inline-block text-[11px] font-semibold uppercase tracking-[1.5px] text-[#FF6B6B]">
              🎯 {t('featuresPage.cta.badge')}
            </span>
          </div>

          {/* H2 */}
          <h2 
            id="cta-heading"
            className="text-[28px] md:text-[36px] lg:text-[40px] font-bold text-[#1A2332] leading-tight mb-4"
          >
            {t('featuresPage.cta.title')}
          </h2>

          {/* Description */}
          <p className="text-[#6B7280] text-base leading-relaxed mb-6">
            {t('featuresPage.cta.description')}
          </p>

          {/* Pill Tags */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            <span className="px-3 py-1 text-xs font-medium text-[#1A2332] bg-white border border-[#6B7280] rounded-full">
              {t('featuresPage.cta.tags.liveWalkthrough')}
            </span>
            <span className="px-3 py-1 text-xs font-medium text-[#1A2332] bg-white border border-[#6B7280] rounded-full">
              {t('featuresPage.cta.tags.integration')}
            </span>
            <span className="px-3 py-1 text-xs font-medium text-[#1A2332] bg-white border border-[#6B7280] rounded-full">
              {t('featuresPage.cta.tags.security')}
            </span>
          </div>

          {/* CTA Button */}
          <Link
            to="/contact"
            className="primary-cta-button inline-block px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold text-white bg-[#FF6B6B] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:ring-offset-2"
          >
            {t('featuresPage.cta.button')}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E5E7EB] py-12 md:py-16 lg:py-[60px] px-4 sm:px-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Four Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 mb-8">
            {/* Column 1 - Branding */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-6 h-6 text-[#FF6B6B]" fill="#FF6B6B" />
                <span className="text-xl font-bold text-[#1A2332]">Vitalita</span>
              </div>
              <p className="text-sm text-[#6B7280] font-medium mb-2">{t('footer.poweredBy')}</p>
              <p className="text-sm text-[#6B7280] font-semibold mb-3">{t('footer.platformDescription')}</p>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                {t('footer.description')}
              </p>
            </div>

            {/* Column 2 - Product */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[1.5px] text-[#6B7280] mb-4">
                {t('footer.sections.product')}
              </h3>
              <nav className="space-y-3" aria-label="Product navigation">
                <Link to="/features" className="block text-sm text-[#6B7280] hover:text-[#FF6B6B] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:ring-offset-2 rounded">
                  {t('footer.links.features')}
                </Link>
                <Link to="/how-it-works" className="block text-sm text-[#6B7280] hover:text-[#FF6B6B] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:ring-offset-2 rounded">
                  {t('footer.links.howItWorks')}
                </Link>
                <Link to="/case-studies" className="block text-sm text-[#6B7280] hover:text-[#FF6B6B] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:ring-offset-2 rounded">
                  {t('footer.links.caseStudies')}
                </Link>
              </nav>
            </div>

            {/* Column 3 - Company */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[1.5px] text-[#6B7280] mb-4">
                {t('footer.sections.company')}
              </h3>
              <nav className="space-y-3" aria-label="Company navigation">
                <Link to="/contact" className="block text-sm text-[#6B7280] hover:text-[#FF6B6B] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:ring-offset-2 rounded">
                  {t('footer.links.contact')}
                </Link>
                <a href="#" className="block text-sm text-[#6B7280] hover:text-[#FF6B6B] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:ring-offset-2 rounded">
                  {t('footer.links.partnerships')}
                </a>
                <a href="#" className="block text-sm text-[#6B7280] hover:text-[#FF6B6B] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:ring-offset-2 rounded">
                  {t('footer.links.newsroom')}
                </a>
                <a href="#" className="block text-sm text-[#6B7280] hover:text-[#FF6B6B] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:ring-offset-2 rounded">
                  {t('footer.links.careers')}
                </a>
              </nav>
            </div>

            {/* Column 4 - Portals */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[1.5px] text-[#6B7280] mb-4">
                {t('footer.sections.portals')}
              </h3>
              <nav className="space-y-3" aria-label="Portals navigation">
                <a href="#" className="block text-sm text-[#6B7280] hover:text-[#FF6B6B] transition-colors">
                  {t('footer.links.donorPortal')}
                </a>
                <a href="#" className="block text-sm text-[#6B7280] hover:text-[#FF6B6B] transition-colors">
                  {t('footer.links.coordinatorConsole')}
                </a>
                <a href="#" className="block text-sm text-[#6B7280] hover:text-[#FF6B6B] transition-colors">
                  {t('footer.links.staffPortal')}
                </a>
                <a href="#" className="block text-sm text-[#6B7280] hover:text-[#FF6B6B] transition-colors">
                  {t('footer.links.developerApi')}
                </a>
              </nav>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="pt-8 mt-8 border-t border-[#E5E7EB]">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-[#6B7280]">
                © 2025 Vitalita. {t('footer.copyright')}
              </p>
              <nav className="flex flex-wrap items-center gap-6" aria-label="Legal navigation">
                <a href="#" className="text-sm text-[#6B7280] hover:text-[#FF6B6B] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:ring-offset-2 rounded">
                  {t('footer.links.privacyPolicy')}
                </a>
                <a href="#" className="text-sm text-[#6B7280] hover:text-[#FF6B6B] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:ring-offset-2 rounded">
                  {t('footer.links.termsOfService')}
                </a>
                <a href="#" className="text-sm text-[#6B7280] hover:text-[#FF6B6B] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6B6B] focus:ring-offset-2 rounded">
                  {t('footer.links.security')}
                </a>
              </nav>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FeaturesPage;


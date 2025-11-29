import { Link } from 'react-router-dom';
import { Activity, BarChart3, CalendarRange, CheckCircle2, FileLock2, Layers, MailCheck, ShieldCheck, Users2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FeaturesPage = () => {
  const { t } = useTranslation();

  const features = [
  {
    id: 'smart-scheduling',
    title: t('featuresPage.features.smartScheduling.title'),
    icon: CalendarRange,
    description: t('featuresPage.features.smartScheduling.description'),
    bullets: [
      t('featuresPage.features.smartScheduling.bullets.realTimeTracking'),
      t('featuresPage.features.smartScheduling.bullets.capacityManagement'),
      t('featuresPage.features.smartScheduling.bullets.multiLocation'),
      t('featuresPage.features.smartScheduling.bullets.conflictDetection'),
    ],
    benefits: t('featuresPage.features.smartScheduling.benefits'),
    mockup: (
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-red-500/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{t('featuresPage.features.smartScheduling.mockup.today')}</p>
            <p className="text-lg font-semibold text-slate-900">{t('featuresPage.features.smartScheduling.mockup.romeCenter')}</p>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">92% {t('featuresPage.features.smartScheduling.mockup.full')}</span>
        </div>
        <div className="mt-6 grid grid-cols-7 gap-2 text-xs text-slate-500">
          {[t('appointment.monday'), t('appointment.tuesday'), t('appointment.wednesday'), t('appointment.thursday'), t('appointment.friday'), t('appointment.saturday'), t('appointment.sunday')].map((day) => (
            <div key={day} className="flex flex-col items-center rounded-xl border border-slate-100 bg-slate-50 py-3">
              <span className="font-medium text-slate-600">{day}</span>
              <span className="mt-2 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-600">
                {t('featuresPage.features.smartScheduling.mockup.onTrack')}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-2 text-xs font-medium text-slate-500">
          <div className="flex items-center justify-between rounded-2xl bg-slate-900/90 px-4 py-3 text-white">
            <span>Fiumicino Mobile Unit</span>
            <span className="text-emerald-300">{t('featuresPage.features.smartScheduling.mockup.noConflicts')}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-red-50 px-4 py-3 text-red-600">
            <span>Trastevere Clinic</span>
            <span>{t('featuresPage.features.smartScheduling.mockup.staffShortage')}</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'donor-management',
    title: t('featuresPage.features.donorManagement.title'),
    icon: Users2,
    description: t('featuresPage.features.donorManagement.description'),
    bullets: [
      t('featuresPage.features.donorManagement.bullets.completeProfiles'),
      t('featuresPage.features.donorManagement.bullets.medicalHistory'),
      t('featuresPage.features.donorManagement.bullets.eligibilityStatus'),
      t('featuresPage.features.donorManagement.bullets.healthScreening'),
    ],
    benefits: t('featuresPage.features.donorManagement.benefits'),
    mockup: (
      <div className="rounded-3xl border border-slate-100 bg-gradient-to-br from-white via-slate-50 to-red-50 p-6 shadow-lg shadow-red-500/10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{t('featuresPage.features.donorManagement.mockup.donorProfile')}</p>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">Giulia Rossi</h3>
            <p className="text-xs text-slate-500">{t('featuresPage.features.donorManagement.mockup.donated')} 11 {t('featuresPage.features.donorManagement.mockup.times')} • Rome</p>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{t('featuresPage.features.donorManagement.mockup.eligible')}</span>
        </div>
        <dl className="mt-6 space-y-3">
          <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
            <dt className="font-medium text-slate-500">{t('featuresPage.features.donorManagement.mockup.bloodType')}</dt>
            <dd className="font-semibold text-slate-900">O+</dd>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
            <dt className="font-medium text-slate-500">{t('featuresPage.features.donorManagement.mockup.lastDonation')}</dt>
            <dd className="font-semibold text-slate-900">15 Jan 2025</dd>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
            <dt className="font-medium text-slate-500">{t('featuresPage.features.donorManagement.mockup.nextEligible')}</dt>
            <dd className="font-semibold text-emerald-600">29 Mar 2025</dd>
          </div>
        </dl>
        <div className="mt-6 rounded-2xl bg-slate-900/90 p-4 text-xs text-white">
          <p className="font-semibold uppercase tracking-[0.3em] text-slate-300">{t('featuresPage.features.donorManagement.mockup.automatedScreening')}</p>
          <div className="mt-3 space-y-2">
            <p className="flex items-center justify-between text-white/80">
              Hb Check • 13.8 g/dL <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-300">{t('featuresPage.features.donorManagement.mockup.ok')}</span>
            </p>
            <p className="flex items-center justify-between text-white/80">
              Travel Deferment • Cleared <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-300">{t('featuresPage.features.donorManagement.mockup.ok')}</span>
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'communication-tools',
    title: t('featuresPage.features.communicationTools.title'),
    icon: MailCheck,
    description: t('featuresPage.features.communicationTools.description'),
    bullets: [
      t('featuresPage.features.communicationTools.bullets.automatedReminders'),
      t('featuresPage.features.communicationTools.bullets.customizableTemplates'),
      t('featuresPage.features.communicationTools.bullets.recallCampaigns'),
      t('featuresPage.features.communicationTools.bullets.emergencyBroadcasts'),
    ],
    benefits: t('featuresPage.features.communicationTools.benefits'),
    mockup: (
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg shadow-red-500/10">
        <div className="border-b border-slate-100 bg-slate-900 px-6 py-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-300">{t('featuresPage.features.communicationTools.mockup.campaignComposer')}</p>
          <h3 className="mt-1 text-lg font-semibold">AVIS Rome - Weekend Recall</h3>
        </div>
        <div className="grid gap-6 p-6 lg:grid-cols-2">
          <div className="space-y-4 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span className="font-medium text-slate-500">{t('featuresPage.features.communicationTools.mockup.channels')}</span>
              <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                Email • SMS • Calendar
              </span>
            </div>
            <div className="rounded-2xl border border-dashed border-red-200 bg-red-50/60 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-400">{t('featuresPage.features.communicationTools.mockup.reminderTemplate')}</p>
              <p className="mt-2 font-medium text-slate-700">
                Ciao {`{donor_first_name}`}, ci vediamo sabato alle 09:30 presso AVIS Roma - Via Veneto.
              </p>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
              <span>{t('featuresPage.features.communicationTools.mockup.automatedFollowup')}</span>
              <span className="rounded-full bg-white px-2 py-1 font-semibold text-emerald-600">+40% {t('featuresPage.features.communicationTools.mockup.attendance')}</span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-900 p-4 text-xs text-white shadow-inner">
            <p className="font-semibold uppercase tracking-[0.4em] text-slate-300">{t('featuresPage.features.communicationTools.mockup.liveDeliveryStatus')}</p>
            <ul className="mt-4 space-y-3">
              {[
                `${t('featuresPage.features.communicationTools.mockup.smsSent')} • 1,248 ${t('featuresPage.features.communicationTools.mockup.donors')}`,
                `${t('featuresPage.features.communicationTools.mockup.emailsScheduled')} • 1,248`,
                `${t('featuresPage.features.communicationTools.mockup.calendarInvitesConfirmed')} • 842`
              ].map(
                (item) => (
                  <li key={item} className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
                    <span>{item}</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'analytics-dashboard',
    title: t('featuresPage.features.analyticsDashboard.title'),
    icon: BarChart3,
    description: t('featuresPage.features.analyticsDashboard.description'),
    bullets: [
      t('featuresPage.features.analyticsDashboard.bullets.realTimeMetrics'),
      t('featuresPage.features.analyticsDashboard.bullets.demographicInsights'),
      t('featuresPage.features.analyticsDashboard.bullets.centerPerformance'),
      t('featuresPage.features.analyticsDashboard.bullets.inventoryForecasting'),
      t('featuresPage.features.analyticsDashboard.bullets.customReports'),
    ],
    benefits: t('featuresPage.features.analyticsDashboard.benefits'),
    mockup: (
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-red-500/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{t('featuresPage.features.analyticsDashboard.mockup.dashboard')}</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">{t('featuresPage.features.analyticsDashboard.mockup.nationalPerformance')}</h3>
          </div>
          <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
            <Activity className="h-3.5 w-3.5" />
            {t('featuresPage.features.analyticsDashboard.mockup.live')}
          </span>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-900 p-5 text-white">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-300">{t('featuresPage.features.analyticsDashboard.mockup.donations')}</p>
            <p className="mt-4 text-3xl font-semibold">+18%</p>
            <p className="mt-2 text-xs text-white/70">{t('featuresPage.features.analyticsDashboard.mockup.vsPrevious')}</p>
            <div className="mt-6 flex items-center justify-between text-xs text-white/80">
              <span>785 {t('featuresPage.features.analyticsDashboard.mockup.unitsCollected')}</span>
              <span>{t('featuresPage.features.analyticsDashboard.mockup.forecast')}: 820</span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{t('featuresPage.features.analyticsDashboard.mockup.inventoryForecast')}</p>
            <div className="mt-4 space-y-3">
              {['O+', 'A+', 'B+', 'AB-'].map((type) => (
                <div key={type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{type}</span>
                    <span>{t('featuresPage.features.analyticsDashboard.mockup.safeFor')} 8 {t('featuresPage.features.analyticsDashboard.mockup.days')}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200">
                    <div className="h-2 rounded-full bg-red-500" style={{ width: type === 'O+' ? '78%' : '54%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-2 rounded-2xl border border-dashed border-red-200 bg-red-50/60 p-5 text-xs text-slate-600">
            <p className="font-semibold uppercase tracking-[0.3em] text-red-400">{t('featuresPage.features.analyticsDashboard.mockup.customReportGeneration')}</p>
            <p className="mt-3 text-sm text-slate-600">
              {t('featuresPage.features.analyticsDashboard.mockup.exportDescription')}
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'integration-security',
    title: t('featuresPage.features.integrationSecurity.title'),
    icon: ShieldCheck,
    description: t('featuresPage.features.integrationSecurity.description'),
    bullets: [
      t('featuresPage.features.integrationSecurity.bullets.medicalRecordIntegration'),
      t('featuresPage.features.integrationSecurity.bullets.gdprCompliant'),
      t('featuresPage.features.integrationSecurity.bullets.encryptedStorage'),
      t('featuresPage.features.integrationSecurity.bullets.roleBasedAccess'),
    ],
    benefits: t('featuresPage.features.integrationSecurity.benefits'),
    mockup: (
      <div className="rounded-3xl border border-slate-100 bg-gradient-to-br from-slate-900 via-slate-800 to-red-800 p-6 text-white shadow-xl shadow-red-500/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-red-200">{t('featuresPage.features.integrationSecurity.mockup.securityCenter')}</p>
            <h3 className="mt-1 text-lg font-semibold text-white">{t('featuresPage.features.integrationSecurity.mockup.accessOverview')}</h3>
          </div>
          <ShieldCheck className="h-6 w-6 text-emerald-300" />
        </div>
        <div className="mt-6 grid gap-4 text-xs">
          <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
            <span className="text-white/80">{t('featuresPage.features.integrationSecurity.mockup.encryptedAtRest')}</span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-300">
              AES-256
            </span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
            <span className="text-white/80">{t('featuresPage.features.integrationSecurity.mockup.gdprProcessingLog')}</span>
            <span className="rounded-full bg-white/10 px-2 py-1 font-semibold text-white">{t('featuresPage.features.integrationSecurity.mockup.compliant')}</span>
          </div>
          <div className="rounded-2xl bg-black/30 p-4">
            <p className="text-[10px] uppercase tracking-[0.4em] text-red-200">{t('featuresPage.features.integrationSecurity.mockup.roleMatrix')}</p>
            <div className="mt-3 grid grid-cols-3 gap-3 text-[10px]">
              {['Admin', 'Coordinator', 'Volunteer'].map((role) => (
                <div key={role} className="rounded-xl bg-white/10 p-3 text-center">
                  <p className="font-semibold text-white">{role}</p>
                  <p className="mt-2 text-white/60">SAML • SSO {t('featuresPage.features.integrationSecurity.mockup.enforced')}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
            <span className="text-white/80">{t('featuresPage.features.integrationSecurity.mockup.hospitalEhrSync')}</span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-1 font-semibold text-emerald-300">{t('featuresPage.features.analyticsDashboard.mockup.live')}</span>
          </div>
        </div>
      </div>
    ),
  },
];
  return (
    <div className="bg-slate-50">
      <section className="relative overflow-hidden bg-white">
        <div className="section-container relative z-10 flex flex-col items-start gap-4 py-12 sm:py-16">
          <span className="flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-red-600">
            <Layers className="h-3.5 w-3.5 text-red-500" />
            {t('featuresPage.header.badge')}
          </span>
          <div className="max-w-3xl space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
              {t('featuresPage.header.title')}
            </h1>
            <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
              {t('featuresPage.header.description')}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-medium text-slate-500">
            <span className="rounded-full border border-slate-200 px-3 py-1">{t('featuresPage.header.tags.enterpriseCloud')}</span>
            <span className="rounded-full border border-slate-200 px-3 py-1">{t('featuresPage.header.tags.clinicalCompliance')}</span>
            <span className="rounded-full border border-slate-200 px-3 py-1">{t('featuresPage.header.tags.trustedCenters')}</span>
          </div>
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-red-100 via-white to-slate-100" />
        <div className="absolute -right-24 top-20 -z-10 h-64 w-64 rounded-full bg-red-200/40 blur-3xl" />
        <div className="absolute bottom-10 left-20 -z-10 h-40 w-40 rounded-full bg-red-300/30 blur-3xl" />
      </section>

      <section className="section-container space-y-12 py-12 sm:py-16">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          const isOdd = index % 2 !== 0;

          return (
            <div
              key={feature.id}
              className="rounded-[32px] border border-slate-200 bg-white/80 p-6 sm:p-8 shadow-sm shadow-red-200/20 backdrop-blur-sm transition duration-300 hover:shadow-xl"
            >
              <div className="grid items-center gap-8 lg:grid-cols-2">
                <div className={`space-y-4 ${isOdd ? 'lg:order-2' : ''}`}>
                  <div className="flex items-center gap-3 rounded-full bg-red-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-red-600">
                    <Icon className="h-4 w-4 text-red-500" />
                    {feature.title}
                  </div>
                  <p className="text-2xl font-semibold tracking-tight text-slate-900">{feature.title}</p>
                  <p className="text-base leading-relaxed text-slate-600">{feature.description}</p>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {feature.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                    <FileLock2 className="h-4 w-4" />
                    {feature.benefits}
                  </div>
                </div>
                <div className={`relative ${isOdd ? 'lg:order-1' : ''}`}>
                  <div className={`pointer-events-none absolute -inset-6 rounded-[36px] bg-gradient-to-br from-red-200/40 via-transparent to-slate-200/30 ${isOdd ? 'lg:-left-10 lg:right-0' : ''}`} />
                  <div className="relative">{feature.mockup}</div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="section-container pb-12 sm:pb-16">
        <div className="relative overflow-hidden rounded-[40px] border border-slate-200 bg-gradient-to-br from-red-50 via-white to-slate-50 px-6 py-10 sm:px-10 sm:py-12 shadow-xl shadow-red-100/50">
          <div className="grid items-center gap-8 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-600">{t('featuresPage.cta.badge')}</p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{t('featuresPage.cta.title')}</h2>
              <p className="text-sm leading-relaxed text-slate-600">
                {t('featuresPage.cta.description')}
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                <span className="rounded-full border border-red-200 bg-white/80 px-3 py-1">{t('featuresPage.cta.tags.liveWalkthrough')}</span>
                <span className="rounded-full border border-red-200 bg-white/80 px-3 py-1">{t('featuresPage.cta.tags.integration')}</span>
                <span className="rounded-full border border-red-200 bg-white/80 px-3 py-1">{t('featuresPage.cta.tags.security')}</span>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-[12px] bg-gradient-to-r from-red-500 via-orange-500 to-red-600 px-10 py-5 text-base font-semibold text-white shadow-lg shadow-red-500/30 transition hover:from-red-600 hover:via-orange-600 hover:to-red-700 hover:shadow-xl hover:shadow-red-500/40 hover:-translate-y-0.5"
              >
                {t('featuresPage.cta.button')}
              </Link>
            </div>
          </div>
          <div className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-red-200/30 blur-3xl" />
          <div className="pointer-events-none absolute left-0 top-0 h-40 w-40 rounded-full bg-red-100/40 blur-3xl" />
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;


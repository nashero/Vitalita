import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Scale,
  Heart,
  CreditCard,
  Clock,
  Activity,
  CheckCircle,
  Info,
  Thermometer,
  Pill,
  Smile,
  Scissors,
  Plane,
  Syringe,
  Baby,
  ChevronDown,
  Sun,
  Coffee,
  Clipboard,
  FileText,
  CheckSquare,
  Phone,
  Mail,
  MessageCircle,
  Shield,
} from 'lucide-react';

interface QuickCheckAnswers {
  age: boolean | null;
  weight: boolean | null;
  health: boolean | null;
  recentDonation: boolean | null;
}

interface AccordionItem {
  id: string;
  heading: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  color: string;
}

const Eligibility = () => {
  const { t } = useTranslation();
  const [quickCheckAnswers, setQuickCheckAnswers] = useState<QuickCheckAnswers>({
    age: null,
    weight: null,
    health: null,
    recentDonation: null,
  });
  const [expandedAccordions, setExpandedAccordions] = useState<Set<string>>(new Set());
  const [expandedFAQ, setExpandedFAQ] = useState<Set<string>>(new Set());

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toggleAccordion = (id: string) => {
    const newExpanded = new Set(expandedAccordions);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedAccordions(newExpanded);
  };

  const toggleFAQ = (id: string) => {
    const newExpanded = new Set(expandedFAQ);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFAQ(newExpanded);
  };

  const updateQuickCheck = (question: keyof QuickCheckAnswers, value: boolean) => {
    setQuickCheckAnswers((prev) => ({ ...prev, [question]: value }));
  };

  const allQuestionsAnswered = Object.values(quickCheckAnswers).every((val) => val !== null);
  const isLikelyEligible =
    allQuestionsAnswered &&
    quickCheckAnswers.age === true &&
    quickCheckAnswers.weight === true &&
    quickCheckAnswers.health === true &&
    quickCheckAnswers.recentDonation === false;

  const getAccordionBorderClass = (color: string) => {
    switch (color) {
      case 'burnt-orange':
        return 'border-l-burnt-orange';
      case 'mediterranean-blue':
        return 'border-l-mediterranean-blue';
      case 'terracotta':
        return 'border-l-terracotta';
      case 'olive-green':
        return 'border-l-olive-green';
      default:
        return '';
    }
  };

  // Temporary deferrals accordion items - using translations
  const temporaryDeferrals: AccordionItem[] = [
    {
      id: 'illness',
      heading: t('eligibility.temporaryDeferrals.illness.heading'),
      icon: <Thermometer className="w-6 h-6 text-burnt-orange" />,
      color: 'burnt-orange',
      content: (
        <div className="space-y-3">
          <p>{t('eligibility.temporaryDeferrals.illness.description')}</p>
          <div className="bg-cream/50 p-3 rounded">
            <p className="font-semibold text-espresso">{t('eligibility.temporaryDeferrals.illness.waitingPeriod')}</p>
            <p>{t('eligibility.temporaryDeferrals.illness.period')}</p>
          </div>
          <p className="text-taupe">{t('eligibility.temporaryDeferrals.illness.note')}</p>
        </div>
      ),
    },
    {
      id: 'medications',
      heading: t('eligibility.temporaryDeferrals.medications.heading'),
      icon: <Pill className="w-6 h-6 text-mediterranean-blue" />,
      color: 'mediterranean-blue',
      content: (
        <div className="space-y-3">
          <p>{t('eligibility.temporaryDeferrals.medications.description')}</p>
          <ul className="list-disc list-inside space-y-1 text-taupe">
            <li>{t('eligibility.temporaryDeferrals.medications.antibiotics')}</li>
            <li>{t('eligibility.temporaryDeferrals.medications.bloodThinners')}</li>
            <li>{t('eligibility.temporaryDeferrals.medications.other')}</li>
          </ul>
          <p className="font-semibold text-espresso">{t('eligibility.temporaryDeferrals.medications.note')}</p>
        </div>
      ),
    },
    {
      id: 'dental',
      heading: t('eligibility.temporaryDeferrals.dental.heading'),
      icon: <Smile className="w-6 h-6 text-terracotta" />,
      color: 'terracotta',
      content: (
        <div className="space-y-3">
          <ul className="list-disc list-inside space-y-2 text-taupe">
            <li><strong className="text-espresso">{t('eligibility.temporaryDeferrals.dental.simpleCleaning')}</strong></li>
            <li><strong className="text-espresso">{t('eligibility.temporaryDeferrals.dental.fillings')}</strong></li>
            <li><strong className="text-espresso">{t('eligibility.temporaryDeferrals.dental.extractions')}</strong></li>
          </ul>
        </div>
      ),
    },
    {
      id: 'tattoos',
      heading: t('eligibility.temporaryDeferrals.tattoos.heading'),
      icon: <Scissors className="w-6 h-6 text-olive-green" />,
      color: 'olive-green',
      content: (
        <div className="space-y-3">
          <ul className="list-disc list-inside space-y-2 text-taupe">
            <li><strong className="text-espresso">{t('eligibility.temporaryDeferrals.tattoos.licensedItaly')}</strong></li>
            <li><strong className="text-espresso">{t('eligibility.temporaryDeferrals.tattoos.unlicensed')}</strong></li>
          </ul>
          <p className="text-taupe">{t('eligibility.temporaryDeferrals.tattoos.note')}</p>
        </div>
      ),
    },
    {
      id: 'travel',
      heading: t('eligibility.temporaryDeferrals.travel.heading'),
      icon: <Plane className="w-6 h-6 text-mediterranean-blue" />,
      color: 'mediterranean-blue',
      content: (
        <div className="space-y-3">
          <p>{t('eligibility.temporaryDeferrals.travel.description')}</p>
          <ul className="list-disc list-inside space-y-1 text-taupe">
            <li>{t('eligibility.temporaryDeferrals.travel.malaria')}</li>
            <li>{t('eligibility.temporaryDeferrals.travel.other')}</li>
          </ul>
          <p className="text-taupe">{t('eligibility.temporaryDeferrals.travel.note')}</p>
        </div>
      ),
    },
    {
      id: 'vaccinations',
      heading: t('eligibility.temporaryDeferrals.vaccinations.heading'),
      icon: <Syringe className="w-6 h-6 text-terracotta" />,
      color: 'terracotta',
      content: (
        <div className="space-y-3">
          <ul className="list-disc list-inside space-y-2 text-taupe">
            <li><strong className="text-espresso">{t('eligibility.temporaryDeferrals.vaccinations.covid')}</strong></li>
            <li><strong className="text-espresso">{t('eligibility.temporaryDeferrals.vaccinations.flu')}</strong></li>
            <li><strong className="text-espresso">{t('eligibility.temporaryDeferrals.vaccinations.live')}</strong></li>
          </ul>
        </div>
      ),
    },
    {
      id: 'pregnancy',
      heading: t('eligibility.temporaryDeferrals.pregnancy.heading'),
      icon: <Baby className="w-6 h-6 text-olive-green" />,
      color: 'olive-green',
      content: (
        <div className="space-y-3">
          <ul className="list-disc list-inside space-y-2 text-taupe">
            <li><strong className="text-espresso">{t('eligibility.temporaryDeferrals.pregnancy.during')}</strong></li>
            <li><strong className="text-espresso">{t('eligibility.temporaryDeferrals.pregnancy.after')}</strong></li>
            <li><strong className="text-espresso">{t('eligibility.temporaryDeferrals.pregnancy.nursing')}</strong></li>
          </ul>
        </div>
      ),
    },
  ];

  // FAQ items - using translations
  const faqItems = [
    {
      id: 'faq1',
      question: t('eligibility.faq.birthControl.question'),
      answer: t('eligibility.faq.birthControl.answer'),
    },
    {
      id: 'faq2',
      question: t('eligibility.faq.tattoo.question'),
      answer: t('eligibility.faq.tattoo.answer'),
    },
    {
      id: 'faq3',
      question: t('eligibility.faq.vegetarian.question'),
      answer: t('eligibility.faq.vegetarian.answer'),
    },
    {
      id: 'faq4',
      question: t('eligibility.faq.needles.question'),
      answer: t('eligibility.faq.needles.answer'),
    },
    {
      id: 'faq5',
      question: t('eligibility.faq.gender.question'),
      answer: t('eligibility.faq.gender.answer'),
    },
    {
      id: 'faq6',
      question: t('eligibility.faq.firstTime.question'),
      answer: t('eligibility.faq.firstTime.answer'),
    },
    {
      id: 'faq7',
      question: t('eligibility.faq.weak.question'),
      answer: t('eligibility.faq.weak.answer'),
    },
    {
      id: 'faq8',
      question: t('eligibility.faq.vitamins.question'),
      answer: t('eligibility.faq.vitamins.answer'),
    },
  ];

  return (
    <>
      {/* SEO Meta - would be in index.html or handled by a meta component */}
      <div className="pt-16 md:pt-20">
        {/* SECTION 1: HERO / QUICK CHECK */}
        <section className="bg-cream py-12 md:py-[60px] px-4 md:px-6">
          <div className="max-w-[900px] mx-auto">
            <h1 className="text-3xl md:text-[40px] font-bold text-espresso text-center mb-4">
              {t('eligibility.hero.title')}
            </h1>
            <p className="text-base md:text-lg text-taupe text-center mb-8 md:mb-12">
              {t('eligibility.hero.subtitle')}
            </p>

            {/* Quick Eligibility Checker */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-8 border-l-4 border-mediterranean-blue">
              <h2 className="text-xl md:text-2xl font-bold text-espresso mb-4 md:mb-6">{t('eligibility.hero.quickCheck.title')}</h2>
              
              <div className="space-y-4 md:space-y-6">
                {/* Question 1: Age */}
                <div className="space-y-2 md:space-y-3">
                  <p className="font-semibold text-espresso text-sm md:text-base">{t('eligibility.hero.quickCheck.ageQuestion')}</p>
                  <div className="flex gap-2 md:gap-4">
                    <button
                      onClick={() => updateQuickCheck('age', true)}
                      className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg font-medium transition-all text-sm md:text-base ${
                        quickCheckAnswers.age === true
                          ? 'bg-mediterranean-blue text-white'
                          : 'bg-gray-100 text-espresso hover:bg-gray-200'
                      }`}
                    >
                      {t('eligibility.hero.quickCheck.yes')}
                    </button>
                    <button
                      onClick={() => updateQuickCheck('age', false)}
                      className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg font-medium transition-all text-sm md:text-base ${
                        quickCheckAnswers.age === false
                          ? 'bg-mediterranean-blue text-white'
                          : 'bg-gray-100 text-espresso hover:bg-gray-200'
                      }`}
                    >
                      {t('eligibility.hero.quickCheck.no')}
                    </button>
                  </div>
                </div>

                {/* Question 2: Weight */}
                <div className="space-y-2 md:space-y-3">
                  <p className="font-semibold text-espresso text-sm md:text-base">{t('eligibility.hero.quickCheck.weightQuestion')}</p>
                  <div className="flex gap-2 md:gap-4">
                    <button
                      onClick={() => updateQuickCheck('weight', true)}
                      className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg font-medium transition-all text-sm md:text-base ${
                        quickCheckAnswers.weight === true
                          ? 'bg-mediterranean-blue text-white'
                          : 'bg-gray-100 text-espresso hover:bg-gray-200'
                      }`}
                    >
                      {t('eligibility.hero.quickCheck.yes')}
                    </button>
                    <button
                      onClick={() => updateQuickCheck('weight', false)}
                      className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg font-medium transition-all text-sm md:text-base ${
                        quickCheckAnswers.weight === false
                          ? 'bg-mediterranean-blue text-white'
                          : 'bg-gray-100 text-espresso hover:bg-gray-200'
                      }`}
                    >
                      {t('eligibility.hero.quickCheck.no')}
                    </button>
                  </div>
                </div>

                {/* Question 3: Health */}
                <div className="space-y-2 md:space-y-3">
                  <p className="font-semibold text-espresso text-sm md:text-base">{t('eligibility.hero.quickCheck.healthQuestion')}</p>
                  <div className="flex gap-2 md:gap-4">
                    <button
                      onClick={() => updateQuickCheck('health', true)}
                      className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg font-medium transition-all text-sm md:text-base ${
                        quickCheckAnswers.health === true
                          ? 'bg-mediterranean-blue text-white'
                          : 'bg-gray-100 text-espresso hover:bg-gray-200'
                      }`}
                    >
                      {t('eligibility.hero.quickCheck.yes')}
                    </button>
                    <button
                      onClick={() => updateQuickCheck('health', false)}
                      className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg font-medium transition-all text-sm md:text-base ${
                        quickCheckAnswers.health === false
                          ? 'bg-mediterranean-blue text-white'
                          : 'bg-gray-100 text-espresso hover:bg-gray-200'
                      }`}
                    >
                      {t('eligibility.hero.quickCheck.no')}
                    </button>
                  </div>
                </div>

                {/* Question 4: Recent Donation */}
                <div className="space-y-2 md:space-y-3">
                  <p className="font-semibold text-espresso text-sm md:text-base">{t('eligibility.hero.quickCheck.recentDonationQuestion')}</p>
                  <div className="flex gap-2 md:gap-4">
                    <button
                      onClick={() => updateQuickCheck('recentDonation', true)}
                      className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg font-medium transition-all text-sm md:text-base ${
                        quickCheckAnswers.recentDonation === true
                          ? 'bg-mediterranean-blue text-white'
                          : 'bg-gray-100 text-espresso hover:bg-gray-200'
                      }`}
                    >
                      {t('eligibility.hero.quickCheck.yes')}
                    </button>
                    <button
                      onClick={() => updateQuickCheck('recentDonation', false)}
                      className={`flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg font-medium transition-all text-sm md:text-base ${
                        quickCheckAnswers.recentDonation === false
                          ? 'bg-mediterranean-blue text-white'
                          : 'bg-gray-100 text-espresso hover:bg-gray-200'
                      }`}
                    >
                      {t('eligibility.hero.quickCheck.no')}
                    </button>
                  </div>
                  {quickCheckAnswers.recentDonation === true && (
                    <p className="text-xs md:text-sm text-taupe mt-2">
                      {t('eligibility.hero.quickCheck.recentDonationNote')}
                    </p>
                  )}
                </div>
              </div>

              {/* Result Display */}
              {allQuestionsAnswered && (
                <div
                  className={`mt-6 md:mt-8 p-4 md:p-6 rounded-lg transition-all duration-300 ${
                    isLikelyEligible ? 'bg-olive-green/20' : 'bg-burnt-orange/20'
                  }`}
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    {isLikelyEligible ? (
                      <>
                        <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-olive-green flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="text-lg md:text-xl font-bold text-espresso mb-2">
                            {t('eligibility.hero.quickCheck.likelyEligible.title')}
                          </h3>
                          <p className="text-sm md:text-base text-taupe mb-4">
                            {t('eligibility.hero.quickCheck.likelyEligible.description')}
                          </p>
                          <Link
                            to="/book"
                            className="inline-block bg-terracotta text-white px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:bg-terracotta/90 transition-colors text-sm md:text-base"
                          >
                            {t('eligibility.hero.quickCheck.likelyEligible.button')}
                          </Link>
                        </div>
                      </>
                    ) : (
                      <>
                        <Info className="w-6 h-6 md:w-8 md:h-8 text-burnt-orange flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="text-lg md:text-xl font-bold text-espresso mb-2">
                            {t('eligibility.hero.quickCheck.mayNeedToWait.title')}
                          </h3>
                          <p className="text-sm md:text-base text-taupe mb-4">
                            {t('eligibility.hero.quickCheck.mayNeedToWait.description')}
                          </p>
                          <a
                            href="mailto:eligibility@vitalita.com"
                            className="inline-block border-2 border-mediterranean-blue text-mediterranean-blue px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:bg-mediterranean-blue hover:text-white transition-colors text-sm md:text-base"
                          >
                            {t('eligibility.hero.quickCheck.mayNeedToWait.button')}
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 2: BASIC REQUIREMENTS */}
        <section className="bg-white py-12 md:py-[60px] px-4 md:px-6">
          <div className="max-w-[900px] mx-auto">
            <h2 className="text-2xl md:text-[32px] font-bold text-espresso mb-2">{t('eligibility.basicRequirements.title')}</h2>
            <p className="text-sm md:text-base text-taupe mb-8 md:mb-12">{t('eligibility.basicRequirements.subtitle')}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Card 1: Age */}
              <div className="bg-white border border-taupe rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow border-l-4 border-l-terracotta">
                <Calendar className="w-10 h-10 md:w-12 md:h-12 text-terracotta mb-3 md:mb-4" />
                <h3 className="text-lg md:text-xl font-bold text-espresso mb-2">{t('eligibility.basicRequirements.age.title')}</h3>
                <p className="text-sm md:text-base text-taupe">
                  {t('eligibility.basicRequirements.age.description')}
                </p>
              </div>

              {/* Card 2: Weight */}
              <div className="bg-white border border-taupe rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow border-l-4 border-l-mediterranean-blue">
                <Scale className="w-10 h-10 md:w-12 md:h-12 text-mediterranean-blue mb-3 md:mb-4" />
                <h3 className="text-lg md:text-xl font-bold text-espresso mb-2">{t('eligibility.basicRequirements.weight.title')}</h3>
                <p className="text-sm md:text-base text-taupe">
                  {t('eligibility.basicRequirements.weight.description')}
                </p>
              </div>

              {/* Card 3: Health */}
              <div className="bg-white border border-taupe rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow border-l-4 border-l-olive-green">
                <Heart className="w-10 h-10 md:w-12 md:h-12 text-olive-green mb-3 md:mb-4" />
                <h3 className="text-lg md:text-xl font-bold text-espresso mb-2">{t('eligibility.basicRequirements.health.title')}</h3>
                <p className="text-sm md:text-base text-taupe">
                  {t('eligibility.basicRequirements.health.description')}
                </p>
              </div>

              {/* Card 4: Identification */}
              <div className="bg-white border border-taupe rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow border-l-4 border-l-terracotta">
                <CreditCard className="w-10 h-10 md:w-12 md:h-12 text-terracotta mb-3 md:mb-4" />
                <h3 className="text-lg md:text-xl font-bold text-espresso mb-2">{t('eligibility.basicRequirements.id.title')}</h3>
                <p className="text-sm md:text-base text-taupe">
                  {t('eligibility.basicRequirements.id.description')}
                </p>
              </div>

              {/* Card 5: Frequency */}
              <div className="bg-white border border-taupe rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow border-l-4 border-l-mediterranean-blue">
                <Clock className="w-10 h-10 md:w-12 md:h-12 text-mediterranean-blue mb-3 md:mb-4" />
                <h3 className="text-lg md:text-xl font-bold text-espresso mb-2">{t('eligibility.basicRequirements.frequency.title')}</h3>
                <p className="text-sm md:text-base text-taupe">
                  {t('eligibility.basicRequirements.frequency.description')}
                </p>
              </div>

              {/* Card 6: Blood Pressure */}
              <div className="bg-white border border-taupe rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow border-l-4 border-l-olive-green">
                <Activity className="w-10 h-10 md:w-12 md:h-12 text-olive-green mb-3 md:mb-4" />
                <h3 className="text-lg md:text-xl font-bold text-espresso mb-2">{t('eligibility.basicRequirements.bloodPressure.title')}</h3>
                <p className="text-sm md:text-base text-taupe">
                  {t('eligibility.basicRequirements.bloodPressure.description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: TEMPORARY DEFERRALS */}
        <section className="bg-cream py-12 md:py-[60px] px-4 md:px-6">
          <div className="max-w-[900px] mx-auto">
            <h2 className="text-2xl md:text-[32px] font-bold text-espresso mb-2">{t('eligibility.temporaryDeferrals.title')}</h2>
            <p className="text-sm md:text-base text-taupe mb-8 md:mb-12">{t('eligibility.temporaryDeferrals.subtitle')}</p>

            <div className="space-y-4">
              {temporaryDeferrals.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white border border-taupe rounded-lg overflow-hidden transition-all ${
                    expandedAccordions.has(item.id) ? `border-l-4 ${getAccordionBorderClass(item.color)}` : ''
                  }`}
                >
                  <button
                    onClick={() => toggleAccordion(item.id)}
                    className="w-full flex items-center justify-between p-4 md:p-6 text-left hover:bg-cream/50 transition-colors"
                    aria-expanded={expandedAccordions.has(item.id)}
                  >
                    <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                      <div className="flex-shrink-0">{item.icon}</div>
                      <h3 className="text-base md:text-lg font-bold text-espresso truncate">{item.heading}</h3>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 md:w-6 md:h-6 text-mediterranean-blue transition-transform flex-shrink-0 ${
                        expandedAccordions.has(item.id) ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedAccordions.has(item.id) && (
                    <div className="px-4 md:px-6 pb-4 md:pb-6 pt-0 accordion-content">
                      {item.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4: PERMANENT DEFERRALS */}
        <section className="bg-white py-12 md:py-[60px] px-4 md:px-6">
          <div className="max-w-[900px] mx-auto">
            <h2 className="text-2xl md:text-[32px] font-bold text-espresso mb-2">{t('eligibility.permanentDeferrals.title')}</h2>
            <p className="text-sm md:text-base text-taupe mb-8 md:mb-12">{t('eligibility.permanentDeferrals.subtitle')}</p>

            {/* Sensitive Content Box */}
            <div className="bg-cream border-l-4 border-mediterranean-blue p-4 md:p-6 rounded-lg mb-6 md:mb-8">
              <div className="flex items-start gap-3 md:gap-4">
                <Info className="w-5 h-5 md:w-6 md:h-6 text-mediterranean-blue flex-shrink-0 mt-1" />
                <p className="text-sm md:text-base text-taupe">
                  {t('eligibility.permanentDeferrals.info.text')}
                </p>
              </div>
            </div>

            {/* Permanent Conditions */}
            <div className="space-y-4 mb-8 md:mb-12">
              <div className="bg-white border border-taupe rounded-lg p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-bold text-espresso mb-3">{t('eligibility.permanentDeferrals.chronicIllnesses.title')}</h3>
                <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-taupe mb-3">
                  <li>{t('eligibility.permanentDeferrals.chronicIllnesses.items.hiv')}</li>
                  <li>{t('eligibility.permanentDeferrals.chronicIllnesses.items.hepatitis')}</li>
                  <li>{t('eligibility.permanentDeferrals.chronicIllnesses.items.heart')}</li>
                </ul>
                <p className="text-xs md:text-sm text-taupe italic">
                  {t('eligibility.permanentDeferrals.chronicIllnesses.note')}
                </p>
              </div>

              <div className="bg-white border border-taupe rounded-lg p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-bold text-espresso mb-3">{t('eligibility.permanentDeferrals.cancer.title')}</h3>
                <ul className="list-disc list-inside space-y-2 text-sm md:text-base text-taupe mb-3">
                  <li>{t('eligibility.permanentDeferrals.cancer.active')}</li>
                  <li>{t('eligibility.permanentDeferrals.cancer.waiting')}</li>
                </ul>
                <p className="text-xs md:text-sm text-taupe italic">
                  {t('eligibility.permanentDeferrals.cancer.note')}
                </p>
              </div>

              <div className="bg-white border border-taupe rounded-lg p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-bold text-espresso mb-3">{t('eligibility.permanentDeferrals.riskFactors.title')}</h3>
                <p className="text-sm md:text-base text-taupe">
                  {t('eligibility.permanentDeferrals.riskFactors.description')}
                </p>
              </div>
            </div>

            {/* Alternative Ways to Help */}
            <div className="bg-olive-green/20 rounded-lg p-6 md:p-8">
              <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
                <Heart className="w-6 h-6 md:w-8 md:h-8 text-olive-green flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-bold text-espresso mb-3 md:mb-4">
                    {t('eligibility.permanentDeferrals.alternativeWays.title')}
                  </h3>
                  <ul className="space-y-2 md:space-y-3 text-sm md:text-base text-taupe mb-4 md:mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-olive-green flex-shrink-0" />
                      {t('eligibility.permanentDeferrals.alternativeWays.volunteer')}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-olive-green flex-shrink-0" />
                      {t('eligibility.permanentDeferrals.alternativeWays.organize')}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-olive-green flex-shrink-0" />
                      {t('eligibility.permanentDeferrals.alternativeWays.spread')}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-olive-green flex-shrink-0" />
                      {t('eligibility.permanentDeferrals.alternativeWays.donate')}
                    </li>
                  </ul>
                  <button className="border-2 border-olive-green text-olive-green px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:bg-olive-green hover:text-white transition-colors text-sm md:text-base">
                    {t('eligibility.permanentDeferrals.alternativeWays.button')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: PREPARING FOR YOUR DONATION */}
        <section className="bg-cream py-12 md:py-[60px] px-4 md:px-6">
          <div className="max-w-[900px] mx-auto">
            <h2 className="text-2xl md:text-[32px] font-bold text-espresso mb-2">{t('eligibility.preparation.title')}</h2>
            <p className="text-sm md:text-base text-taupe mb-8 md:mb-12">{t('eligibility.preparation.subtitle')}</p>

            <div className="space-y-6 md:space-y-8">
              {/* 24 Hours Before */}
              <div className="bg-white border-l-4 border-burnt-orange rounded-lg p-4 md:p-6">
                <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                  <Sun className="w-10 h-10 md:w-12 md:h-12 text-burnt-orange flex-shrink-0" />
                  <h3 className="text-xl md:text-2xl font-bold text-espresso">{t('eligibility.preparation.24Hours.title')}</h3>
                </div>
                <ul className="space-y-2 text-sm md:text-base text-taupe">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-olive-green flex-shrink-0 mt-0.5" />
                    {t('eligibility.preparation.24Hours.hydrate')}
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-olive-green flex-shrink-0 mt-0.5" />
                    {t('eligibility.preparation.24Hours.iron')}
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-olive-green flex-shrink-0 mt-0.5" />
                    {t('eligibility.preparation.24Hours.sleep')}
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-olive-green flex-shrink-0 mt-0.5" />
                    {t('eligibility.preparation.24Hours.alcohol')}
                  </li>
                </ul>
              </div>

              {/* Day of Donation */}
              <div className="bg-white border-l-4 border-terracotta rounded-lg p-4 md:p-6">
                <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                  <Coffee className="w-10 h-10 md:w-12 md:h-12 text-terracotta flex-shrink-0" />
                  <h3 className="text-xl md:text-2xl font-bold text-espresso">{t('eligibility.preparation.dayOf.title')}</h3>
                </div>
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm md:text-base text-espresso mb-2">{t('eligibility.preparation.dayOf.morning')}</h4>
                    <ul className="space-y-2 text-sm md:text-base text-taupe">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-olive-green flex-shrink-0 mt-0.5" />
                        {t('eligibility.preparation.dayOf.breakfast')}
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-olive-green flex-shrink-0 mt-0.5" />
                        {t('eligibility.preparation.dayOf.water')}
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-olive-green flex-shrink-0 mt-0.5" />
                        {t('eligibility.preparation.dayOf.fatty')}
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-olive-green flex-shrink-0 mt-0.5" />
                        {t('eligibility.preparation.dayOf.clothing')}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm md:text-base text-espresso mb-2">{t('eligibility.preparation.dayOf.atCenter')}</h4>
                    <ul className="space-y-2 text-sm md:text-base text-taupe">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-olive-green flex-shrink-0 mt-0.5" />
                        {t('eligibility.preparation.dayOf.bringId')}
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-olive-green flex-shrink-0 mt-0.5" />
                        {t('eligibility.preparation.dayOf.honest')}
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-olive-green flex-shrink-0 mt-0.5" />
                        {t('eligibility.preparation.dayOf.nervous')}
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-olive-green flex-shrink-0 mt-0.5" />
                        {t('eligibility.preparation.dayOf.relax')}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* After Donation */}
              <div className="bg-white border-l-4 border-olive-green rounded-lg p-4 md:p-6">
                <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                  <CheckCircle className="w-10 h-10 md:w-12 md:h-12 text-olive-green flex-shrink-0" />
                  <h3 className="text-xl md:text-2xl font-bold text-espresso">{t('eligibility.preparation.after.title')}</h3>
                </div>
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm md:text-base text-espresso mb-2">{t('eligibility.preparation.after.immediate')}</h4>
                    <ul className="space-y-2 text-sm md:text-base text-taupe">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-olive-green flex-shrink-0 mt-0.5" />
                        {t('eligibility.preparation.after.rest')}
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-olive-green flex-shrink-0 mt-0.5" />
                        {t('eligibility.preparation.after.snacks')}
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-olive-green flex-shrink-0 mt-0.5" />
                        {t('eligibility.preparation.after.stand')}
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm md:text-base text-espresso mb-2">{t('eligibility.preparation.after.next24')}</h4>
                    <ul className="space-y-2 text-sm md:text-base text-taupe">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-olive-green flex-shrink-0 mt-0.5" />
                        {t('eligibility.preparation.after.fluids')}
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-olive-green flex-shrink-0 mt-0.5" />
                        {t('eligibility.preparation.after.lifting')}
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-olive-green flex-shrink-0 mt-0.5" />
                        {t('eligibility.preparation.after.exercise')}
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-olive-green flex-shrink-0 mt-0.5" />
                        {t('eligibility.preparation.after.bandage')}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: HEALTH SCREENING PROCESS */}
        <section className="bg-white py-12 md:py-[60px] px-4 md:px-6">
          <div className="max-w-[900px] mx-auto">
            <h2 className="text-2xl md:text-[32px] font-bold text-espresso mb-2">{t('eligibility.screening.title')}</h2>
            <p className="text-sm md:text-base text-taupe mb-8 md:mb-12">{t('eligibility.screening.subtitle')}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
              {/* Step 1 */}
              <div className="bg-white border border-taupe rounded-lg p-4 md:p-6">
                <div className="flex items-center gap-3 md:gap-4 mb-3">
                  <Clipboard className="w-8 h-8 md:w-10 md:h-10 text-mediterranean-blue flex-shrink-0" />
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-espresso">{t('eligibility.screening.step1.title')}</h3>
                    <p className="text-xs md:text-sm text-taupe">{t('eligibility.screening.step1.time')}</p>
                  </div>
                </div>
                <p className="text-sm md:text-base text-taupe">{t('eligibility.screening.step1.description')}</p>
              </div>

              {/* Step 2 */}
              <div className="bg-white border border-taupe rounded-lg p-4 md:p-6">
                <div className="flex items-center gap-3 md:gap-4 mb-3">
                  <FileText className="w-8 h-8 md:w-10 md:h-10 text-terracotta flex-shrink-0" />
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-espresso">{t('eligibility.screening.step2.title')}</h3>
                    <p className="text-xs md:text-sm text-taupe">{t('eligibility.screening.step2.time')}</p>
                  </div>
                </div>
                <p className="text-sm md:text-base text-taupe">{t('eligibility.screening.step2.description')}</p>
              </div>

              {/* Step 3 */}
              <div className="bg-white border border-taupe rounded-lg p-4 md:p-6">
                <div className="flex items-center gap-3 md:gap-4 mb-3">
                  <Activity className="w-8 h-8 md:w-10 md:h-10 text-olive-green flex-shrink-0" />
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-espresso">{t('eligibility.screening.step3.title')}</h3>
                    <p className="text-xs md:text-sm text-taupe">{t('eligibility.screening.step3.time')}</p>
                  </div>
                </div>
                <p className="text-sm md:text-base text-taupe">{t('eligibility.screening.step3.description')}</p>
              </div>

              {/* Step 4 */}
              <div className="bg-white border border-taupe rounded-lg p-4 md:p-6">
                <div className="flex items-center gap-3 md:gap-4 mb-3">
                  <CheckSquare className="w-8 h-8 md:w-10 md:h-10 text-mediterranean-blue flex-shrink-0" />
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-espresso">{t('eligibility.screening.step4.title')}</h3>
                    <p className="text-xs md:text-sm text-taupe">{t('eligibility.screening.step4.time')}</p>
                  </div>
                </div>
                <p className="text-sm md:text-base text-taupe">{t('eligibility.screening.step4.description')}</p>
              </div>
            </div>

            {/* Reassurance Box */}
            <div className="bg-cream rounded-lg p-4 md:p-6">
              <div className="flex items-start gap-3 md:gap-4">
                <Heart className="w-5 h-5 md:w-6 md:h-6 text-terracotta flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm md:text-base text-taupe">
                    {t('eligibility.screening.reassurance.text')}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <Shield className="w-4 h-4 md:w-5 md:h-5 text-mediterranean-blue" />
                    <span className="text-xs md:text-sm text-taupe">{t('eligibility.screening.reassurance.gdpr')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: FAQ */}
        <section className="bg-cream py-12 md:py-[60px] px-4 md:px-6">
          <div className="max-w-[900px] mx-auto">
            <h2 className="text-2xl md:text-[32px] font-bold text-espresso mb-8 md:mb-12">{t('eligibility.faq.title')}</h2>

            <div className="space-y-3 md:space-y-4">
              {faqItems.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-white border border-taupe rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full flex items-center justify-between p-4 md:p-6 text-left hover:bg-cream/50 transition-colors"
                    aria-expanded={expandedFAQ.has(faq.id)}
                  >
                    <h3 className="text-base md:text-lg font-semibold text-espresso pr-3 md:pr-4 flex-1">{faq.question}</h3>
                    <ChevronDown
                      className={`w-5 h-5 md:w-6 md:h-6 text-mediterranean-blue flex-shrink-0 transition-transform ${
                        expandedFAQ.has(faq.id) ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedFAQ.has(faq.id) && (
                    <div className="px-4 md:px-6 pb-4 md:pb-6 pt-0 accordion-content">
                      <p className="text-sm md:text-base text-taupe">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 8: STILL HAVE QUESTIONS? */}
        <section className="bg-white py-12 md:py-[60px] px-4 md:px-6">
          <div className="max-w-[900px] mx-auto">
            <h2 className="text-2xl md:text-[32px] font-bold text-espresso text-center mb-3 md:mb-4">
              {t('eligibility.contact.title')}
            </h2>
            <p className="text-sm md:text-base text-taupe text-center mb-8 md:mb-12 max-w-2xl mx-auto">
              {t('eligibility.contact.subtitle')}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {/* Card 1: Call Us */}
              <div className="bg-white border-t-4 border-terracotta rounded-lg p-4 md:p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                <Phone className="w-8 h-8 md:w-10 md:h-10 text-terracotta mb-3 md:mb-4" />
                <h3 className="text-lg md:text-xl font-bold text-espresso mb-2">{t('eligibility.contact.call.title')}</h3>
                <a
                  href="tel:+391800123456"
                  className="text-mediterranean-blue hover:underline font-semibold block mb-2 text-sm md:text-base"
                >
                  {t('eligibility.contact.call.phone')}
                </a>
                <p className="text-xs md:text-sm text-taupe">{t('eligibility.contact.call.hours')}</p>
              </div>

              {/* Card 2: Email Us */}
              <div className="bg-white border-t-4 border-mediterranean-blue rounded-lg p-4 md:p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                <Mail className="w-8 h-8 md:w-10 md:h-10 text-mediterranean-blue mb-3 md:mb-4" />
                <h3 className="text-lg md:text-xl font-bold text-espresso mb-2">{t('eligibility.contact.email.title')}</h3>
                <a
                  href="mailto:eligibility@vitalita.com"
                  className="text-mediterranean-blue hover:underline font-semibold block mb-2 text-sm md:text-base break-all"
                >
                  {t('eligibility.contact.email.address')}
                </a>
                <p className="text-xs md:text-sm text-taupe">{t('eligibility.contact.email.response')}</p>
              </div>

              {/* Card 3: Live Chat */}
              <div className="bg-white border-t-4 border-olive-green rounded-lg p-4 md:p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                <MessageCircle className="w-8 h-8 md:w-10 md:h-10 text-olive-green mb-3 md:mb-4" />
                <h3 className="text-lg md:text-xl font-bold text-espresso mb-2">{t('eligibility.contact.chat.title')}</h3>
                <button className="text-mediterranean-blue hover:underline font-semibold block mb-2 text-sm md:text-base">
                  {t('eligibility.contact.chat.button')}
                </button>
                <p className="text-xs md:text-sm text-taupe">{t('eligibility.contact.chat.hours')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 9: CALL TO ACTION */}
        <section className="bg-gradient-to-r from-terracotta to-terracotta/90 py-12 md:py-20 px-4 md:px-6">
          <div className="max-w-[900px] mx-auto text-center">
            <h2 className="text-2xl md:text-[36px] font-bold text-white mb-3 md:mb-4">{t('eligibility.cta.title')}</h2>
            <p className="text-white/90 text-base md:text-lg mb-6 md:mb-8 max-w-2xl mx-auto">
              {t('eligibility.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <Link
                to="/book"
                className="bg-white text-terracotta px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold text-base md:text-lg hover:bg-cream transition-colors"
              >
                {t('eligibility.cta.schedule')}
              </Link>
              <a
                href="mailto:eligibility@vitalita.com"
                className="border-2 border-white text-white px-6 md:px-8 py-3 md:py-4 rounded-lg font-bold text-base md:text-lg hover:bg-white/10 transition-colors"
              >
                {t('eligibility.cta.contact')}
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Eligibility;


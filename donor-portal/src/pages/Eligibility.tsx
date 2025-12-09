import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

  // Temporary deferrals accordion items
  const temporaryDeferrals: AccordionItem[] = [
    {
      id: 'illness',
      heading: 'Cold, Flu, or Infection',
      icon: <Thermometer className="w-6 h-6 text-burnt-orange" />,
      color: 'burnt-orange',
      content: (
        <div className="space-y-3">
          <p>Wait until you're symptom-free and have completed any antibiotics</p>
          <div className="bg-cream/50 p-3 rounded">
            <p className="font-semibold text-espresso">Waiting period:</p>
            <p>1-2 weeks after recovery</p>
          </div>
          <p className="text-taupe">We want to ensure your immune system is strong and you feel your best</p>
        </div>
      ),
    },
    {
      id: 'medications',
      heading: 'Taking Certain Medications',
      icon: <Pill className="w-6 h-6 text-mediterranean-blue" />,
      color: 'mediterranean-blue',
      content: (
        <div className="space-y-3">
          <p>Most medications are fine, but some require waiting periods</p>
          <ul className="list-disc list-inside space-y-1 text-taupe">
            <li>Antibiotics: Wait 7-14 days after finishing course</li>
            <li>Blood thinners: May require special consideration</li>
            <li>Other medications: Evaluated case by case</li>
          </ul>
          <p className="font-semibold text-espresso">Always tell us what you're taking during screening</p>
        </div>
      ),
    },
    {
      id: 'dental',
      heading: 'Recent Dental Procedures',
      icon: <Smile className="w-6 h-6 text-terracotta" />,
      color: 'terracotta',
      content: (
        <div className="space-y-3">
          <ul className="list-disc list-inside space-y-2 text-taupe">
            <li><strong className="text-espresso">Simple cleaning:</strong> 24 hours</li>
            <li><strong className="text-espresso">Fillings:</strong> 24 hours</li>
            <li><strong className="text-espresso">Extractions, root canals:</strong> 7 days</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'tattoos',
      heading: 'New Tattoos or Piercings',
      icon: <Scissors className="w-6 h-6 text-olive-green" />,
      color: 'olive-green',
      content: (
        <div className="space-y-3">
          <ul className="list-disc list-inside space-y-2 text-taupe">
            <li><strong className="text-espresso">Licensed studio in Italy:</strong> Usually okay immediately</li>
            <li><strong className="text-espresso">Unlicensed or abroad:</strong> 4 months</li>
          </ul>
          <p className="text-taupe">This protects against bloodborne infections</p>
        </div>
      ),
    },
    {
      id: 'travel',
      heading: 'Recent International Travel',
      icon: <Plane className="w-6 h-6 text-mediterranean-blue" />,
      color: 'mediterranean-blue',
      content: (
        <div className="space-y-3">
          <p>Some destinations require waiting periods</p>
          <ul className="list-disc list-inside space-y-1 text-taupe">
            <li>Malaria-risk areas: 3-12 months</li>
            <li>Other high-risk regions: Varies by location</li>
          </ul>
          <p className="text-taupe">We'll ask about your travel history during screening</p>
        </div>
      ),
    },
    {
      id: 'vaccinations',
      heading: 'Recent Vaccinations',
      icon: <Syringe className="w-6 h-6 text-terracotta" />,
      color: 'terracotta',
      content: (
        <div className="space-y-3">
          <ul className="list-disc list-inside space-y-2 text-taupe">
            <li><strong className="text-espresso">COVID-19 vaccine:</strong> No waiting period</li>
            <li><strong className="text-espresso">Flu shot:</strong> 24 hours</li>
            <li><strong className="text-espresso">Live vaccines:</strong> 4 weeks</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'pregnancy',
      heading: 'Pregnancy or Breastfeeding',
      icon: <Baby className="w-6 h-6 text-olive-green" />,
      color: 'olive-green',
      content: (
        <div className="space-y-3">
          <ul className="list-disc list-inside space-y-2 text-taupe">
            <li><strong className="text-espresso">During pregnancy:</strong> Cannot donate</li>
            <li><strong className="text-espresso">After delivery:</strong> Wait 6 months</li>
            <li><strong className="text-espresso">While nursing:</strong> Wait until baby is weaned or 3 months postpartum</li>
          </ul>
        </div>
      ),
    },
  ];

  // FAQ items
  const faqItems = [
    {
      id: 'faq1',
      question: "I'm on birth control. Can I donate?",
      answer: "Yes! Birth control pills, patches, and IUDs don't affect eligibility.",
    },
    {
      id: 'faq2',
      question: "I have a tattoo from last month. Can I donate?",
      answer: "If done at a licensed studio in Italy with sterile equipment, yes. Otherwise, wait 4 months.",
    },
    {
      id: 'faq3',
      question: "I'm a vegetarian/vegan. Can I donate?",
      answer: "Absolutely! Just ensure you're eating iron-rich plant foods and may need to monitor iron levels.",
    },
    {
      id: 'faq4',
      question: "I'm nervous about needles. Can I still donate?",
      answer: "Yes! Tell our staff—we're experienced in helping nervous donors feel comfortable.",
    },
    {
      id: 'faq5',
      question: 'Can men and women both donate?',
      answer: 'Yes, both can donate equally, with the same requirements.',
    },
    {
      id: 'faq6',
      question: "I've never donated before. Is it safe?",
      answer: 'Completely safe. We use sterile, single-use equipment, and millions donate safely every year.',
    },
    {
      id: 'faq7',
      question: 'Will donating make me weak?',
      answer: "Your body replaces the fluid within 24 hours and cells within a few weeks. Most donors feel normal immediately after.",
    },
    {
      id: 'faq8',
      question: "Can I donate if I'm taking vitamins?",
      answer: 'Yes, vitamins and supplements are fine.',
    },
  ];

  return (
    <>
      {/* SEO Meta - would be in index.html or handled by a meta component */}
      <div className="pt-16 md:pt-20">
        {/* SECTION 1: HERO / QUICK CHECK */}
        <section className="bg-cream py-[60px] px-6">
          <div className="max-w-[900px] mx-auto">
            <h1 className="text-[40px] md:text-[40px] font-bold text-espresso text-center mb-4">
              Am I Eligible to Donate Blood?
            </h1>
            <p className="text-lg text-taupe text-center mb-12">
              Most healthy adults can donate. Let's find out if you're ready.
            </p>

            {/* Quick Eligibility Checker */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-mediterranean-blue">
              <h2 className="text-2xl font-bold text-espresso mb-6">Quick Eligibility Check</h2>
              
              <div className="space-y-6">
                {/* Question 1: Age */}
                <div className="space-y-3">
                  <p className="font-semibold text-espresso">Are you between 18-65 years old?</p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => updateQuickCheck('age', true)}
                      className={`px-6 py-2 rounded-lg font-medium transition-all ${
                        quickCheckAnswers.age === true
                          ? 'bg-mediterranean-blue text-white'
                          : 'bg-gray-100 text-espresso hover:bg-gray-200'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => updateQuickCheck('age', false)}
                      className={`px-6 py-2 rounded-lg font-medium transition-all ${
                        quickCheckAnswers.age === false
                          ? 'bg-mediterranean-blue text-white'
                          : 'bg-gray-100 text-espresso hover:bg-gray-200'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {/* Question 2: Weight */}
                <div className="space-y-3">
                  <p className="font-semibold text-espresso">Do you weigh at least 50 kg (110 lbs)?</p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => updateQuickCheck('weight', true)}
                      className={`px-6 py-2 rounded-lg font-medium transition-all ${
                        quickCheckAnswers.weight === true
                          ? 'bg-mediterranean-blue text-white'
                          : 'bg-gray-100 text-espresso hover:bg-gray-200'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => updateQuickCheck('weight', false)}
                      className={`px-6 py-2 rounded-lg font-medium transition-all ${
                        quickCheckAnswers.weight === false
                          ? 'bg-mediterranean-blue text-white'
                          : 'bg-gray-100 text-espresso hover:bg-gray-200'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {/* Question 3: Health */}
                <div className="space-y-3">
                  <p className="font-semibold text-espresso">Do you feel healthy today?</p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => updateQuickCheck('health', true)}
                      className={`px-6 py-2 rounded-lg font-medium transition-all ${
                        quickCheckAnswers.health === true
                          ? 'bg-mediterranean-blue text-white'
                          : 'bg-gray-100 text-espresso hover:bg-gray-200'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => updateQuickCheck('health', false)}
                      className={`px-6 py-2 rounded-lg font-medium transition-all ${
                        quickCheckAnswers.health === false
                          ? 'bg-mediterranean-blue text-white'
                          : 'bg-gray-100 text-espresso hover:bg-gray-200'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {/* Question 4: Recent Donation */}
                <div className="space-y-3">
                  <p className="font-semibold text-espresso">Have you donated blood in the last 8 weeks?</p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => updateQuickCheck('recentDonation', true)}
                      className={`px-6 py-2 rounded-lg font-medium transition-all ${
                        quickCheckAnswers.recentDonation === true
                          ? 'bg-mediterranean-blue text-white'
                          : 'bg-gray-100 text-espresso hover:bg-gray-200'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => updateQuickCheck('recentDonation', false)}
                      className={`px-6 py-2 rounded-lg font-medium transition-all ${
                        quickCheckAnswers.recentDonation === false
                          ? 'bg-mediterranean-blue text-white'
                          : 'bg-gray-100 text-espresso hover:bg-gray-200'
                      }`}
                    >
                      No
                    </button>
                  </div>
                  {quickCheckAnswers.recentDonation === true && (
                    <p className="text-sm text-taupe mt-2">
                      You'll need to wait until 8 weeks have passed since your last donation.
                    </p>
                  )}
                </div>
              </div>

              {/* Result Display */}
              {allQuestionsAnswered && (
                <div
                  className={`mt-8 p-6 rounded-lg transition-all duration-300 ${
                    isLikelyEligible ? 'bg-olive-green/20' : 'bg-burnt-orange/20'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {isLikelyEligible ? (
                      <>
                        <CheckCircle className="w-8 h-8 text-olive-green flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-espresso mb-2">
                            You're likely eligible to donate! 🎉
                          </h3>
                          <p className="text-taupe mb-4">
                            Based on your answers, you meet the basic requirements. We'll confirm during your appointment.
                          </p>
                          <Link
                            to="/book"
                            className="inline-block bg-terracotta text-white px-6 py-3 rounded-lg font-semibold hover:bg-terracotta/90 transition-colors"
                          >
                            Schedule Your Donation
                          </Link>
                        </div>
                      </>
                    ) : (
                      <>
                        <Info className="w-8 h-8 text-burnt-orange flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-espresso mb-2">
                            You may need to wait before donating
                          </h3>
                          <p className="text-taupe mb-4">
                            Based on your answers, you might need to wait before donating. Contact us for specific guidance.
                          </p>
                          <a
                            href="mailto:eligibility@vitalita.com"
                            className="inline-block border-2 border-mediterranean-blue text-mediterranean-blue px-6 py-3 rounded-lg font-semibold hover:bg-mediterranean-blue hover:text-white transition-colors"
                          >
                            Contact Us
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
        <section className="bg-white py-[60px] px-6">
          <div className="max-w-[900px] mx-auto">
            <h2 className="text-[32px] font-bold text-espresso mb-2">Basic Eligibility Requirements</h2>
            <p className="text-taupe mb-12">These are the general guidelines in Italy</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1: Age */}
              <div className="bg-white border border-taupe rounded-lg p-6 hover:shadow-lg transition-shadow border-l-4 border-l-terracotta">
                <Calendar className="w-12 h-12 text-terracotta mb-4" />
                <h3 className="text-xl font-bold text-espresso mb-2">Age 18-65</h3>
                <p className="text-taupe">
                  First-time donors: 18-60 years. Regular donors can continue until 65 with medical approval.
                </p>
              </div>

              {/* Card 2: Weight */}
              <div className="bg-white border border-taupe rounded-lg p-6 hover:shadow-lg transition-shadow border-l-4 border-l-mediterranean-blue">
                <Scale className="w-12 h-12 text-mediterranean-blue mb-4" />
                <h3 className="text-xl font-bold text-espresso mb-2">Minimum 50 kg</h3>
                <p className="text-taupe">
                  You must weigh at least 50 kg (110 lbs) to safely donate a standard unit of blood.
                </p>
              </div>

              {/* Card 3: Health */}
              <div className="bg-white border border-taupe rounded-lg p-6 hover:shadow-lg transition-shadow border-l-4 border-l-olive-green">
                <Heart className="w-12 h-12 text-olive-green mb-4" />
                <h3 className="text-xl font-bold text-espresso mb-2">Good Health</h3>
                <p className="text-taupe">
                  Generally healthy, feeling well on donation day, and living an active lifestyle.
                </p>
              </div>

              {/* Card 4: Identification */}
              <div className="bg-white border border-taupe rounded-lg p-6 hover:shadow-lg transition-shadow border-l-4 border-l-terracotta">
                <CreditCard className="w-12 h-12 text-terracotta mb-4" />
                <h3 className="text-xl font-bold text-espresso mb-2">Valid ID</h3>
                <p className="text-taupe">
                  Government-issued ID and donor card (if you're a returning donor).
                </p>
              </div>

              {/* Card 5: Frequency */}
              <div className="bg-white border border-taupe rounded-lg p-6 hover:shadow-lg transition-shadow border-l-4 border-l-mediterranean-blue">
                <Clock className="w-12 h-12 text-mediterranean-blue mb-4" />
                <h3 className="text-xl font-bold text-espresso mb-2">Wait Between Donations</h3>
                <p className="text-taupe">
                  Blood: 8 weeks minimum. Plasma: 2 weeks minimum.
                </p>
              </div>

              {/* Card 6: Blood Pressure */}
              <div className="bg-white border border-taupe rounded-lg p-6 hover:shadow-lg transition-shadow border-l-4 border-l-olive-green">
                <Activity className="w-12 h-12 text-olive-green mb-4" />
                <h3 className="text-xl font-bold text-espresso mb-2">Normal Blood Pressure</h3>
                <p className="text-taupe">
                  Generally within normal range. We'll check during your screening.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: TEMPORARY DEFERRALS */}
        <section className="bg-cream py-[60px] px-6">
          <div className="max-w-[900px] mx-auto">
            <h2 className="text-[32px] font-bold text-espresso mb-2">Temporary Reasons You May Need to Wait</h2>
            <p className="text-taupe mb-12">These situations require a short waiting period</p>

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
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-cream/50 transition-colors"
                    aria-expanded={expandedAccordions.has(item.id)}
                  >
                    <div className="flex items-center gap-4">
                      {item.icon}
                      <h3 className="text-lg font-bold text-espresso">{item.heading}</h3>
                    </div>
                    <ChevronDown
                      className={`w-6 h-6 text-mediterranean-blue transition-transform ${
                        expandedAccordions.has(item.id) ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedAccordions.has(item.id) && (
                    <div className="px-6 pb-6 pt-0 accordion-content">
                      {item.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4: PERMANENT DEFERRALS */}
        <section className="bg-white py-[60px] px-6">
          <div className="max-w-[900px] mx-auto">
            <h2 className="text-[32px] font-bold text-espresso mb-2">Permanent Donation Restrictions</h2>
            <p className="text-taupe mb-12">For your safety and recipient safety</p>

            {/* Sensitive Content Box */}
            <div className="bg-cream border-l-4 border-mediterranean-blue p-6 rounded-lg mb-8">
              <div className="flex items-start gap-4">
                <Info className="w-6 h-6 text-mediterranean-blue flex-shrink-0 mt-1" />
                <p className="text-taupe">
                  Some health conditions permanently prevent blood donation. This isn't about judgment—it's about
                  protecting both donors and recipients. If you have questions about your specific situation, please
                  contact us confidentially.
                </p>
              </div>
            </div>

            {/* Permanent Conditions */}
            <div className="space-y-4 mb-12">
              <div className="bg-white border border-taupe rounded-lg p-6">
                <h3 className="text-xl font-bold text-espresso mb-3">Certain Chronic Illnesses</h3>
                <ul className="list-disc list-inside space-y-2 text-taupe mb-3">
                  <li>HIV/AIDS</li>
                  <li>Hepatitis B or C (current infection)</li>
                  <li>Certain heart conditions</li>
                </ul>
                <p className="text-sm text-taupe italic">
                  Many chronic conditions are fine—we evaluate individually
                </p>
              </div>

              <div className="bg-white border border-taupe rounded-lg p-6">
                <h3 className="text-xl font-bold text-espresso mb-3">Cancer History</h3>
                <ul className="list-disc list-inside space-y-2 text-taupe mb-3">
                  <li>Active cancer or recent treatment</li>
                  <li>Some cancers have waiting periods after successful treatment</li>
                </ul>
                <p className="text-sm text-taupe italic">
                  If you're a cancer survivor, contact us—you may be eligible
                </p>
              </div>

              <div className="bg-white border border-taupe rounded-lg p-6">
                <h3 className="text-xl font-bold text-espresso mb-3">Specific Risk Factors</h3>
                <p className="text-taupe">
                  Presented sensitively with medical rationale. These policies are regularly reviewed as medical
                  knowledge advances.
                </p>
              </div>
            </div>

            {/* Alternative Ways to Help */}
            <div className="bg-olive-green/20 rounded-lg p-8">
              <div className="flex items-start gap-4 mb-6">
                <Heart className="w-8 h-8 text-olive-green flex-shrink-0" />
                <div>
                  <h3 className="text-2xl font-bold text-espresso mb-4">
                    Can't Donate? You Can Still Make a Difference
                  </h3>
                  <ul className="space-y-3 text-taupe mb-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-olive-green" />
                      Volunteer with AVIS
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-olive-green" />
                      Organize a blood drive
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-olive-green" />
                      Spread awareness on social media
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-olive-green" />
                      Donate financially to support operations
                    </li>
                  </ul>
                  <button className="border-2 border-olive-green text-olive-green px-6 py-3 rounded-lg font-semibold hover:bg-olive-green hover:text-white transition-colors">
                    Explore Other Ways to Help
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: PREPARING FOR YOUR DONATION */}
        <section className="bg-cream py-[60px] px-6">
          <div className="max-w-[900px] mx-auto">
            <h2 className="text-[32px] font-bold text-espresso mb-2">How to Prepare for Your Donation</h2>
            <p className="text-taupe mb-12">Make your donation smooth and comfortable</p>

            <div className="space-y-8">
              {/* 24 Hours Before */}
              <div className="bg-white border-l-4 border-burnt-orange rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Sun className="w-12 h-12 text-burnt-orange" />
                  <h3 className="text-2xl font-bold text-espresso">24 Hours Before</h3>
                </div>
                <ul className="space-y-2 text-taupe">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-olive-green flex-shrink-0 mt-0.5" />
                    Stay well hydrated (8-10 glasses of water)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-olive-green flex-shrink-0 mt-0.5" />
                    Eat iron-rich foods (spinach, red meat, lentils)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-olive-green flex-shrink-0 mt-0.5" />
                    Get good sleep (7-8 hours)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-olive-green flex-shrink-0 mt-0.5" />
                    Avoid alcohol
                  </li>
                </ul>
              </div>

              {/* Day of Donation */}
              <div className="bg-white border-l-4 border-terracotta rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Coffee className="w-12 h-12 text-terracotta" />
                  <h3 className="text-2xl font-bold text-espresso">Day of Donation</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-espresso mb-2">Morning:</h4>
                    <ul className="space-y-2 text-taupe">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-olive-green flex-shrink-0 mt-0.5" />
                        Eat a healthy breakfast
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-olive-green flex-shrink-0 mt-0.5" />
                        Drink extra water
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-olive-green flex-shrink-0 mt-0.5" />
                        Avoid fatty foods
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-olive-green flex-shrink-0 mt-0.5" />
                        Wear comfortable clothing
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-espresso mb-2">At the center:</h4>
                    <ul className="space-y-2 text-taupe">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-olive-green flex-shrink-0 mt-0.5" />
                        Bring your ID and donor card
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-olive-green flex-shrink-0 mt-0.5" />
                        Be honest during health screening
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-olive-green flex-shrink-0 mt-0.5" />
                        Tell staff if you feel nervous
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-olive-green flex-shrink-0 mt-0.5" />
                        Relax—the staff will guide you
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* After Donation */}
              <div className="bg-white border-l-4 border-olive-green rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <CheckCircle className="w-12 h-12 text-olive-green" />
                  <h3 className="text-2xl font-bold text-espresso">After Donation</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-espresso mb-2">Immediate (0-30 minutes):</h4>
                    <ul className="space-y-2 text-taupe">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-olive-green flex-shrink-0 mt-0.5" />
                        Rest for 10-15 minutes
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-olive-green flex-shrink-0 mt-0.5" />
                        Enjoy provided snacks and drinks
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-olive-green flex-shrink-0 mt-0.5" />
                        Don't rush to stand up
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-espresso mb-2">Next 24 hours:</h4>
                    <ul className="space-y-2 text-taupe">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-olive-green flex-shrink-0 mt-0.5" />
                        Drink extra fluids
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-olive-green flex-shrink-0 mt-0.5" />
                        Avoid heavy lifting
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-olive-green flex-shrink-0 mt-0.5" />
                        Avoid strenuous exercise
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-olive-green flex-shrink-0 mt-0.5" />
                        Keep bandage on for a few hours
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: HEALTH SCREENING PROCESS */}
        <section className="bg-white py-[60px] px-6">
          <div className="max-w-[900px] mx-auto">
            <h2 className="text-[32px] font-bold text-espresso mb-2">What Happens During Health Screening?</h2>
            <p className="text-taupe mb-12">Understanding the process reduces anxiety</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Step 1 */}
              <div className="bg-white border border-taupe rounded-lg p-6">
                <div className="flex items-center gap-4 mb-3">
                  <Clipboard className="w-10 h-10 text-mediterranean-blue" />
                  <div>
                    <h3 className="text-lg font-bold text-espresso">Step 1: Registration</h3>
                    <p className="text-sm text-taupe">5 minutes</p>
                  </div>
                </div>
                <p className="text-taupe">Verify your identity and review your health questionnaire</p>
              </div>

              {/* Step 2 */}
              <div className="bg-white border border-taupe rounded-lg p-6">
                <div className="flex items-center gap-4 mb-3">
                  <FileText className="w-10 h-10 text-terracotta" />
                  <div>
                    <h3 className="text-lg font-bold text-espresso">Step 2: Health History</h3>
                    <p className="text-sm text-taupe">10 minutes</p>
                  </div>
                </div>
                <p className="text-taupe">Confidential discussion about your health, travel, and medications</p>
              </div>

              {/* Step 3 */}
              <div className="bg-white border border-taupe rounded-lg p-6">
                <div className="flex items-center gap-4 mb-3">
                  <Activity className="w-10 h-10 text-olive-green" />
                  <div>
                    <h3 className="text-lg font-bold text-espresso">Step 3: Mini Physical</h3>
                    <p className="text-sm text-taupe">5 minutes</p>
                  </div>
                </div>
                <p className="text-taupe">Temperature, blood pressure, pulse, and hemoglobin check</p>
              </div>

              {/* Step 4 */}
              <div className="bg-white border border-taupe rounded-lg p-6">
                <div className="flex items-center gap-4 mb-3">
                  <CheckSquare className="w-10 h-10 text-mediterranean-blue" />
                  <div>
                    <h3 className="text-lg font-bold text-espresso">Step 4: Final Review</h3>
                    <p className="text-sm text-taupe">2 minutes</p>
                  </div>
                </div>
                <p className="text-taupe">Staff confirms you're ready to donate safely</p>
              </div>
            </div>

            {/* Reassurance Box */}
            <div className="bg-cream rounded-lg p-6">
              <div className="flex items-start gap-4">
                <Heart className="w-6 h-6 text-terracotta flex-shrink-0 mt-1" />
                <div>
                  <p className="text-taupe">
                    Your health information is completely confidential and protected by GDPR. We'll never share it
                    without your permission.
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <Shield className="w-5 h-5 text-mediterranean-blue" />
                    <span className="text-sm text-taupe">GDPR Protected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: FAQ */}
        <section className="bg-cream py-[60px] px-6">
          <div className="max-w-[900px] mx-auto">
            <h2 className="text-[32px] font-bold text-espresso mb-12">Common Eligibility Questions</h2>

            <div className="space-y-4">
              {faqItems.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-white border border-taupe rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-cream/50 transition-colors"
                    aria-expanded={expandedFAQ.has(faq.id)}
                  >
                    <h3 className="text-lg font-semibold text-espresso pr-4">{faq.question}</h3>
                    <ChevronDown
                      className={`w-6 h-6 text-mediterranean-blue flex-shrink-0 transition-transform ${
                        expandedFAQ.has(faq.id) ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedFAQ.has(faq.id) && (
                    <div className="px-6 pb-6 pt-0 accordion-content">
                      <p className="text-taupe">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 8: STILL HAVE QUESTIONS? */}
        <section className="bg-white py-[60px] px-6">
          <div className="max-w-[900px] mx-auto">
            <h2 className="text-[32px] font-bold text-espresso text-center mb-4">
              Need Personal Guidance?
            </h2>
            <p className="text-taupe text-center mb-12 max-w-2xl mx-auto">
              Every situation is unique. If you're unsure about your eligibility, our team is here to help with
              confidential, personalized guidance.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Call Us */}
              <div className="bg-white border-t-4 border-terracotta rounded-lg p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                <Phone className="w-10 h-10 text-terracotta mb-4" />
                <h3 className="text-xl font-bold text-espresso mb-2">Call Us</h3>
                <a
                  href="tel:+391800123456"
                  className="text-mediterranean-blue hover:underline font-semibold block mb-2"
                >
                  +39 1800 123 456
                </a>
                <p className="text-taupe text-sm">Mon-Fri, 8 AM - 8 PM</p>
              </div>

              {/* Card 2: Email Us */}
              <div className="bg-white border-t-4 border-mediterranean-blue rounded-lg p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                <Mail className="w-10 h-10 text-mediterranean-blue mb-4" />
                <h3 className="text-xl font-bold text-espresso mb-2">Email Us</h3>
                <a
                  href="mailto:eligibility@vitalita.com"
                  className="text-mediterranean-blue hover:underline font-semibold block mb-2"
                >
                  eligibility@vitalita.com
                </a>
                <p className="text-taupe text-sm">Response within 24 hours</p>
              </div>

              {/* Card 3: Live Chat */}
              <div className="bg-white border-t-4 border-olive-green rounded-lg p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                <MessageCircle className="w-10 h-10 text-olive-green mb-4" />
                <h3 className="text-xl font-bold text-espresso mb-2">Live Chat</h3>
                <button className="text-mediterranean-blue hover:underline font-semibold block mb-2">
                  Chat with us
                </button>
                <p className="text-taupe text-sm">Available during business hours</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 9: CALL TO ACTION */}
        <section className="bg-gradient-to-r from-terracotta to-terracotta/90 py-20 px-6">
          <div className="max-w-[900px] mx-auto text-center">
            <h2 className="text-[36px] font-bold text-white mb-4">Ready to Check Your Eligibility?</h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              The best way to know for sure is to start the process. We'll guide you every step of the way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/book"
                className="bg-white text-terracotta px-8 py-4 rounded-lg font-bold text-lg hover:bg-cream transition-colors"
              >
                Schedule Your Donation
              </Link>
              <a
                href="mailto:eligibility@vitalita.com"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition-colors"
              >
                Contact Us with Questions
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Eligibility;


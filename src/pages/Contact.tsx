import { useState, useEffect } from 'react';
import { Mail, MapPin, Phone, Clock, CheckCircle2, Shield, Lock, FileCheck, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface FormData {
  organizationName: string;
  name: string;
  role: string;
  email: string;
  challenges: string;
  referralSource: string;
}

const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FormData>({
    organizationName: '',
    name: '',
    role: '',
    email: '',
    challenges: '',
    referralSource: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      quote: t('contactPage.testimonials.quote'),
      author: t('contactPage.testimonials.author'),
      position: t('contactPage.testimonials.position'),
      organization: t('contactPage.testimonials.organization')
    }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    // Future: integrate with backend endpoint
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div style={{ backgroundColor: '#F9FAFB' }}>
      {/* Header Section */}
      <section className="section-container py-6 sm:py-8 px-4 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: '#FF6B6B' }}>{t('contactPage.title')}</p>
          <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight" style={{ color: '#1A2332' }}>
            {t('contactPage.heading')}
          </h1>
          <p className="mt-3 text-base sm:text-lg px-4" style={{ color: '#6B7280' }}>
            {t('contactPage.subtitle')}
          </p>
        </div>
      </section>

      {/* Main Content - Two Column Layout */}
      <section className="section-container pb-8 px-4 sm:px-6">
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
          {/* Left Column - Contact Form */}
          <div className="order-2 lg:order-1">
            <div className="rounded-2xl sm:rounded-[32px] p-4 sm:p-6 lg:p-8 shadow-2xl" style={{ 
              border: '1px solid rgba(107, 114, 128, 0.2)',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
              {submitted ? (
                <div className="text-center py-6">
                  <div className="mx-auto flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(255, 107, 107, 0.1)' }}>
                    <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8" style={{ color: '#FF6B6B' }} />
                  </div>
                  <h2 className="mt-4 text-xl sm:text-2xl font-semibold" style={{ color: '#1A2332' }}>{t('contactPage.form.thankYou')}</h2>
                  <p className="mt-2 text-xs sm:text-sm px-4" style={{ color: '#6B7280' }}>
                    {t('contactPage.form.thankYouMessage')}
                  </p>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="organizationName" className="block text-sm font-semibold mb-2" style={{ color: '#1A2332' }}>
                      {t('contactPage.form.organizationName')} <span style={{ color: '#FF6B6B' }}>*</span>
                    </label>
                    <input
                      id="organizationName"
                      name="organizationName"
                      type="text"
                      required
                      value={formData.organizationName}
                      onChange={handleChange}
                      placeholder={t('contactPage.form.organizationNamePlaceholder')}
                      className="w-full rounded-xl bg-white px-4 py-3 text-sm shadow-sm transition focus:outline-none focus:ring-2"
                      style={{ 
                        border: '1px solid rgba(107, 114, 128, 0.2)',
                        color: '#1A2332'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#FF6B6B';
                        e.target.style.boxShadow = '0 0 0 2px rgba(255, 107, 107, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(107, 114, 128, 0.2)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold mb-2" style={{ color: '#1A2332' }}>
                      {t('contactPage.form.yourName')} <span style={{ color: '#FF6B6B' }}>*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t('contactPage.form.yourNamePlaceholder')}
                      className="w-full rounded-xl bg-white px-4 py-3 text-sm shadow-sm transition focus:outline-none focus:ring-2"
                      style={{ 
                        border: '1px solid rgba(107, 114, 128, 0.2)',
                        color: '#1A2332'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#FF6B6B';
                        e.target.style.boxShadow = '0 0 0 2px rgba(255, 107, 107, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(107, 114, 128, 0.2)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-semibold mb-2" style={{ color: '#1A2332' }}>
                      {t('contactPage.form.yourRole')} <span style={{ color: '#FF6B6B' }}>*</span>
                    </label>
                    <select
                      id="role"
                      name="role"
                      required
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-white px-4 py-3 text-sm shadow-sm transition focus:outline-none focus:ring-2"
                      style={{ 
                        border: '1px solid rgba(107, 114, 128, 0.2)',
                        color: '#1A2332'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#FF6B6B';
                        e.target.style.boxShadow = '0 0 0 2px rgba(255, 107, 107, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(107, 114, 128, 0.2)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <option value="">{t('contactPage.form.selectRole')}</option>
                      <option value="Manager">{t('contactPage.roles.manager')}</option>
                      <option value="Director">{t('contactPage.roles.director')}</option>
                      <option value="IT Administrator">{t('contactPage.roles.itAdministrator')}</option>
                      <option value="Other">{t('contactPage.roles.other')}</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: '#1A2332' }}>
                      {t('contactPage.form.emailAddress')} <span style={{ color: '#FF6B6B' }}>*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t('contactPage.form.emailPlaceholder')}
                      className="w-full rounded-xl bg-white px-4 py-3 text-sm shadow-sm transition focus:outline-none focus:ring-2"
                      style={{ 
                        border: '1px solid rgba(107, 114, 128, 0.2)',
                        color: '#1A2332'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#FF6B6B';
                        e.target.style.boxShadow = '0 0 0 2px rgba(255, 107, 107, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(107, 114, 128, 0.2)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div>
                    <label htmlFor="challenges" className="block text-sm font-semibold mb-2" style={{ color: '#1A2332' }}>
                      {t('contactPage.form.currentChallenges')}
                    </label>
                    <textarea
                      id="challenges"
                      name="challenges"
                      rows={4}
                      value={formData.challenges}
                      onChange={handleChange}
                      placeholder={t('contactPage.form.challengesPlaceholder')}
                      className="w-full rounded-xl bg-white px-4 py-3 text-sm shadow-sm transition focus:outline-none focus:ring-2 resize-none"
                      style={{ 
                        border: '1px solid rgba(107, 114, 128, 0.2)',
                        color: '#1A2332'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#FF6B6B';
                        e.target.style.boxShadow = '0 0 0 2px rgba(255, 107, 107, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(107, 114, 128, 0.2)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div>
                    <label htmlFor="referralSource" className="block text-sm font-semibold mb-2" style={{ color: '#1A2332' }}>
                      {t('contactPage.form.howDidYouHear')}
                    </label>
                    <select
                      id="referralSource"
                      name="referralSource"
                      value={formData.referralSource}
                      onChange={handleChange}
                      className="w-full rounded-xl bg-white px-4 py-3 text-sm shadow-sm transition focus:outline-none focus:ring-2"
                      style={{ 
                        border: '1px solid rgba(107, 114, 128, 0.2)',
                        color: '#1A2332'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#FF6B6B';
                        e.target.style.boxShadow = '0 0 0 2px rgba(255, 107, 107, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(107, 114, 128, 0.2)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <option value="">{t('contactPage.form.selectOption')}</option>
                      <option value="Web Search">{t('contactPage.form.webSearch')}</option>
                      <option value="Referral">{t('contactPage.form.referral')}</option>
                      <option value="Conference">{t('contactPage.form.conference')}</option>
                      <option value="Other">{t('contactPage.form.other')}</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white transition"
                    style={{ 
                      backgroundColor: '#FF6B6B',
                      boxShadow: '0 20px 25px -5px rgba(255, 107, 107, 0.4)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#E65A5A';
                      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(255, 107, 107, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FF6B6B';
                      e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(255, 107, 107, 0.4)';
                    }}
                  >
                    {t('contactPage.form.requestDemo')}
                  </button>

                  <p className="text-xs text-center px-2" style={{ color: '#6B7280' }}>
                    {t('contactPage.form.privacyNotice')}
                  </p>
                </form>
              )}
            </div>
          </div>

          {/* Right Column - Information Cards */}
          <div className="order-1 space-y-4 lg:order-2">
            {/* What to Expect Card */}
            <div className="rounded-2xl p-4 sm:p-5 shadow-sm" style={{ 
              border: '1px solid rgba(107, 114, 128, 0.2)',
              backgroundColor: '#FFFFFF'
            }}>
              <h3 className="text-base sm:text-lg font-semibold mb-3" style={{ color: '#1A2332' }}>{t('contactPage.whatToExpect.title')}</h3>
              <ul className="space-y-2.5 text-sm" style={{ color: '#6B7280' }}>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: '#FF6B6B' }} />
                  <span>{t('contactPage.whatToExpect.item1')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: '#FF6B6B' }} />
                  <span>{t('contactPage.whatToExpect.item2')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: '#FF6B6B' }} />
                  <span>{t('contactPage.whatToExpect.item3')}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: '#FF6B6B' }} />
                  <span>{t('contactPage.whatToExpect.item4')}</span>
                </li>
              </ul>
            </div>

            {/* Contact Information Card */}
            <div className="rounded-2xl p-4 sm:p-5 shadow-sm" style={{ 
              border: '1px solid rgba(107, 114, 128, 0.2)',
              backgroundColor: '#FFFFFF'
            }}>
              <h3 className="text-base sm:text-lg font-semibold mb-3" style={{ color: '#1A2332' }}>{t('contactPage.contactInfo.title')}</h3>
              <div className="space-y-3 text-sm" style={{ color: '#6B7280' }}>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 flex-shrink-0" style={{ color: '#FF6B6B' }} />
                  <a href="mailto:info@vitalita.com" className="transition break-all" 
                    style={{ color: '#6B7280' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#FF6B6B'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
                  >
                    {t('contactPage.contactInfo.email')}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 flex-shrink-0" style={{ color: '#FF6B6B' }} />
                  <a href="tel:+390212345678" className="transition"
                    style={{ color: '#6B7280' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#FF6B6B'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
                  >
                    {t('contactPage.contactInfo.phone')}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 flex-shrink-0" style={{ color: '#FF6B6B' }} />
                  <span>{t('contactPage.contactInfo.hours')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 flex-shrink-0" style={{ color: '#FF6B6B' }} />
                  <span>{t('contactPage.contactInfo.location')}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="rounded-2xl p-4 sm:p-5 shadow-sm" style={{ 
              border: '1px solid rgba(107, 114, 128, 0.2)',
              background: 'linear-gradient(to bottom right, rgba(255, 107, 107, 0.1), #F9FAFB)'
            }}>
              <h3 className="text-base sm:text-lg font-semibold mb-3" style={{ color: '#1A2332' }}>{t('contactPage.quickStats.title')}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xl sm:text-2xl font-bold" style={{ color: '#FF6B6B' }}>150+</p>
                  <p className="text-xs mt-1" style={{ color: '#6B7280' }}>{t('contactPage.quickStats.organizations')}</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold" style={{ color: '#FF6B6B' }}>500K+</p>
                  <p className="text-xs mt-1" style={{ color: '#6B7280' }}>{t('contactPage.quickStats.donationsManaged')}</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold" style={{ color: '#FF6B6B' }}>1M+</p>
                  <p className="text-xs mt-1" style={{ color: '#6B7280' }}>{t('contactPage.quickStats.livesSaved')}</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold" style={{ color: '#FF6B6B' }}>24/7</p>
                  <p className="text-xs mt-1" style={{ color: '#6B7280' }}>{t('contactPage.quickStats.platformUptime')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="section-container py-4 sm:py-6 px-4 sm:px-6" style={{ borderTop: '1px solid rgba(107, 114, 128, 0.2)' }}>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
          <div className="flex items-center gap-2 text-xs sm:text-sm" style={{ color: '#6B7280' }}>
            <Shield className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#FF6B6B' }} />
            <span className="font-medium">{t('contactPage.trustBadges.gdprCompliant')}</span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm" style={{ color: '#6B7280' }}>
            <FileCheck className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#FF6B6B' }} />
            <span className="font-medium">{t('contactPage.trustBadges.isoCertified')}</span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm" style={{ color: '#6B7280' }}>
            <Lock className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#FF6B6B' }} />
            <span className="font-medium">{t('contactPage.trustBadges.secureEncryption')}</span>
          </div>
        </div>
      </section>

      {/* Testimonial Carousel */}
      <section className="section-container py-6 sm:py-8 px-4 sm:px-6" style={{ backgroundColor: '#F9FAFB' }}>
        <div className="text-center mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: '#FF6B6B' }}>{t('contactPage.testimonials.title')}</p>
          <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight" style={{ color: '#1A2332' }}>
            {t('contactPage.testimonials.heading')}
          </h2>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="rounded-2xl sm:rounded-[32px] p-4 sm:p-6 md:p-8 shadow-xl" style={{ 
            border: '1px solid rgba(107, 114, 128, 0.2)',
            backgroundColor: '#FFFFFF'
          }}>
            <div className="relative min-h-[150px]">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    index === currentTestimonial ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="text-center">
                    <Quote className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-3 opacity-50" style={{ color: '#FF6B6B' }} />
                    <p className="text-base sm:text-lg mb-4 leading-relaxed px-2" style={{ color: '#6B7280' }}>
                      "{testimonial.quote}"
                    </p>
                    <div>
                      <p className="font-semibold" style={{ color: '#1A2332' }}>{testimonial.author}</p>
                      <p className="text-xs sm:text-sm" style={{ color: '#6B7280' }}>{testimonial.position}</p>
                      <p className="text-xs sm:text-sm font-medium mt-1" style={{ color: '#FF6B6B' }}>{testimonial.organization}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Carousel Controls */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={prevTestimonial}
                className="p-2 rounded-full transition min-w-[44px] min-h-[44px] flex items-center justify-center"
                style={{ 
                  border: '1px solid rgba(107, 114, 128, 0.2)',
                  color: '#6B7280'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
                  e.currentTarget.style.borderColor = '#FF6B6B';
                  e.currentTarget.style.color = '#FF6B6B';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(107, 114, 128, 0.2)';
                  e.currentTarget.style.color = '#6B7280';
                }}
                aria-label={t('common.previous')}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: index === currentTestimonial ? '32px' : '8px',
                      backgroundColor: index === currentTestimonial ? '#FF6B6B' : 'rgba(107, 114, 128, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      if (index !== currentTestimonial) {
                        e.currentTarget.style.backgroundColor = 'rgba(107, 114, 128, 0.5)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (index !== currentTestimonial) {
                        e.currentTarget.style.backgroundColor = 'rgba(107, 114, 128, 0.3)';
                      }
                    }}
                    aria-label={`${t('common.next')} ${index + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={nextTestimonial}
                className="p-2 rounded-full transition min-w-[44px] min-h-[44px] flex items-center justify-center"
                style={{ 
                  border: '1px solid rgba(107, 114, 128, 0.2)',
                  color: '#6B7280'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
                  e.currentTarget.style.borderColor = '#FF6B6B';
                  e.currentTarget.style.color = '#FF6B6B';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(107, 114, 128, 0.2)';
                  e.currentTarget.style.color = '#6B7280';
                }}
                aria-label={t('common.next')}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;

import { useState, useEffect } from 'react';
import { Mail, MapPin, Phone, Clock, CheckCircle2, Shield, Lock, FileCheck, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

interface FormData {
  organizationName: string;
  name: string;
  role: string;
  email: string;
  challenges: string;
  referralSource: string;
}

const testimonials = [
  {
    quote: "Vitalita transformed our donation management. We've seen a 40% increase in donor engagement and streamlined our entire operation.",
    author: "Marco Rossi",
    position: "Operations Manager",
    organization: "AVIS Milano"
  }
];

const Contact = () => {
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
  }, []);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="bg-white">
      {/* Header Section */}
      <section className="section-container py-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">Contact Us</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Request Your Personalized Demo
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            See how Vitalita can transform your donation management
          </p>
        </div>
      </section>

      {/* Main Content - Two Column Layout */}
      <section className="section-container pb-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column - Contact Form */}
          <div className="order-2 lg:order-1">
            <div className="rounded-[32px] border border-slate-100 bg-white/90 p-6 shadow-2xl shadow-slate-200/50 lg:p-8">
              {submitted ? (
                <div className="text-center py-6">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold text-slate-900">Thank you!</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    A Vitalita expert will reach out within the next business day to coordinate a tailored demo.
                  </p>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="organizationName" className="block text-sm font-semibold text-slate-700 mb-2">
                      Organization Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="organizationName"
                      name="organizationName"
                      type="text"
                      required
                      value={formData.organizationName}
                      onChange={handleChange}
                      placeholder="e.g. AVIS Milano"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-semibold text-slate-700 mb-2">
                      Your Role/Position <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="role"
                      name="role"
                      required
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-100"
                    >
                      <option value="">Select your role</option>
                      <option value="Manager">Manager</option>
                      <option value="Director">Director</option>
                      <option value="IT Administrator">IT Administrator</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@organization.it"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-100"
                    />
                  </div>

                  <div>
                    <label htmlFor="challenges" className="block text-sm font-semibold text-slate-700 mb-2">
                      Current Challenges
                    </label>
                    <textarea
                      id="challenges"
                      name="challenges"
                      rows={4}
                      value={formData.challenges}
                      onChange={handleChange}
                      placeholder="Tell us about your biggest operational challenges"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-100 resize-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="referralSource" className="block text-sm font-semibold text-slate-700 mb-2">
                      How did you hear about us?
                    </label>
                    <select
                      id="referralSource"
                      name="referralSource"
                      value={formData.referralSource}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-100"
                    >
                      <option value="">Select an option</option>
                      <option value="Web Search">Web Search</option>
                      <option value="Referral">Referral</option>
                      <option value="Conference">Conference</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full inline-flex items-center justify-center rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-600/40 transition hover:bg-red-700"
                  >
                    Request Demo
                  </button>

                  <p className="text-xs text-slate-500 text-center">
                    By submitting this form you agree to Vitalita contacting you about our platform. View our Privacy Policy for details.
                  </p>
                </form>
              )}
            </div>
          </div>

          {/* Right Column - Information Cards */}
          <div className="order-1 space-y-4 lg:order-2">
            {/* What to Expect Card */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">What to Expect</h3>
              <ul className="space-y-2.5 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>30-minute personalized demo</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>Live Q&A with product specialist</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>Custom use case discussion</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>No obligation, no pressure</span>
                </li>
              </ul>
            </div>

            {/* Contact Information Card */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Contact Information</h3>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <a href="mailto:info@vitalita.com" className="transition hover:text-red-600">
                    info@vitalita.com
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <a href="tel:+390212345678" className="transition hover:text-red-600">
                    +39 02 1234 5678
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <span>Mon-Fri, 9:00-18:00 CET</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <span>Milan, Italy</span>
                </div>
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-red-50 to-slate-50 p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-2xl font-bold text-red-600">150+</p>
                  <p className="text-xs text-slate-600 mt-1">Organizations Trust Vitalita</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">500K+</p>
                  <p className="text-xs text-slate-600 mt-1">Donations Managed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">1M+</p>
                  <p className="text-xs text-slate-600 mt-1">Lives Saved</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">24/7</p>
                  <p className="text-xs text-slate-600 mt-1">Platform Uptime</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="section-container py-6 border-t border-slate-100">
        <div className="flex flex-wrap items-center justify-center gap-8">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Shield className="h-5 w-5 text-red-500" />
            <span className="font-medium">GDPR Compliant</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <FileCheck className="h-5 w-5 text-red-500" />
            <span className="font-medium">ISO Certified</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Lock className="h-5 w-5 text-red-500" />
            <span className="font-medium">Secure Encryption</span>
          </div>
        </div>
      </section>

      {/* Testimonial Carousel */}
      <section className="section-container py-8 bg-slate-50/50">
        <div className="text-center mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-500">Testimonials</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            What Our Partners Say
          </h2>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="rounded-[32px] border border-slate-100 bg-white p-6 md:p-8 shadow-xl">
            <div className="relative min-h-[150px]">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    index === currentTestimonial ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="text-center">
                    <Quote className="h-6 w-6 text-red-500 mx-auto mb-3 opacity-50" />
                    <p className="text-lg text-slate-700 mb-4 leading-relaxed">
                      "{testimonial.quote}"
                    </p>
                    <div>
                      <p className="font-semibold text-slate-900">{testimonial.author}</p>
                      <p className="text-sm text-slate-500">{testimonial.position}</p>
                      <p className="text-sm text-red-600 font-medium mt-1">{testimonial.organization}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Carousel Controls */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={prevTestimonial}
                className="p-2 rounded-full border border-slate-200 text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentTestimonial
                        ? 'w-8 bg-red-600'
                        : 'w-2 bg-slate-300 hover:bg-slate-400'
                    }`}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={nextTestimonial}
                className="p-2 rounded-full border border-slate-200 text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition"
                aria-label="Next testimonial"
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

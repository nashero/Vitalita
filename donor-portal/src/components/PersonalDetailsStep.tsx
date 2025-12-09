import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Mail,
  Phone,
  Shield,
  User,
} from 'lucide-react';

type DonatedBefore = '' | 'yes' | 'no';

export type PersonalDetails = {
  fullName: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  hasDonatedBefore: DonatedBefore;
  donorId: string;
};

type FieldKey = keyof PersonalDetails;

type FieldState = {
  error: string | null;
  touched: boolean;
};

type PersonalDetailsStepProps = {
  initialValues?: Partial<PersonalDetails>;
  onBack?: () => void;
  onContinue?: (data: PersonalDetails) => void;
};

const defaultValues: PersonalDetails = {
  fullName: '',
  dateOfBirth: '',
  phoneNumber: '',
  email: '',
  hasDonatedBefore: '',
  donorId: '',
};

const inputBaseClasses =
  'w-full h-12 rounded-lg pl-11 pr-12 text-[16px] text-espresso placeholder:text-taupe/70 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-mediterranean-blue';

const PersonalDetailsStep = ({
  initialValues,
  onBack,
  onContinue,
}: PersonalDetailsStepProps) => {
  const { t } = useTranslation();
  const [values, setValues] = useState<PersonalDetails>({
    ...defaultValues,
    ...initialValues,
  });
  const [fields, setFields] = useState<Record<FieldKey, FieldState>>({
    fullName: { error: null, touched: false },
    dateOfBirth: { error: null, touched: false },
    phoneNumber: { error: null, touched: false },
    email: { error: null, touched: false },
    hasDonatedBefore: { error: null, touched: false },
    donorId: { error: null, touched: false },
  });

  const validate = (values: PersonalDetails): Record<FieldKey, string | null> => {
    const errors: Record<FieldKey, string | null> = {
      fullName: null,
      dateOfBirth: null,
      phoneNumber: null,
      email: null,
      hasDonatedBefore: null,
      donorId: null,
    };

    if (!values.fullName.trim()) {
      errors.fullName = t('booking.step3.fullNameRequired');
    } else if (values.fullName.trim().length < 2) {
      errors.fullName = t('booking.step3.fullNameRequired');
    }

    if (!values.dateOfBirth) {
      errors.dateOfBirth = t('booking.step3.dobRequired');
    } else {
      const birthDate = new Date(values.dateOfBirth);
      const today = new Date();
      const age =
        today.getFullYear() -
        birthDate.getFullYear() -
        (today.getMonth() < birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
          ? 1
          : 0);
      if (age < 18) {
        errors.dateOfBirth = t('booking.step3.dobRequired');
      } else if (birthDate > today) {
        errors.dateOfBirth = t('booking.step3.dobRequired');
      }
    }

    if (!values.phoneNumber.trim()) {
      errors.phoneNumber = t('booking.step3.phoneRequired');
    } else {
      const phone = values.phoneNumber.replace(/\s/g, '');
      const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{3,}([-.\s]?[0-9]{2,})*$/;
      if (!phoneRegex.test(phone)) {
        errors.phoneNumber = t('booking.step3.phoneRequired');
      }
    }

    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = t('booking.step3.emailPlaceholder');
    }

    if (!values.hasDonatedBefore) {
      errors.hasDonatedBefore = t('booking.step3.hasDonatedBeforeRequired');
    }

    if (values.hasDonatedBefore === 'yes') {
      if (!values.donorId.trim()) {
        errors.donorId = t('booking.step3.hasDonatedBeforeRequired');
      } else if (!/^[A-Za-z0-9]{5}$/.test(values.donorId.trim())) {
        errors.donorId = t('booking.step3.hasDonatedBeforeRequired');
      }
    }

    return errors;
  };
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const nextErrors = validate(values);
      setFields((prev) => {
        const updated: Record<FieldKey, FieldState> = { ...prev };
        (Object.keys(prev) as FieldKey[]).forEach((key) => {
          updated[key] = { ...prev[key], error: nextErrors[key] };
        });
        return updated;
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [values]);

  const formIsValid = useMemo(() => {
    const errs = validate(values);
    const requiredValid =
      !errs.fullName && !errs.dateOfBirth && !errs.phoneNumber && !errs.hasDonatedBefore;
    const donorIdValid = values.hasDonatedBefore === 'yes' ? !errs.donorId : true;
    const emailValid = !errs.email;
    return requiredValid && donorIdValid && emailValid;
  }, [values]);

  const markTouched = (key: FieldKey) => {
    setFields((prev) => ({ ...prev, [key]: { ...prev[key], touched: true } }));
  };

  const fieldStatus = (key: FieldKey) => {
    const hasError = fields[key].touched && Boolean(fields[key].error);
    const success =
      fields[key].touched &&
      !fields[key].error &&
      (key === 'email' ? Boolean(values.email) : true);
    return { hasError, success, message: fields[key].error };
  };

  const handleChange = (key: FieldKey, value: string) => {
    setValues((prev) => ({
      ...prev,
      [key]:
        key === 'donorId'
          ? value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5)
          : value,
    }));
  };

  const formattedPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, '');
    if (digits.startsWith('39')) {
      const rest = digits.slice(2).slice(0, 10);
      return `+39 ${rest.replace(/(\d{3})(\d{0,3})(\d{0,4})/, (_, a, b, c) =>
        [a, b, c].filter(Boolean).join(' '),
      )}`.trim();
    }
    return raw.startsWith('+') ? raw : digits ? `+${digits}` : raw;
  };

  const submit = () => {
    if (formIsValid && onContinue) {
      onContinue(values);
    }
  };

  return (
    <section className="bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-12">
        <nav aria-label="Progress" className="mb-10">
          <ol className="flex items-center gap-3 md:gap-5">
            {[1, 2].map((step) => (
              <li key={step} className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-full bg-olive-green text-white flex items-center justify-center font-semibold">
                  <Check aria-hidden />
                </span>
                <div className="hidden sm:block text-sm text-espresso font-medium">Step {step}</div>
                <div className="w-12 md:w-20 h-0.5 bg-terracotta rounded-full" aria-hidden />
              </li>
            ))}
            <li className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-full bg-terracotta text-white flex items-center justify-center font-semibold">
                3
              </span>
              <div className="hidden sm:block text-sm text-espresso font-semibold">Your Details</div>
            </li>
            <div className="flex-1 border-t border-taupe/30 ml-3" aria-hidden />
          </ol>
        </nav>

        <div className="bg-cream border-l-4 border-terracotta rounded-r-lg p-4 mb-8 flex items-start gap-3">
          <User className="w-5 h-5 text-terracotta mt-0.5" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-espresso">Step 3: Your Details</p>
            <p className="text-sm text-taupe">Enter your contact information</p>
          </div>
        </div>

        <header className="mb-8">
          <h1 className="text-[32px] font-bold text-espresso leading-tight">Tell us about yourself</h1>
          <p className="text-[16px] text-taupe">
            We&apos;ll send reminders and keep you updated about your appointment.
          </p>
        </header>

        <div className="mb-6 bg-cream border-l-4 border-mediterranean-blue rounded-r-lg p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-mediterranean-blue mt-0.5" aria-hidden />
          <p className="text-[14px] text-espresso">
            Your information is protected by GDPR and EU privacy laws
          </p>
        </div>

        <div className="mb-8">
          <button
            type="button"
            onClick={() => setShowPrivacy((s) => !s)}
            className="text-mediterranean-blue underline underline-offset-2 hover:text-mediterranean-blue/80 text-sm font-medium flex items-center gap-1"
            aria-expanded={showPrivacy}
            aria-controls="privacy-details"
          >
            How we use your data
            {showPrivacy ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showPrivacy && (
            <div
              id="privacy-details"
              className="mt-3 bg-cream rounded-lg p-4 text-sm text-taupe transition-all duration-300"
            >
              We only use your details to confirm your booking, send reminders, and keep your
              donation history accurate. You can request changes or deletion at any time in line
              with EU privacy laws.
            </div>
          )}
        </div>

        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-espresso mb-2">
              Full Name <span className="text-burnt-orange">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mediterranean-blue" />
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                value={values.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                onBlur={() => markTouched('fullName')}
                placeholder="e.g. Giulia Rossi"
                aria-invalid={fieldStatus('fullName').hasError}
                aria-describedby={fieldStatus('fullName').message ? 'fullName-error' : undefined}
                className={`${inputBaseClasses} ${
                  fieldStatus('fullName').hasError
                    ? 'border-2 border-burnt-orange'
                    : fieldStatus('fullName').success
                    ? 'border-2 border-olive-green'
                    : 'border border-taupe'
                } focus:border-mediterranean-blue`}
              />
              {fieldStatus('fullName').success && (
                <CheckCircle2
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-olive-green"
                  aria-hidden
                />
              )}
            </div>
            {fieldStatus('fullName').message && (
              <p id="fullName-error" className="mt-1 text-sm text-burnt-orange" role="alert">
                {fieldStatus('fullName').message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-espresso mb-2">
              Date of Birth <span className="text-burnt-orange">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mediterranean-blue" />
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={values.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                onBlur={() => markTouched('dateOfBirth')}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18))
                  .toISOString()
                  .split('T')[0]}
                aria-invalid={fieldStatus('dateOfBirth').hasError}
                aria-describedby={
                  fieldStatus('dateOfBirth').message ? 'dob-error dob-helper' : 'dob-helper'
                }
                className={`${inputBaseClasses} ${
                  fieldStatus('dateOfBirth').hasError
                    ? 'border-2 border-burnt-orange'
                    : fieldStatus('dateOfBirth').success
                    ? 'border-2 border-olive-green'
                    : 'border border-taupe'
                } focus:border-mediterranean-blue`}
              />
              {fieldStatus('dateOfBirth').success && (
                <CheckCircle2
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-olive-green"
                  aria-hidden
                />
              )}
            </div>
            <p id="dob-helper" className="mt-1 text-sm text-taupe">
              You must be at least 18 years old to donate
            </p>
            {fieldStatus('dateOfBirth').message && (
              <p id="dob-error" className="mt-1 text-sm text-burnt-orange" role="alert">
                {fieldStatus('dateOfBirth').message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-semibold text-espresso mb-2">
              Phone Number <span className="text-burnt-orange">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mediterranean-blue" />
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={values.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', formattedPhone(e.target.value))}
                onBlur={() => markTouched('phoneNumber')}
                placeholder="+39 123 456 7890"
                autoComplete="tel"
                aria-invalid={fieldStatus('phoneNumber').hasError}
                aria-describedby={
                  fieldStatus('phoneNumber').message ? 'phone-error' : undefined
                }
                className={`${inputBaseClasses} ${
                  fieldStatus('phoneNumber').hasError
                    ? 'border-2 border-burnt-orange'
                    : fieldStatus('phoneNumber').success
                    ? 'border-2 border-olive-green'
                    : 'border border-taupe'
                } focus:border-mediterranean-blue`}
              />
              {fieldStatus('phoneNumber').success && (
                <CheckCircle2
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-olive-green"
                  aria-hidden
                />
              )}
            </div>
            {fieldStatus('phoneNumber').message && (
              <p id="phone-error" className="mt-1 text-sm text-burnt-orange" role="alert">
                {fieldStatus('phoneNumber').message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-espresso mb-2">
              Email <span className="text-xs text-taupe font-normal">(optional)</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-mediterranean-blue" />
              <input
                id="email"
                name="email"
                type="email"
                value={values.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => markTouched('email')}
                placeholder="giulia.rossi@email.com"
                autoComplete="email"
                aria-invalid={fieldStatus('email').hasError}
                aria-describedby={fieldStatus('email').message ? 'email-error' : undefined}
                className={`${inputBaseClasses} ${
                  fieldStatus('email').hasError
                    ? 'border-2 border-burnt-orange'
                    : fieldStatus('email').success
                    ? 'border-2 border-olive-green'
                    : 'border border-taupe'
                } focus:border-mediterranean-blue`}
              />
              {fieldStatus('email').success && (
                <CheckCircle2
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-olive-green"
                  aria-hidden
                />
              )}
            </div>
            <p className="mt-1 text-sm text-taupe">We&apos;ll send you a confirmation email</p>
            {fieldStatus('email').message && (
              <p id="email-error" className="mt-1 text-sm text-burnt-orange" role="alert">
                {fieldStatus('email').message}
              </p>
            )}
          </div>

          <fieldset className="space-y-3" aria-describedby="donated-before-help">
            <legend className="block text-sm font-semibold text-espresso mb-1">
              Have you donated before? <span className="text-burnt-orange">*</span>
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { value: 'yes' as DonatedBefore, label: t('booking.step3.yesReturning') },
                { value: 'no' as DonatedBefore, label: t('booking.step3.noFirstTime') },
              ].map((option) => {
                const checked = values.hasDonatedBefore === option.value;
                return (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                      checked ? 'border-mediterranean-blue bg-cream' : 'border-taupe hover:bg-cream'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        checked
                          ? 'border-mediterranean-blue bg-mediterranean-blue'
                          : 'border-taupe bg-white'
                      }`}
                    >
                      {checked && <Check className="w-3 h-3 text-white" />}
                    </span>
                    <input
                      type="radio"
                      name="hasDonatedBefore"
                      value={option.value}
                      checked={checked}
                      onChange={(e) => {
                        handleChange('hasDonatedBefore', e.target.value);
                        markTouched('hasDonatedBefore');
                        if (e.target.value === 'no') {
                          setValues((prev) => ({ ...prev, donorId: '' }));
                        }
                      }}
                      className="sr-only"
                    />
                    <span className="text-base text-espresso">{option.label}</span>
                  </label>
                );
              })}
            </div>
            <p id="donated-before-help" className="sr-only">
              Select whether you have donated before.
            </p>
            {fieldStatus('hasDonatedBefore').message && (
              <p className="text-sm text-burnt-orange" role="alert">
                {fieldStatus('hasDonatedBefore').message}
              </p>
            )}
          </fieldset>

          {values.hasDonatedBefore === 'yes' && (
            <div className="transition-all duration-300 ease-in-out">
              <label htmlFor="donorId" className="block text-sm font-semibold text-espresso mb-2">
                Donor ID <span className="text-burnt-orange">*</span>
              </label>
              <input
                id="donorId"
                name="donorId"
                type="text"
                value={values.donorId}
                onChange={(e) => handleChange('donorId', e.target.value)}
                onBlur={() => markTouched('donorId')}
                placeholder="A1B2C"
                aria-invalid={fieldStatus('donorId').hasError}
                aria-describedby={fieldStatus('donorId').message ? 'donor-id-error' : undefined}
                className={`${inputBaseClasses.replace('pl-11', 'px-4')} ${
                  fieldStatus('donorId').hasError
                    ? 'border-2 border-burnt-orange'
                    : fieldStatus('donorId').success
                    ? 'border-2 border-olive-green'
                    : 'border border-taupe'
                } focus:border-mediterranean-blue uppercase`}
              />
              <p className="mt-1 text-sm text-taupe">
                Enter your 5-digit alphanumeric donor ID provided by AVIS
              </p>
              {fieldStatus('donorId').message && (
                <p id="donor-id-error" className="mt-1 text-sm text-burnt-orange" role="alert">
                  {fieldStatus('donorId').message}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="h-12 px-6 rounded-lg border-2 border-taupe text-taupe font-semibold hover:border-espresso hover:text-espresso transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!onBack}
            >
              Back
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="hidden md:inline-flex h-12 px-4 items-center gap-2 text-sm text-mediterranean-blue hover:text-mediterranean-blue/80"
                aria-label="Scroll to top"
              >
                <ChevronUp className="w-4 h-4" />
                Top
              </button>
              <button
                type="submit"
                onClick={submit}
                disabled={!formIsValid}
                className={`h-12 px-6 rounded-lg font-semibold inline-flex items-center gap-2 transition-all duration-200 ${
                  formIsValid
                    ? 'bg-terracotta text-white shadow-sm hover:shadow-md'
                    : 'bg-taupe text-white/80 cursor-not-allowed opacity-70'
                }`}
              >
                {formIsValid && <Check className="w-5 h-5" aria-hidden />}
                Continue to Health Check
              </button>
            </div>
          </div>
        </form>

        <footer className="mt-12 bg-espresso text-cream rounded-xl px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">Vitalita | Mediterranean Care</p>
            <p className="text-sm text-cream/80">
              Need help? Call your local AVIS center or email support@vitalita.it
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ChevronLeft className="w-4 h-4 text-cream" />
            <div className="w-16 h-0.5 bg-cream/40" aria-hidden />
            <ChevronRight className="w-4 h-4 text-cream" />
          </div>
        </footer>
      </div>
    </section>
  );
};

export default PersonalDetailsStep;


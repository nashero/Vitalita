import { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  User,
  Calendar,
  Phone,
  Mail,
  Shield,
  Check,
  ChevronDown,
  ChevronUp,
  Sprout,
} from 'lucide-react';

interface DonorPersonalInfoProps {
  onContinue?: (data: DonorFormData) => void;
  onBack?: () => void;
  initialData?: Partial<DonorFormData>;
}

export interface DonorFormData {
  fullName: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  hasDonatedBefore: 'yes' | 'no' | '';
  donorId: string;
}

interface FieldValidation {
  isValid: boolean;
  error?: string;
}

const DonorPersonalInfo: React.FC<DonorPersonalInfoProps> = ({
  onContinue,
  onBack,
  initialData,
}) => {
  const [formData, setFormData] = useState<DonorFormData>({
    fullName: initialData?.fullName || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    phoneNumber: initialData?.phoneNumber || '',
    email: initialData?.email || '',
    hasDonatedBefore: initialData?.hasDonatedBefore || '',
    donorId: initialData?.donorId || '',
  });

  const [validation, setValidation] = useState<Record<string, FieldValidation>>({
    fullName: { isValid: false },
    dateOfBirth: { isValid: false },
    phoneNumber: { isValid: false },
    email: { isValid: true }, // Optional field
    hasDonatedBefore: { isValid: false },
    donorId: { isValid: true }, // Only required if hasDonatedBefore is 'yes'
  });

  const [showPrivacyNotice, setShowPrivacyNotice] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Debounce validation
  const validateField = useCallback((name: keyof DonorFormData, value: string): FieldValidation => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) {
          return { isValid: false, error: 'Full name is required' };
        }
        if (value.trim().length < 2) {
          return { isValid: false, error: 'Name must be at least 2 characters' };
        }
        if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(value.trim())) {
          return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
        }
        return { isValid: true };

      case 'dateOfBirth':
        if (!value) {
          return { isValid: false, error: 'Date of birth is required' };
        }
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
          ? age - 1 
          : age;
        
        if (actualAge < 18) {
          return { isValid: false, error: 'You must be at least 18 years old to donate' };
        }
        if (birthDate > today) {
          return { isValid: false, error: 'Date of birth cannot be in the future' };
        }
        return { isValid: true };

      case 'phoneNumber':
        if (!value.trim()) {
          return { isValid: false, error: 'Phone number is required' };
        }
        // Allow various phone formats (international, Italian, etc.)
        const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
          return { isValid: false, error: 'Please enter a valid phone number' };
        }
        return { isValid: true };

      case 'email':
        if (value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return { isValid: false, error: 'Please enter a valid email address' };
        }
        return { isValid: true };

      case 'hasDonatedBefore':
        if (!value) {
          return { isValid: false, error: 'Please select an option' };
        }
        return { isValid: true };

      case 'donorId':
        if (formData.hasDonatedBefore === 'yes') {
          if (!value.trim()) {
            return { isValid: false, error: 'Donor ID is required for returning donors' };
          }
          if (!/^[A-Z0-9]{5}$/.test(value.trim().toUpperCase())) {
            return { isValid: false, error: 'Donor ID must be 5 alphanumeric characters' };
          }
        }
        return { isValid: true };

      default:
        return { isValid: true };
    }
  }, [formData.hasDonatedBefore]);

  // Debounced validation
  useEffect(() => {
    const timers: Record<string, NodeJS.Timeout> = {};
    
    Object.keys(formData).forEach((key) => {
      const fieldName = key as keyof DonorFormData;
      if (touched[fieldName] || formData[fieldName]) {
        timers[fieldName] = setTimeout(() => {
          const result = validateField(fieldName, formData[fieldName]);
          setValidation((prev) => ({
            ...prev,
            [fieldName]: result,
          }));
        }, 300);
      }
    });

    return () => {
      Object.values(timers).forEach((timer) => clearTimeout(timer));
    };
  }, [formData, validateField, touched]);

  // Validate donorId when hasDonatedBefore changes
  useEffect(() => {
    if (formData.hasDonatedBefore === 'yes' && touched.donorId) {
      const result = validateField('donorId', formData.donorId);
      setValidation((prev) => ({
        ...prev,
        donorId: result,
      }));
    } else if (formData.hasDonatedBefore === 'no') {
      setValidation((prev) => ({
        ...prev,
        donorId: { isValid: true },
      }));
    }
  }, [formData.hasDonatedBefore, formData.donorId, touched.donorId, validateField]);

  const handleChange = (name: keyof DonorFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const handleBlur = (name: keyof DonorFormData) => {
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  const isFormValid = () => {
    const requiredFieldsValid = 
      validation.fullName.isValid &&
      validation.dateOfBirth.isValid &&
      validation.phoneNumber.isValid &&
      validation.hasDonatedBefore.isValid &&
      validation.email.isValid;

    const donorIdValid = formData.hasDonatedBefore === 'yes' 
      ? validation.donorId.isValid 
      : true;

    return requiredFieldsValid && donorIdValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid() && onContinue) {
      onContinue(formData);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Format as +39 XXX XXX XXXX for Italian numbers
    if (digits.startsWith('39')) {
      const remaining = digits.slice(2);
      if (remaining.length <= 10) {
        const formatted = remaining.match(/.{1,3}/g)?.join(' ') || remaining;
        return `+39 ${formatted}`;
      }
    }
    
    // For other formats, add + if it starts with a number and doesn't have +
    if (digits.length > 0 && !value.startsWith('+')) {
      return `+${digits}`;
    }
    
    return value;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[600px] mx-auto px-4 py-6 md:py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 md:gap-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-olive-green text-white flex items-center justify-center text-sm font-semibold">
                ✓
              </div>
              <span className="text-xs mt-1 text-taupe hidden md:block">Step 1</span>
            </div>
            <div className="w-12 md:w-24 h-0.5 bg-olive-green" />
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-olive-green text-white flex items-center justify-center text-sm font-semibold">
                ✓
              </div>
              <span className="text-xs mt-1 text-taupe hidden md:block">Step 2</span>
            </div>
            <div className="w-12 md:w-24 h-0.5 bg-olive-green" />
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-terracotta text-white flex items-center justify-center text-sm font-semibold">
                3
              </div>
              <span className="text-xs mt-1 text-espresso font-semibold hidden md:block">Your Details</span>
            </div>
            <div className="w-12 md:w-24 h-0.5 bg-taupe/30" />
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-taupe text-taupe bg-white flex items-center justify-center text-sm font-semibold">
                4
              </div>
              <span className="text-xs mt-1 text-taupe hidden md:block">Step 4</span>
            </div>
          </div>
        </div>

        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            type="button"
            className="mb-6 px-4 py-2 border border-taupe text-taupe rounded-lg hover:bg-cream transition-colors duration-200 flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        )}

        {/* Trust Indicator */}
        <div className="mb-6 bg-cream border-l-4 border-mediterranean-blue rounded-r-lg p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-mediterranean-blue flex-shrink-0 mt-0.5" />
          <p className="text-[14px] text-espresso">
            Your information is protected by GDPR and EU privacy laws
          </p>
        </div>

        {/* Heading with Italian Touch */}
        <header className="mb-8 relative">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-[28px] md:text-[32px] font-bold text-espresso">
              Tell us about yourself
            </h1>
            <Sprout className="w-6 h-6 md:w-7 md:h-7 text-olive-green flex-shrink-0" />
          </div>
          <p className="text-base text-taupe">
            We'll send reminders and keep you updated about your appointment.
          </p>
        </header>

        {/* Privacy Notice */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setShowPrivacyNotice(!showPrivacyNotice)}
            className="text-mediterranean-blue hover:text-mediterranean-blue/80 text-sm underline transition-colors duration-200 flex items-center gap-1"
          >
            How we use your data
            {showPrivacyNotice ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {showPrivacyNotice && (
            <div className="mt-3 bg-cream rounded-lg p-4 transition-all duration-300 ease-in-out">
              <p className="text-sm text-taupe">
                Your personal information will be securely handled and the original data will not be stored. This ensures GDPR compliance while maintaining secure authentication.
              </p>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold text-espresso mb-2">
              Full Name <span className="text-burnt-orange">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <User className="w-5 h-5 text-mediterranean-blue" />
              </div>
              <input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                onBlur={() => handleBlur('fullName')}
                placeholder="e.g. Giulia Rossi"
                className={`
                  w-full pl-11 pr-10 py-3 rounded-lg transition-all duration-200 bg-white
                  ${touched.fullName && !validation.fullName.isValid
                    ? 'border-2 border-burnt-orange'
                    : touched.fullName && validation.fullName.isValid
                    ? 'border-2 border-olive-green'
                    : 'border border-taupe hover:bg-cream'
                  }
                  focus:outline-none focus:ring-0 focus:bg-cream
                  ${touched.fullName && validation.fullName.isValid
                    ? 'focus:border-2 focus:border-olive-green'
                    : 'focus:border-2 focus:border-mediterranean-blue'
                  }
                  text-espresso placeholder:text-taupe/60
                `}
              />
              {touched.fullName && validation.fullName.isValid && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Check className="w-5 h-5 text-olive-green" />
                </div>
              )}
            </div>
            {touched.fullName && validation.fullName.error && (
              <p className="mt-1 text-sm text-burnt-orange">{validation.fullName.error}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-espresso mb-2">
              Date of Birth <span className="text-burnt-orange">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Calendar className="w-5 h-5 text-mediterranean-blue" />
              </div>
              <input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                onBlur={() => handleBlur('dateOfBirth')}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                className={`
                  w-full pl-11 pr-10 py-3 rounded-lg transition-all duration-200 bg-white
                  ${touched.dateOfBirth && !validation.dateOfBirth.isValid
                    ? 'border-2 border-burnt-orange'
                    : touched.dateOfBirth && validation.dateOfBirth.isValid
                    ? 'border-2 border-olive-green'
                    : 'border border-taupe hover:bg-cream'
                  }
                  focus:outline-none focus:ring-0 focus:bg-cream
                  ${touched.dateOfBirth && validation.dateOfBirth.isValid
                    ? 'focus:border-2 focus:border-olive-green'
                    : 'focus:border-2 focus:border-mediterranean-blue'
                  }
                  text-espresso placeholder:text-taupe/60
                `}
              />
              {touched.dateOfBirth && validation.dateOfBirth.isValid && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Check className="w-5 h-5 text-olive-green" />
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-taupe">You must be at least 18 years old to donate</p>
            {touched.dateOfBirth && validation.dateOfBirth.error && (
              <p className="mt-1 text-sm text-burnt-orange">{validation.dateOfBirth.error}</p>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-semibold text-espresso mb-2">
              Phone Number <span className="text-burnt-orange">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Phone className="w-5 h-5 text-mediterranean-blue" />
              </div>
              <input
                id="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  handleChange('phoneNumber', formatted);
                }}
                onBlur={() => handleBlur('phoneNumber')}
                placeholder="+39 123 456 7890"
                className={`
                  w-full pl-11 pr-10 py-3 rounded-lg transition-all duration-200 bg-white
                  ${touched.phoneNumber && !validation.phoneNumber.isValid
                    ? 'border-2 border-burnt-orange'
                    : touched.phoneNumber && validation.phoneNumber.isValid
                    ? 'border-2 border-olive-green'
                    : 'border border-taupe hover:bg-cream'
                  }
                  focus:outline-none focus:ring-0 focus:bg-cream
                  ${touched.phoneNumber && validation.phoneNumber.isValid
                    ? 'focus:border-2 focus:border-olive-green'
                    : 'focus:border-2 focus:border-mediterranean-blue'
                  }
                  text-espresso placeholder:text-taupe/60
                `}
              />
              {touched.phoneNumber && validation.phoneNumber.isValid && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Check className="w-5 h-5 text-olive-green" />
                </div>
              )}
            </div>
            {touched.phoneNumber && validation.phoneNumber.error && (
              <p className="mt-1 text-sm text-burnt-orange">{validation.phoneNumber.error}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-espresso mb-2">
              Email <span className="text-taupe text-xs font-normal">(optional)</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Mail className="w-5 h-5 text-mediterranean-blue" />
              </div>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="giulia.rossi@email.com"
                className={`
                  w-full pl-11 pr-10 py-3 rounded-lg transition-all duration-200 bg-white
                  ${touched.email && !validation.email.isValid
                    ? 'border-2 border-burnt-orange'
                    : touched.email && validation.email.isValid && formData.email
                    ? 'border-2 border-olive-green'
                    : 'border border-taupe hover:bg-cream'
                  }
                  focus:outline-none focus:ring-0 focus:bg-cream
                  ${touched.email && validation.email.isValid && formData.email
                    ? 'focus:border-2 focus:border-olive-green'
                    : 'focus:border-2 focus:border-mediterranean-blue'
                  }
                  text-espresso placeholder:text-taupe/60
                `}
              />
              {touched.email && validation.email.isValid && formData.email && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Check className="w-5 h-5 text-olive-green" />
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-taupe">We'll send you a confirmation email</p>
            {touched.email && validation.email.error && (
              <p className="mt-1 text-sm text-burnt-orange">{validation.email.error}</p>
            )}
          </div>

          {/* Have you donated before? */}
          <div>
            <fieldset>
              <legend className="block text-sm font-semibold text-espresso mb-3">
                Have you donated before? <span className="text-burnt-orange">*</span>
              </legend>
              <div className="space-y-3" role="radiogroup">
                <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-lg border border-taupe hover:bg-cream transition-colors duration-200">
                  <input
                    type="radio"
                    name="hasDonatedBefore"
                    value="yes"
                    checked={formData.hasDonatedBefore === 'yes'}
                    onChange={(e) => {
                      handleChange('hasDonatedBefore', e.target.value);
                      handleBlur('hasDonatedBefore');
                    }}
                    className="w-5 h-5 text-mediterranean-blue border-taupe focus:ring-mediterranean-blue focus:ring-2 checked:bg-mediterranean-blue checked:border-mediterranean-blue"
                  />
                  <span className="text-base text-espresso">Yes, I'm a returning donor</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-lg border border-taupe hover:bg-cream transition-colors duration-200">
                  <input
                    type="radio"
                    name="hasDonatedBefore"
                    value="no"
                    checked={formData.hasDonatedBefore === 'no'}
                    onChange={(e) => {
                      handleChange('hasDonatedBefore', e.target.value);
                      handleBlur('hasDonatedBefore');
                      setFormData((prev) => ({ ...prev, donorId: '' }));
                    }}
                    className="w-5 h-5 text-mediterranean-blue border-taupe focus:ring-mediterranean-blue focus:ring-2 checked:bg-mediterranean-blue checked:border-mediterranean-blue"
                  />
                  <span className="text-base text-espresso">No, this is my first time</span>
                </label>
              </div>
              {touched.hasDonatedBefore && validation.hasDonatedBefore.error && (
                <p className="mt-2 text-sm text-burnt-orange">{validation.hasDonatedBefore.error}</p>
              )}
            </fieldset>
          </div>

          {/* Donor ID (conditional) */}
          {formData.hasDonatedBefore === 'yes' && (
            <div className="transition-all duration-300 ease-in-out">
              <label htmlFor="donorId" className="block text-sm font-semibold text-espresso mb-2">
                Donor ID <span className="text-burnt-orange">*</span>
              </label>
              <div className="relative">
                <input
                  id="donorId"
                  type="text"
                  value={formData.donorId}
                  onChange={(e) => {
                    const upperValue = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5);
                    handleChange('donorId', upperValue);
                  }}
                  onBlur={() => handleBlur('donorId')}
                  placeholder="A1B2C"
                  className={`
                    w-full px-4 pr-10 py-3 rounded-lg transition-all duration-200 bg-white
                    ${touched.donorId && !validation.donorId.isValid
                      ? 'border-2 border-burnt-orange'
                      : touched.donorId && validation.donorId.isValid
                      ? 'border-2 border-olive-green'
                      : 'border border-taupe hover:bg-cream'
                    }
                    focus:outline-none focus:ring-0 focus:bg-cream
                    ${touched.donorId && validation.donorId.isValid
                      ? 'focus:border-2 focus:border-olive-green'
                      : 'focus:border-2 focus:border-mediterranean-blue'
                    }
                    text-espresso placeholder:text-taupe/60 uppercase
                  `}
                />
                {touched.donorId && validation.donorId.isValid && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Check className="w-5 h-5 text-olive-green" />
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-taupe">Enter your 5-digit alphanumeric donor ID provided by AVIS</p>
              {touched.donorId && validation.donorId.error && (
                <p className="mt-1 text-sm text-burnt-orange">{validation.donorId.error}</p>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6 border-t border-taupe/20">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-3 border border-taupe text-taupe rounded-lg hover:bg-cream transition-colors duration-200"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={!isFormValid()}
              className={`
                px-6 py-3 rounded-lg font-semibold transition-all duration-200 ml-auto flex items-center gap-2
                ${isFormValid()
                  ? 'bg-terracotta text-white hover:bg-terracotta/90 shadow-lg hover:shadow-xl'
                  : 'bg-taupe/30 text-taupe cursor-not-allowed'
                }
              `}
            >
              {isFormValid() && <Check className="w-5 h-5" />}
              Continue to Health Check
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DonorPersonalInfo;


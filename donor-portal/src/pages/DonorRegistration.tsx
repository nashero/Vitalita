import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { generateDonorHashId, generateSalt } from '../utils/hash';

interface RegistrationFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  donorId: string;
  email: string;
}

const DonorRegistration = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState<RegistrationFormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    donorId: '',
    email: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: keyof RegistrationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) return t('registration.validation.firstNameRequired');
    if (!formData.lastName.trim()) return t('registration.validation.lastNameRequired');
    if (!formData.dateOfBirth) return t('registration.validation.dateOfBirthRequired');
    if (!formData.donorId.trim()) return t('registration.validation.donorIdRequired');
    if (!formData.email.trim()) return t('registration.validation.emailRequired');

    // Validate Donor ID format (5-digit alphanumeric)
    const donorIdRegex = /^[A-Za-z0-9]{5}$/;
    if (!donorIdRegex.test(formData.donorId)) {
      return t('registration.validation.donorIdFormatError');
    }

    // Validate email format
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      return t('registration.validation.emailFormatError');
    }

    // Validate date of birth (must be at least 18 years old)
    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      age < 18 ||
      (age === 18 && monthDiff < 0) ||
      (age === 18 && monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      return t('registration.validation.ageRequirementError');
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Generate donor_hash_id from personal information (GDPR compliant)
      // This creates a unique identifier without storing PII
      const donorHashId = await generateDonorHashId(
        formData.firstName.toUpperCase(),
        formData.lastName.toUpperCase(),
        formData.dateOfBirth,
        formData.donorId.toUpperCase()
      );

      // Check if this hash already exists (duplicate registration)
      const { data: existingDonor, error: checkError } = await supabase
        .from('donors')
        .select('donor_hash_id')
        .eq('donor_hash_id', donorHashId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected for new registrations
        console.error('Error checking existing donor:', checkError);
        setError(t('registration.validation.registrationFailed'));
        return;
      }

      if (existingDonor) {
        setError(t('registration.validation.accountExists'));
        return;
      }

      // Check if email already exists
      const { data: existingEmail, error: emailCheckError } = await supabase
        .from('donors')
        .select('email')
        .eq('email', formData.email.toLowerCase())
        .single();

      if (emailCheckError && emailCheckError.code !== 'PGRST116') {
        console.error('Error checking existing email:', emailCheckError);
        setError(t('registration.validation.registrationFailed'));
        return;
      }

      if (existingEmail) {
        setError(t('registration.validation.emailExists'));
        return;
      }

      // Generate salt for additional security
      const salt = generateSalt();

      // Call the Supabase function to register the donor
      // The function signature: register_donor_with_email(p_donor_hash_id, p_salt, p_email, p_donor_id)
      const { data: registrationResult, error: registrationError } = await supabase.rpc(
        'register_donor_with_email',
        {
          p_donor_hash_id: donorHashId,
          p_salt: salt,
          p_email: formData.email.toLowerCase(),
          p_donor_id: formData.donorId.toUpperCase(),
        }
      );

      if (registrationError) {
        console.error('Registration error:', registrationError);
        setError(registrationError.message || t('registration.validation.registrationFailed'));
        return;
      }

      // Check if registration was successful
      if (registrationResult && registrationResult.length > 0) {
        const result = registrationResult[0];
        if (result.success) {
          setSuccess(true);
          setFormData({
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            donorId: '',
            email: '',
          });

          // Redirect after 3 seconds
          setTimeout(() => {
            navigate('/');
          }, 3000);
        } else {
          setError(result.message || t('registration.validation.genericFailure'));
        }
      } else {
        setError(t('registration.validation.registrationFailed'));
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(t('registration.validation.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18);
  const maxDateString = maxDate.toISOString().split('T')[0];

  const handleBack = () => {
    // Navigate back to previous page, or home if no history
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="donor-registration-page">
      <div className="registration-container">
        <div className="registration-card">
          {/* Back Button */}
          <button
            type="button"
            onClick={handleBack}
            className="back-button"
            aria-label={t('registration.backAriaLabel')}
          >
            <span aria-hidden="true">←</span>
            <span>{t('registration.back')}</span>
          </button>

          {/* Header */}
          <div className="registration-header">
            <div className="registration-header-icon">
              <span aria-hidden="true">👤</span>
              <span aria-hidden="true" className="icon-plus">+</span>
            </div>
            <h1>{t('registration.title')}</h1>
          </div>

          {/* Form Content */}
          <div className="registration-content">
            {success ? (
              <div className="inline-alert success">
                <strong>{t('registration.success.title')}</strong>
                <p>
                  {t('registration.success.message')}
                </p>
              </div>
            ) : (
              <>
                {/* Privacy & Security Notice */}
                <div className="registration-notice registration-notice-privacy">
                  <div className="notice-icon">🛡️</div>
                  <div className="notice-content">
                    <p>
                      <strong>{t('registration.privacy.title')}</strong>
                    </p>
                    <p>
                      {t('registration.privacy.description')}
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="inline-alert error">
                    <p>{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="registration-form">
                  {/* Name Fields */}
                  <div className="form-row">
                    <div className="form-field">
                      <label htmlFor="firstName">
                        {t('registration.form.firstName')} <span aria-label={t('registration.form.requiredAriaLabel')}>{t('registration.form.required')}</span>
                      </label>
                      <div className="input-wrapper">
                        <span className="input-icon" aria-hidden="true">
                          👤
                        </span>
                        <input
                          type="text"
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) =>
                            handleInputChange('firstName', e.target.value.toUpperCase())
                          }
                          placeholder={t('registration.form.firstNamePlaceholder')}
                          disabled={loading}
                          required
                        />
                        <span className="input-decoration" aria-hidden="true">
                          ⋮
                        </span>
                      </div>
                    </div>

                    <div className="form-field">
                      <label htmlFor="lastName">
                        {t('registration.form.lastName')} <span aria-label={t('registration.form.requiredAriaLabel')}>{t('registration.form.required')}</span>
                      </label>
                      <div className="input-wrapper">
                        <span className="input-icon" aria-hidden="true">
                          👤
                        </span>
                        <input
                          type="text"
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) =>
                            handleInputChange('lastName', e.target.value.toUpperCase())
                          }
                          placeholder={t('registration.form.lastNamePlaceholder')}
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div className="form-field">
                    <label htmlFor="dateOfBirth">
                      {t('registration.form.dateOfBirth')} <span aria-label={t('registration.form.requiredAriaLabel')}>{t('registration.form.required')}</span>
                    </label>
                    <div className="input-wrapper">
                      <span className="input-icon" aria-hidden="true">
                        📅
                      </span>
                      <input
                        type="date"
                        id="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        max={maxDateString}
                        disabled={loading}
                        required
                        className="date-input"
                      />
                    </div>
                    <p className="field-hint">{t('registration.form.ageRequirement')}</p>
                  </div>

                  {/* Donor ID */}
                  <div className="form-field">
                    <label htmlFor="donorId">
                      {t('registration.form.donorId')} <span aria-label={t('registration.form.requiredAriaLabel')}>{t('registration.form.required')}</span>
                    </label>
                    <div className="input-wrapper">
                      <span className="input-icon" aria-hidden="true">
                        👤
                      </span>
                      <input
                        type="text"
                        id="donorId"
                        value={formData.donorId}
                        onChange={(e) =>
                          handleInputChange('donorId', e.target.value.toUpperCase())
                        }
                        placeholder={t('registration.form.donorIdPlaceholder')}
                        maxLength={5}
                        pattern="[A-Za-z0-9]{5}"
                        disabled={loading}
                        required
                      />
                    </div>
                    <p className="field-hint">
                      {t('registration.form.donorIdHint')}
                    </p>
                  </div>

                  {/* Email Address */}
                  <div className="form-field">
                    <label htmlFor="email">
                      {t('registration.form.email')} <span aria-label={t('registration.form.requiredAriaLabel')}>{t('registration.form.required')}</span>
                    </label>
                    <div className="input-wrapper">
                      <span className="input-icon" aria-hidden="true">
                        ✉️
                      </span>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder={t('registration.form.emailPlaceholder')}
                        disabled={loading}
                        required
                      />
                    </div>
                    <p className="field-hint">
                      {t('registration.form.emailHint')}
                    </p>
                  </div>

                  {/* Before You Continue Notice */}
                  <div className="registration-notice registration-notice-warning">
                    <div className="notice-icon">⚠️</div>
                    <div className="notice-content">
                      <p>
                        <strong>{t('registration.warning.title')}</strong>
                      </p>
                      <p className="notice-subheading">{t('registration.warning.doubleCheckTitle')}</p>
                      <p>
                        {t('registration.warning.doubleCheckMessage')}
                      </p>
                      <ul>
                        <li>{t('registration.warning.detailFirstName')}</li>
                        <li>{t('registration.warning.detailLastName')}</li>
                        <li>{t('registration.warning.detailDateOfBirth')}</li>
                        <li>{t('registration.warning.detailDonorId')}</li>
                      </ul>
                      <p className="notice-subheading">{t('registration.warning.verificationProcessTitle')}</p>
                      <ol>
                        <li>{t('registration.warning.step1')}</li>
                        <li>{t('registration.warning.step2')}</li>
                        <li>{t('registration.warning.step3')}</li>
                        <li>
                          {t('registration.warning.step4')}
                        </li>
                        <li>
                          {t('registration.warning.step5')}
                        </li>
                      </ol>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="button primary registration-submit"
                  >
                    {loading ? (
                      <>
                        <span className="spinner spinner-small" aria-hidden="true"></span>
                        <span>{t('registration.submit.submitting')}</span>
                      </>
                    ) : (
                      <>
                        <span aria-hidden="true">📄</span>
                        <span>{t('registration.submit.button')}</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorRegistration;


import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { generateDonorHashId } from '../utils/hash';

interface LoginFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  donorId: string;
}

const DonorLogin = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState<LoginFormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    donorId: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) return t('login.validation.firstNameRequired');
    if (!formData.lastName.trim()) return t('login.validation.lastNameRequired');
    if (!formData.dateOfBirth) return t('login.validation.dateOfBirthRequired');
    if (!formData.donorId.trim()) return t('login.validation.donorIdRequired');

    // Validate Donor ID format (5-digit alphanumeric)
    const donorIdRegex = /^[A-Za-z0-9]{5}$/;
    if (!donorIdRegex.test(formData.donorId)) {
      return t('login.validation.donorIdFormatError');
    }

    // Validate date of birth format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.dateOfBirth)) {
      return t('login.validation.dateOfBirthFormatError');
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

      // Generate donor_hash_id from personal information (same as registration)
      const donorHashId = await generateDonorHashId(
        formData.firstName.toUpperCase(),
        formData.lastName.toUpperCase(),
        formData.dateOfBirth,
        formData.donorId.toUpperCase()
      );

      // Check if donor exists and is active
      const { data: donorData, error: donorError } = await supabase
        .from('donors')
        .select('donor_hash_id, donor_id, email_verified, account_activated, is_active, email')
        .eq('donor_hash_id', donorHashId)
        .single();

      if (donorError) {
        if (donorError.code === 'PGRST116') {
          setError(t('login.errors.accountNotFound'));
        } else {
          console.error('Error checking donor:', donorError);
          setError(t('login.errors.loginFailed'));
        }
        return;
      }

      if (!donorData) {
        setError(t('login.errors.accountNotFound'));
        return;
      }

      // Check if account is active
      if (!donorData.is_active) {
        setError(t('login.errors.accountNotActive'));
        return;
      }

      // Check if account is activated
      if (!donorData.account_activated) {
        setError(t('login.errors.accountNotActivated'));
        return;
      }

      // Check if email is verified
      if (!donorData.email_verified) {
        setError(t('login.errors.emailNotVerified'));
        return;
      }

      // Store donor information in session storage for authentication
      sessionStorage.setItem('donor_hash_id', donorData.donor_hash_id);
      sessionStorage.setItem('donor_id', donorData.donor_id || formData.donorId.toUpperCase());
      sessionStorage.setItem('donor_email', donorData.email || '');

      // Dispatch custom event to notify Header component of auth state change
      window.dispatchEvent(new Event('auth-change'));

      // Redirect to appointments page
      navigate('/appointments');
    } catch (err) {
      console.error('Login error:', err);
      setError(t('login.errors.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  // Format date for display (convert YYYY-MM-DD to MM/DD/YYYY)
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Parse MM/DD/YYYY to YYYY-MM-DD
  const parseDateInput = (dateString: string): string => {
    if (!dateString) return '';
    const parts = dateString.split('/');
    if (parts.length !== 3) return dateString;
    const month = parts[0].padStart(2, '0');
    const day = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
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
            aria-label={t('login.backAriaLabel')}
          >
            <span aria-hidden="true">←</span>
            <span>{t('login.back')}</span>
          </button>

          {/* Header */}
          <div className="registration-header">
            <div className="registration-header-icon">
              <span aria-hidden="true">🔑</span>
            </div>
            <h1>{t('login.title')}</h1>
          </div>

          {/* Form Content */}
          <div className="registration-content">
            {error && (
              <div className="inline-alert error">
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="registration-form">
              {/* Name Fields */}
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="loginFirstName">
                    {t('login.form.firstName')} <span aria-label={t('login.form.requiredAriaLabel')}>{t('login.form.required')}</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-icon" aria-hidden="true">
                      👤
                    </span>
                    <input
                      type="text"
                      id="loginFirstName"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange('firstName', e.target.value.toUpperCase())
                      }
                      placeholder={t('login.form.firstNamePlaceholder')}
                      disabled={loading}
                      required
                    />
                    <span className="input-decoration" aria-hidden="true">
                      ⋮
                    </span>
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="loginLastName">
                    {t('login.form.lastName')} <span aria-label={t('login.form.requiredAriaLabel')}>{t('login.form.required')}</span>
                  </label>
                  <div className="input-wrapper">
                    <span className="input-icon" aria-hidden="true">
                      👤
                    </span>
                    <input
                      type="text"
                      id="loginLastName"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange('lastName', e.target.value.toUpperCase())
                      }
                      placeholder={t('login.form.lastNamePlaceholder')}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Date of Birth */}
              <div className="form-field">
                <label htmlFor="loginDateOfBirth">
                  {t('login.form.dateOfBirth')} <span aria-label={t('login.form.requiredAriaLabel')}>{t('login.form.required')}</span>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon" aria-hidden="true">
                    📅
                  </span>
                  <input
                    type="date"
                    id="loginDateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    max={maxDateString}
                    disabled={loading}
                    required
                    className="date-input"
                  />
                  <span className="input-decoration" aria-hidden="true">
                    📅
                  </span>
                </div>
                <p className="field-hint">{t('login.form.ageRequirement')}</p>
              </div>

              {/* Donor ID */}
              <div className="form-field">
                <label htmlFor="loginDonorId">
                  {t('login.form.donorId')} <span aria-label={t('login.form.requiredAriaLabel')}>{t('login.form.required')}</span>
                </label>
                <div className="input-wrapper">
                  <span className="input-icon" aria-hidden="true">
                    👤
                  </span>
                  <input
                    type="text"
                    id="loginDonorId"
                    value={formData.donorId}
                    onChange={(e) =>
                      handleInputChange('donorId', e.target.value.toUpperCase())
                    }
                    placeholder={t('login.form.donorIdPlaceholder')}
                    maxLength={5}
                    pattern="[A-Za-z0-9]{5}"
                    disabled={loading}
                    required
                  />
                </div>
                <p className="field-hint">
                  {t('login.form.donorIdHint')}
                </p>
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
                    <span>{t('login.submit.loggingIn')}</span>
                  </>
                ) : (
                  <>
                    <span aria-hidden="true">🔑</span>
                    <span>{t('login.submit.button')}</span>
                  </>
                )}
              </button>

              {/* Link to Registration */}
              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  {t('login.registerLink.newToVitalita')}
                </p>
                <a
                  href="/register"
                  className="text-link"
                  style={{ color: 'var(--brand-red)', fontWeight: 600 }}
                >
                  {t('login.registerLink.registerAsDonor')}
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorLogin;


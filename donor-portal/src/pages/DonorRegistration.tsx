import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.lastName.trim()) return 'Last name is required';
    if (!formData.dateOfBirth) return 'Date of birth is required';
    if (!formData.donorId.trim()) return 'Donor ID is required';
    if (!formData.email.trim()) return 'Email address is required';

    // Validate Donor ID format (5-digit alphanumeric)
    const donorIdRegex = /^[A-Za-z0-9]{5}$/;
    if (!donorIdRegex.test(formData.donorId)) {
      return 'Donor ID must be exactly 5 alphanumeric characters';
    }

    // Validate email format
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address';
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
      return 'You must be at least 18 years old to donate';
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
        setError('Registration failed. Please try again or contact AVIS staff for assistance.');
        return;
      }

      if (existingDonor) {
        setError('A donor account already exists with these details. Please contact AVIS staff for assistance.');
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
        setError('Registration failed. Please try again or contact AVIS staff for assistance.');
        return;
      }

      if (existingEmail) {
        setError('An account with this email address already exists. Please use a different email or contact AVIS staff for assistance.');
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
        setError(registrationError.message || 'Registration failed. Please try again or contact AVIS staff for assistance.');
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
          setError(result.message || 'Registration failed. Please try again.');
        }
      } else {
        setError('Registration failed. Please try again or contact AVIS staff for assistance.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again or contact AVIS staff for assistance.');
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
            aria-label="Go back to previous page"
          >
            <span aria-hidden="true">←</span>
            <span>Back</span>
          </button>

          {/* Header */}
          <div className="registration-header">
            <div className="registration-header-icon">
              <span aria-hidden="true">👤</span>
              <span aria-hidden="true" className="icon-plus">+</span>
            </div>
            <h1>Donor Registration</h1>
          </div>

          {/* Form Content */}
          <div className="registration-content">
            {success ? (
              <div className="inline-alert success">
                <strong>Registration Submitted Successfully!</strong>
                <p>
                  Your registration has been submitted for review. AVIS staff will review and
                  activate your account. The process takes about 45 days. Once you are verified as
                  a donor, you'll receive a notification by email.
                </p>
              </div>
            ) : (
              <>
                {/* Privacy & Security Notice */}
                <div className="registration-notice registration-notice-privacy">
                  <div className="notice-icon">🛡️</div>
                  <div className="notice-content">
                    <p>
                      <strong>Privacy & Security</strong>
                    </p>
                    <p>
                      Your personal information will be securely hashed and the original data will
                      not be stored. This ensures GDPR compliance while maintaining secure
                      authentication.
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
                        First Name <span aria-label="required">*</span>
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
                          placeholder="Enter your first name"
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
                        Last Name <span aria-label="required">*</span>
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
                          placeholder="Enter your last name"
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div className="form-field">
                    <label htmlFor="dateOfBirth">
                      Date of Birth <span aria-label="required">*</span>
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
                    <p className="field-hint">You must be at least 18 years old to donate</p>
                  </div>

                  {/* Donor ID */}
                  <div className="form-field">
                    <label htmlFor="donorId">
                      Donor ID <span aria-label="required">*</span>
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
                        placeholder="Enter your 5-digit alphanumeric donor ID"
                        maxLength={5}
                        pattern="[A-Za-z0-9]{5}"
                        disabled={loading}
                        required
                      />
                    </div>
                    <p className="field-hint">
                      Enter the 5-digit alphanumeric ID provided by AVIS
                    </p>
                  </div>

                  {/* Email Address */}
                  <div className="form-field">
                    <label htmlFor="email">
                      Email Address <span aria-label="required">*</span>
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
                        placeholder="Enter your email address"
                        disabled={loading}
                        required
                      />
                    </div>
                    <p className="field-hint">
                      We'll send a verification email to this address
                    </p>
                  </div>

                  {/* Before You Continue Notice */}
                  <div className="registration-notice registration-notice-warning">
                    <div className="notice-icon">⚠️</div>
                    <div className="notice-content">
                      <p>
                        <strong>Before You Continue</strong>
                      </p>
                      <p className="notice-subheading">Double-check details</p>
                      <p>
                        Double-check these details before submitting — they cannot be changed once
                        saved:
                      </p>
                      <ul>
                        <li>First Name</li>
                        <li>Last Name</li>
                        <li>Date of Birth</li>
                        <li>Donor ID</li>
                      </ul>
                      <p className="notice-subheading">Verification Process</p>
                      <ol>
                        <li>Submit registration form</li>
                        <li>AVIS staff will review and activate your account</li>
                        <li>The process takes about 45 days</li>
                        <li>
                          Once you are verified as a donor, you'll receive a notification by email
                        </li>
                        <li>
                          Once you verify your email, you'll be able to create a 5-digit PIN to log
                          into the system
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
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span aria-hidden="true">📄</span>
                        <span>Submit Registration</span>
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


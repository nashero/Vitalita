# Email Template for PIN Setup Integration

## Verification Email Template

This document provides the updated email template for donor verification emails that includes the PIN setup flow.

### Email Subject
```
Verify Your Vitalita Account - Complete Registration
```

### Email Body (HTML)

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Vitalita Account</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none; }
        .button { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        .button:hover { background: #b91c1c; }
        .highlight { background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .steps { background: #f0f9ff; border: 1px solid #bae6fd; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .step { margin: 10px 0; }
        .step-number { background: #dc2626; color: white; border-radius: 50%; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🩸 Welcome to Vitalita</h1>
            <p>Complete Your Donor Registration</p>
        </div>
        
        <div class="content">
            <h2>Hello {{firstName}},</h2>
            
            <p>Thank you for registering with Vitalita! Your account has been created and is ready for verification.</p>
            
            <div class="highlight">
                <h3>🔐 Next Step: Set Up Your PIN</h3>
                <p>After verifying your email, you'll be prompted to create a secure 5-digit PIN for quick and secure access to your donor account.</p>
            </div>
            
            <div class="steps">
                <h3>Complete Your Registration in 3 Easy Steps:</h3>
                <div class="step">
                    <span class="step-number">1</span>
                    <strong>Verify Your Email</strong> - Click the button below to verify your email address
                </div>
                <div class="step">
                    <span class="step-number">2</span>
                    <strong>Set Up Your PIN</strong> - Create a secure 5-digit PIN for account access
                </div>
                <div class="step">
                    <span class="step-number">3</span>
                    <strong>Start Donating</strong> - Book your first donation appointment
                </div>
            </div>
            
            <div style="text-align: center;">
                <a href="{{verificationUrl}}" class="button">Verify Email & Set Up PIN</a>
            </div>
            
            <p><strong>Your Registration Details:</strong></p>
            <ul>
                <li><strong>Name:</strong> {{firstName}} {{lastName}}</li>
                <li><strong>Donor ID:</strong> {{donorId}}</li>
                <li><strong>Date of Birth:</strong> {{dateOfBirth}}</li>
                <li><strong>Email:</strong> {{email}}</li>
            </ul>
            
            <div class="highlight">
                <h4>🛡️ Security Information</h4>
                <p>Your PIN will be encrypted and stored securely on your device. It will be required for all future logins to ensure only you can access your account.</p>
            </div>
            
            <p><strong>Important:</strong> This verification link will expire in 24 hours. If you don't verify your email within this time, please contact AVIS staff for assistance.</p>
            
            <p>If you didn't create an account with Vitalita, please ignore this email or contact our support team.</p>
        </div>
        
        <div class="footer">
            <p><strong>Vitalita Blood Donation System</strong></p>
            <p>Making blood donation simple, secure, and accessible</p>
            <p style="font-size: 12px; color: #6b7280;">
                This email was sent to {{email}}. If you have any questions, contact your local AVIS center.
            </p>
        </div>
    </div>
</body>
</html>
```

### Email Body (Plain Text)

```
Welcome to Vitalita - Complete Your Donor Registration

Hello {{firstName}},

Thank you for registering with Vitalita! Your account has been created and is ready for verification.

NEXT STEP: SET UP YOUR PIN
After verifying your email, you'll be prompted to create a secure 5-digit PIN for quick and secure access to your donor account.

Complete Your Registration in 3 Easy Steps:

1. Verify Your Email - Click the link below to verify your email address
2. Set Up Your PIN - Create a secure 5-digit PIN for account access  
3. Start Donating - Book your first donation appointment

Verify Email & Set Up PIN: {{verificationUrl}}

Your Registration Details:
- Name: {{firstName}} {{lastName}}
- Donor ID: {{donorId}}
- Date of Birth: {{dateOfBirth}}
- Email: {{email}}

SECURITY INFORMATION
Your PIN will be encrypted and stored securely on your device. It will be required for all future logins to ensure only you can access your account.

Important: This verification link will expire in 24 hours. If you don't verify your email within this time, please contact AVIS staff for assistance.

If you didn't create an account with Vitalita, please ignore this email or contact our support team.

---
Vitalita Blood Donation System
Making blood donation simple, secure, and accessible

This email was sent to {{email}}. If you have any questions, contact your local AVIS center.
```

### Template Variables

The following variables should be replaced in the email template:

- `{{firstName}}` - Donor's first name
- `{{lastName}}` - Donor's last name  
- `{{donorId}}` - Generated donor ID
- `{{dateOfBirth}}` - Donor's date of birth
- `{{email}}` - Donor's email address
- `{{verificationUrl}}` - Complete verification URL with token

### Verification URL Format

The verification URL should be in the format:
```
https://your-domain.com/email-verification?token={{verificationToken}}
```

This will automatically redirect to the PIN setup flow after successful verification.

### Integration Notes

1. **Email Service Integration**: Replace the placeholder `send_verification_email()` function with actual email service calls
2. **Template Rendering**: Use a template engine to replace variables with actual donor data
3. **URL Generation**: Ensure the verification URL points to the correct domain and route
4. **Testing**: Test both HTML and plain text versions across different email clients
5. **Localization**: Consider creating translated versions for different languages

### Security Considerations

1. **Token Security**: Verification tokens should be cryptographically secure and time-limited
2. **HTTPS**: All verification links must use HTTPS
3. **Rate Limiting**: Implement rate limiting for verification attempts
4. **Audit Logging**: Log all verification attempts for security monitoring
5. **GDPR Compliance**: Ensure email content complies with data protection regulations

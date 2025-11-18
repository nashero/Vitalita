import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { EmailOptions } from '../types/index.js';

dotenv.config();

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter configuration
transporter.verify((error) => {
  if (error) {
    console.error('❌ Email service configuration error:', error);
  } else {
    console.log('✅ Email service ready');
  }
});

/**
 * Send email
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@vitalita.it',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Send registration approval request email to administrator
 */
export const sendRegistrationApprovalEmail = async (
  adminEmail: string,
  newUserEmail: string,
  newUserName: string,
  centerName: string
): Promise<void> => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5175';
  const approvalUrl = `${frontendUrl}/admin/approve-user?email=${encodeURIComponent(newUserEmail)}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .button { display: inline-block; padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Staff Registration Request</h1>
        </div>
        <div class="content">
          <p>Hello Administrator,</p>
          <p>A new staff member has requested registration:</p>
          <ul>
            <li><strong>Name:</strong> ${newUserName}</li>
            <li><strong>Email:</strong> ${newUserEmail}</li>
            <li><strong>Center:</strong> ${centerName}</li>
          </ul>
          <p>Please review and approve this registration:</p>
          <a href="${approvalUrl}" class="button">Review Registration</a>
          <p>Or copy this link: ${approvalUrl}</p>
        </div>
        <div class="footer">
          <p>This is an automated message from Vitalita Staff Portal</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: adminEmail,
    subject: 'New Staff Registration Request - Action Required',
    html,
  });
};

/**
 * Send welcome email to newly approved user
 */
export const sendWelcomeEmail = async (
  userEmail: string,
  userName: string,
  loginUrl: string
): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .button { display: inline-block; padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Vitalita Staff Portal!</h1>
        </div>
        <div class="content">
          <p>Hello ${userName},</p>
          <p>Your registration has been approved. You can now access the Vitalita Staff Portal.</p>
          <a href="${loginUrl}" class="button">Login to Portal</a>
          <p>If you have any questions, please contact your administrator.</p>
        </div>
        <div class="footer">
          <p>This is an automated message from Vitalita Staff Portal</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: userEmail,
    subject: 'Welcome to Vitalita Staff Portal',
    html,
  });
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  userEmail: string,
  resetToken: string,
  userName: string
): Promise<void> => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5175';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .button { display: inline-block; padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .warning { background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hello ${userName},</p>
          <p>You have requested to reset your password. Click the button below to create a new password:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p>Or copy this link: ${resetUrl}</p>
          <div class="warning">
            <p><strong>Security Notice:</strong></p>
            <p>This link will expire in 1 hour. If you did not request this reset, please ignore this email or contact support.</p>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated message from Vitalita Staff Portal</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: userEmail,
    subject: 'Password Reset Request - Vitalita Staff Portal',
    html,
  });
};

export default {
  sendEmail,
  sendRegistrationApprovalEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
};


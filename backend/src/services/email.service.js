const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Email configuration from environment variables
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = process.env.EMAIL_PORT || 587;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Create reusable transporter
let transporter = null;

const createTransporter = () => {
  if (transporter) return transporter;

  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn('Email credentials not configured. Email service will not work.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465, // true for 465, false for other ports
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  return transporter;
};

/**
 * Send email using nodemailer
 * @param {Object} options - { to, subject, html, text }
 * @returns {Promise<Object>}
 */
const sendEmail = async (options) => {
  const emailTransporter = createTransporter();
  
  if (!emailTransporter) {
    console.error('Email transporter not available. Check email configuration.');
    throw new Error('Email service not configured');
  }

  const mailOptions = {
    from: `"Shopshop" <${EMAIL_FROM}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
  };

  // Add attachments if provided
  if (options.attachments && Array.isArray(options.attachments)) {
    mailOptions.attachments = options.attachments;
  }

  try {
    const info = await emailTransporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Old gift card email templates and functions removed:
// - generateGiftCardShareEmailTemplate
// - generateAcceptanceConfirmationToSenderTemplate
// - generateAcceptanceConfirmationToReceiverTemplate
// - sendGiftCardShareEmail
// - sendAcceptanceConfirmationToSender
// - sendAcceptanceConfirmationToReceiver
// New flow: Gift cards are sent directly via email with PDF attachment after payment

module.exports = {
  sendEmail,
  FRONTEND_URL,
};


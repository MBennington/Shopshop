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

  try {
    const info = await emailTransporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Generate HTML template for gift card share email
 * @param {Object} data - { senderName, receiverName, amount, expiryDate, acceptanceLink }
 * @returns {String} HTML email template
 */
const generateGiftCardShareEmailTemplate = (data) => {
  const { senderName, receiverName, amount, expiryDate, acceptanceLink } = data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>You've Received a Gift Card!</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">🎁 You've Received a Gift Card!</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px;">Hi ${receiverName || 'there'},</p>
        
        <p style="font-size: 16px;">
          <strong>${senderName}</strong> has sent you a gift card worth <strong style="color: #667eea; font-size: 20px;">LKR ${amount.toLocaleString()}</strong>!
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
          <p style="margin: 10px 0;"><strong>Gift Card Amount:</strong> LKR ${amount.toLocaleString()}</p>
          <p style="margin: 10px 0;"><strong>Expiry Date:</strong> ${new Date(expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        
        <p style="font-size: 16px;">
          To accept this gift card and add it to your account, click the button below:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${acceptanceLink}" 
             style="display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
            Accept Gift Card
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666;">
          Or copy and paste this link into your browser:<br>
          <a href="${acceptanceLink}" style="color: #667eea; word-break: break-all;">${acceptanceLink}</a>
        </p>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          <strong>Note:</strong> This link will expire in 7 days. You'll need to create an account or log in to accept the gift card.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          This is an automated email from Shopshop. Please do not reply to this email.
        </p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate HTML template for gift card acceptance confirmation (to sender)
 * @param {Object} data - { senderName, receiverName, amount }
 * @returns {String} HTML email template
 */
const generateAcceptanceConfirmationToSenderTemplate = (data) => {
  const { senderName, receiverName, amount } = data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Gift Card Accepted</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">✅ Gift Card Accepted!</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px;">Hi ${senderName},</p>
        
        <p style="font-size: 16px;">
          Great news! <strong>${receiverName}</strong> has accepted your gift card of <strong style="color: #48bb78; font-size: 20px;">LKR ${amount.toLocaleString()}</strong>.
        </p>
        
        <p style="font-size: 16px;">
          The gift card has been successfully added to their account and they can now use it for purchases.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          This is an automated email from Shopshop. Please do not reply to this email.
        </p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate HTML template for gift card acceptance confirmation (to receiver)
 * @param {Object} data - { receiverName, senderName, amount, code, pin, expiryDate }
 * @returns {String} HTML email template
 */
const generateAcceptanceConfirmationToReceiverTemplate = (data) => {
  const { receiverName, senderName, amount, code, pin, expiryDate } = data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Gift Card Details</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">🎉 Gift Card Accepted!</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px;">Hi ${receiverName},</p>
        
        <p style="font-size: 16px;">
          You've successfully accepted the gift card from <strong>${senderName}</strong>!
        </p>
        
        <div style="background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border: 2px solid #667eea;">
          <h2 style="color: #667eea; margin-top: 0; text-align: center;">Your Gift Card Details</h2>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p style="margin: 10px 0; font-size: 14px; color: #666;"><strong>Gift Card Code:</strong></p>
            <p style="margin: 10px 0; font-size: 24px; font-weight: bold; font-family: monospace; letter-spacing: 2px; text-align: center; color: #333;">${code}</p>
          </div>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p style="margin: 10px 0; font-size: 14px; color: #666;"><strong>Security PIN:</strong></p>
            <p style="margin: 10px 0; font-size: 24px; font-weight: bold; font-family: monospace; letter-spacing: 4px; text-align: center; color: #333;">${pin}</p>
          </div>
          
          <div style="margin: 15px 0;">
            <p style="margin: 10px 0;"><strong>Amount:</strong> <span style="color: #667eea; font-size: 18px;">LKR ${amount.toLocaleString()}</span></p>
            <p style="margin: 10px 0;"><strong>Expiry Date:</strong> ${new Date(expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #856404;">
            <strong>⚠️ Important:</strong> Please save both the Gift Card Code and PIN securely. You'll need both to redeem this gift card. The PIN will not be shown again.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${FRONTEND_URL}" 
             style="display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
            Start Shopping
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          This is an automated email from Shopshop. Please do not reply to this email.
        </p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Send gift card share email
 * @param {Object} data - { senderName, senderEmail, receiverEmail, receiverName, amount, expiryDate, acceptanceLink }
 * @returns {Promise<Object>}
 */
const sendGiftCardShareEmail = async (data) => {
  const html = generateGiftCardShareEmailTemplate({
    senderName: data.senderName,
    receiverName: data.receiverName || 'there',
    amount: data.amount,
    expiryDate: data.expiryDate,
    acceptanceLink: data.acceptanceLink,
  });

  return await sendEmail({
    to: data.receiverEmail,
    subject: `🎁 You've Received a Gift Card from ${data.senderName}!`,
    html,
  });
};

/**
 * Send acceptance confirmation to sender
 * @param {Object} data - { senderName, senderEmail, receiverName, amount }
 * @returns {Promise<Object>}
 */
const sendAcceptanceConfirmationToSender = async (data) => {
  const html = generateAcceptanceConfirmationToSenderTemplate({
    senderName: data.senderName,
    receiverName: data.receiverName,
    amount: data.amount,
  });

  return await sendEmail({
    to: data.senderEmail,
    subject: `✅ Your Gift Card Was Accepted by ${data.receiverName}`,
    html,
  });
};

/**
 * Send acceptance confirmation to receiver
 * @param {Object} data - { receiverName, receiverEmail, senderName, amount, code, pin, expiryDate }
 * @returns {Promise<Object>}
 */
const sendAcceptanceConfirmationToReceiver = async (data) => {
  const html = generateAcceptanceConfirmationToReceiverTemplate({
    receiverName: data.receiverName,
    senderName: data.senderName,
    amount: data.amount,
    code: data.code,
    pin: data.pin,
    expiryDate: data.expiryDate,
  });

  return await sendEmail({
    to: data.receiverEmail,
    subject: `🎉 Your Gift Card Details - LKR ${data.amount.toLocaleString()}`,
    html,
  });
};

module.exports = {
  sendEmail,
  sendGiftCardShareEmail,
  sendAcceptanceConfirmationToSender,
  sendAcceptanceConfirmationToReceiver,
  FRONTEND_URL,
};


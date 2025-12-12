/**
 * Email Service - Modular email sending service
 * 
 * This service provides a modular interface for sending emails.
 * Currently uses Nodemailer with Gmail SMTP, but can be easily
 * replaced with any third-party service (SendGrid, Mailgun, etc.)
 * 
 * To replace with another provider:
 * 1. Create a new transport adapter
 * 2. Update the sendEmail function to use the new adapter
 * 3. Keep the same function signatures for compatibility
 */

const nodemailer = require('nodemailer');

// ==================== CONFIGURATION ====================

const emailConfig = {
  // Gmail SMTP configuration
  gmail: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: process.env.EMAIL_USER || process.env.GMAIL_USER,
      pass: process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD
    }
  },
  
  // Default sender info
  defaultFrom: {
    name: process.env.EMAIL_FROM_NAME || 'Trnsferio',
    email: process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.GMAIL_USER
  },
  
  // OTP settings
  otp: {
    length: 6,
    expiryMinutes: 10
  }
};

// ==================== TRANSPORT FACTORY ====================

/**
 * Create email transport based on provider
 * Currently supports: gmail
 * Add more providers as needed (sendgrid, mailgun, etc.)
 */
function createTransport(provider = 'gmail') {
  switch (provider) {
    case 'gmail':
      return nodemailer.createTransport(emailConfig.gmail);
    
    // Add more providers here:
    // case 'sendgrid':
    //   return createSendGridTransport();
    // case 'mailgun':
    //   return createMailgunTransport();
    
    default:
      return nodemailer.createTransport(emailConfig.gmail);
  }
}

// ==================== EMAIL TEMPLATES ====================

const emailTemplates = {
  /**
   * OTP Verification Email Template
   */
  otpVerification: (otp, userName, expiryMinutes = 10) => ({
    subject: `🔐 Your Trnsferio Verification Code: ${otp}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fe;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                ✨ Trnsferio
              </h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">
                Dealer Discount Management System
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">
                Hello${userName ? `, ${userName}` : ''}! 👋
              </h2>
              
              <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                Thank you for registering with Trnsferio. To complete your registration, 
                please enter the verification code below:
              </p>
              
              <!-- OTP Box -->
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 30px; text-align: center; margin: 30px 0;">
                <p style="color: rgba(255,255,255,0.9); margin: 0 0 15px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">
                  Your Verification Code
                </p>
                <h1 style="color: #ffffff; margin: 0; font-size: 48px; font-weight: 700; letter-spacing: 10px;">
                  ${otp}
                </h1>
              </div>
              
              <!-- Expiry Warning -->
              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 8px; margin: 25px 0;">
                <p style="color: #856404; margin: 0; font-size: 14px;">
                  ⏰ This code will expire in <strong>${expiryMinutes} minutes</strong>. 
                  Please use it before it expires.
                </p>
              </div>
              
              <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 25px 0 0 0;">
                If you didn't request this verification code, please ignore this email 
                or contact our support team if you have concerns.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #888; font-size: 12px; margin: 0 0 10px 0;">
                This is an automated message from Trnsferio.
              </p>
              <p style="color: #888; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Trnsferio. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `
      Hello${userName ? `, ${userName}` : ''}!
      
      Thank you for registering with Trnsferio.
      
      Your verification code is: ${otp}
      
      This code will expire in ${expiryMinutes} minutes.
      
      If you didn't request this code, please ignore this email.
      
      - Trnsferio Team
    `
  }),

  /**
   * Welcome Email Template (after successful verification)
   */
  welcomeEmail: (userName, dealerCode) => ({
    subject: `🎉 Welcome to Trnsferio, ${userName}!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fe;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">
                🎉 Welcome to Trnsferio!
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">
                Congratulations, ${userName}! 🎊
              </h2>
              
              <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                Your account has been successfully verified and created. 
                You can now log in and start using Trnsferio to check discount offers!
              </p>
              
              <!-- Dealer Code Box -->
              <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); border-radius: 16px; padding: 25px; text-align: center; margin: 30px 0;">
                <p style="color: rgba(255,255,255,0.9); margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">
                  Your Dealer Code
                </p>
                <h1 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: 700; letter-spacing: 5px;">
                  ${dealerCode}
                </h1>
                <p style="color: rgba(255,255,255,0.8); margin: 15px 0 0 0; font-size: 14px;">
                  Please save this code for login
                </p>
              </div>
              
              <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 25px 0;">
                If you have any questions, feel free to reach out to our support team.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eee;">
              <p style="color: #888; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Trnsferio. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `
      Congratulations, ${userName}!
      
      Your account has been successfully verified and created.
      
      Your Dealer Code: ${dealerCode}
      
      Please save this code for login.
      
      - Trnsferio Team
    `
  })
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Generate a random numeric OTP
 */
function generateOTP(length = 6) {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
}

/**
 * Calculate OTP expiry time
 */
function getOTPExpiry(minutes = 10) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

// ==================== MAIN EMAIL FUNCTIONS ====================

/**
 * Send an email using the configured transport
 * 
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} [options.text] - Plain text content
 * @param {string} [options.from] - Sender (optional, uses default)
 * @returns {Promise<Object>} - Nodemailer send result
 */
async function sendEmail({ to, subject, html, text, from }) {
  try {
    const transport = createTransport('gmail');
    
    // Verify transport connection
    await transport.verify();
    console.log('📧 Email transport verified successfully');
    
    const mailOptions = {
      from: from || `"${emailConfig.defaultFrom.name}" <${emailConfig.defaultFrom.email}>`,
      to,
      subject,
      html,
      text: text || subject
    };
    
    const result = await transport.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to}`, { messageId: result.messageId });
    
    return {
      success: true,
      messageId: result.messageId,
      response: result.response
    };
    
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

/**
 * Send OTP verification email
 * 
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code
 * @param {string} [userName] - User's name (optional)
 * @returns {Promise<Object>} - Send result
 */
async function sendOTPEmail(email, otp, userName = '') {
  const template = emailTemplates.otpVerification(otp, userName, emailConfig.otp.expiryMinutes);
  
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text
  });
}

/**
 * Send welcome email after successful registration
 * 
 * @param {string} email - Recipient email  
 * @param {string} userName - User's name
 * @param {string} dealerCode - Generated dealer code
 * @returns {Promise<Object>} - Send result
 */
async function sendWelcomeEmail(email, userName, dealerCode) {
  const template = emailTemplates.welcomeEmail(userName, dealerCode);
  
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text
  });
}

// ==================== EXPORTS ====================

module.exports = {
  // Core functions
  sendEmail,
  sendOTPEmail,
  sendWelcomeEmail,
  
  // Utilities
  generateOTP,
  getOTPExpiry,
  
  // Config (for testing/debugging)
  emailConfig,
  emailTemplates
};

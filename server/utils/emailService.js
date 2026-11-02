const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

let transporter = null;

if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

/**
 * Send password reset email or log to local file if SMTP is not configured
 */
async function sendPasswordResetEmail({ toEmail, recipientName, resetUrl, accountType }) {
  const subject = `[DMMS] Password Reset Request for ${accountType}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #1A365D;">Digital Marksheet Management System</h2>
      <p>Hello ${recipientName || 'User'},</p>
      <p>You requested a password reset for your DMMS ${accountType} account.</p>
      <p>Click the link below to set a new password. This link will expire in 1 hour:</p>
      <p style="margin: 20px 0;">
        <a href="${resetUrl}" style="background-color: #2B6CB0; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
      </p>
      <p>Or copy and paste this URL into your browser:</p>
      <p style="word-break: break-all; color: #4A5568;">${resetUrl}</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #718096;">If you did not request a password reset, please ignore this email.</p>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"DMMS Platform" <noreply@dmms.local>',
        to: toEmail,
        subject,
        html
      });
      console.log(`[Email] Password reset email sent to ${toEmail}`);
      return { success: true, delivered: true };
    } catch (err) {
      console.error(`[Email Error] Failed to send email via SMTP: ${err.message}`);
    }
  }

  // Fallback for local development when SMTP is not configured:
  console.log(`\n============================================================`);
  console.log(`[LOCAL DEV EMAIL SIMULATION]`);
  console.log(`To: ${toEmail} (${accountType})`);
  console.log(`Subject: ${subject}`);
  console.log(`Reset URL: ${resetUrl}`);
  console.log(`============================================================\n`);

  try {
    const docsDir = path.resolve(__dirname, '../../docs');
    const resetLogPath = path.join(docsDir, 'INITIAL_CREDENTIALS.local.txt');
    const logEntry = `[${new Date().toISOString()}] Password Reset Token for ${toEmail} (${accountType}):\nURL: ${resetUrl}\n\n`;
    fs.appendFileSync(resetLogPath, logEntry, 'utf8');
  } catch (e) {
    // ignore
  }

  return { success: true, delivered: false, simulated: true };
}

module.exports = {
  sendPasswordResetEmail
};

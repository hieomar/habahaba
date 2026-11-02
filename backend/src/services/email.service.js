import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(env.SMTP_PORT) || 587,
  secure: Number(env.SMTP_PORT) === 465,
  auth: {
    user: env.SMTP_USER || 'isaac98solomon1@gmail.com',
    pass: env.SMTP_PASS || '',
  },
});

/**
 * Sends welcome onboarding email with login credentials when a new user is created.
 */
export const sendUserCredentialsEmail = async ({ toEmail, userName, tempPassword, roleName }) => {
  if (!env.SMTP_PASS) {
    logger.warn(`⚠️ SMTP_PASS is not configured in .env. Skipping email dispatch to ${toEmail}. Temp password: ${tempPassword}`);
    return false;
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        <div style="background-color: #1a5c2a; color: #ffffff; padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 22px;">NASFAM GTMS</h1>
          <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">Grain Traceability Management System</p>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="color: #1a5c2a; margin-top: 0;">Welcome to GTMS, ${userName}!</h2>
          <p>Your user account has been successfully created on the NASFAM Grain Traceability Management System platform.</p>
          
          <div style="background-color: #f9fbf9; border-left: 4px solid #1a5c2a; padding: 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0 0 8px 0;"><strong>Assigned Role:</strong> ${roleName}</p>
            <p style="margin: 0 0 8px 0;"><strong>Login Email:</strong> <span style="color: #1a5c2a; font-weight: bold;">${toEmail}</span></p>
            <p style="margin: 0;"><strong>Temporary Password:</strong> <span style="background-color: #e8f5e9; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 16px; font-weight: bold; color: #2e7d32;">${tempPassword}</span></p>
          </div>
          
          <p>Please click the button below to log in to your account. You are advised to change your password upon your first login.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${env.CORS_ORIGIN || 'http://localhost:3000'}/login" style="background-color: #1a5c2a; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Log In to GTMS</a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 24px 0;" />
          <p style="font-size: 12px; color: #888888; margin: 0; text-align: center;">
            This is an automated operational email sent by NASFAM GTMS. Please do not reply directly to this email.
          </p>
        </div>
      </div>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: env.EMAIL_FROM || '"NASFAM GTMS" <isaac98solomon1@gmail.com>',
      to: toEmail,
      subject: 'Welcome to GTMS - Your Login Credentials',
      html: htmlContent,
    });

    logger.info(`📧 Welcome email with credentials sent to ${toEmail} (MessageId: ${info.messageId})`);
    return true;
  } catch (error) {
    logger.error(`❌ Failed to send credentials email to ${toEmail}:`, error.message);
    return false;
  }
};

const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Email Service Error:', error);
  } else {
    console.log('Email Service is ready to take messages');
  }
});

const sendWelcomeEmail = async (user, password, collegeName = 'PulseDesk') => {
  try {
    const loginUrl = process.env.FRONTEND_LOGIN_URL || 'http://localhost:3000/login';
    
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: `Welcome to ${collegeName} - Your Login Credentials`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #2563eb; text-align: center;">Welcome to ${collegeName}!</h2>
          <p>Hello <strong>${user.firstName || 'User'}</strong>,</p>
          <p>Your account has been successfully created. You can now access your dashboard using the credentials below:</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
            <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
          </div>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background-color: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Dashboard</a>
          </p>
          
          <p style="font-size: 12px; color: #6b7280; margin-top: 40px;">
            If you did not expect this email, please ignore it or contact your college administration.
            For security reasons, please change your password after your first login.
          </p>
          
          <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="text-align: center; color: #9ca3af; font-size: 12px;">&copy; ${new Date().getFullYear()} PulseDesk. All rights reserved.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome Email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Send Welcome Email Error:', error);
    // We don't want to throw error here to avoid breaking the enrollment flow if email fails
    return null;
  }
};

module.exports = { sendWelcomeEmail };

const nodemailer = require('nodemailer');

const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = port === 465;

  if (!host || !user || !pass) {
    console.warn('Email Service: Missing SMTP configuration (HOST, USER, or PASS). Emails will fail to send.');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: {
      // Do not fail on invalid certs
      rejectUnauthorized: false
    }
  });
};

const buildWelcomeHtml = (collegeName, loginUrl, adminEmail, password, showCredentials = true) => {
  const brand = '#3b82f6';
  const credentialsHtml = showCredentials ? `
    <p style="margin:0 0 16px;">Your college has been successfully registered on Pulse. Below are your administrator credentials to access the dashboard:</p>
    <div style="margin:16px 0;padding:16px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;">
      <div style="margin-bottom:8px;"><strong>Email:</strong> ${adminEmail}</div>
      <div><strong>Temporary Password:</strong> ${password}</div>
    </div>
  ` : `
    <p style="margin:0 0 16px;">Your college has been successfully registered on Pulse. Please use your registered administrator email to log in.</p>
  `;

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charSet="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to Pulse</title>
  </head>
  <body style="margin:0;background:#f8fafc;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" style="background:#f8fafc;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" style="width:100%;max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
            <tr>
              <td style="padding:32px 32px 0;background:${brand};color:#fff;">
                <h1 style="margin:0;font-size:24px;line-height:1.3;">Welcome to Pulse</h1>
                <p style="margin:8px 0 0;opacity:.9;">${collegeName} is now onboarded</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;">
                <p style="margin:0 0 12px;">Hello,</p>
                ${credentialsHtml}
                <p style="margin:16px 0;">For security, you will be asked to reset your password on first login.</p>
                <div style="margin:24px 0;">
                  <a href="${loginUrl}" style="display:inline-block;background:${brand};color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:700;">Login Now</a>
                </div>
                <p style="margin:0 0 8px;">If you did not request this, please contact support immediately.</p>
                <p style="margin:0;opacity:.7;">Thank you,<br/>Pulse Team</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

const sendWelcomeEmail = async (to, password, collegeName, showCredentials = true) => {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || 'Pulse <no-reply@pulse.com>';
  const loginUrl = process.env.FRONTEND_LOGIN_URL || 'https://app.pulsedesk.com/login';

  const textAttachment = showCredentials ? `Pulse - College Admin Credentials

College: ${collegeName}
Email: ${to}
Password: ${password}
` : `Pulse - Welcome

College: ${collegeName}
Email: ${to}
Please use your registered administrator credentials to log in.
`;

  const mailOptions = {
    from,
    to,
    subject: `Welcome to Pulse • ${collegeName}`,
    html: buildWelcomeHtml(collegeName, loginUrl, to, password, showCredentials),
    attachments: [
      {
        filename: `${collegeName.replace(/\s+/g, '_')}_welcome.txt`,
        content: textAttachment,
      },
    ],
  };

  return transporter.sendMail(mailOptions);
};

const buildOtpHtml = (otp) => {
  const brand = '#3b82f6';
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charSet="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Password Reset OTP</title>
  </head>
  <body style="margin:0;background:#f8fafc;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
    <table role="presentation" width="100%" style="background:#f8fafc;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" style="width:100%;max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
            <tr>
              <td style="padding:32px 32px 0;background:${brand};color:#fff;">
                <h1 style="margin:0;font-size:24px;line-height:1.3;">Reset Your Password</h1>
                <p style="margin:8px 0 0;opacity:.9;">Use the OTP below to proceed</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;">
                <p style="margin:0 0 12px;">Hello,</p>
                <p style="margin:0 0 16px;">You requested a password reset. Use the following 6-digit OTP to verify your identity. This code will expire in 10 minutes.</p>
                <div style="margin:24px 0;padding:20px;text-align:center;background:#f1f5f9;border-radius:12px;border:2px dashed #cbd5e1;">
                  <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:${brand};">${otp}</span>
                </div>
                <p style="margin:16px 0;">If you did not request this, please ignore this email.</p>
                <p style="margin:0;opacity:.7;">Thank you,<br/>Pulse Team</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

const sendPasswordResetOtp = async (to, otp) => {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || 'Pulse <no-reply@pulse.com>';

  const mailOptions = {
    from,
    to,
    subject: `Password Reset OTP • Pulse`,
    html: buildOtpHtml(otp),
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetOtp,
};

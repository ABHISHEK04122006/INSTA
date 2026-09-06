import nodemailer from 'nodemailer';

const getTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP is not configured');
  }

  const port = Number(SMTP_PORT);
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

export const sendPasswordResetOtp = async ({ to, otp }) => {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  const transporter = getTransporter();

  await transporter.sendMail({
    from,
    to,
    subject: 'Your Nexora password reset code',
    text: `Your Nexora password reset code is ${otp}. It expires in 10 minutes. If you did not request this, you can safely ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #1e293b; line-height: 1.5;">
        <h2 style="margin: 0 0 16px;">Reset your Nexora password</h2>
        <p>Use this code to reset your password:</p>
        <p style="margin: 20px 0; font-size: 28px; font-weight: 700; letter-spacing: 6px;">${otp}</p>
        <p>This code expires in 10 minutes. If you did not request it, you can safely ignore this email.</p>
      </div>
    `,
  });
};

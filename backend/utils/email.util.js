import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config()

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: { 
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS 
  },
  tls: { 
    rejectUnauthorized: false 
  },
  requireTLS: true
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Mail server connection failed:', error.message);
  } else {
    console.log('✅ Mail server is ready to send emails');
  }
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"Lost & Found System" <${process.env.EMAIL_USER}>`,
      to, subject, html
    });
  } catch (error) {
    console.error('Email error:', error.message);
  }
};

export const sendOtpEmail = async (email, otp, purpose = 'verification') => {
  const subject = purpose === 'verification' ? 'Email Verification OTP' : 'Claim Confirmation OTP';
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;padding:30px;border-radius:12px">
      <div style="text-align:center;margin-bottom:30px">
        <h1 style="color:#2563eb;font-size:28px;margin:0">🔍 Lost & Found</h1>
        <p style="color:#666;margin-top:5px">Intelligent Recovery System</p>
      </div>
      <div style="background:white;padding:30px;border-radius:8px;text-align:center">
        <h2 style="color:#1f2937">${subject}</h2>
        <p style="color:#4b5563">Your One-Time Password is:</p>
        <div style="background:#eff6ff;border:2px dashed #2563eb;border-radius:8px;padding:20px;margin:20px 0">
          <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#2563eb">${otp}</span>
        </div>
        <p style="color:#ef4444;font-size:14px">⏰ Valid for ${process.env.OTP_EXPIRE_MINUTES || 10} minutes only</p>
        <p style="color:#9ca3af;font-size:12px">Do not share this OTP with anyone.</p>
      </div>
    </div>
  `;
  await sendEmail({ to: email, subject, html });
};

export const sendMatchNotification = async (email, itemTitle, matchScore) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#2563eb">🎯 Potential Match Found!</h2>
      <p>We found a potential match for your item: <strong>${itemTitle}</strong></p>
      <p>Match confidence: <strong style="color:#16a34a">${matchScore}%</strong></p>
      <p>Login to your account to review and initiate the claim process.</p>
      <a href="${process.env.CLIENT_URL}/dashboard" style="background:#2563eb;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;margin-top:15px">View Match</a>
    </div>
  `;
  await sendEmail({ to: email, subject: `Match Found for "${itemTitle}"`, html });
};

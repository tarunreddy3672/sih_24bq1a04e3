import nodemailer from 'nodemailer';

function getTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_PASS;
  // Only use Gmail if both are set AND look like real values (not placeholders)
  if (
    gmailUser && gmailPass &&
    !gmailUser.includes('your_') && !gmailPass.includes('your_') &&
    gmailUser.includes('@') && gmailPass.length >= 8
  ) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: gmailUser, pass: gmailPass },
    });
  }
  return null;
}

export async function sendOTPEmail(to, otp, name = '') {
  const transporter = getTransporter();

  const html = `
    <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;background:#fff;border:1px solid #E4E7EC;border-radius:16px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#3E4C8A,#6366F1);padding:28px 32px">
        <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700">EduVision</h1>
        <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:13px">Academic Intelligence Platform</p>
      </div>
      <div style="padding:32px">
        <p style="color:#1A1D23;font-size:15px;margin:0 0 8px">Hi ${name || 'there'},</p>
        <p style="color:#6B7280;font-size:14px;margin:0 0 24px">Your one-time verification code is:</p>
        <div style="background:#F7F8FA;border:2px dashed #C7D2FE;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px">
          <span style="font-size:36px;font-weight:800;letter-spacing:10px;color:#3E4C8A;font-family:monospace">${otp}</span>
        </div>
        <p style="color:#6B7280;font-size:13px;margin:0 0 4px">⏱ This code expires in <strong>10 minutes</strong>.</p>
        <p style="color:#9CA3AF;font-size:12px;margin:0">If you didn't request this, please ignore this email.</p>
      </div>
      <div style="background:#F7F8FA;padding:16px 32px;border-top:1px solid #E4E7EC">
        <p style="color:#9CA3AF;font-size:11px;margin:0">© 2026 EduVision · SIH Academic Platform</p>
      </div>
    </div>
  `;

  if (!transporter) {
    // No email config — log OTP to console for dev/demo
    console.log(`\n📧 [EduVision OTP] To: ${to} | Code: ${otp}\n`);
    return { success: true, preview: `OTP logged to console: ${otp}` };
  }

  await transporter.sendMail({
    from: `"EduVision" <${process.env.SMTP_USER || process.env.GMAIL_USER || 'noreply@eduvision.ai'}>`,
    to,
    subject: `${otp} — Your EduVision Verification Code`,
    html,
  });

  return { success: true };
}

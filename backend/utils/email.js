const nodemailer = require('nodemailer');

const SMTP_CONFIGURED = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.FROM_EMAIL);

let transporter = null;
if (SMTP_CONFIGURED) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendInviteEmail(to, inviteLink, expiresAt) {
  if (!SMTP_CONFIGURED) return false;
  try {
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject: 'You have been invited to IPMAIA WinterJam Admin',
      text: `You were invited to the IPMAIA WinterJam admin panel. Use this link to set your password and sign in: ${inviteLink}\n\nThis link expires at: ${new Date(expiresAt).toString()}`,
      html: `<p>You were invited to the <strong>IPMAIA WinterJam</strong> admin panel.</p><p><a href="${inviteLink}">Set your password and sign in</a></p><p>This link expires at: ${new Date(expiresAt).toString()}</p>`
    });
    console.log('✅ Invite email sent:', info.messageId);
    return true;
  } catch (err) {
    console.error('❌ Failed to send invite email:', err.message);
    return false;
  }
}

module.exports = { sendInviteEmail, SMTP_CONFIGURED };

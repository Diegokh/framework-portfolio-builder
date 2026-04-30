const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const FROM = process.env.EMAIL_FROM || `Portfolio Builder <${process.env.EMAIL_USER}>`;
const FRONTEND = (process.env.FRONTEND_URL || 'http://localhost:4200').split(',')[0].trim();

// ── Email de verificación de cuenta ──────────────────────────────────────────
async function sendVerificationEmail(toEmail, token) {
  const link = `${FRONTEND}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to: toEmail,
    subject: 'Verifica tu cuenta en Portfolio Builder',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:12px">
        <div style="text-align:center;margin-bottom:24px">
          <h1 style="margin:0;font-size:28px;background:linear-gradient(135deg,#667eea,#764ba2);-webkit-background-clip:text;-webkit-text-fill-color:transparent">
            Portfolio Builder
          </h1>
        </div>
        <div style="background:white;border-radius:10px;padding:28px;box-shadow:0 2px 8px rgba(0,0,0,.06)">
          <h2 style="margin:0 0 12px;color:#1e293b;font-size:20px">¡Bienvenido! Verifica tu cuenta</h2>
          <p style="color:#64748b;line-height:1.6">
            Gracias por registrarte. Haz clic en el botón para activar tu cuenta:
          </p>
          <div style="text-align:center;margin:28px 0">
            <a href="${link}"
               style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#667eea,#764ba2);
                      color:white;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;
                      box-shadow:0 4px 14px rgba(102,126,234,.4)">
              Verificar mi cuenta
            </a>
          </div>
          <p style="color:#94a3b8;font-size:13px;margin:0">
            Este enlace caduca en 24 horas. Si no te registraste, ignora este email.
          </p>
        </div>
      </div>
    `,
  });
}

// ── Notificación de mensaje recibido ─────────────────────────────────────────
async function sendContactNotification(toEmail, fromName, fromEmail, body) {
  await transporter.sendMail({
    from: FROM,
    to: toEmail,
    subject: `📬 Nuevo mensaje de ${fromName} en tu portfolio`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:12px">
        <div style="text-align:center;margin-bottom:24px">
          <h1 style="margin:0;font-size:28px;background:linear-gradient(135deg,#667eea,#764ba2);-webkit-background-clip:text;-webkit-text-fill-color:transparent">
            Portfolio Builder
          </h1>
        </div>
        <div style="background:white;border-radius:10px;padding:28px;box-shadow:0 2px 8px rgba(0,0,0,.06)">
          <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px">📬 Tienes un nuevo mensaje</h2>
          <p style="color:#64748b;margin:0 0 20px">Alguien ha contactado contigo a través de tu perfil público.</p>
          <div style="background:#f8fafc;border-left:4px solid #667eea;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:20px">
            <p style="margin:0 0 6px;font-size:13px;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em">De</p>
            <p style="margin:0;font-weight:600;color:#1e293b">${fromName}</p>
            <p style="margin:4px 0 0;color:#667eea;font-size:14px">${fromEmail}</p>
          </div>
          <div style="background:#f8fafc;border-radius:8px;padding:16px 20px;margin-bottom:20px">
            <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em">Mensaje</p>
            <p style="margin:0;color:#334155;line-height:1.7;white-space:pre-wrap">${body}</p>
          </div>
          <a href="mailto:${fromEmail}"
             style="display:inline-block;padding:11px 24px;background:linear-gradient(135deg,#667eea,#764ba2);
                    color:white;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
            Responder a ${fromName}
          </a>
        </div>
      </div>
    `,
  });
}

module.exports = { sendVerificationEmail, sendContactNotification };

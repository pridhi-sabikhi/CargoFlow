import nodemailer from "nodemailer";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} in environment variables`);
  }
  return value;
}

export async function sendPasswordResetMail({ to, resetLink }) {
  const host = requireEnv("SMTP_HOST");
  const port = Number(process.env.SMTP_PORT || 587);
  const user = requireEnv("SMTP_USER");
  const pass = requireEnv("SMTP_PASS");
  const from = process.env.SMTP_FROM || user;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  const info = await transporter.sendMail({
    from,
    to,
    subject: "CargoFlow password reset",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
        <h2 style="margin: 0 0 8px;">Reset your CargoFlow password</h2>
        <p style="margin: 0 0 12px;">Click the button below to set a new password.</p>
        <a href="${resetLink}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Reset Password</a>
        <p style="margin: 14px 0 0; font-size: 12px; color: #6b7280;">
          If you did not request this, you can safely ignore this email.
        </p>
      </div>
    `
  });

  return info;
}

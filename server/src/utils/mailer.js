import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";

// Check if SMTP is actually configured (not just placeholder values)
function isSMTPConfigured() {
  const user = process.env.EMAIL_USER || process.env.SMTP_USER || "";
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS || "";
  const invalidUsers = ["your_email@gmail.com", "your-email@gmail.com"];
  const invalidPasses = ["your_app_password", "your_16char_app_password", "your-app-password"];

  return (
    user.length > 0 &&
    pass.length > 0 &&
    !invalidUsers.includes(user.trim().toLowerCase()) &&
    !invalidPasses.includes(pass.trim().toLowerCase())
  );
}

// Check if SendGrid is configured
function isSendGridConfigured() {
  return process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.length > 0;
}

function getTransporter() {
  // Support both EMAIL_* and SMTP_* variable names
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT || 587);
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  const from = process.env.EMAIL_FROM || process.env.SMTP_FROM || `CargoFlow <${user}>`;
  const isGmail = host.includes("gmail");

  const transporter = nodemailer.createTransport({
    ...(isGmail ? { service: "gmail" } : { host, port }),
    secure: port === 465,          // true for 465, false for 587
    auth: { user, pass },
  });

  return { transporter, from };
}

export async function sendPasswordResetMail({ to, resetLink }) {
  // ── SendGrid API ─────────────────────────────────────────────
  if (isSendGridConfigured()) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to,
      from: process.env.EMAIL_FROM || process.env.SENDGRID_FROM || "noreply@cargoflow.local",
      subject: "CargoFlow — Reset your password",
      text: `We received a password reset request for your CargoFlow account.\n\nReset link: ${resetLink}\n\nThis link expires in 15 minutes. If you did not request this, you can ignore this email.`,
      html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <span style="display:inline-block;background:#001f3f;color:#ffab00;font-size:18px;font-weight:800;padding:10px 20px;border-radius:8px;letter-spacing:0.05em;">CF CargoFlow</span>
        </div>
        <h2 style="margin:0 0 8px;color:#0f172a;font-size:22px;">Reset your password</h2>
        <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.6;">
          We received a request to reset the password for your CargoFlow account.
          Click the button below to set a new password. This link expires in <strong>15 minutes</strong>.
        </p>
        <a href="${resetLink}"
           style="display:inline-block;padding:12px 28px;background:#001f3f;color:#ffab00;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;">
          Reset Password
        </a>
        <p style="margin:20px 0 0;font-size:12px;color:#94a3b8;">
          If you did not request this, you can safely ignore this email.
        </p>
        <hr style="margin:20px 0;border:none;border-top:1px solid #e2e8f0;" />
        <p style="margin:0;font-size:11px;color:#cbd5e1;text-align:center;">
          © ${new Date().getFullYear()} CargoFlow. All rights reserved.
        </p>
      </div>
      `,
    };

    try {
      const info = await sgMail.send(msg);
      console.log("[Mailer] Reset email sent to", to, "via SendGrid");
      return info;
    } catch (error) {
      console.error("[Mailer] SendGrid error:", error);
      if (error.response) {
        console.error(error.response.body);
      }
      throw new Error("Failed to send email via SendGrid.");
    }
  }

  // ── Dev / no-SMTP mode: use Ethereal for test emails ─────────
  if (!isSMTPConfigured()) {
    console.log("\n[Mailer] SMTP not configured. Creating Ethereal test account...");
    const testAccount = await nodemailer.createTestAccount();

    const testTransporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });

    const info = await testTransporter.sendMail({
      from: '"CargoFlow Local" <test@cargoflow.local>',
      to,
      subject: "CargoFlow — Reset your password",
      html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <span style="display:inline-block;background:#001f3f;color:#ffab00;font-size:18px;font-weight:800;padding:10px 20px;border-radius:8px;letter-spacing:0.05em;">CF CargoFlow</span>
        </div>
        <h2 style="margin:0 0 8px;color:#0f172a;font-size:22px;">Reset your password</h2>
        <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.6;">
          We received a request to reset the password for your CargoFlow account.
          Click the button below to set a new password. This link expires in <strong>15 minutes</strong>.
        </p>
        <a href="${resetLink}"
           style="display:inline-block;padding:12px 28px;background:#001f3f;color:#ffab00;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;">
          Reset Password
        </a>
        <p style="margin:20px 0 0;font-size:12px;color:#94a3b8;">
          If you did not request this, you can safely ignore this email.
        </p>
        <hr style="margin:20px 0;border:none;border-top:1px solid #e2e8f0;" />
        <p style="margin:0;font-size:11px;color:#cbd5e1;text-align:center;">
          © ${new Date().getFullYear()} CargoFlow. All rights reserved.
        </p>
      </div>
      `,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log("\n╔══════════════════════════════════════════════════╗");
    console.log("║  Ethereal Test Email Sent successfully!          ║");
    console.log("╚══════════════════════════════════════════════════╝");
    console.log(`  To: ${to}`);
    console.log(`  Preview URL: ${previewUrl}\n`);
    
    return { messageId: info.messageId, devMode: true, previewUrl };
  }

  // ── Production: send via SMTP ───────────────────────────────
  const { transporter, from } = getTransporter();

  // Verify connection before sending (gives a clear error if credentials are wrong)
  try {
    await transporter.verify();
  } catch (verifyErr) {
    console.error("[Mailer] SMTP verify failed:", verifyErr.message);
    throw new Error(`SMTP connection failed: ${verifyErr.message}`);
  }

  const info = await transporter.sendMail({
    from,
    to,
    subject: "CargoFlow — Reset your password",
    text: `We received a password reset request for your CargoFlow account.\n\nReset link: ${resetLink}\n\nThis link expires in 15 minutes. If you did not request this, you can ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <span style="display:inline-block;background:#001f3f;color:#ffab00;font-size:18px;font-weight:800;padding:10px 20px;border-radius:8px;letter-spacing:0.05em;">CF CargoFlow</span>
        </div>
        <h2 style="margin:0 0 8px;color:#0f172a;font-size:22px;">Reset your password</h2>
        <p style="margin:0 0 20px;color:#475569;font-size:14px;line-height:1.6;">
          We received a request to reset the password for your CargoFlow account.
          Click the button below to set a new password. This link expires in <strong>15 minutes</strong>.
        </p>
        <a href="${resetLink}"
           style="display:inline-block;padding:12px 28px;background:#001f3f;color:#ffab00;text-decoration:none;border-radius:8px;font-weight:700;font-size:15px;">
          Reset Password
        </a>
        <p style="margin:20px 0 0;font-size:12px;color:#94a3b8;">
          If you did not request this, you can safely ignore this email.
        </p>
        <hr style="margin:20px 0;border:none;border-top:1px solid #e2e8f0;" />
        <p style="margin:0;font-size:11px;color:#cbd5e1;text-align:center;">
          © ${new Date().getFullYear()} CargoFlow. All rights reserved.
        </p>
      </div>
    `,
  });

  console.log("[Mailer] Reset email sent to", to, "| messageId:", info.messageId);
  return info;
}

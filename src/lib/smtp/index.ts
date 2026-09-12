import nodemailer, { type Transporter } from "nodemailer";

const host = process.env.SMTP_HOST || "smtp.gmail.com";
const port = Number(process.env.SMTP_PORT) || 587;
const user = (process.env.SMTP_USER || "").replace(/['"]/g, "").trim();
const pass = (process.env.SMTP_PASS || process.env.SMTP_PASSWORD || "").replace(/['"]/g, "").trim();
const fromEmail = process.env.SMTP_FROM || user || "noreply@harmonyschool.edu.in";

let transporter: Transporter | null = null;

export function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });
  }
  return transporter;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<boolean> {
  try {
    const mail = getTransporter();
    await mail.sendMail({
      from: `"Harmony School ERP" <${fromEmail}>`,
      to,
      subject,
      text: text || subject,
      html,
    });
    return true;
  } catch (err) {
    console.error("Failed to send email:", err);
    return false;
  }
}

export function passwordResetEmailTemplate(resetUrl: string, userName: string): string {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Password Reset Request</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;">
    <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
      <div style="background-color: #4f46e5; padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 700;">Harmony Public School</h1>
        <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.9;">School Management Portal</p>
      </div>
      <div style="padding: 32px 24px;">
        <h2 style="font-size: 18px; margin-top: 0; color: #0f172a;">Password Reset Request</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">Hello <strong>${userName}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">We received a request to reset your password for your Harmony School ERP account. Click the button below to set a new password. This link is valid for <strong>1 hour</strong>.</p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${resetUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">Reset My Password</a>
        </div>
        <p style="font-size: 13px; color: #64748b; line-height: 1.5;">If you did not request this password reset, please ignore this email. Your password will remain unchanged.</p>
        <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 24px 0;">
        <p style="font-size: 11px; color: #94a3b8; margin: 0; text-align: center;">Harmony School ERP • 18 Ring Road, Vijay Nagar, Indore</p>
      </div>
    </div>
  </body>
  </html>
  `;
}

export function paymentReceiptEmailTemplate(
  studentName: string,
  receiptNo: string,
  amount: number,
  mode: string,
  date: string
): string {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;">
    <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden;">
      <div style="background-color: #10b981; padding: 20px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 20px;">Fee Payment Confirmation</h1>
      </div>
      <div style="padding: 24px;">
        <p style="font-size: 14px; color: #334155;">Dear Parent / Student,</p>
        <p style="font-size: 14px; color: #334155;">Payment of <strong>₹${amount.toLocaleString("en-IN")}</strong> for <strong>${studentName}</strong> has been successfully received.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; color: #64748b;">Receipt No:</td><td style="padding: 8px 0; font-weight: 600; text-align: right;">${receiptNo}</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; color: #64748b;">Payment Date:</td><td style="padding: 8px 0; font-weight: 600; text-align: right;">${date}</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; color: #64748b;">Payment Mode:</td><td style="padding: 8px 0; font-weight: 600; text-align: right;">${mode}</td></tr>
          <tr><td style="padding: 8px 0; color: #64748b; font-weight: 700;">Total Paid:</td><td style="padding: 8px 0; font-weight: 700; color: #10b981; font-size: 16px; text-align: right;">₹${amount.toLocaleString("en-IN")}</td></tr>
        </table>
        <p style="font-size: 12px; color: #64748b;">You can view and print the complete fee receipt from the student portal.</p>
      </div>
    </div>
  </body>
  </html>
  `;
}

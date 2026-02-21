import nodemailer, {type Transporter} from "nodemailer";
import {buildEmailHtml} from "./email-template";

let transporter: Transporter | null = null;

const getTransporter = (): Transporter => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const portRaw = process.env.SMTP_PORT ?? "587";
  const port = Number(portRaw);

  if (!host) {
    throw new Error("SMTP_HOST is required");
  }

  if (Number.isNaN(port)) {
    throw new Error(`SMTP_PORT is invalid: ${portRaw}`);
  }

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const hasAuth = Boolean(user) && Boolean(pass);
  const hasPartialAuth = Boolean(user) !== Boolean(pass);

  if (hasPartialAuth) {
    throw new Error("SMTP_USER and SMTP_PASS must be both set or both empty");
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: hasAuth ? {user, pass} : undefined,
  });

  return transporter;
};

export async function sendEmail(to: string, subject: string, message: string) {
  const from = process.env.MAIL_FROM ?? "Auth <no-reply@example.com>";
  const html = buildEmailHtml(subject, message);

  await getTransporter().sendMail({
    from,
    to,
    subject,
    text: message,
    html,
  });
}

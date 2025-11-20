'use server';

import "server-only";

import nodemailer from "nodemailer";

import {
  getAutoRenewalNotificationEmail,
  getPlanActivatedEmail,
  getPlanRenewalReminderEmail,
  getVerificationEmail,
  type AutoRenewalNotificationEmailProps,
  type PlanActivatedEmailProps,
  type PlanRenewalReminderEmailProps,
  type VerificationEmailProps,
} from "@/lib/email/templates";

type SendEmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  headers?: Record<string, string>;
};

const defaultFrom = process.env.EMAIL_FROM_ADDRESS ?? "Textopsy <notifications@textopsy.com>";
const defaultReplyTo = process.env.EMAIL_REPLY_TO;

let cachedTransport: nodemailer.Transporter | null = null;

function getTransporter() {
  if (cachedTransport) {
    return cachedTransport;
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  if (!host || !port || !user || !pass) {
    console.warn("[email] SMTP configuration incomplete. Skipping email send.");
    return null;
  }

  cachedTransport = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  return cachedTransport;
}

export async function sendEmail({ html, text, subject, to, from, replyTo, cc, bcc, headers }: SendEmailOptions) {
  const transporter = getTransporter();

  if (!transporter) {
    return { skipped: true };
  }

  return transporter.sendMail({
    from: from ?? defaultFrom,
    to,
    subject,
    html,
    text,
    replyTo: replyTo ?? defaultReplyTo ?? undefined,
    cc,
    bcc,
    headers,
  });
}

export async function sendVerificationEmail(props: VerificationEmailProps & { subject?: string }) {
  const envelope = getVerificationEmail(props);
  return sendEmail({
    to: props.email,
    subject: props.subject ?? envelope.subject,
    html: envelope.html,
    text: envelope.text,
  });
}

export async function sendPlanActivatedEmail(props: PlanActivatedEmailProps & { subject?: string }) {
  const envelope = getPlanActivatedEmail(props);
  return sendEmail({
    to: props.email,
    subject: props.subject ?? envelope.subject,
    html: envelope.html,
    text: envelope.text,
  });
}

export async function sendPlanRenewalReminderEmail(
  props: PlanRenewalReminderEmailProps & { subject?: string }
) {
  const envelope = getPlanRenewalReminderEmail(props);
  return sendEmail({
    to: props.email,
    subject: props.subject ?? envelope.subject,
    html: envelope.html,
    text: envelope.text,
  });
}

export async function sendAutoRenewalNotificationEmail(
  props: AutoRenewalNotificationEmailProps & { subject?: string; notify?: string | string[] }
) {
  const to = props.notify ?? process.env.BILLING_ALERT_EMAIL;
  if (!to) {
    console.warn("[email] No BILLING_ALERT_EMAIL configured. Skipping auto-renewal alert.");
    return { skipped: true };
  }

  const envelope = getAutoRenewalNotificationEmail(props);
  return sendEmail({
    to,
    subject: props.subject ?? envelope.subject,
    html: envelope.html,
    text: envelope.text,
  });
}


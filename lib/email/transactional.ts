import "server-only";
import { Resend } from "resend";
import { render } from "@react-email/components";
import InviteEmail from "@/emails/InviteEmail";
import RegistrationConfirmation from "@/emails/RegistrationConfirmation";
import ContactNotification from "@/emails/ContactNotification";
import ContactReceived from "@/emails/ContactReceived";
import { buildScanUrl, generateQrDataUrl } from "@/lib/qr";
import { formatEventDateTime } from "@/lib/dates";
import type { Event, EventRegistration } from "@/prisma/generated/client/client";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const TEAM_INBOX = process.env.ETU_TEAM_INBOX ?? "info@empowerteensunited.org";

export async function sendInviteEmail(params: {
  toEmail: string;
  role: string;
  invitedByName: string;
  token: string;
}) {
  const inviteUrl = `${SITE_URL}/invite/${params.token}`;
  const html = await render(
    InviteEmail({ inviteUrl, role: params.role, invitedByName: params.invitedByName }),
  );

  await resend.emails.send({
    from: `Empower Teens United <${FROM}>`,
    to: params.toEmail,
    subject: `You're invited to ETU (${params.role})`,
    html,
    text: `${params.invitedByName} invited you to ETU as a ${params.role}.\n\nAccept: ${inviteUrl}\n\nThis link expires in 14 days.`,
  });
}

export async function sendRegistrationConfirmation(params: {
  toEmail: string;
  toName: string;
  event: Event;
  registration: EventRegistration;
}) {
  const qrDataUrl = await generateQrDataUrl(
    buildScanUrl(params.registration.qrToken),
  );
  const eventDate = formatEventDateTime(params.event.startsAt);
  const html = await render(
    RegistrationConfirmation({
      attendeeName: params.toName,
      eventTitle: params.event.title,
      eventDate,
      eventLocation: params.event.location,
      qrDataUrl,
      eventUrl: `${SITE_URL}/events/${params.event.slug}`,
    }),
  );
  const text = [
    `You're registered for ${params.event.title}.`,
    `When: ${eventDate}`,
    `Where: ${params.event.location}`,
    "",
    "Open this email in a client that renders images to view your check-in QR code.",
    `Event page: ${SITE_URL}/events/${params.event.slug}`,
  ].join("\n");

  await resend.emails.send({
    from: `Empower Teens United <${FROM}>`,
    to: params.toEmail,
    subject: `You're registered for ${params.event.title}`,
    html,
    text,
  });
}

export async function sendContactAdminNotice(params: {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
}) {
  const html = await render(ContactNotification(params));
  await resend.emails.send({
    from: `Empower Teens United <${FROM}>`,
    to: TEAM_INBOX,
    replyTo: params.email,
    subject: `[ETU contact] ${params.subject}`,
    html,
    text: [
      `${params.name} <${params.email}>`,
      params.phone ? `Phone: ${params.phone}` : null,
      "",
      params.message,
    ]
      .filter(Boolean)
      .join("\n"),
  });
}

export async function sendContactAutoreply(params: {
  name: string;
  toEmail: string;
}) {
  const html = await render(ContactReceived({ name: params.name }));
  await resend.emails.send({
    from: `Empower Teens United <${FROM}>`,
    to: params.toEmail,
    subject: "We got your message",
    html,
    text: `Hi ${params.name}, we received your message and someone from the ETU team will get back to you within 2 business days.`,
  });
}

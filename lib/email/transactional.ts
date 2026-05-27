import "server-only";
import { Resend } from "resend";
import { render } from "@react-email/components";
import InviteEmail from "@/emails/InviteEmail";
import RegistrationConfirmation from "@/emails/RegistrationConfirmation";
import { buildScanUrl, generateQrDataUrl } from "@/lib/qr";
import { formatEventDateTime } from "@/lib/dates";
import type { Event, EventRegistration } from "@/prisma/generated/client/client";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

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

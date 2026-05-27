import "server-only";
import { Resend } from "resend";
import { render } from "@react-email/components";
import InviteEmail from "@/emails/InviteEmail";

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

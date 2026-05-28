import "server-only";
import { Resend } from "resend";
import { render } from "@react-email/components";
import BroadcastShell from "@/emails/BroadcastShell";
import { prisma } from "@/lib/prisma";

// Lazily constructed: `new Resend()` throws without an API key, which would
// break `next build`'s page-data collection where env vars aren't present.
let _resend: Resend | null = null;
function resendClient() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}
const FROM = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const BATCH_SIZE = 100;

export async function processCampaignBatch(campaignId: string): Promise<{
  processed: number;
  remaining: number;
  finished: boolean;
}> {
  const campaign = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
  });
  if (
    !campaign ||
    (campaign.status !== "sending" && campaign.status !== "scheduled")
  ) {
    return { processed: 0, remaining: 0, finished: true };
  }

  if (campaign.status === "scheduled") {
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: { status: "sending" },
    });
  }

  const queued = await prisma.emailRecipient.findMany({
    where: { campaignId, status: "queued" },
    take: BATCH_SIZE,
  });

  if (queued.length === 0) {
    const remaining = await prisma.emailRecipient.count({
      where: { campaignId, status: "queued" },
    });
    if (remaining === 0) {
      await prisma.emailCampaign.update({
        where: { id: campaignId },
        data: { status: "sent", sentAt: new Date() },
      });
    }
    return { processed: 0, remaining, finished: remaining === 0 };
  }

  for (const recipient of queued) {
    const unsubscribeUrl = `${SITE_URL}/unsubscribe?t=${recipient.id}`;
    const html = await render(
      BroadcastShell({ bodyHtml: campaign.bodyHtml, unsubscribeUrl }),
    );
    try {
      const res = await resendClient().emails.send({
        from: campaign.sender || `Empower Teens United <${FROM}>`,
        to: recipient.email,
        subject: campaign.subject,
        html,
        text: `${campaign.bodyText}\n\nUnsubscribe: ${unsubscribeUrl}`,
      });
      await prisma.emailRecipient.update({
        where: { id: recipient.id },
        data: {
          status: "sent",
          sentAt: new Date(),
          resendMessageId: res.data?.id ?? null,
        },
      });
    } catch (e) {
      console.error("Broadcast send failed", recipient.email, e);
      // RecipientStatus has no explicit `failed`; mark as `bounced` so the
      // queue stops retrying. Webhook events may later refine this.
      await prisma.emailRecipient.update({
        where: { id: recipient.id },
        data: { status: "bounced", lastEventAt: new Date() },
      });
    }
  }

  const remaining = await prisma.emailRecipient.count({
    where: { campaignId, status: "queued" },
  });
  if (remaining === 0) {
    await prisma.emailCampaign.update({
      where: { id: campaignId },
      data: { status: "sent", sentAt: new Date() },
    });
  }

  return {
    processed: queued.length,
    remaining,
    finished: remaining === 0,
  };
}

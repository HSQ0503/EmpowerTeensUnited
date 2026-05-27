import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { RecipientStatus } from "@/prisma/generated/client/client";

type ResendEvent = {
  type: string;
  data: { email_id?: string; to?: string[] | string };
};

const STATUS_MAP: Record<string, RecipientStatus> = {
  "email.delivered": "delivered",
  "email.opened": "opened",
  "email.clicked": "clicked",
  "email.bounced": "bounced",
  "email.complained": "complained",
};

// Signature validation is deferred until RESEND_WEBHOOK_SECRET is configured
// on the Resend dashboard. When that lands, wrap this handler with the Svix
// verifier per https://resend.com/docs/dashboard/webhooks/verify-webhooks.

export async function POST(req: Request) {
  let event: ResendEvent;
  try {
    event = (await req.json()) as ResendEvent;
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid_json" }, { status: 400 });
  }

  const status = STATUS_MAP[event.type];
  if (!status || !event.data?.email_id) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  await prisma.emailRecipient.updateMany({
    where: { resendMessageId: event.data.email_id },
    data: { status, lastEventAt: new Date() },
  });

  if (status === "complained" || status === "bounced") {
    const rawTo = event.data.to;
    const recipientEmail = Array.isArray(rawTo) ? rawTo[0] : rawTo;
    if (recipientEmail) {
      await prisma.profile.updateMany({
        where: { email: recipientEmail },
        data: { emailUnsubscribed: true },
      });
      await prisma.unsubscribedEmail.upsert({
        where: { email: recipientEmail },
        create: { email: recipientEmail },
        update: {},
      });
    }
  }

  return NextResponse.json({ ok: true });
}

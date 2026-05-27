import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { A } from "@/app/components/tokens";
import { authStyles as s } from "@/app/(auth)/_styles";
import { formatEventDateTime } from "@/lib/dates";
import { processCampaignAction } from "../actions";
import type {
  CampaignStatus,
  RecipientStatus,
} from "@/prisma/generated/client/client";

export const metadata = { title: "Broadcast · Admin" };

const STATUS_STYLES: Record<
  CampaignStatus,
  { bg: string; color: string; border: string; label: string }
> = {
  draft: {
    bg: A.ruleSoft,
    color: A.muted,
    border: `1px solid ${A.rule}`,
    label: "Draft",
  },
  scheduled: {
    bg: "rgba(15, 69, 102, 0.08)",
    color: A.navy,
    border: `1px solid ${A.rule}`,
    label: "Scheduled",
  },
  sending: {
    bg: "rgba(252, 204, 0, 0.18)",
    color: "#7a5b00",
    border: "1px solid rgba(252, 204, 0, 0.45)",
    label: "Sending",
  },
  sent: {
    bg: "rgba(31, 138, 91, 0.12)",
    color: "#1f8a5b",
    border: "1px solid rgba(31, 138, 91, 0.3)",
    label: "Sent",
  },
  failed: {
    bg: "rgba(178, 34, 52, 0.08)",
    color: "#b22234",
    border: "1px solid rgba(178, 34, 52, 0.3)",
    label: "Failed",
  },
};

const TALLY_LABELS: Array<{ status: RecipientStatus; label: string }> = [
  { status: "queued", label: "Queued" },
  { status: "sent", label: "Sent" },
  { status: "delivered", label: "Delivered" },
  { status: "opened", label: "Opened" },
  { status: "clicked", label: "Clicked" },
  { status: "bounced", label: "Bounced" },
];

export default async function CampaignReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;
  const campaign = await prisma.emailCampaign.findUnique({
    where: { id },
    include: {
      recipients: {
        orderBy: { sentAt: "desc" },
        take: 100,
      },
      _count: { select: { recipients: true } },
    },
  });
  if (!campaign) notFound();

  const recipientStatusCounts = await prisma.emailRecipient.groupBy({
    by: ["status"],
    where: { campaignId: id },
    _count: { status: true },
  });
  const tally = (status: RecipientStatus) =>
    recipientStatusCounts.find((g) => g.status === status)?._count.status ?? 0;

  const status = STATUS_STYLES[campaign.status];
  const drain = processCampaignAction.bind(null, id);
  const hasQueued = tally("queued") > 0;

  return (
    <div style={{ maxWidth: 960 }}>
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/admin/broadcasts"
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: A.muted,
            textDecoration: "none",
          }}
        >
          ← Broadcasts
        </Link>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 24,
            marginTop: 12,
          }}
        >
          <h1
            style={{
              fontFamily: A.fontHead,
              fontSize: 30,
              fontWeight: 500,
              color: A.navy,
              margin: 0,
              letterSpacing: "-0.02em",
              flex: 1,
            }}
          >
            {campaign.subject}
          </h1>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.6,
              textTransform: "uppercase",
              padding: "6px 12px",
              borderRadius: 99,
              background: status.bg,
              color: status.color,
              border: status.border,
              flexShrink: 0,
            }}
          >
            {status.label}
          </span>
        </div>
        <p style={{ marginTop: 8, color: A.muted, fontSize: 14 }}>
          {campaign.recipientCount} recipient
          {campaign.recipientCount === 1 ? "" : "s"} ·{" "}
          {campaign.sentAt
            ? `Sent ${formatEventDateTime(campaign.sentAt)}`
            : `Created ${formatEventDateTime(campaign.createdAt)}`}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 12,
        }}
      >
        {TALLY_LABELS.map(({ status: rs, label }) => (
          <div
            key={rs}
            style={{
              background: "#fff",
              border: `1px solid ${A.rule}`,
              borderRadius: 6,
              padding: "20px 18px",
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: A.navy,
                fontFamily: A.fontHead,
                letterSpacing: "-0.02em",
              }}
            >
              {tally(rs)}
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                color: A.muted,
                marginTop: 4,
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      {hasQueued && (
        <form
          action={drain}
          style={{
            marginTop: 24,
            background: "#fff",
            border: `1px solid ${A.rule}`,
            borderRadius: 6,
            padding: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 24,
          }}
        >
          <div>
            <strong style={{ color: A.navy }}>
              {tally("queued")} recipient
              {tally("queued") === 1 ? "" : "s"} still queued.
            </strong>
            <div style={{ color: A.muted, fontSize: 13, marginTop: 4 }}>
              Cron drains 100/min automatically. You can also drain a batch
              now.
            </div>
          </div>
          <button type="submit" style={s.ghostButton}>
            Send next batch
          </button>
        </form>
      )}

      <div
        style={{
          marginTop: 32,
          background: "#fff",
          border: `1px solid ${A.rule}`,
          borderRadius: 6,
          padding: 32,
        }}
      >
        <h2
          style={{
            fontFamily: A.fontHead,
            fontSize: 20,
            fontWeight: 500,
            color: A.navy,
            margin: 0,
            marginBottom: 16,
            letterSpacing: "-0.01em",
          }}
        >
          Message preview
        </h2>
        <div
          style={{
            fontSize: 14,
            color: A.body,
            lineHeight: 1.65,
            padding: "16px 18px",
            background: A.ruleSoft,
            border: `1px solid ${A.rule}`,
            borderRadius: 4,
          }}
          dangerouslySetInnerHTML={{ __html: campaign.bodyHtml }}
        />
      </div>

      <h2
        style={{
          marginTop: 32,
          fontFamily: A.fontHead,
          fontSize: 20,
          fontWeight: 500,
          color: A.navy,
          letterSpacing: "-0.01em",
        }}
      >
        Recent recipients
        <span
          style={{
            marginLeft: 10,
            fontSize: 13,
            color: A.muted,
            fontFamily: A.fontBody,
            fontWeight: 500,
            letterSpacing: 0,
            textTransform: "none",
          }}
        >
          (latest 100)
        </span>
      </h2>
      <div
        style={{
          background: "#fff",
          border: `1px solid ${A.rule}`,
          borderRadius: 6,
          marginTop: 12,
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                textAlign: "left",
                background: A.ruleSoft,
                borderBottom: `1px solid ${A.rule}`,
              }}
            >
              <th style={th}>Email</th>
              <th style={th}>Name</th>
              <th style={th}>Status</th>
              <th style={th}>Last event</th>
            </tr>
          </thead>
          <tbody>
            {campaign.recipients.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  style={{
                    ...td,
                    color: A.muted,
                    textAlign: "center",
                    padding: 32,
                  }}
                >
                  No recipients yet.
                </td>
              </tr>
            ) : (
              campaign.recipients.map((r) => (
                <tr
                  key={r.id}
                  style={{ borderBottom: `1px solid ${A.rule}` }}
                >
                  <td style={{ ...td, color: A.body }}>{r.email}</td>
                  <td style={{ ...td, color: A.body }}>
                    {r.name ?? "—"}
                  </td>
                  <td style={{ ...td, color: A.body }}>{r.status}</td>
                  <td style={{ ...td, color: A.body }}>
                    {r.lastEventAt
                      ? formatEventDateTime(r.lastEventAt)
                      : r.sentAt
                        ? formatEventDateTime(r.sentAt)
                        : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th = {
  padding: "12px 16px",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 1.2,
  textTransform: "uppercase" as const,
  color: A.muted,
};

const td = {
  padding: "14px 16px",
  fontSize: 14,
  verticalAlign: "middle" as const,
};

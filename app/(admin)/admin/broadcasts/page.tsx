import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { A } from "@/app/components/tokens";
import { formatShortDate } from "@/lib/dates";
import type { CampaignStatus } from "@/prisma/generated/client/client";

export const metadata = { title: "Broadcasts · Admin" };

const STATUS_STYLES: Record<
  CampaignStatus,
  { bg: string; color: string; border: string }
> = {
  draft: {
    bg: A.ruleSoft,
    color: A.muted,
    border: `1px solid ${A.rule}`,
  },
  scheduled: {
    bg: "rgba(15, 69, 102, 0.08)",
    color: A.navy,
    border: `1px solid ${A.rule}`,
  },
  sending: {
    bg: "rgba(252, 204, 0, 0.18)",
    color: "#7a5b00",
    border: "1px solid rgba(252, 204, 0, 0.45)",
  },
  sent: {
    bg: "rgba(31, 138, 91, 0.12)",
    color: "#1f8a5b",
    border: "1px solid rgba(31, 138, 91, 0.3)",
  },
  failed: {
    bg: "rgba(178, 34, 52, 0.08)",
    color: "#b22234",
    border: "1px solid rgba(178, 34, 52, 0.3)",
  },
};

export default async function BroadcastsListPage() {
  await requireRole("admin");
  const campaigns = await prisma.emailCampaign.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div
        className="etu-stack"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 24,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              color: A.muted,
              marginBottom: 6,
            }}
          >
            Email
          </div>
          <h1
            className="etu-h2"
            style={{
              fontFamily: A.fontHead,
              fontSize: 32,
              fontWeight: 500,
              color: A.navy,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Broadcasts
          </h1>
        </div>
        <Link
          href="/admin/broadcasts/new"
          style={{
            background: A.navy,
            color: "#fff",
            padding: "12px 18px",
            borderRadius: 4,
            textDecoration: "none",
            fontFamily: A.fontBody,
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          New broadcast
        </Link>
      </div>

      <div
        style={{
          background: "#fff",
          border: `1px solid ${A.rule}`,
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        <div className="etu-table-wrap">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                textAlign: "left",
                background: A.ruleSoft,
                borderBottom: `1px solid ${A.rule}`,
              }}
            >
              <th style={th}>Subject</th>
              <th style={{ ...th, textAlign: "right" }}>Recipients</th>
              <th style={th}>Status</th>
              <th style={th}>Created</th>
              <th style={{ ...th, textAlign: "right" }}></th>
            </tr>
          </thead>
          <tbody>
            {campaigns.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    ...td,
                    color: A.muted,
                    textAlign: "center",
                    padding: 32,
                  }}
                >
                  No broadcasts yet. Create one to get started.
                </td>
              </tr>
            ) : (
              campaigns.map((c) => {
                const style = STATUS_STYLES[c.status];
                return (
                  <tr
                    key={c.id}
                    style={{ borderBottom: `1px solid ${A.rule}` }}
                  >
                    <td style={{ ...td, fontWeight: 600, color: A.navy }}>
                      <Link
                        href={`/admin/broadcasts/${c.id}`}
                        style={{ color: A.navy, textDecoration: "none" }}
                      >
                        {c.subject}
                      </Link>
                    </td>
                    <td style={{ ...td, textAlign: "right", color: A.body }}>
                      {c.recipientCount}
                    </td>
                    <td style={td}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: 0.6,
                          textTransform: "uppercase",
                          padding: "4px 10px",
                          borderRadius: 99,
                          background: style.bg,
                          color: style.color,
                          border: style.border,
                        }}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td style={{ ...td, color: A.body }}>
                      {formatShortDate(c.createdAt)}
                    </td>
                    <td style={{ ...td, textAlign: "right" }}>
                      <Link
                        href={`/admin/broadcasts/${c.id}`}
                        style={actionLink}
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
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

const actionLink = {
  color: A.navy,
  fontSize: 13,
  fontWeight: 600,
  textDecoration: "none",
  borderBottom: `2px solid ${A.gold}`,
  paddingBottom: 2,
};

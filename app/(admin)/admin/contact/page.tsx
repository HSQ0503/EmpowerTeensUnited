import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { A } from "@/app/components/tokens";
import { formatShortDate } from "@/lib/dates";
import type { ContactStatus } from "@/prisma/generated/client/client";
import { archiveAllNewAction, quickArchiveAction } from "./actions";

export const metadata = { title: "Contact inbox · Admin" };

const STATUS_STYLES: Record<
  ContactStatus,
  { bg: string; color: string; border: string }
> = {
  new: {
    bg: "rgba(252, 204, 0, 0.18)",
    color: "#7a5b00",
    border: "1px solid rgba(252, 204, 0, 0.45)",
  },
  replied: {
    bg: "rgba(31, 138, 91, 0.12)",
    color: "#1f8a5b",
    border: "1px solid rgba(31, 138, 91, 0.3)",
  },
  archived: {
    bg: A.ruleSoft,
    color: A.muted,
    border: `1px solid ${A.rule}`,
  },
};

export default async function AdminContactInbox() {
  await requireRole("admin");
  const messages = await prisma.contactMessage.findMany({
    orderBy: { submittedAt: "desc" },
  });

  const counts = messages.reduce(
    (acc, m) => {
      acc[m.status] = (acc[m.status] ?? 0) + 1;
      return acc;
    },
    { new: 0, replied: 0, archived: 0 } as Record<ContactStatus, number>,
  );

  return (
    <div>
      <div
        className="etu-stack"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 24,
          gap: 16,
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
            Inbox
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
            Contact messages
          </h1>
          <p style={{ marginTop: 12, color: A.muted, fontSize: 14 }}>
            {counts.new} new · {counts.replied} replied · {counts.archived}{" "}
            archived
          </p>
        </div>
        {counts.new > 0 && (
          <form action={archiveAllNewAction}>
            <button
              type="submit"
              style={{
                background: "#fff",
                color: A.navy,
                border: `1px solid ${A.rule}`,
                padding: "10px 16px",
                borderRadius: 4,
                fontFamily: A.fontBody,
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: 0.5,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Archive all new ({counts.new})
            </button>
          </form>
        )}
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
              <th style={th}>From</th>
              <th style={th}>Received</th>
              <th style={th}>Status</th>
              <th style={{ ...th, textAlign: "right" }}></th>
            </tr>
          </thead>
          <tbody>
            {messages.length === 0 ? (
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
                  No messages yet.
                </td>
              </tr>
            ) : (
              messages.map((m) => {
                const style = STATUS_STYLES[m.status];
                return (
                  <tr
                    className="etu-row-hover"
                    key={m.id}
                    style={{ borderBottom: `1px solid ${A.rule}` }}
                  >
                    <td style={{ ...td, fontWeight: 600, color: A.navy }}>
                      <Link
                        href={`/admin/contact/${m.id}`}
                        style={{ color: A.navy, textDecoration: "none" }}
                      >
                        {m.subject}
                      </Link>
                    </td>
                    <td style={{ ...td, color: A.body }}>
                      <div>{m.name}</div>
                      <div style={{ color: A.muted, fontSize: 13 }}>
                        {m.email}
                      </div>
                    </td>
                    <td style={{ ...td, color: A.body }}>
                      {formatShortDate(m.submittedAt)}
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
                        {m.status}
                      </span>
                    </td>
                    <td style={{ ...td, textAlign: "right", whiteSpace: "nowrap" }}>
                      <Link
                        href={`/admin/contact/${m.id}`}
                        style={actionLink}
                      >
                        Open
                      </Link>
                      {m.status !== "archived" && (
                        <form
                          action={quickArchiveAction.bind(null, m.id)}
                          style={{ display: "inline-block", marginLeft: 16 }}
                        >
                          <button type="submit" style={archiveButton}>
                            Archive
                          </button>
                        </form>
                      )}
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

const archiveButton = {
  background: "transparent",
  border: "none",
  padding: 0,
  color: A.muted,
  fontFamily: A.fontBody,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  borderBottom: `2px solid ${A.rule}`,
  paddingBottom: 2,
};

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { A } from "@/app/components/tokens";
import { authStyles as s } from "@/app/(auth)/_styles";
import { formatEventDateTime } from "@/lib/dates";
import {
  markRepliedAction,
  markArchivedAction,
  markNewAction,
} from "../actions";
import type { ContactStatus } from "@/prisma/generated/client/client";

export const metadata = { title: "Contact message · Admin" };

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

export default async function AdminContactDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ updated?: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;
  const { updated } = await searchParams;
  const message = await prisma.contactMessage.findUnique({
    where: { id },
    include: { repliedBy: true },
  });
  if (!message) notFound();

  const markReplied = markRepliedAction.bind(null, id);
  const markArchived = markArchivedAction.bind(null, id);
  const markNew = markNewAction.bind(null, id);

  const style = STATUS_STYLES[message.status];

  return (
    <div style={{ maxWidth: 760 }}>
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/admin/contact"
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: A.muted,
            textDecoration: "none",
          }}
        >
          ← Inbox
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
            {message.subject}
          </h1>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.6,
              textTransform: "uppercase",
              padding: "6px 12px",
              borderRadius: 99,
              background: style.bg,
              color: style.color,
              border: style.border,
              flexShrink: 0,
            }}
          >
            {message.status}
          </span>
        </div>
      </div>

      {updated && (
        <div style={{ ...s.alertInfo, marginBottom: 20 }}>
          Status updated.
        </div>
      )}

      <div
        style={{
          background: "#fff",
          border: `1px solid ${A.rule}`,
          borderRadius: 6,
          padding: 32,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "120px 1fr",
            gap: "10px 20px",
            fontSize: 14,
            color: A.body,
            marginBottom: 24,
            paddingBottom: 20,
            borderBottom: `1px solid ${A.rule}`,
          }}
        >
          <div style={{ color: A.muted, fontWeight: 600 }}>From</div>
          <div>
            {message.name} &lt;
            <a
              href={`mailto:${message.email}?subject=${encodeURIComponent(
                `Re: ${message.subject}`,
              )}`}
              style={{ color: A.navy, fontWeight: 600 }}
            >
              {message.email}
            </a>
            &gt;
          </div>
          {message.phone && (
            <>
              <div style={{ color: A.muted, fontWeight: 600 }}>Phone</div>
              <div>{message.phone}</div>
            </>
          )}
          <div style={{ color: A.muted, fontWeight: 600 }}>Received</div>
          <div>{formatEventDateTime(message.submittedAt)}</div>
          {message.repliedAt && (
            <>
              <div style={{ color: A.muted, fontWeight: 600 }}>Replied</div>
              <div>
                {formatEventDateTime(message.repliedAt)}
                {message.repliedBy && (
                  <span style={{ color: A.muted }}>
                    {" "}
                    by {message.repliedBy.firstName}{" "}
                    {message.repliedBy.lastName}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        <div
          style={{
            whiteSpace: "pre-wrap",
            fontSize: 15,
            color: A.ink,
            lineHeight: 1.65,
            background: A.ruleSoft,
            padding: "20px 22px",
            borderLeft: `3px solid ${A.gold}`,
            borderRadius: 2,
          }}
        >
          {message.message}
        </div>

        <div
          style={{
            marginTop: 28,
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <a
            href={`mailto:${message.email}?subject=${encodeURIComponent(
              `Re: ${message.subject}`,
            )}`}
            style={{
              ...s.primaryButton,
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Reply by email
          </a>

          {message.status !== "replied" && (
            <form action={markReplied}>
              <button type="submit" style={s.ghostButton}>
                Mark as replied
              </button>
            </form>
          )}
          {message.status !== "archived" && (
            <form action={markArchived}>
              <button type="submit" style={s.ghostButton}>
                Archive
              </button>
            </form>
          )}
          {message.status !== "new" && (
            <form action={markNew}>
              <button type="submit" style={s.ghostButton}>
                Re-open
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

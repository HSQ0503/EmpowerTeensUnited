import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { A } from "@/app/components/tokens";
import { formatEventDateTime } from "@/lib/dates";

export const metadata = { title: "Events · Admin" };

export default async function AdminEventsListPage() {
  await requireRole("admin");
  const events = await prisma.event.findMany({
    where: { archivedAt: null },
    orderBy: { startsAt: "desc" },
    include: {
      _count: { select: { registrations: true } },
    },
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
            Programs
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
            Events
          </h1>
        </div>
        <Link
          href="/admin/events/new"
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
          New event
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
              <th style={th}>Title</th>
              <th style={th}>Date</th>
              <th style={th}>Location</th>
              <th style={{ ...th, textAlign: "right" }}>Reg.</th>
              <th style={th}>Status</th>
              <th style={{ ...th, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ ...td, color: A.muted, textAlign: "center", padding: 32 }}>
                  No events yet. Create one to get started.
                </td>
              </tr>
            ) : (
              events.map((e) => (
                <tr className="etu-row-hover" key={e.id} style={{ borderBottom: `1px solid ${A.rule}` }}>
                  <td style={{ ...td, fontWeight: 600, color: A.navy }}>{e.title}</td>
                  <td style={{ ...td, color: A.body }}>
                    {formatEventDateTime(e.startsAt)}
                  </td>
                  <td style={{ ...td, color: A.body }}>{e.location}</td>
                  <td style={{ ...td, textAlign: "right", color: A.body }}>
                    {e._count.registrations}
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
                        background: e.publishedAt
                          ? "rgba(31, 138, 91, 0.12)"
                          : A.ruleSoft,
                        color: e.publishedAt ? "#1f8a5b" : A.muted,
                        border: e.publishedAt
                          ? "1px solid rgba(31, 138, 91, 0.3)"
                          : `1px solid ${A.rule}`,
                      }}
                    >
                      {e.publishedAt ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td style={{ ...td, textAlign: "right" }}>
                    <Link href={`/admin/events/${e.id}/edit`} style={actionLink}>
                      Edit
                    </Link>
                    <Link
                      href={`/admin/events/${e.id}/registrations`}
                      style={{ ...actionLink, marginLeft: 14 }}
                    >
                      Funnel
                    </Link>
                  </td>
                </tr>
              ))
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

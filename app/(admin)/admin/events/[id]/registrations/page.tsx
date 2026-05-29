import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { A } from "@/app/components/tokens";
import { formatEventDateTime } from "@/lib/dates";

export const metadata = { title: "Funnel · Admin" };

export default async function EventFunnelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) notFound();

  const regs = await prisma.eventRegistration.findMany({
    where: { eventId: id, status: "registered" },
    include: { checkin: true },
    orderBy: { registeredAt: "asc" },
  });

  const totalReg = regs.length;
  const guestSum = regs.reduce((sum, r) => sum + r.guestCount, 0);
  const checkedIn = regs.filter((r) => r.checkin).length;
  const conversion = totalReg ? Math.round((checkedIn / totalReg) * 100) : 0;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/admin/events"
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: A.muted,
            textDecoration: "none",
          }}
        >
          ← Events
        </Link>
        <h1
          style={{
            marginTop: 12,
            fontFamily: A.fontHead,
            fontSize: 30,
            fontWeight: 500,
            color: A.navy,
            letterSpacing: "-0.02em",
            margin: "12px 0 6px",
          }}
        >
          {event.title}
        </h1>
        <p style={{ color: A.muted, fontSize: 14, margin: 0 }}>
          {formatEventDateTime(event.startsAt)} · {event.location}
        </p>
      </div>

      <div
        className="etu-collapse-2"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
        }}
      >
        <Stat label="Registered" value={totalReg} />
        <Stat label="Guests added" value={guestSum} />
        <Stat label="Checked in" value={checkedIn} />
        <Stat label="Conversion" value={`${conversion}%`} />
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
        <Link
          href={`/admin/events/${id}/registrations/export`}
          style={pillButton}
        >
          Export CSV
        </Link>
        <Link
          href={`/admin/broadcasts/new?segment=event_registrants:${id}`}
          style={pillButton}
        >
          Email registrants
        </Link>
        <Link
          href={`/admin/broadcasts/new?segment=event_no_shows:${id}`}
          style={pillButton}
        >
          Email no-shows
        </Link>
        <Link href={`/events/${event.slug}`} style={pillButton}>
          View public page
        </Link>
        <Link
          href="/admin/scan"
          style={{ ...pillButton, background: A.navy, color: "#fff", borderColor: A.navy }}
        >
          Open scanner
        </Link>
      </div>

      <div
        style={{
          marginTop: 24,
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
              <th style={th}>Name</th>
              <th style={th}>Grade</th>
              <th style={th}>Guests</th>
              <th style={th}>Email</th>
              <th style={th}>Phone</th>
              <th style={th}>Registered</th>
              <th style={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {regs.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ ...td, color: A.muted, textAlign: "center", padding: 32 }}>
                  No registrations yet.
                </td>
              </tr>
            ) : (
              regs.map((r) => (
                <tr key={r.id} style={{ borderBottom: `1px solid ${A.rule}` }}>
                  <td style={{ ...td, fontWeight: 600, color: A.navy }}>{r.name}</td>
                  <td style={{ ...td, color: A.body }}>{r.grade ?? "—"}</td>
                  <td style={{ ...td, color: A.body }}>{r.guestCount}</td>
                  <td style={{ ...td, color: A.body }}>{r.email}</td>
                  <td style={{ ...td, color: A.body }}>{r.phone ?? "—"}</td>
                  <td style={{ ...td, color: A.muted }}>
                    {r.registeredAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </td>
                  <td style={td}>
                    {r.checkin ? (
                      <span
                        style={{
                          color: "#1f8a5b",
                          fontWeight: 700,
                          fontSize: 12,
                          letterSpacing: 0.5,
                        }}
                      >
                        ✓ Checked in
                      </span>
                    ) : (
                      <span style={{ color: A.muted, fontSize: 12 }}>—</span>
                    )}
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

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${A.rule}`,
        borderRadius: 6,
        padding: 20,
      }}
    >
      <div
        style={{
          fontSize: 28,
          fontFamily: A.fontHead,
          fontWeight: 600,
          color: A.navy,
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          color: A.muted,
          fontSize: 11,
          marginTop: 10,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          fontWeight: 700,
        }}
      >
        {label}
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

const pillButton = {
  background: "#fff",
  border: `1px solid ${A.rule}`,
  padding: "10px 16px",
  borderRadius: 4,
  textDecoration: "none",
  color: A.navy,
  fontFamily: "var(--font-manrope), Manrope, system-ui, sans-serif",
  fontWeight: 700,
  fontSize: 12,
  letterSpacing: 0.6,
  textTransform: "uppercase" as const,
};

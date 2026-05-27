import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { A } from "@/app/components/tokens";
import { formatEventDateTime, formatShortDate } from "@/lib/dates";

export const metadata = { title: "Dashboard · Admin" };

function startOfDay(d = new Date()) {
  const s = new Date(d);
  s.setHours(0, 0, 0, 0);
  return s;
}
function startOfWeek(d = new Date()) {
  const s = startOfDay(d);
  // Sunday-start week.
  s.setDate(s.getDate() - s.getDay());
  return s;
}

export default async function AdminDashboardPage() {
  const { profile } = await requireRole("admin");

  const [
    todayCheckins,
    weekRegistrations,
    activeEnrollments,
    pendingInvites,
    newMessages,
    unpairedStudents,
    draftBroadcasts,
    sendingBroadcasts,
    upcomingEvents,
    recentRegistrations,
    recentMessages,
  ] = await Promise.all([
    prisma.eventCheckin.count({
      where: { checkedInAt: { gte: startOfDay() } },
    }),
    prisma.eventRegistration.count({
      where: { registeredAt: { gte: startOfWeek() } },
    }),
    prisma.enrollment.count({ where: { status: "active" } }),
    prisma.invitation.count({
      where: {
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { gte: new Date() },
      },
    }),
    prisma.contactMessage.count({ where: { status: "new" } }),
    prisma.profile.count({
      where: { role: "student", bannedAt: null, studentAssignment: null },
    }),
    prisma.emailCampaign.count({ where: { status: "draft" } }),
    prisma.emailCampaign.count({
      where: { status: { in: ["sending", "scheduled"] } },
    }),
    prisma.event.findMany({
      where: {
        archivedAt: null,
        startsAt: { gte: new Date() },
      },
      orderBy: { startsAt: "asc" },
      take: 4,
      include: { _count: { select: { registrations: true } } },
    }),
    prisma.eventRegistration.findMany({
      orderBy: { registeredAt: "desc" },
      take: 5,
      include: {
        event: { select: { slug: true, title: true } },
        checkin: { select: { id: true } },
      },
    }),
    prisma.contactMessage.findMany({
      orderBy: { submittedAt: "desc" },
      take: 4,
    }),
  ]);

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12
      ? "Good morning"
      : greetingHour < 18
        ? "Good afternoon"
        : "Good evening";

  return (
    <div>
      {/* Hero greeting */}
      <section
        style={{
          background: `linear-gradient(135deg, ${A.navy} 0%, ${A.navyDark} 100%)`,
          color: "#fff",
          borderRadius: 8,
          padding: "32px 36px",
          position: "relative",
          overflow: "hidden",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 220,
            height: 220,
            borderRadius: 99,
            background:
              "radial-gradient(circle, rgba(252,204,0,0.18) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: A.gold,
            marginBottom: 8,
          }}
        >
          {greeting}, admin
        </div>
        <h1
          style={{
            fontFamily: A.fontHead,
            fontSize: 36,
            fontWeight: 500,
            margin: 0,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          Welcome back, {profile.firstName}.
        </h1>
        <p
          style={{
            marginTop: 10,
            fontSize: 14,
            color: "rgba(255,255,255,0.78)",
            maxWidth: 640,
            lineHeight: 1.6,
          }}
        >
          {newMessages > 0 || unpairedStudents > 0
            ? `You have ${newMessages} new message${newMessages === 1 ? "" : "s"} and ${unpairedStudents} student${unpairedStudents === 1 ? "" : "s"} waiting for a mentor.`
            : "Inbox is clear and every student is paired. Nice work."}
        </p>
      </section>

      {/* KPI row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <KpiCard
          label="Today's check-ins"
          value={todayCheckins}
          accent={todayCheckins > 0}
        />
        <KpiCard
          label="This week's registrations"
          value={weekRegistrations}
        />
        <KpiCard label="Active enrollments" value={activeEnrollments} />
        <KpiCard label="Pending invites" value={pendingInvites} />
      </div>

      {/* Main grid: action items + activity feed */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gap: 20,
          marginBottom: 24,
        }}
      >
        <Card title="Action items">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <ActionRow
              label="Unanswered contact messages"
              count={newMessages}
              href="/admin/contact"
              tone={newMessages > 0 ? "warn" : "good"}
            />
            <ActionRow
              label="Students waiting for a mentor"
              count={unpairedStudents}
              href="/admin/mentorship"
              tone={unpairedStudents > 0 ? "warn" : "good"}
            />
            <ActionRow
              label="Draft broadcasts"
              count={draftBroadcasts}
              href="/admin/broadcasts"
              tone="neutral"
            />
            <ActionRow
              label="Campaigns currently sending"
              count={sendingBroadcasts}
              href="/admin/broadcasts"
              tone={sendingBroadcasts > 0 ? "warn" : "neutral"}
            />
          </div>
        </Card>

        <Card title="Quick actions">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <QuickAction
              label="Create event"
              hint="Publish a new program"
              href="/admin/events/new"
            />
            <QuickAction
              label="Send broadcast"
              hint="Email a saved segment"
              href="/admin/broadcasts/new"
            />
            <QuickAction
              label="Invite a mentor"
              hint="Magic link, expires in 14 days"
              href="/admin/invitations"
            />
            <QuickAction
              label="Open scanner"
              hint="Check teens in at the door"
              href="/admin/scan"
            />
          </div>
        </Card>
      </div>

      {/* Activity grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 20,
        }}
      >
        <Card
          title="Upcoming events"
          link={{ label: "All events", href: "/admin/events" }}
        >
          {upcomingEvents.length === 0 ? (
            <EmptyState body="No upcoming events scheduled." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {upcomingEvents.map((e) => (
                <Link
                  key={e.id}
                  href={`/admin/events/${e.id}/edit`}
                  style={rowLinkStyle}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: A.fontHead,
                        fontWeight: 500,
                        fontSize: 14,
                        color: A.navy,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {e.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: A.muted,
                        marginTop: 4,
                      }}
                    >
                      {formatEventDateTime(e.startsAt)}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: A.navy,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {e._count.registrations} reg.
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card
          title="Recent registrations"
          link={{ label: "Funnels", href: "/admin/events" }}
        >
          {recentRegistrations.length === 0 ? (
            <EmptyState body="No registrations yet." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recentRegistrations.map((r) => (
                <div key={r.id} style={rowStyle}>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: A.ink,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {r.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: A.muted,
                        marginTop: 4,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {r.event.title}
                    </div>
                  </div>
                  {r.checkin ? (
                    <span style={badgeGood}>✓</span>
                  ) : (
                    <span style={badgeNeutral}>•</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card
          title="Recent messages"
          link={{ label: "Inbox", href: "/admin/contact" }}
        >
          {recentMessages.length === 0 ? (
            <EmptyState body="No contact messages." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recentMessages.map((m) => (
                <Link
                  key={m.id}
                  href={`/admin/contact/${m.id}`}
                  style={rowLinkStyle}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: A.navy,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {m.subject}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: A.muted,
                        marginTop: 4,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {m.name} · {formatShortDate(m.submittedAt)}
                    </div>
                  </div>
                  {m.status === "new" ? (
                    <span style={badgeWarn}>NEW</span>
                  ) : m.status === "replied" ? (
                    <span style={badgeGood}>✓</span>
                  ) : (
                    <span style={badgeNeutral}>—</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

/* ——— sub-components ——— */

function KpiCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${A.rule}`,
        borderRadius: 8,
        padding: "22px 22px 20px",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 12px 32px -28px rgba(15, 69, 102, 0.2)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 48,
          height: 3,
          background: accent ? A.gold : A.navy,
        }}
      />
      <div
        style={{
          fontSize: 36,
          fontWeight: 600,
          color: A.navy,
          fontFamily: A.fontHead,
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          color: A.muted,
          lineHeight: 1.4,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function Card({
  title,
  link,
  children,
}: {
  title: string;
  link?: { label: string; href: string };
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: "#fff",
        border: `1px solid ${A.rule}`,
        borderRadius: 8,
        padding: 24,
        boxShadow: "0 12px 32px -28px rgba(15, 69, 102, 0.2)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 14,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: A.fontHead,
            fontSize: 17,
            fontWeight: 500,
            color: A.navy,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </h2>
        {link && (
          <Link
            href={link.href}
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: A.navy,
              textDecoration: "none",
              borderBottom: `2px solid ${A.gold}`,
              paddingBottom: 2,
            }}
          >
            {link.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function ActionRow({
  label,
  count,
  href,
  tone,
}: {
  label: string;
  count: number;
  href: string;
  tone: "good" | "warn" | "neutral";
}) {
  const palette = {
    good: {
      bg: "rgba(31, 138, 91, 0.08)",
      color: "#1f8a5b",
      border: "rgba(31, 138, 91, 0.25)",
    },
    warn: {
      bg: "rgba(252, 204, 0, 0.16)",
      color: "#7a5a00",
      border: "rgba(252, 204, 0, 0.45)",
    },
    neutral: {
      bg: A.ruleSoft,
      color: A.navy,
      border: A.rule,
    },
  }[tone];
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        borderRadius: 6,
        padding: "12px 14px",
        textDecoration: "none",
        color: A.ink,
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
      <span
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: palette.color,
          padding: "4px 10px",
          background: "#fff",
          borderRadius: 99,
          border: `1px solid ${palette.border}`,
          minWidth: 36,
          textAlign: "center",
        }}
      >
        {count}
      </span>
    </Link>
  );
}

function QuickAction({
  label,
  hint,
  href,
}: {
  label: string;
  hint: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        background: "#fff",
        border: `1px solid ${A.rule}`,
        borderRadius: 6,
        padding: "12px 14px",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: A.navy }}>
          {label}
        </div>
        <div style={{ fontSize: 11, color: A.muted, marginTop: 2 }}>
          {hint}
        </div>
      </div>
      <span
        style={{
          fontSize: 13,
          color: A.navy,
          fontWeight: 700,
        }}
      >
        →
      </span>
    </Link>
  );
}

function EmptyState({ body }: { body: string }) {
  return (
    <div
      style={{
        background: A.ruleSoft,
        border: `1px dashed ${A.rule}`,
        borderRadius: 6,
        padding: "18px 16px",
        textAlign: "center",
        color: A.muted,
        fontSize: 13,
      }}
    >
      {body}
    </div>
  );
}

const rowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  padding: "10px 12px",
  background: A.ruleSoft,
  border: `1px solid ${A.rule}`,
  borderRadius: 6,
};

const rowLinkStyle = {
  ...rowStyle,
  textDecoration: "none",
  color: A.ink,
} as const;

const badgeGood = {
  fontSize: 11,
  fontWeight: 700,
  color: "#1f8a5b",
  background: "rgba(31, 138, 91, 0.12)",
  border: "1px solid rgba(31, 138, 91, 0.3)",
  padding: "3px 9px",
  borderRadius: 99,
  letterSpacing: 0.4,
};

const badgeWarn = {
  fontSize: 10,
  fontWeight: 700,
  color: "#7a5a00",
  background: "rgba(252, 204, 0, 0.2)",
  border: "1px solid rgba(252, 204, 0, 0.5)",
  padding: "3px 9px",
  borderRadius: 99,
  letterSpacing: 0.8,
};

const badgeNeutral = {
  fontSize: 11,
  fontWeight: 700,
  color: A.muted,
  background: A.ruleSoft,
  border: `1px solid ${A.rule}`,
  padding: "3px 9px",
  borderRadius: 99,
  letterSpacing: 0.4,
};

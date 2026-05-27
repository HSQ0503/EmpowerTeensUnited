import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { A } from "@/app/components/tokens";
import { formatEventDateTime, formatShortDate } from "@/lib/dates";

export const metadata = { title: "Dashboard · Empower Teens United" };

export default async function StudentDashboardPage() {
  const { profile } = await requireRole("student");

  const [enrollments, upcomingRegs, intake, hsPlan, assignment] =
    await Promise.all([
      prisma.enrollment.findMany({
        where: { profileId: profile.id, status: "active" },
        include: {
          course: { select: { id: true, slug: true, title: true, weeks: true } },
          responses: { select: { weekId: true, submittedAt: true } },
        },
        orderBy: { enrolledAt: "desc" },
      }),
      prisma.eventRegistration.findMany({
        where: {
          profileId: profile.id,
          status: "registered",
          event: { startsAt: { gte: new Date() } },
        },
        include: {
          event: {
            select: { slug: true, title: true, startsAt: true, location: true },
          },
          checkin: { select: { id: true } },
        },
        orderBy: { event: { startsAt: "asc" } },
        take: 4,
      }),
      prisma.mentorshipForm.findFirst({
        where: { studentId: profile.id, kind: "intake", sessionNo: null },
        select: { submittedAt: true },
      }),
      prisma.mentorshipForm.findFirst({
        where: { studentId: profile.id, kind: "hs_plan", sessionNo: null },
        select: { submittedAt: true },
      }),
      prisma.mentorAssignment.findFirst({
        where: { studentId: profile.id, endedAt: null },
        include: {
          mentor: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              title: true,
              phone: true,
            },
          },
        },
      }),
    ]);

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12 ? "Good morning" : greetingHour < 18 ? "Good afternoon" : "Good evening";

  const summary = {
    activeCourses: enrollments.length,
    upcomingEvents: upcomingRegs.length,
    mentor: assignment?.mentor
      ? `${assignment.mentor.firstName} ${assignment.mentor.lastName}`
      : null,
    intakeDone: !!intake?.submittedAt,
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* Hero greeting */}
      <section
        style={{
          background: `linear-gradient(135deg, ${A.navy} 0%, ${A.navyDark} 100%)`,
          color: "#fff",
          borderRadius: 8,
          padding: "36px 36px 32px",
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
            background: `radial-gradient(circle, rgba(252,204,0,0.18) 0%, transparent 70%)`,
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
          {greeting}
        </div>
        <h1
          style={{
            fontFamily: A.fontHead,
            fontSize: 40,
            fontWeight: 500,
            margin: 0,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          {profile.firstName}, here&apos;s your week.
        </h1>
        <p
          style={{
            marginTop: 12,
            fontSize: 15,
            color: "rgba(255,255,255,0.78)",
            maxWidth: 580,
            lineHeight: 1.6,
          }}
        >
          {summary.mentor
            ? `You're paired with ${summary.mentor}. `
            : "An admin will pair you with a mentor soon. "}
          {summary.activeCourses > 0
            ? `You have ${summary.activeCourses} active course${
                summary.activeCourses === 1 ? "" : "s"
              }${summary.upcomingEvents > 0 ? ` and ${summary.upcomingEvents} upcoming event${summary.upcomingEvents === 1 ? "" : "s"}` : ""}.`
            : "Browse courses to enroll and start your journey."}
        </p>
        <div
          style={{
            marginTop: 24,
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <SummaryPill
            label="Mentor"
            value={summary.mentor ?? "Not paired"}
            tone={summary.mentor ? "good" : "warn"}
          />
          <SummaryPill
            label="Intake"
            value={summary.intakeDone ? "Complete" : "To do"}
            tone={summary.intakeDone ? "good" : "warn"}
          />
          <SummaryPill
            label="Active courses"
            value={String(summary.activeCourses)}
            tone="neutral"
          />
          <SummaryPill
            label="Upcoming events"
            value={String(summary.upcomingEvents)}
            tone="neutral"
          />
        </div>
      </section>

      {/* Main grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
          gap: 20,
        }}
      >
        {/* Left column: courses + events */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card title="Continue learning" link={{ label: "Browse all", href: "/courses" }}>
            {enrollments.length === 0 ? (
              <EmptyState
                title="No active courses yet"
                body="Pick a cohort to join and start your weekly reflections."
                cta={{ label: "Browse courses", href: "/courses" }}
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {enrollments.map((e) => {
                  const totalWeeks = e.course.weeks;
                  const done = e.responses.filter((r) => r.submittedAt).length;
                  const pct =
                    totalWeeks > 0
                      ? Math.min(100, Math.round((done / totalWeeks) * 100))
                      : 0;
                  return (
                    <Link
                      key={e.id}
                      href={`/me/courses/${e.course.slug}`}
                      style={{
                        display: "block",
                        textDecoration: "none",
                        color: "inherit",
                        background: A.ruleSoft,
                        border: `1px solid ${A.rule}`,
                        borderRadius: 6,
                        padding: "18px 20px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                          gap: 16,
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                            fontFamily: A.fontHead,
                            fontSize: 18,
                            fontWeight: 500,
                            color: A.navy,
                            letterSpacing: "-0.01em",
                          }}
                        >
                          {e.course.title}
                        </h3>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: A.navy,
                            letterSpacing: 0.4,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {done} / {totalWeeks} weeks
                        </span>
                      </div>
                      <div
                        style={{
                          marginTop: 12,
                          height: 6,
                          background: "#fff",
                          borderRadius: 99,
                          overflow: "hidden",
                          border: `1px solid ${A.rule}`,
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: "100%",
                            background: A.gold,
                            borderRadius: 99,
                            transition: "width 200ms ease",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          marginTop: 10,
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: 1.2,
                          textTransform: "uppercase",
                          color: A.navy,
                        }}
                      >
                        {pct === 100 ? "Course complete" : "Continue →"}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </Card>

          <Card
            title="Upcoming events"
            link={
              upcomingRegs.length > 0
                ? { label: "My events", href: "/me/events" }
                : { label: "All events", href: "/events" }
            }
          >
            {upcomingRegs.length === 0 ? (
              <EmptyState
                title="No upcoming events"
                body="Register for a workshop, panel, or community day."
                cta={{ label: "Browse events", href: "/events" }}
              />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {upcomingRegs.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto 1fr auto",
                      gap: 18,
                      alignItems: "center",
                      background: "#fff",
                      border: `1px solid ${A.rule}`,
                      borderRadius: 6,
                      padding: "14px 18px",
                    }}
                  >
                    <DateBlock date={r.event.startsAt} />
                    <div>
                      <Link
                        href={`/events/${r.event.slug}`}
                        style={{
                          color: A.navy,
                          textDecoration: "none",
                          fontFamily: A.fontHead,
                          fontWeight: 500,
                          fontSize: 16,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {r.event.title}
                      </Link>
                      <p
                        style={{
                          margin: "4px 0 0",
                          fontSize: 12,
                          color: A.muted,
                          lineHeight: 1.4,
                        }}
                      >
                        {formatEventDateTime(r.event.startsAt)} ·{" "}
                        {r.event.location}
                      </p>
                    </div>
                    <CheckinPill checkedIn={!!r.checkin} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right column: mentorship + profile snapshot + quick links */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card title="Mentorship">
            {assignment?.mentor ? (
              <div>
                <div
                  style={{
                    display: "flex",
                    gap: 14,
                    alignItems: "center",
                    marginBottom: 14,
                  }}
                >
                  <Avatar
                    initials={`${assignment.mentor.firstName[0]}${assignment.mentor.lastName[0]}`}
                  />
                  <div>
                    <div
                      style={{
                        fontFamily: A.fontHead,
                        fontSize: 17,
                        fontWeight: 500,
                        color: A.navy,
                      }}
                    >
                      {assignment.mentor.firstName} {assignment.mentor.lastName}
                    </div>
                    {assignment.mentor.title && (
                      <div style={{ fontSize: 12, color: A.muted, marginTop: 2 }}>
                        {assignment.mentor.title}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: 13, color: A.body, lineHeight: 1.6 }}>
                  <a
                    href={`mailto:${assignment.mentor.email}`}
                    style={{ color: A.navy, fontWeight: 600 }}
                  >
                    {assignment.mentor.email}
                  </a>
                  {assignment.mentor.phone && (
                    <>
                      <br />
                      {assignment.mentor.phone}
                    </>
                  )}
                </div>
                <div
                  style={{
                    marginTop: 18,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <StatusRow
                    label="Intake (20 Qs)"
                    done={!!intake?.submittedAt}
                    detail={
                      intake?.submittedAt
                        ? `Submitted ${formatShortDate(intake.submittedAt)}`
                        : undefined
                    }
                  />
                  <StatusRow
                    label="HS plan"
                    done={!!hsPlan?.submittedAt}
                    detail={
                      hsPlan?.submittedAt
                        ? `Submitted ${formatShortDate(hsPlan.submittedAt)}`
                        : undefined
                    }
                  />
                </div>
                <Link
                  href="/me/mentorship"
                  style={{
                    display: "inline-block",
                    marginTop: 18,
                    color: A.navy,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: 1.2,
                    textTransform: "uppercase",
                    textDecoration: "none",
                    borderBottom: `2px solid ${A.gold}`,
                    paddingBottom: 2,
                  }}
                >
                  Open mentorship →
                </Link>
              </div>
            ) : (
              <EmptyState
                title="Not yet paired"
                body="An admin will assign you a mentor. In the meantime, finish your intake so they can get to know you."
                cta={{ label: "Start intake", href: "/me/mentorship" }}
              />
            )}
          </Card>

          <Card title="Profile snapshot" link={{ label: "Edit", href: "/me/profile" }}>
            <dl
              style={{
                margin: 0,
                display: "grid",
                gridTemplateColumns: "90px 1fr",
                rowGap: 10,
                columnGap: 14,
                fontSize: 13,
              }}
            >
              <dt style={dtStyle}>Email</dt>
              <dd style={ddStyle}>{profile.email}</dd>
              {profile.phone && (
                <>
                  <dt style={dtStyle}>Phone</dt>
                  <dd style={ddStyle}>{profile.phone}</dd>
                </>
              )}
              {profile.grade && (
                <>
                  <dt style={dtStyle}>Grade</dt>
                  <dd style={ddStyle}>{profile.grade}</dd>
                </>
              )}
              {profile.school && (
                <>
                  <dt style={dtStyle}>School</dt>
                  <dd style={ddStyle}>{profile.school}</dd>
                </>
              )}
              {profile.parentEmail && (
                <>
                  <dt style={dtStyle}>Parent</dt>
                  <dd style={ddStyle}>{profile.parentEmail}</dd>
                </>
              )}
            </dl>
          </Card>

          <Card title="Quick links">
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <QuickLink href="/me/events" label="My event QR codes" />
              <QuickLink href="/events" label="Browse upcoming events" />
              <QuickLink href="/courses" label="Browse cohorts" />
              <QuickLink href="/me/mentorship" label="My mentorship forms" />
              <QuickLink href="/me/profile" label="Edit profile" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ——— sub-components ——— */

function SummaryPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "good" | "warn" | "neutral";
}) {
  const palette = {
    good: {
      bg: "rgba(252, 204, 0, 0.22)",
      label: A.gold,
      value: "#fff",
      border: "rgba(252, 204, 0, 0.55)",
    },
    warn: {
      bg: "rgba(252, 204, 0, 0.1)",
      label: "rgba(252,204,0,0.85)",
      value: "#fff",
      border: "rgba(252, 204, 0, 0.35)",
    },
    neutral: {
      bg: "rgba(255, 255, 255, 0.08)",
      label: "rgba(255,255,255,0.65)",
      value: "#fff",
      border: "rgba(255, 255, 255, 0.18)",
    },
  }[tone];
  return (
    <div
      style={{
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        borderRadius: 99,
        padding: "8px 16px",
        display: "inline-flex",
        alignItems: "baseline",
        gap: 8,
        fontFamily: A.fontBody,
      }}
    >
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          color: palette.label,
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 13, fontWeight: 700, color: palette.value }}>
        {value}
      </span>
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
          marginBottom: 16,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: A.fontHead,
            fontSize: 18,
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

function EmptyState({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta?: { label: string; href: string };
}) {
  return (
    <div
      style={{
        background: A.ruleSoft,
        border: `1px dashed ${A.rule}`,
        borderRadius: 6,
        padding: "22px 20px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: A.fontHead,
          fontSize: 15,
          fontWeight: 500,
          color: A.navy,
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      <p
        style={{
          color: A.muted,
          fontSize: 13,
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        {body}
      </p>
      {cta && (
        <Link
          href={cta.href}
          style={{
            display: "inline-block",
            marginTop: 14,
            background: A.navy,
            color: "#fff",
            padding: "9px 14px",
            borderRadius: 4,
            fontFamily: A.fontBody,
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: 0.6,
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}

function DateBlock({ date }: { date: Date }) {
  const day = date.getDate();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  return (
    <div
      style={{
        background: A.gold,
        color: A.navy,
        borderRadius: 4,
        textAlign: "center",
        minWidth: 52,
        padding: "8px 10px",
        borderLeft: `3px solid ${A.navy}`,
      }}
    >
      <div
        style={{
          fontFamily: A.fontHead,
          fontSize: 22,
          fontWeight: 600,
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        {day}
      </div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 1.4,
          textTransform: "uppercase",
          marginTop: 4,
        }}
      >
        {month}
      </div>
    </div>
  );
}

function CheckinPill({ checkedIn }: { checkedIn: boolean }) {
  if (checkedIn) {
    return (
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          padding: "4px 10px",
          borderRadius: 99,
          background: "rgba(31, 138, 91, 0.12)",
          color: "#1f8a5b",
          border: "1px solid rgba(31, 138, 91, 0.3)",
        }}
      >
        ✓ Checked in
      </span>
    );
  }
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 0.6,
        textTransform: "uppercase",
        padding: "4px 10px",
        borderRadius: 99,
        background: "rgba(15, 69, 102, 0.06)",
        color: A.navy,
        border: `1px solid ${A.rule}`,
      }}
    >
      Registered
    </span>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 99,
        background: A.navy,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: A.fontHead,
        fontSize: 16,
        fontWeight: 600,
        border: `2px solid ${A.gold}`,
      }}
    >
      {initials.toUpperCase()}
    </div>
  );
}

function StatusRow({
  label,
  done,
  detail,
}: {
  label: string;
  done: boolean;
  detail?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 12,
        padding: "8px 0",
        borderBottom: `1px solid ${A.rule}`,
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: A.ink }}>
          {label}
        </div>
        {detail && (
          <div style={{ fontSize: 11, color: A.muted, marginTop: 2 }}>
            {detail}
          </div>
        )}
      </div>
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          padding: "3px 8px",
          borderRadius: 99,
          background: done
            ? "rgba(31, 138, 91, 0.12)"
            : "rgba(252, 204, 0, 0.18)",
          color: done ? "#1f8a5b" : "#7a5a00",
          border: done
            ? "1px solid rgba(31, 138, 91, 0.3)"
            : "1px solid rgba(252, 204, 0, 0.45)",
          whiteSpace: "nowrap",
        }}
      >
        {done ? "Done" : "To do"}
      </span>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 12px",
        borderRadius: 4,
        textDecoration: "none",
        color: A.ink,
        fontSize: 13,
        fontWeight: 600,
        background: A.ruleSoft,
        border: `1px solid ${A.rule}`,
      }}
    >
      <span>{label}</span>
      <span
        style={{
          color: A.navy,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1.2,
          textTransform: "uppercase",
        }}
      >
        →
      </span>
    </Link>
  );
}

const dtStyle = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 1,
  textTransform: "uppercase" as const,
  color: A.muted,
  margin: 0,
};
const ddStyle = {
  margin: 0,
  fontSize: 13,
  color: A.ink,
  fontWeight: 500,
  wordBreak: "break-word" as const,
};

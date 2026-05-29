import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { A } from "@/app/components/tokens";

export const metadata = { title: "My students · Mentor" };

export default async function MentorDashboardPage() {
  const { profile } = await requireRole("mentor");

  const assignments = await prisma.mentorAssignment.findMany({
    where: { mentorId: profile.id, endedAt: null },
    include: { student: true },
    orderBy: { startedAt: "desc" },
  });

  // Pull recent activity per student so the dashboard shows who needs attention.
  const studentIds = assignments.map((a) => a.studentId);
  const [intakes, sessionCounts, lastSessions] = await Promise.all([
    prisma.mentorshipForm.findMany({
      where: { studentId: { in: studentIds }, kind: "intake", sessionNo: null },
      select: { studentId: true, submittedAt: true },
    }),
    prisma.mentorshipForm.groupBy({
      by: ["studentId"],
      where: { studentId: { in: studentIds }, kind: "session" },
      _count: { _all: true },
    }),
    prisma.mentorshipForm.findMany({
      where: { studentId: { in: studentIds }, kind: "session" },
      orderBy: { submittedAt: "desc" },
      distinct: ["studentId"],
      select: { studentId: true, submittedAt: true, sessionNo: true },
    }),
  ]);

  const intakeMap = new Map(intakes.map((i) => [i.studentId, i.submittedAt]));
  const sessionCountMap = new Map(
    sessionCounts.map((s) => [s.studentId, s._count._all]),
  );
  const lastSessionMap = new Map(
    lastSessions.map((s) => [s.studentId, s]),
  );

  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
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
          Mentor portal
        </div>
        <h1
          className="etu-h1"
          style={{
            fontFamily: A.fontHead,
            fontSize: 38,
            fontWeight: 500,
            color: A.navy,
            margin: 0,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          My students
        </h1>
        <p
          style={{
            marginTop: 10,
            color: A.muted,
            fontSize: 15,
            lineHeight: 1.5,
          }}
        >
          {assignments.length === 0
            ? "You haven't been paired with any students yet. An admin will assign you."
            : "Open a student to read their intake and log a session."}
        </p>
      </div>

      {assignments.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {assignments.map((a) => {
            const intakeAt = intakeMap.get(a.studentId);
            const sessionCount = sessionCountMap.get(a.studentId) ?? 0;
            const lastSession = lastSessionMap.get(a.studentId);
            return (
              <Link
                key={a.id}
                href={`/mentor/students/${a.student.id}`}
                className="etu-collapse"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 24,
                  background: "#fff",
                  border: `1px solid ${A.rule}`,
                  borderRadius: 6,
                  padding: "20px 24px",
                  textDecoration: "none",
                  color: "inherit",
                  boxShadow: "0 12px 32px -28px rgba(15, 69, 102, 0.2)",
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontFamily: A.fontHead,
                      fontSize: 20,
                      fontWeight: 500,
                      color: A.navy,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {a.student.firstName} {a.student.lastName}
                  </h2>
                  <p
                    style={{
                      margin: "6px 0 0",
                      color: A.muted,
                      fontSize: 13,
                      lineHeight: 1.5,
                    }}
                  >
                    {a.student.email}
                    {a.student.grade && ` · Grade ${a.student.grade}`}
                    {a.student.school && ` · ${a.student.school}`}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: 18,
                      marginTop: 14,
                      flexWrap: "wrap",
                    }}
                  >
                    <Chip
                      label={intakeAt ? "Intake done" : "Intake pending"}
                      tone={intakeAt ? "good" : "warn"}
                    />
                    <Chip
                      label={`${sessionCount} session${sessionCount === 1 ? "" : "s"}`}
                      tone={sessionCount > 0 ? "neutral" : "warn"}
                    />
                    {lastSession?.submittedAt && (
                      <Chip
                        label={`Last: ${lastSession.submittedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                        tone="neutral"
                      />
                    )}
                  </div>
                </div>
                <div
                  style={{
                    alignSelf: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: 1.2,
                    textTransform: "uppercase",
                    color: A.navy,
                    borderBottom: `2px solid ${A.gold}`,
                    paddingBottom: 2,
                  }}
                >
                  Open &rarr;
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Chip({
  label,
  tone,
}: {
  label: string;
  tone: "good" | "warn" | "neutral";
}) {
  const palette = {
    good: { bg: "rgba(31, 138, 91, 0.12)", fg: "#1f8a5b", border: "rgba(31, 138, 91, 0.3)" },
    warn: { bg: "rgba(252, 204, 0, 0.18)", fg: "#7a5a00", border: "rgba(252, 204, 0, 0.5)" },
    neutral: { bg: "rgba(15, 69, 102, 0.06)", fg: A.navy, border: A.rule },
  }[tone];
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.6,
        textTransform: "uppercase",
        padding: "4px 10px",
        borderRadius: 99,
        background: palette.bg,
        color: palette.fg,
        border: `1px solid ${palette.border}`,
      }}
    >
      {label}
    </span>
  );
}

import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { A } from "@/app/components/tokens";
import { authStyles as s } from "@/app/(auth)/_styles";
import { assignMentorAction, endAssignmentAction } from "./actions";

export const metadata = { title: "Mentorship · Admin" };

const ASSIGN_ERRORS: Record<string, string> = {
  missing: "Pick a mentor before saving.",
  invalid: "That pairing was rejected — check the student and mentor accounts.",
};

export default async function AdminMentorshipPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRole("admin");
  const { error } = await searchParams;

  const [students, mentors] = await Promise.all([
    prisma.profile.findMany({
      where: { role: "student", bannedAt: null },
      include: { studentAssignment: { include: { mentor: true } } },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    }),
    prisma.profile.findMany({
      where: { role: "mentor", bannedAt: null },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    }),
  ]);

  // Per-mentor active student counts for the workload column.
  const counts = await prisma.mentorAssignment.groupBy({
    by: ["mentorId"],
    where: { endedAt: null },
    _count: { _all: true },
  });
  const loadByMentor = new Map(counts.map((c) => [c.mentorId, c._count._all]));

  const paired = students.filter(
    (s) => s.studentAssignment && !s.studentAssignment.endedAt,
  ).length;
  const unpaired = students.length - paired;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
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
          Mentorship
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
          Mentor assignments
        </h1>
        <p style={{ color: A.muted, fontSize: 14, marginTop: 8, lineHeight: 1.5 }}>
          Pair each student with a mentor. Re-assigning a paired student
          replaces the previous mentor and re-activates the assignment if it
          had been ended.
        </p>
      </div>

      {error && (
        <div style={{ ...s.alertError, marginBottom: 20 }}>
          {ASSIGN_ERRORS[error] ?? "Something went wrong saving that pairing."}
        </div>
      )}

      <div
        className="etu-collapse"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <Stat label="Students" value={students.length} />
        <Stat label="Paired" value={paired} tone="good" />
        <Stat
          label="Unpaired"
          value={unpaired}
          tone={unpaired > 0 ? "warn" : "good"}
        />
      </div>

      {mentors.length === 0 && (
        <div
          style={{
            background: "rgba(178, 34, 52, 0.08)",
            border: "1px solid rgba(178, 34, 52, 0.3)",
            color: "#7a1620",
            padding: "14px 18px",
            borderRadius: 6,
            fontSize: 13,
            lineHeight: 1.5,
            marginBottom: 20,
          }}
        >
          No mentor accounts yet. Invite one from{" "}
          <Link
            href="/admin/invitations"
            style={{ color: "#7a1620", fontWeight: 700 }}
          >
            Invitations
          </Link>
          .
        </div>
      )}

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
              <th style={th}>Student</th>
              <th style={th}>Current mentor</th>
              <th style={th}>Assign / change</th>
              <th style={{ ...th, textAlign: "right" }}></th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
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
                  No students yet.
                </td>
              </tr>
            ) : (
              students.map((student) => {
                const current = student.studentAssignment;
                const active = current && !current.endedAt ? current : null;
                return (
                  <tr
                    key={student.id}
                    style={{ borderBottom: `1px solid ${A.rule}` }}
                  >
                    <td style={td}>
                      <Link
                        href={`/admin/mentorship/students/${student.id}`}
                        style={{
                          fontWeight: 600,
                          color: A.navy,
                          textDecoration: "none",
                          borderBottom: `2px solid ${A.gold}`,
                          paddingBottom: 2,
                        }}
                      >
                        {student.firstName} {student.lastName}
                      </Link>
                      <div style={{ fontSize: 12, color: A.muted, marginTop: 4 }}>
                        {student.grade ? `Grade ${student.grade}` : "—"}
                        {student.school ? ` · ${student.school}` : ""}
                      </div>
                    </td>
                    <td style={td}>
                      {active ? (
                        <span style={{ color: A.ink, fontWeight: 600 }}>
                          {active.mentor.firstName} {active.mentor.lastName}
                        </span>
                      ) : (
                        <span
                          style={{
                            color: "#7a5a00",
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: 0.5,
                            textTransform: "uppercase",
                            background: "rgba(252, 204, 0, 0.18)",
                            border: "1px solid rgba(252, 204, 0, 0.5)",
                            padding: "4px 10px",
                            borderRadius: 99,
                          }}
                        >
                          Unpaired
                        </span>
                      )}
                    </td>
                    <td style={td}>
                      <form
                        action={assignMentorAction}
                        style={{ display: "flex", gap: 8, alignItems: "center" }}
                      >
                        <input
                          type="hidden"
                          name="student_id"
                          value={student.id}
                        />
                        <select
                          name="mentor_id"
                          defaultValue={active?.mentorId ?? ""}
                          required
                          style={{
                            padding: "8px 10px",
                            border: `1px solid ${A.rule}`,
                            borderRadius: 4,
                            fontFamily: A.fontBody,
                            fontSize: 13,
                            background: "#fff",
                            color: A.ink,
                            minWidth: 200,
                          }}
                        >
                          <option value="" disabled>
                            Choose mentor…
                          </option>
                          {mentors.map((m) => {
                            const load = loadByMentor.get(m.id) ?? 0;
                            return (
                              <option key={m.id} value={m.id}>
                                {m.firstName} {m.lastName} · {load} student
                                {load === 1 ? "" : "s"}
                              </option>
                            );
                          })}
                        </select>
                        <button
                          type="submit"
                          disabled={mentors.length === 0}
                          style={{
                            background: A.navy,
                            color: "#fff",
                            padding: "8px 14px",
                            border: "none",
                            borderRadius: 4,
                            fontFamily: A.fontBody,
                            fontWeight: 700,
                            fontSize: 12,
                            letterSpacing: 0.5,
                            textTransform: "uppercase",
                            cursor: mentors.length === 0 ? "not-allowed" : "pointer",
                            opacity: mentors.length === 0 ? 0.5 : 1,
                          }}
                        >
                          Save
                        </button>
                      </form>
                    </td>
                    <td style={{ ...td, textAlign: "right" }}>
                      {active && (
                        <form action={endAssignmentAction}>
                          <input
                            type="hidden"
                            name="student_id"
                            value={student.id}
                          />
                          <button
                            type="submit"
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#b22234",
                              fontFamily: A.fontBody,
                              fontWeight: 700,
                              fontSize: 12,
                              letterSpacing: 0.5,
                              textTransform: "uppercase",
                              cursor: "pointer",
                            }}
                          >
                            End
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

function Stat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: "good" | "warn" | "neutral";
}) {
  const color =
    tone === "good" ? "#1f8a5b" : tone === "warn" ? "#7a5a00" : A.navy;
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
          color,
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

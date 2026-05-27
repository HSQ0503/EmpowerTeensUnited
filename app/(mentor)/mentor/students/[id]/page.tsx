import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { A } from "@/app/components/tokens";
import { authStyles as s } from "@/app/(auth)/_styles";
import { FormRenderer } from "@/app/components/FormRenderer";
import { FormAnswerList } from "@/app/components/FormAnswers";
import { INTAKE_FORM } from "@/lib/forms/intake";
import { SESSION_FORM } from "@/lib/forms/session";
import { HS_PLAN_FORM } from "@/lib/forms/hs-plan";
import type { FormAnswers } from "@/lib/forms/types";
import { submitSessionFormAction } from "./actions";

export const metadata = { title: "Student · Mentor" };

export default async function MentorStudentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { profile } = await requireRole("mentor");
  const { id } = await params;
  const { saved } = await searchParams;

  const assignment = await prisma.mentorAssignment.findFirst({
    where: { mentorId: profile.id, studentId: id, endedAt: null },
    include: {
      student: {
        include: {
          enrollments: {
            include: {
              course: true,
              responses: { include: { week: true } },
            },
            orderBy: { enrolledAt: "desc" },
          },
        },
      },
    },
  });
  if (!assignment) notFound();
  const student = assignment.student;

  const [intake, sessions, hsPlan] = await Promise.all([
    prisma.mentorshipForm.findFirst({
      where: { studentId: id, kind: "intake", sessionNo: null },
    }),
    prisma.mentorshipForm.findMany({
      where: { studentId: id, kind: "session" },
      orderBy: { sessionNo: "asc" },
    }),
    prisma.mentorshipForm.findFirst({
      where: { studentId: id, kind: "hs_plan", sessionNo: null },
    }),
  ]);

  const submitSession = submitSessionFormAction.bind(null, id);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <Link
          href="/mentor"
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: A.muted,
            textDecoration: "none",
          }}
        >
          ← My students
        </Link>
        <h1
          style={{
            marginTop: 12,
            fontFamily: A.fontHead,
            fontSize: 36,
            fontWeight: 500,
            color: A.navy,
            margin: "12px 0 6px",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          {student.firstName} {student.lastName}
        </h1>
        <p style={{ color: A.muted, fontSize: 14, margin: 0 }}>
          {student.email}
          {student.grade && ` · Grade ${student.grade}`}
          {student.school && ` · ${student.school}`}
        </p>
      </div>

      {saved === "session" && (
        <div style={{ ...s.alertInfo, marginBottom: 20 }}>Session saved.</div>
      )}

      <Card title={`Intake ${intake ? "· submitted" : "· pending"}`}>
        {intake ? (
          <FormAnswerList
            def={INTAKE_FORM}
            answers={(intake.answers as FormAnswers) ?? {}}
          />
        ) : (
          <Empty>Student hasn&apos;t completed intake yet.</Empty>
        )}
      </Card>

      <Card title={`Session notes (${sessions.length})`}>
        {sessions.length === 0 ? (
          <Empty>No sessions logged yet. Add the first one below.</Empty>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sessions.map((session) => {
              const answers = (session.answers as FormAnswers) ?? {};
              return (
                <details
                  key={session.id}
                  style={{
                    border: `1px solid ${A.rule}`,
                    borderRadius: 6,
                    padding: "14px 18px",
                    background: A.paper,
                  }}
                >
                  <summary
                    style={{
                      cursor: "pointer",
                      listStyle: "none",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: 1.2,
                          textTransform: "uppercase",
                          color: A.gold,
                        }}
                      >
                        Session {session.sessionNo}
                        {answers.date && ` · ${answers.date}`}
                      </div>
                      <div
                        style={{
                          fontFamily: A.fontHead,
                          fontSize: 15,
                          fontWeight: 500,
                          color: A.navy,
                          marginTop: 2,
                        }}
                      >
                        {answers.topics
                          ? answers.topics.slice(0, 80) +
                            (answers.topics.length > 80 ? "…" : "")
                          : "Logged"}
                      </div>
                    </div>
                    <span style={{ fontSize: 12, color: A.muted }}>
                      {session.submittedAt?.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </summary>
                  <div style={{ marginTop: 14 }}>
                    <FormAnswerList def={SESSION_FORM} answers={answers} />
                  </div>
                </details>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: 24 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: A.gold,
              marginBottom: 10,
            }}
          >
            Log session {sessions.length + 1}
          </div>
          <FormRenderer
            def={SESSION_FORM}
            existing={null}
            action={submitSession}
            submitLabel="Save session"
            textareaRows={3}
          />
        </div>
      </Card>

      <Card title={`HS plan ${hsPlan ? "· submitted" : "· pending"}`}>
        {hsPlan ? (
          <FormAnswerList
            def={HS_PLAN_FORM}
            answers={(hsPlan.answers as FormAnswers) ?? {}}
          />
        ) : (
          <Empty>Student hasn&apos;t submitted a plan yet.</Empty>
        )}
      </Card>

      <Card title={`Course progress (${student.enrollments.length})`}>
        {student.enrollments.length === 0 ? (
          <Empty>Not enrolled in any course.</Empty>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {student.enrollments.map((e) => {
              const submitted = e.responses.filter((r) => r.submittedAt).length;
              return (
                <div
                  key={e.id}
                  style={{
                    border: `1px solid ${A.rule}`,
                    borderRadius: 6,
                    padding: "14px 18px",
                    background: A.paper,
                  }}
                >
                  <div
                    style={{
                      fontFamily: A.fontHead,
                      fontSize: 15,
                      fontWeight: 500,
                      color: A.navy,
                    }}
                  >
                    {e.course.title}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      color: A.muted,
                    }}
                  >
                    {submitted} of {e.course.weeks} weeks submitted ·{" "}
                    {e.status}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        background: "#fff",
        border: `1px solid ${A.rule}`,
        borderRadius: 6,
        padding: 28,
        marginBottom: 20,
        boxShadow: "0 12px 32px -28px rgba(15, 69, 102, 0.2)",
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
          marginBottom: 18,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ color: A.muted, fontSize: 14, margin: 0, lineHeight: 1.5 }}>
      {children}
    </p>
  );
}

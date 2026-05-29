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
import {
  submitSessionFormAction,
  updateSessionFormAction,
  deleteSessionFormAction,
} from "./actions";

export const metadata = { title: "Student · Mentor" };

const SAVED_MESSAGES: Record<string, string> = {
  session: "Session saved.",
  session_updated: "Session updated.",
  session_deleted: "Session deleted.",
};

export default async function MentorStudentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { profile } = await requireRole("mentor");
  const { id } = await params;
  const { saved, error } = await searchParams;

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
      include: { mentor: true },
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
          className="etu-h1"
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

      {saved && SAVED_MESSAGES[saved] && (
        <div style={{ ...s.alertInfo, marginBottom: 20 }}>
          {SAVED_MESSAGES[saved]}
        </div>
      )}
      {error === "session" && (
        <div style={{ ...s.alertError, marginBottom: 20 }}>
          Please fill in the required session fields (marked *) before saving.
        </div>
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
              const updateThis = updateSessionFormAction.bind(
                null,
                session.id,
                id,
              );
              const deleteThis = deleteSessionFormAction.bind(
                null,
                session.id,
                id,
              );
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
                    className="etu-stack"
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
                      {session.mentor && (
                        <div
                          style={{ fontSize: 12, color: A.muted, marginTop: 2 }}
                        >
                          Logged by {session.mentor.firstName}{" "}
                          {session.mentor.lastName}
                          {session.mentor.id !== profile.id && " (former mentor)"}
                        </div>
                      )}
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

                  <details style={{ marginTop: 14 }}>
                    <summary
                      style={{
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: 0.6,
                        textTransform: "uppercase",
                        color: A.navy,
                      }}
                    >
                      Edit or delete this session
                    </summary>
                    <div style={{ marginTop: 14 }}>
                      <FormRenderer
                        def={SESSION_FORM}
                        existing={answers}
                        action={updateThis}
                        submitLabel="Save changes"
                        textareaRows={3}
                      />
                      <form action={deleteThis} style={{ marginTop: 12 }}>
                        <button
                          type="submit"
                          style={{
                            background: "transparent",
                            border: "1px solid rgba(178, 34, 52, 0.4)",
                            color: "#b22234",
                            padding: "8px 14px",
                            borderRadius: 4,
                            fontFamily: A.fontBody,
                            fontWeight: 700,
                            fontSize: 12,
                            letterSpacing: 0.5,
                            textTransform: "uppercase",
                            cursor: "pointer",
                          }}
                        >
                          Delete session {session.sessionNo}
                        </button>
                      </form>
                    </div>
                  </details>
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

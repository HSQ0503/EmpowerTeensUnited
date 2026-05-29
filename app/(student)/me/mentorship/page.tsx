import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { A } from "@/app/components/tokens";
import { authStyles as s } from "@/app/(auth)/_styles";
import { FormRenderer } from "@/app/components/FormRenderer";
import { FormAnswerList } from "@/app/components/FormAnswers";
import { INTAKE_FORM } from "@/lib/forms/intake";
import { SESSION_FORM } from "@/lib/forms/session";
import { HS_PLAN_FORM } from "@/lib/forms/hs-plan";
import { submitIntakeAction, submitHsPlanAction } from "./actions";
import type { FormAnswers } from "@/lib/forms/types";

export const metadata = { title: "Mentorship · Empower Teens United" };

export default async function MentorshipPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { profile } = await requireRole("student");
  const { saved, error } = await searchParams;

  const [intake, hsPlan, sessions, assignment] = await Promise.all([
    prisma.mentorshipForm.findFirst({
      where: { studentId: profile.id, kind: "intake", sessionNo: null },
    }),
    prisma.mentorshipForm.findFirst({
      where: { studentId: profile.id, kind: "hs_plan", sessionNo: null },
    }),
    prisma.mentorshipForm.findMany({
      where: { studentId: profile.id, kind: "session" },
      orderBy: { sessionNo: "asc" },
      include: { mentor: true },
    }),
    prisma.mentorAssignment.findUnique({
      where: { studentId: profile.id },
      include: { mentor: true },
    }),
  ]);

  const mentor = assignment && !assignment.endedAt ? assignment.mentor : null;
  const intakeAnswers = (intake?.answers as FormAnswers | null) ?? null;
  const hsPlanAnswers = (hsPlan?.answers as FormAnswers | null) ?? null;

  return (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
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
          Mentorship
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
          Your mentorship journey
        </h1>
        <p
          style={{
            marginTop: 10,
            color: A.muted,
            fontSize: 15,
            lineHeight: 1.5,
          }}
        >
          Start with the intake so your mentor can prepare. Session notes show
          up here as they happen. Wrap with the high-school plan near the end.
        </p>
      </div>

      <div
        className="etu-collapse-2"
        style={{
          background: "#fff",
          border: `1px solid ${A.rule}`,
          borderRadius: 6,
          padding: 24,
          marginBottom: 28,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 24,
        }}
      >
        <Pillar
          label="Mentor"
          value={
            mentor ? `${mentor.firstName} ${mentor.lastName}` : "Not yet paired"
          }
          sub={mentor?.email ?? undefined}
          status={mentor ? "active" : "idle"}
        />
        <Pillar
          label="Intake"
          value={intake ? "Submitted" : "Not yet"}
          status={intake ? "done" : "idle"}
        />
        <Pillar
          label="Sessions logged"
          value={String(sessions.length)}
          status={sessions.length > 0 ? "active" : "idle"}
        />
      </div>

      {saved === "intake" && (
        <div style={{ ...s.alertInfo, marginBottom: 20 }}>Intake saved.</div>
      )}
      {saved === "hs_plan" && (
        <div style={{ ...s.alertInfo, marginBottom: 20 }}>HS plan saved.</div>
      )}
      {error === "intake" && (
        <div style={{ ...s.alertError, marginBottom: 20 }}>
          Please answer all required intake questions (marked *) before
          submitting.
        </div>
      )}
      {error === "hs_plan" && (
        <div style={{ ...s.alertError, marginBottom: 20 }}>
          Please answer all required plan questions (marked *) before
          submitting.
        </div>
      )}

      <section style={{ marginBottom: 40 }}>
        <SectionHeader title="Intake" />
        <FormRenderer
          def={INTAKE_FORM}
          existing={intakeAnswers}
          action={submitIntakeAction}
          submitLabel={intake ? "Update intake" : "Submit intake"}
        />
      </section>

      <section style={{ marginBottom: 40 }}>
        <SectionHeader title="Session notes" />
        {sessions.length === 0 ? (
          <div
            style={{
              background: "#fff",
              border: `1px solid ${A.rule}`,
              borderRadius: 6,
              padding: 32,
              textAlign: "center",
            }}
          >
            <p style={{ color: A.muted, margin: 0, fontSize: 14 }}>
              No session notes yet. After each meeting, your mentor will
              record one here.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {sessions.map((session) => {
              const answers = (session.answers as FormAnswers) ?? {};
              return (
                <details
                  key={session.id}
                  style={{
                    background: "#fff",
                    border: `1px solid ${A.rule}`,
                    borderRadius: 6,
                    padding: "16px 20px",
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
                      gap: 14,
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
                      </div>
                      <div
                        style={{
                          fontFamily: A.fontHead,
                          fontSize: 16,
                          fontWeight: 500,
                          color: A.navy,
                          marginTop: 2,
                        }}
                      >
                        {session.mentor
                          ? `${session.mentor.firstName} ${session.mentor.lastName}`
                          : "Mentor"}
                        {answers.date && ` · ${answers.date}`}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        color: A.muted,
                      }}
                    >
                      {session.submittedAt?.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </summary>
                  <div style={{ marginTop: 16 }}>
                    <FormAnswerList def={SESSION_FORM} answers={answers} />
                  </div>
                </details>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <SectionHeader title="High-school plan" />
        <FormRenderer
          def={HS_PLAN_FORM}
          existing={hsPlanAnswers}
          action={submitHsPlanAction}
          submitLabel={hsPlan ? "Update plan" : "Submit plan"}
          textareaRows={4}
        />
      </section>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 1.4,
        textTransform: "uppercase",
        color: A.muted,
        marginBottom: 14,
      }}
    >
      {title}
    </div>
  );
}

function Pillar({
  label,
  value,
  sub,
  status,
}: {
  label: string;
  value: string;
  sub?: string;
  status: "idle" | "active" | "done";
}) {
  const color = status === "done" ? "#1f8a5b" : status === "active" ? A.navy : A.muted;
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          color: A.muted,
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 6,
          fontFamily: A.fontHead,
          fontSize: 20,
          fontWeight: 500,
          color,
          letterSpacing: "-0.01em",
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
      {sub && (
        <a
          href={`mailto:${sub}`}
          style={{
            display: "inline-block",
            marginTop: 4,
            fontSize: 13,
            color: A.navy,
            textDecoration: "none",
            borderBottom: `1px solid ${A.gold}`,
          }}
        >
          {sub}
        </a>
      )}
    </div>
  );
}

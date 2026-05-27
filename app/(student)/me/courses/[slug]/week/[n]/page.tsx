import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { A } from "@/app/components/tokens";
import { authStyles as s } from "@/app/(auth)/_styles";
import { submitWeekAnswersAction } from "./actions";

type QuestionDef = {
  id: string;
  prompt: string;
  type: "short" | "long";
};

export const metadata = { title: "Weekly reflection · My course" };

export default async function WeekAnswerPage({
  params,
}: {
  params: Promise<{ slug: string; n: string }>;
}) {
  const { slug, n } = await params;
  const weekNo = Number(n);
  if (!Number.isInteger(weekNo) || weekNo < 1) notFound();

  const { profile } = await requireRole("student");

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      courseWeeks: { where: { weekNo } },
      enrollments: {
        where: { profileId: profile.id, status: "active" },
        include: { responses: true },
      },
    },
  });
  const week = course?.courseWeeks[0];
  const enrollment = course?.enrollments[0];
  if (!course || !week || !enrollment) notFound();

  const response = enrollment.responses.find((r) => r.weekId === week.id);
  const existing = (response?.answers as Record<string, string>) ?? {};
  const questions = ((week.questions as unknown) as QuestionDef[]) ?? [];
  const submit = submitWeekAnswersAction.bind(null, slug, weekNo);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Link
          href={`/me/courses/${slug}`}
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: A.muted,
            textDecoration: "none",
          }}
        >
          ← {course.title}
        </Link>
        <div
          style={{
            marginTop: 12,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: A.gold,
          }}
        >
          Week {week.weekNo} of {course.weeks}
        </div>
        <h1
          style={{
            fontFamily: A.fontHead,
            fontSize: 32,
            fontWeight: 500,
            color: A.navy,
            margin: "8px 0 0",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          {week.title}
        </h1>
      </div>

      {week.body && (
        <div
          style={{
            background: "#fff",
            border: `1px solid ${A.rule}`,
            borderRadius: 6,
            padding: 24,
            marginBottom: 24,
            fontSize: 15,
            color: A.body,
            lineHeight: 1.7,
          }}
          dangerouslySetInnerHTML={{ __html: week.body }}
        />
      )}

      {questions.length === 0 ? (
        <div
          style={{
            background: "#fff",
            border: `1px solid ${A.rule}`,
            borderRadius: 6,
            padding: 32,
            textAlign: "center",
          }}
        >
          <p style={{ color: A.muted, margin: 0, fontSize: 15 }}>
            Your mentor hasn&apos;t added prompts for this week yet.
          </p>
        </div>
      ) : (
        <form
          action={submit}
          style={{
            background: "#fff",
            border: `1px solid ${A.rule}`,
            borderRadius: 6,
            padding: 32,
            display: "flex",
            flexDirection: "column",
            gap: 20,
            boxShadow: "0 12px 32px -28px rgba(15, 69, 102, 0.2)",
          }}
        >
          {questions.map((q) => (
            <div key={q.id}>
              <label htmlFor={`q_${q.id}`} style={s.fieldLabel}>
                {q.prompt}
              </label>
              {q.type === "long" ? (
                <textarea
                  id={`q_${q.id}`}
                  name={`q_${q.id}`}
                  rows={5}
                  defaultValue={existing[q.id] ?? ""}
                  style={{
                    ...s.input,
                    resize: "vertical",
                    fontFamily: A.fontBody,
                  }}
                />
              ) : (
                <input
                  id={`q_${q.id}`}
                  name={`q_${q.id}`}
                  defaultValue={existing[q.id] ?? ""}
                  style={s.input}
                />
              )}
            </div>
          ))}

          <div style={{ marginTop: 8 }}>
            <button type="submit" style={s.primaryButton}>
              {response?.submittedAt ? "Update answers" : "Submit answers"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

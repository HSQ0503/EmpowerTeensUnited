import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { A } from "@/app/components/tokens";
import { authStyles as s } from "@/app/(auth)/_styles";
import { formatShortDate } from "@/lib/dates";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await prisma.course.findUnique({ where: { slug } });
  return { title: course ? `${course.title} · My course` : "My course" };
}

export default async function MyCourseHomePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { profile } = await requireRole("student");
  const { slug } = await params;
  const { saved } = await searchParams;

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      courseWeeks: { orderBy: { weekNo: "asc" } },
      enrollments: {
        where: { profileId: profile.id },
        include: { responses: true },
      },
    },
  });

  const enrollment = course?.enrollments[0];
  if (!course || !enrollment) notFound();

  const submittedCount = enrollment.responses.filter((r) => r.submittedAt).length;
  const progress = course.weeks
    ? Math.round((submittedCount / course.weeks) * 100)
    : 0;

  return (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <Link
          href="/courses"
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: A.muted,
            textDecoration: "none",
          }}
        >
          ← Programs
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
          {course.title}
        </h1>
        <p style={{ color: A.muted, fontSize: 14, margin: 0 }}>
          {course.weeks} weeks · starts {formatShortDate(course.startsOn)} ·{" "}
          {course.location}
        </p>
      </div>

      {saved && (
        <div style={{ ...s.alertInfo, marginBottom: 20 }}>
          Week {saved} saved.
        </div>
      )}

      <div
        className="etu-collapse"
        style={{
          background: "#fff",
          border: `1px solid ${A.rule}`,
          borderRadius: 6,
          padding: 24,
          marginBottom: 20,
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 24,
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
              color: A.muted,
              marginBottom: 8,
            }}
          >
            Your progress
          </div>
          <div
            style={{
              height: 8,
              background: A.ruleSoft,
              borderRadius: 99,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                background: A.gold,
                width: `${progress}%`,
              }}
            />
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 13,
              color: A.muted,
            }}
          >
            {submittedCount} of {course.weeks} weeks submitted
          </div>
        </div>
        <div
          style={{
            fontFamily: A.fontHead,
            fontSize: 32,
            fontWeight: 600,
            color: A.navy,
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          {progress}%
        </div>
      </div>

      <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {course.courseWeeks.map((w) => {
          const response = enrollment.responses.find((x) => x.weekId === w.id);
          const submitted = !!response?.submittedAt;
          const questions =
            (w.questions as unknown as Array<{ id: string }>) ?? [];
          const hasQuestions = questions.length > 0;
          return (
            <li
              key={w.id}
              className="etu-collapse"
              style={{
                background: "#fff",
                border: `1px solid ${A.rule}`,
                borderRadius: 6,
                padding: "18px 20px",
                marginBottom: 10,
                display: "grid",
                gridTemplateColumns: "auto 1fr auto",
                gap: 18,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 99,
                  background: submitted ? A.gold : A.ruleSoft,
                  color: submitted ? A.navy : A.muted,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                {submitted ? "✓" : w.weekNo}
              </div>
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
                  Week {w.weekNo}
                </div>
                <div
                  style={{
                    fontFamily: A.fontHead,
                    fontSize: 17,
                    fontWeight: 500,
                    color: A.navy,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {w.title}
                </div>
              </div>
              <div>
                {hasQuestions ? (
                  <Link
                    href={`/me/courses/${slug}/week/${w.weekNo}`}
                    style={{
                      display: "inline-block",
                      padding: "8px 14px",
                      background: submitted ? "transparent" : A.navy,
                      color: submitted ? A.navy : "#fff",
                      border: submitted ? `1px solid ${A.rule}` : "none",
                      borderRadius: 4,
                      textDecoration: "none",
                      fontFamily: A.fontBody,
                      fontWeight: 700,
                      fontSize: 12,
                      letterSpacing: 0.6,
                      textTransform: "uppercase",
                    }}
                  >
                    {submitted ? "Edit" : "Start"}
                  </Link>
                ) : (
                  <span style={{ fontSize: 12, color: A.muted }}>
                    No prompts yet
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { A } from "@/app/components/tokens";
import { authStyles as s } from "@/app/(auth)/_styles";
import { CourseMetadataForm } from "../../_metadata-form";
import {
  updateCourseMetadataAction,
  updateWeekAction,
  archiveCourseAction,
} from "../../actions";

export const metadata = { title: "Edit course · Admin" };

export default async function EditCoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      courseWeeks: { orderBy: { weekNo: "asc" } },
      _count: { select: { enrollments: true } },
    },
  });
  if (!course) notFound();

  const updateMeta = updateCourseMetadataAction.bind(null, id);
  const archive = archiveCourseAction.bind(null, id);

  return (
    <div style={{ maxWidth: 880 }}>
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/admin/courses"
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: A.muted,
            textDecoration: "none",
          }}
        >
          ← Courses
        </Link>
        <h1
          style={{
            marginTop: 12,
            fontFamily: A.fontHead,
            fontSize: 32,
            fontWeight: 500,
            color: A.navy,
            letterSpacing: "-0.02em",
          }}
        >
          Edit course
        </h1>
        <p style={{ marginTop: 8, color: A.muted, fontSize: 14 }}>
          {course.publishedAt ? "Published" : "Draft"} · /courses/{course.slug}{" "}
          · {course._count.enrollments} enrolled
        </p>
      </div>

      {saved && (
        <div style={{ ...s.alertInfo, marginBottom: 20 }}>Saved.</div>
      )}

      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1.4,
          textTransform: "uppercase",
          color: A.muted,
          marginBottom: 12,
        }}
      >
        Metadata
      </div>
      <CourseMetadataForm
        action={updateMeta}
        course={course}
        submitLabel="Save metadata"
        showWeeksInput={false}
      />

      <div
        style={{
          marginTop: 48,
          marginBottom: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: A.muted,
          }}
        >
          Weekly prompts ({course.weeks} weeks)
        </div>
      </div>
      <div
        style={{
          background: "rgba(252, 204, 0, 0.08)",
          border: `1px solid ${A.gold}`,
          borderRadius: 6,
          padding: "14px 18px",
          marginBottom: 20,
          fontSize: 13,
          color: A.body,
          lineHeight: 1.6,
        }}
      >
        Each week has a title, body (HTML), and a JSON array of questions
        students answer. Question shape:{" "}
        <code
          style={{
            background: "#fff",
            padding: "1px 6px",
            borderRadius: 3,
            border: `1px solid ${A.rule}`,
            fontSize: 12,
          }}
        >
          {`[{"id":"q1","prompt":"What did you learn?","type":"long"}]`}
        </code>
        . <code>type</code> is <code>short</code> or <code>long</code>.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {course.courseWeeks.map((w) => {
          const updateWeek = updateWeekAction.bind(null, w.id);
          const prettyQuestions = JSON.stringify(w.questions, null, 2);
          return (
            <form
              key={w.id}
              action={updateWeek}
              style={{
                background: "#fff",
                border: `1px solid ${A.rule}`,
                borderRadius: 6,
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                  color: A.gold,
                }}
              >
                Week {w.weekNo}
              </div>
              <div>
                <label htmlFor={`week-title-${w.id}`} style={s.fieldLabel}>
                  Title
                </label>
                <input
                  id={`week-title-${w.id}`}
                  name="title"
                  defaultValue={w.title}
                  required
                  style={s.input}
                />
              </div>
              <div>
                <label htmlFor={`week-body-${w.id}`} style={s.fieldLabel}>
                  Body (HTML)
                </label>
                <textarea
                  id={`week-body-${w.id}`}
                  name="body"
                  rows={4}
                  defaultValue={w.body}
                  placeholder="Plain text or HTML — students see this above the prompts."
                  style={{
                    ...s.input,
                    fontFamily: "ui-monospace, monospace",
                    fontSize: 13,
                  }}
                />
              </div>
              <div>
                <label htmlFor={`week-questions-${w.id}`} style={s.fieldLabel}>
                  Questions (JSON)
                </label>
                <textarea
                  id={`week-questions-${w.id}`}
                  name="questions"
                  rows={6}
                  defaultValue={prettyQuestions}
                  spellCheck={false}
                  style={{
                    ...s.input,
                    fontFamily: "ui-monospace, monospace",
                    fontSize: 13,
                  }}
                />
              </div>
              <div>
                <button
                  type="submit"
                  style={{
                    ...s.primaryButton,
                    padding: "10px 18px",
                    fontSize: 13,
                  }}
                >
                  Save week
                </button>
              </div>
            </form>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 48,
          padding: 24,
          background: "#fff",
          border: `1px solid ${A.rule}`,
          borderRadius: 6,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 700,
            color: "#b22234",
            letterSpacing: 0.4,
            textTransform: "uppercase",
          }}
        >
          Danger zone
        </h2>
        <p style={{ color: A.muted, fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>
          Archiving hides this course from the public catalog and blocks new
          enrollments. Existing enrollments stay intact.
        </p>
        <form action={archive} style={{ marginTop: 16 }}>
          <button
            type="submit"
            style={{
              background: "#b22234",
              color: "#fff",
              padding: "10px 16px",
              border: "none",
              borderRadius: 4,
              fontFamily: A.fontBody,
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Archive course
          </button>
        </form>
      </div>
    </div>
  );
}

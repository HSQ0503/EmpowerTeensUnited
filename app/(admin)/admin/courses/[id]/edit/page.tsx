import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { A } from "@/app/components/tokens";
import { authStyles as s } from "@/app/(auth)/_styles";
import { CourseMetadataForm } from "../../_metadata-form";
import { RichTextEditor } from "@/components/RichTextEditor";
import { QuestionBuilder } from "@/app/components/QuestionBuilder";
import {
  updateCourseMetadataAction,
  updateWeekAction,
  archiveCourseAction,
  addWeekAction,
  deleteWeekAction,
  duplicateCourseAction,
} from "../../actions";

export const metadata = { title: "Edit course · Admin" };

export default async function EditCoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { id } = await params;
  const { saved, error } = await searchParams;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      courseWeeks: {
        orderBy: { weekNo: "asc" },
        include: { _count: { select: { responses: true } } },
      },
      _count: { select: { enrollments: true } },
    },
  });
  if (!course) notFound();

  const updateMeta = updateCourseMetadataAction.bind(null, id);
  const archive = archiveCourseAction.bind(null, id);
  const addWeek = addWeekAction.bind(null, id);
  const duplicate = duplicateCourseAction.bind(null, id);
  const lastWeekNo = course.courseWeeks.at(-1)?.weekNo;

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
          className="etu-h2"
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
        <div
          style={{
            marginTop: 8,
            display: "flex",
            alignItems: "center",
            gap: 18,
            flexWrap: "wrap",
          }}
        >
          <p style={{ margin: 0, color: A.muted, fontSize: 14 }}>
            {course.publishedAt ? "Published" : "Draft"} · /courses/
            {course.slug} · {course._count.enrollments} enrolled
          </p>
          <Link
            href={`/courses/${course.slug}`}
            style={{
              color: A.navy,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              borderBottom: `2px solid ${A.gold}`,
              paddingBottom: 1,
            }}
          >
            View public page
          </Link>
          <form action={duplicate} style={{ display: "inline" }}>
            <button
              type="submit"
              style={{
                background: "transparent",
                border: "none",
                padding: "0 0 1px",
                color: A.navy,
                fontFamily: A.fontBody,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                borderBottom: `2px solid ${A.gold}`,
              }}
            >
              Duplicate as draft
            </button>
          </form>
        </div>
      </div>

      {saved === "1" && (
        <div style={{ ...s.alertInfo, marginBottom: 20 }}>Saved.</div>
      )}
      {error === "week-locked" && (
        <div style={{ ...s.alertError, marginBottom: 20 }}>
          That week can&apos;t be deleted — only the last week can be removed,
          and only if no student has submitted answers for it.
        </div>
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
        For each week, give it a title, write the lesson content, and add the
        reflection questions students answer. Choose{" "}
        <strong>Short answer</strong> for a one-line response or{" "}
        <strong>Paragraph</strong> for a longer one. Remember to save each week
        after editing.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {course.courseWeeks.map((w) => {
          const updateWeek = updateWeekAction.bind(null, w.id);
          const justSaved = saved === `w${w.weekNo}`;
          const deletable =
            w.weekNo === lastWeekNo && w._count.responses === 0;
          return (
            <form
              key={w.id}
              id={`week-${w.weekNo}`}
              action={updateWeek}
              style={{
                background: "#fff",
                border: `1px solid ${justSaved ? "#1f8a5b" : A.rule}`,
                borderRadius: 6,
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
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
                  {w._count.responses > 0 && (
                    <span
                      style={{
                        marginLeft: 10,
                        color: A.muted,
                        letterSpacing: 0.4,
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                    >
                      {w._count.responses} student{" "}
                      {w._count.responses === 1 ? "response" : "responses"}
                    </span>
                  )}
                </div>
                {justSaved && (
                  <span
                    style={{
                      fontSize: 11,
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
                    Saved
                  </span>
                )}
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
                <label style={s.fieldLabel}>Lesson content</label>
                <p
                  style={{
                    margin: "0 0 8px",
                    fontSize: 12,
                    color: A.muted,
                    lineHeight: 1.5,
                  }}
                >
                  Students see this above the questions.
                </p>
                <RichTextEditor
                  name="body"
                  defaultValue={w.body}
                  minHeight={140}
                />
              </div>
              <div>
                <label style={s.fieldLabel}>Reflection questions</label>
                <p
                  style={{
                    margin: "0 0 10px",
                    fontSize: 12,
                    color: A.muted,
                    lineHeight: 1.5,
                  }}
                >
                  These are the prompts students fill out for this week.
                </p>
                <QuestionBuilder name="questions" defaultValue={w.questions} />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
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
                {deletable && (
                  <button
                    type="submit"
                    formAction={deleteWeekAction.bind(null, w.id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      padding: 0,
                      color: "#b22234",
                      fontFamily: A.fontBody,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Delete week
                  </button>
                )}
              </div>
            </form>
          );
        })}

        <form action={addWeek}>
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: 6,
              border: `1px dashed ${A.navy}`,
              background: "#fff",
              color: A.navy,
              fontFamily: A.fontBody,
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: 0.4,
              cursor: "pointer",
            }}
          >
            + Add week {(lastWeekNo ?? 0) + 1}
          </button>
        </form>
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

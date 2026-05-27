import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOptionalUser } from "@/lib/auth";
import { A } from "@/app/components/tokens";
import { PHOTOS } from "@/app/components/photos";
import { ConcentricArcs } from "@/app/components/ConcentricArcs";
import { formatShortDate } from "@/lib/dates";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await prisma.course.findUnique({ where: { slug } });
  return { title: course ? `${course.title} · Programs` : "Program" };
}

export default async function CourseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug } = await params;
  const { error } = await searchParams;
  const course = await prisma.course.findUnique({
    where: { slug },
    include: { courseWeeks: { orderBy: { weekNo: "asc" } } },
  });
  if (!course || !course.publishedAt || course.archivedAt) notFound();

  const auth = await getOptionalUser();
  const enrolled = auth
    ? await prisma.enrollment.findFirst({
        where: {
          courseId: course.id,
          profileId: auth.profile.id,
          status: "active",
        },
      })
    : null;

  return (
    <>
      <section
        style={{
          position: "relative",
          background: A.navy,
          color: "#fff",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `url(${course.coverImageUrl || PHOTOS.notebook}) center/cover`,
            opacity: 0.35,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(15,69,102,0.6) 0%, rgba(15,69,102,0.92) 100%)",
          }}
        />
        <div style={{ position: "absolute", top: 0, right: 0 }}>
          <ConcentricArcs size={300} color="#FCCC00" opacity={0.18} corner="tr" />
        </div>
        <div
          style={{
            position: "relative",
            padding: "72px 56px 84px",
            maxWidth: 1000,
          }}
        >
          <div
            style={{
              fontSize: 13,
              letterSpacing: 1.6,
              textTransform: "uppercase",
              color: A.gold,
              marginBottom: 14,
              fontWeight: 600,
            }}
          >
            <Link
              href="/"
              style={{ color: "rgba(255,255,255,0.75)", textDecoration: "none" }}
            >
              Home
            </Link>{" "}
            ·{" "}
            <Link
              href="/courses"
              style={{ color: "rgba(255,255,255,0.75)", textDecoration: "none" }}
            >
              Programs
            </Link>{" "}
            · {course.title}
          </div>
          <h1
            style={{
              fontFamily: A.fontHead,
              fontSize: "clamp(36px, 4.8vw, 56px)",
              fontWeight: 400,
              margin: 0,
              letterSpacing: "-0.025em",
              lineHeight: 1.05,
              maxWidth: 900,
            }}
          >
            {course.title}
          </h1>
          <div
            style={{
              marginTop: 24,
              display: "flex",
              gap: 28,
              fontSize: 15,
              color: "rgba(255,255,255,0.9)",
              flexWrap: "wrap",
            }}
          >
            <span>📅 {course.weeks} weeks · starts {formatShortDate(course.startsOn)}</span>
            <span>📍 {course.location}</span>
            <span>
              👤 Ages {course.ageMin}–{course.ageMax}
            </span>
            {course.certificate && <span>🎓 Certificate on completion</span>}
          </div>
        </div>
      </section>

      <section style={{ padding: "64px 56px 96px", background: "#fff" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 340px",
            gap: 56,
            maxWidth: 1100,
            margin: "0 auto",
            alignItems: "start",
          }}
        >
          <article>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                color: A.muted,
                marginBottom: 10,
              }}
            >
              About the program
            </div>
            <div
              style={{
                fontSize: 16,
                color: A.body,
                lineHeight: 1.75,
              }}
              dangerouslySetInnerHTML={{ __html: course.body }}
            />

            <div style={{ marginTop: 48 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  color: A.muted,
                  marginBottom: 14,
                }}
              >
                Weekly outline
              </div>
              <ol
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  border: `1px solid ${A.rule}`,
                }}
              >
                {course.courseWeeks.map((w, i) => (
                  <li
                    key={w.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "80px 1fr",
                      gap: 20,
                      padding: "18px 24px",
                      borderTop: i > 0 ? `1px solid ${A.rule}` : "none",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: A.fontHead,
                        fontSize: 18,
                        fontWeight: 600,
                        color: A.gold,
                      }}
                    >
                      Week {w.weekNo}
                    </div>
                    <div
                      style={{
                        fontFamily: A.fontHead,
                        fontSize: 16,
                        fontWeight: 500,
                        color: A.navy,
                      }}
                    >
                      {w.title}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </article>

          <aside style={{ position: "sticky", top: 24 }}>
            <div
              style={{
                background: A.navy,
                color: "#fff",
                padding: "28px 28px 32px",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  letterSpacing: 1.6,
                  textTransform: "uppercase",
                  color: A.gold,
                  fontWeight: 700,
                }}
              >
                Enrollment
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontFamily: A.fontHead,
                  fontSize: 30,
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                }}
              >
                Free
              </div>
              <div
                style={{
                  marginTop: 18,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.78)",
                  lineHeight: 1.6,
                }}
              >
                {course.weeks} weeks · {course.cohortCap
                  ? `cohort of ${course.cohortCap}`
                  : "open cohort"}
                <br />
                Starts {formatShortDate(course.startsOn)}
              </div>
              {error && (
                <div
                  style={{
                    marginTop: 16,
                    padding: "10px 12px",
                    background: "rgba(178, 34, 52, 0.18)",
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                    borderRadius: 4,
                    fontSize: 13,
                    color: "#fff",
                    lineHeight: 1.5,
                  }}
                >
                  {error}
                </div>
              )}
              <div style={{ marginTop: 20 }}>
                {enrolled ? (
                  <Link
                    href={`/me/courses/${course.slug}`}
                    style={{
                      display: "block",
                      background: A.gold,
                      color: A.navy,
                      padding: "14px 18px",
                      textAlign: "center",
                      textDecoration: "none",
                      fontFamily: A.fontBody,
                      fontWeight: 700,
                      fontSize: 14,
                      letterSpacing: 0.6,
                      textTransform: "uppercase",
                      borderRadius: 4,
                    }}
                  >
                    Open my course
                  </Link>
                ) : (
                  <form
                    action={`/courses/${course.slug}/enroll`}
                    method="post"
                    style={{ margin: 0 }}
                  >
                    <button
                      type="submit"
                      style={{
                        width: "100%",
                        background: A.gold,
                        color: A.navy,
                        padding: "14px 18px",
                        textAlign: "center",
                        border: "none",
                        fontFamily: A.fontBody,
                        fontWeight: 700,
                        fontSize: 14,
                        letterSpacing: 0.6,
                        textTransform: "uppercase",
                        borderRadius: 4,
                        cursor: "pointer",
                      }}
                    >
                      Enroll
                    </button>
                  </form>
                )}
                {!auth && (
                  <p
                    style={{
                      marginTop: 12,
                      fontSize: 12,
                      color: "rgba(255,255,255,0.7)",
                      lineHeight: 1.5,
                    }}
                  >
                    You&apos;ll be asked to sign in or create a student account
                    first.
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

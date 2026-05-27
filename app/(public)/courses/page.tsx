import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { A } from "@/app/components/tokens";
import { PHOTOS } from "@/app/components/photos";
import { PageHero } from "@/app/components/PageHero";
import { SectionLabel } from "@/app/components/SectionLabel";
import { formatShortDate } from "@/lib/dates";

export const metadata = { title: "Programs · Empower Teens United" };

export default async function CoursesListPage() {
  const courses = await prisma.course.findMany({
    where: { publishedAt: { not: null }, archivedAt: null },
    orderBy: { startsOn: "asc" },
    include: { _count: { select: { enrollments: true } } },
  });

  return (
    <>
      <PageHero
        breadcrumb="Home · Programs"
        title="Programs"
        subtitle="Cohort-based programs combining mentorship, leadership, and personal growth — all free for Orlando-area teens."
        image={PHOTOS.heroLibrary}
      />

      <section style={{ padding: "64px 56px 96px", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 32 }}>
            <SectionLabel>Active programs</SectionLabel>
            <h2
              style={{
                fontFamily: A.fontHead,
                fontSize: 36,
                fontWeight: 400,
                color: A.navy,
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Find your fit
            </h2>
          </div>

          {courses.length === 0 ? (
            <p style={{ color: A.muted, fontSize: 15 }}>
              No active programs right now. Check back soon.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 24,
              }}
            >
              {courses.map((c) => (
                <Link
                  key={c.id}
                  href={`/courses/${c.slug}`}
                  style={{
                    display: "block",
                    background: "#fff",
                    border: `1px solid ${A.rule}`,
                    textDecoration: "none",
                    color: "inherit",
                    overflow: "hidden",
                  }}
                >
                  {c.coverImageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.coverImageUrl}
                      alt=""
                      style={{
                        width: "100%",
                        height: 160,
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  )}
                  <div style={{ padding: 24 }}>
                    <div
                      style={{
                        display: "inline-flex",
                        gap: 8,
                        marginBottom: 12,
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: 1.2,
                        textTransform: "uppercase",
                        color: A.gold,
                      }}
                    >
                      <span>{c.weeks} weeks</span>
                      <span style={{ color: A.muted }}>·</span>
                      <span style={{ color: A.muted }}>
                        Starts {formatShortDate(c.startsOn)}
                      </span>
                    </div>
                    <h3
                      style={{
                        margin: 0,
                        fontFamily: A.fontHead,
                        fontSize: 20,
                        fontWeight: 500,
                        color: A.navy,
                        lineHeight: 1.3,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {c.title}
                    </h3>
                    <p
                      style={{
                        margin: "10px 0 0",
                        fontSize: 13,
                        color: A.muted,
                        lineHeight: 1.55,
                      }}
                    >
                      Ages {c.ageMin}–{c.ageMax} · {c.location}
                    </p>
                    <div
                      style={{
                        marginTop: 18,
                        paddingTop: 14,
                        borderTop: `1px solid ${A.rule}`,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          color: "#1f8a5b",
                          fontWeight: 700,
                          letterSpacing: 0.5,
                        }}
                      >
                        Free
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          letterSpacing: 1.2,
                          textTransform: "uppercase",
                          color: A.navy,
                        }}
                      >
                        Explore &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { A } from "@/app/components/tokens";
import { PHOTOS } from "@/app/components/photos";
import { PageHero } from "@/app/components/PageHero";
import { SectionLabel } from "@/app/components/SectionLabel";
import { formatShortDate } from "@/lib/dates";

export const metadata = { title: "Blog · Empower Teens United" };

export default async function BlogIndex() {
  const posts = await prisma.blogPost.findMany({
    where: { publishedAt: { not: null }, archivedAt: null },
    orderBy: { publishedAt: "desc" },
    include: { author: true },
  });

  return (
    <>
      <PageHero
        breadcrumb="Home · Blog"
        title="Stories from ETU"
        subtitle="Field notes, founder reflections, and dispatches from our cohorts and families."
        image={PHOTOS.heroLibrary}
      />

      <section style={{ padding: "64px 56px 96px", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 32 }}>
            <SectionLabel>Latest</SectionLabel>
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
              From the team
            </h2>
          </div>

          {posts.length === 0 ? (
            <p style={{ color: A.muted, fontSize: 15 }}>
              No posts yet. Check back soon.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 28,
              }}
            >
              {posts.map((p) => (
                <Link
                  key={p.id}
                  href={`/blog/${p.slug}`}
                  style={{
                    display: "block",
                    background: "#fff",
                    border: `1px solid ${A.rule}`,
                    padding: 28,
                    textDecoration: "none",
                    color: "inherit",
                    transition: "border-color 160ms ease, transform 160ms ease",
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
                    {p.publishedAt && formatShortDate(p.publishedAt)} ·{" "}
                    {p.author.firstName} {p.author.lastName}
                  </div>
                  <h3
                    style={{
                      fontFamily: A.fontHead,
                      fontSize: 22,
                      fontWeight: 500,
                      color: A.navy,
                      margin: "14px 0 10px",
                      lineHeight: 1.3,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {p.title}
                  </h3>
                  {p.excerpt && (
                    <p
                      style={{
                        fontSize: 14.5,
                        color: A.body,
                        lineHeight: 1.65,
                        margin: 0,
                      }}
                    >
                      {p.excerpt}
                    </p>
                  )}
                  <div
                    style={{
                      marginTop: 18,
                      paddingTop: 14,
                      borderTop: `1px solid ${A.rule}`,
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: 1.2,
                      textTransform: "uppercase",
                      color: A.navy,
                    }}
                  >
                    Read article &rarr;
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

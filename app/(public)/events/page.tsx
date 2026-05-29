import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { A } from "@/app/components/tokens";
import { PHOTOS } from "@/app/components/photos";
import { PageHero } from "@/app/components/PageHero";
import { SectionLabel } from "@/app/components/SectionLabel";
import {
  dayNum,
  monthAbbreviation,
  formatEventDateTime,
} from "@/lib/dates";

export const metadata = { title: "Events · Empower Teens United" };

export default async function EventsListPage() {
  const events = await prisma.event.findMany({
    where: {
      publishedAt: { not: null },
      archivedAt: null,
      startsAt: { gte: new Date() },
    },
    orderBy: { startsAt: "asc" },
  });

  return (
    <>
      <PageHero
        breadcrumb="Home · Events"
        title="Events & gatherings"
        subtitle="Cohort kickoffs, college visits, community service days, and the workshops that bring our families together."
        image={PHOTOS.heroLibrary}
      />

      <section className="etu-px" style={{ padding: "64px 56px 96px", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 32 }}>
            <SectionLabel>Upcoming</SectionLabel>
            <h2
              className="etu-h2"
              style={{
                fontFamily: A.fontHead,
                fontSize: 36,
                fontWeight: 400,
                color: A.navy,
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              What&apos;s next
            </h2>
          </div>

          {events.length === 0 ? (
            <p style={{ color: A.muted, fontSize: 15 }}>
              No upcoming events. Check back soon.
            </p>
          ) : (
            <div
              className="etu-collapse"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 24,
              }}
            >
              {events.map((e) => (
                <Link
                  key={e.id}
                  href={`/events/${e.slug}`}
                  style={{
                    display: "block",
                    background: "#fff",
                    border: `1px solid ${A.rule}`,
                    padding: 24,
                    textDecoration: "none",
                    color: "inherit",
                    transition: "border-color 160ms ease, transform 160ms ease",
                  }}
                >
                  <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                    <div
                      style={{
                        background: A.gold,
                        padding: "10px 14px",
                        textAlign: "center",
                        minWidth: 64,
                        borderLeft: `3px solid ${A.navy}`,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: A.fontHead,
                          fontSize: 26,
                          fontWeight: 600,
                          color: A.navy,
                          lineHeight: 1,
                        }}
                      >
                        {dayNum(e.startsAt)}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: A.navy,
                          letterSpacing: 1.4,
                          textTransform: "uppercase",
                          marginTop: 4,
                        }}
                      >
                        {monthAbbreviation(e.startsAt)}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          margin: 0,
                          fontFamily: A.fontHead,
                          fontSize: 18,
                          fontWeight: 500,
                          color: A.navy,
                          lineHeight: 1.3,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {e.title}
                      </h3>
                      <p
                        style={{
                          margin: "8px 0 0",
                          fontSize: 13,
                          color: A.muted,
                          lineHeight: 1.5,
                        }}
                      >
                        {formatEventDateTime(e.startsAt)}
                      </p>
                      <p
                        style={{
                          margin: "4px 0 0",
                          fontSize: 13,
                          color: A.muted,
                        }}
                      >
                        {e.location}
                      </p>
                    </div>
                  </div>
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
                    Details &rarr;
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

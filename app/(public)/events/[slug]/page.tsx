import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { A } from "@/app/components/tokens";
import { PHOTOS } from "@/app/components/photos";
import { ConcentricArcs } from "@/app/components/ConcentricArcs";
import { formatEventDateTime } from "@/lib/dates";
import { getOptionalUser } from "@/lib/auth";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug } });
  return { title: event ? `${event.title} · Empower Teens United` : "Event" };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event || !event.publishedAt || event.archivedAt) notFound();

  const auth = await getOptionalUser();
  const alreadyRegistered = auth
    ? await prisma.eventRegistration.findFirst({
        where: {
          eventId: event.id,
          profileId: auth.profile.id,
          status: "registered",
        },
      })
    : null;

  const registeredCount = await prisma.eventRegistration.count({
    where: { eventId: event.id, status: "registered" },
  });
  const seatsLeft =
    event.capacity != null ? Math.max(event.capacity - registeredCount, 0) : null;
  const full = seatsLeft === 0;

  return (
    <>
      <section
        style={{
          position: "relative",
          height: 420,
          overflow: "hidden",
          background: A.navy,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `url(${event.coverImageUrl || PHOTOS.collegeTour}) center/cover`,
            opacity: 0.4,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(15,69,102,0.55) 0%, rgba(15,69,102,0.92) 100%)",
          }}
        />
        <div style={{ position: "absolute", top: 0, right: 0 }}>
          <ConcentricArcs size={300} color="#FCCC00" opacity={0.18} corner="tr" />
        </div>
        <div
          style={{
            position: "relative",
            padding: "64px 56px",
            color: "#fff",
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
              href="/events"
              style={{ color: "rgba(255,255,255,0.75)", textDecoration: "none" }}
            >
              Events
            </Link>{" "}
            · {event.title}
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
            {event.title}
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
            <span>📅 {formatEventDateTime(event.startsAt)}</span>
            <span>📍 {event.location}</span>
            {event.capacity != null && (
              <span>
                👥 {registeredCount} of {event.capacity} registered
              </span>
            )}
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
              About the event
            </div>
            <div
              style={{
                fontSize: 16,
                color: A.body,
                lineHeight: 1.75,
              }}
              dangerouslySetInnerHTML={{ __html: event.body }}
            />
          </article>

          <aside style={{ position: "sticky", top: 24, alignSelf: "start" }}>
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
                Reserve your spot
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
              {event.capacity != null && (
                <>
                  <div
                    style={{
                      marginTop: 16,
                      height: 6,
                      background: "rgba(255,255,255,0.15)",
                      borderRadius: 99,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        background: A.gold,
                        width: `${Math.min((registeredCount / event.capacity) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 13,
                      color: "rgba(255,255,255,0.78)",
                    }}
                  >
                    {seatsLeft === 0
                      ? "All spots taken"
                      : `${seatsLeft} of ${event.capacity} spots left`}
                  </div>
                </>
              )}
              <div style={{ marginTop: 20 }}>
                {alreadyRegistered ? (
                  <div
                    style={{
                      background: "rgba(252,204,0,0.12)",
                      border: `1px solid ${A.gold}`,
                      padding: "14px 16px",
                      borderRadius: 4,
                      fontSize: 14,
                      color: "#fff",
                      lineHeight: 1.5,
                    }}
                  >
                    You&apos;re registered. Check your email for the QR code,
                    or visit{" "}
                    <Link href="/me/events" style={{ color: A.gold, fontWeight: 700 }}>
                      My events
                    </Link>
                    .
                  </div>
                ) : full ? (
                  <div
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      padding: "14px 16px",
                      borderRadius: 4,
                      fontSize: 14,
                      color: "#fff",
                    }}
                  >
                    This event is full.
                  </div>
                ) : (
                  <Link
                    href={`/events/${event.slug}/register`}
                    style={{
                      display: "inline-block",
                      width: "100%",
                      boxSizing: "border-box",
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
                    Register
                  </Link>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

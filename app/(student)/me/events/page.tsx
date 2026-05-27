import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildScanUrl, generateQrDataUrl } from "@/lib/qr";
import { formatEventDateTime } from "@/lib/dates";
import { A } from "@/app/components/tokens";

export const metadata = { title: "My events · Empower Teens United" };

export default async function MyEventsPage() {
  const { profile } = await requireRole("student");

  const regs = await prisma.eventRegistration.findMany({
    where: { profileId: profile.id, status: "registered" },
    include: { event: true, checkin: true },
    orderBy: { event: { startsAt: "asc" } },
  });

  const withQr = await Promise.all(
    regs.map(async (r) => ({
      reg: r,
      qrDataUrl: await generateQrDataUrl(buildScanUrl(r.qrToken)),
    })),
  );

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
          Events
        </div>
        <h1
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
          My events
        </h1>
        <p style={{ marginTop: 10, color: A.muted, fontSize: 15, lineHeight: 1.5 }}>
          Show your QR at the door to check in. The code updates here if anyone
          scans it.
        </p>
      </div>

      {withQr.length === 0 ? (
        <div
          style={{
            background: "#fff",
            border: `1px solid ${A.rule}`,
            borderRadius: 6,
            padding: 32,
            textAlign: "center",
          }}
        >
          <p style={{ color: A.muted, fontSize: 15, margin: 0 }}>
            You haven&apos;t registered for any events yet.
          </p>
          <Link
            href="/events"
            style={{
              display: "inline-block",
              marginTop: 16,
              background: A.navy,
              color: "#fff",
              padding: "12px 18px",
              borderRadius: 4,
              fontFamily: A.fontBody,
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            Browse events
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {withQr.map(({ reg, qrDataUrl }) => (
            <div
              key={reg.id}
              style={{
                background: "#fff",
                border: `1px solid ${A.rule}`,
                borderRadius: 6,
                padding: 24,
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 24,
                alignItems: "center",
                boxShadow: "0 12px 32px -28px rgba(15, 69, 102, 0.2)",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontFamily: A.fontHead,
                    fontSize: 20,
                    fontWeight: 500,
                    color: A.navy,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {reg.event.title}
                </h2>
                <p
                  style={{
                    color: A.muted,
                    fontSize: 13,
                    marginTop: 6,
                    lineHeight: 1.5,
                  }}
                >
                  {formatEventDateTime(reg.event.startsAt)} ·{" "}
                  {reg.event.location}
                </p>
                {reg.guestCount > 0 && (
                  <p
                    style={{
                      color: A.muted,
                      fontSize: 13,
                      marginTop: 4,
                    }}
                  >
                    + {reg.guestCount} guest{reg.guestCount === 1 ? "" : "s"}
                  </p>
                )}
                {reg.checkin ? (
                  <div
                    style={{
                      marginTop: 14,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      background: "rgba(31, 138, 91, 0.1)",
                      border: "1px solid rgba(31, 138, 91, 0.3)",
                      color: "#1f8a5b",
                      padding: "6px 12px",
                      borderRadius: 99,
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                    }}
                  >
                    ✓ Checked in
                  </div>
                ) : (
                  <Link
                    href={`/events/${reg.event.slug}`}
                    style={{
                      display: "inline-block",
                      marginTop: 14,
                      color: A.navy,
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: 1.2,
                      textTransform: "uppercase",
                      textDecoration: "none",
                      borderBottom: `2px solid ${A.gold}`,
                      paddingBottom: 2,
                    }}
                  >
                    Event details →
                  </Link>
                )}
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt="Check-in QR code"
                width={132}
                height={132}
                style={{
                  border: `1px solid ${A.rule}`,
                  borderRadius: 4,
                  background: "#fff",
                  padding: 6,
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

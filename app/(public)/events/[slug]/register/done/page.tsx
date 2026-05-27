import Link from "next/link";
import { A } from "@/app/components/tokens";
import { authStyles as s } from "@/app/(auth)/_styles";

export const metadata = { title: "You're registered" };

export default async function RegisterDonePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <main
      style={{
        background: A.paper,
        minHeight: "calc(100vh - 80px)",
        padding: "96px 24px",
      }}
    >
      <div
        style={{
          maxWidth: 560,
          margin: "0 auto",
          textAlign: "center",
          background: "#fff",
          border: `1px solid ${A.rule}`,
          borderRadius: 6,
          padding: "48px 32px",
          boxShadow: "0 12px 32px -24px rgba(15, 69, 102, 0.2)",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 99,
            background: A.gold,
            margin: "0 auto 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            color: A.navy,
            fontWeight: 700,
          }}
        >
          ✓
        </div>
        <h1 style={{ ...s.heading, textAlign: "center" }}>You&apos;re registered</h1>
        <p style={{ ...s.subheading, textAlign: "center", maxWidth: 420, margin: "12px auto 0" }}>
          We sent a confirmation with your QR code to your email. Show it at the
          door to check in.
        </p>
        <div
          style={{
            marginTop: 28,
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link href={`/events/${slug}`} style={s.ghostButton}>
            Back to event
          </Link>
          <Link href="/events" style={{ ...s.primaryButton, textDecoration: "none" }}>
            See more events
          </Link>
        </div>
      </div>
    </main>
  );
}

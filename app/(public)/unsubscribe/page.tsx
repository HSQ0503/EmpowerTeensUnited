import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { A } from "@/app/components/tokens";

export const metadata = { title: "Unsubscribe · Empower Teens United" };

async function unsubscribeRecipient(token: string) {
  const recipient = await prisma.emailRecipient.findUnique({
    where: { id: token },
  });
  if (!recipient) return { kind: "unknown" as const };

  if (recipient.profileId) {
    await prisma.profile.update({
      where: { id: recipient.profileId },
      data: { emailUnsubscribed: true },
    });
  }
  await prisma.unsubscribedEmail.upsert({
    where: { email: recipient.email },
    create: { email: recipient.email },
    update: {},
  });

  return { kind: "ok" as const, email: recipient.email };
}

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t: token } = await searchParams;

  let state: { kind: "missing" } | { kind: "unknown" } | { kind: "ok"; email: string };
  if (!token) {
    state = { kind: "missing" };
  } else {
    state = await unsubscribeRecipient(token);
  }

  const wrap = {
    maxWidth: 560,
    margin: "120px auto",
    padding: "0 24px",
    textAlign: "center" as const,
    fontFamily: A.fontBody,
  };
  const headingStyle = {
    fontFamily: A.fontHead,
    fontSize: 36,
    fontWeight: 400,
    color: A.navy,
    margin: 0,
    letterSpacing: "-0.02em",
  };
  const bodyStyle = {
    color: A.body,
    fontSize: 16,
    lineHeight: 1.65,
    marginTop: 16,
  };

  if (state.kind === "missing") {
    return (
      <main style={wrap}>
        <h1 style={headingStyle}>Missing unsubscribe token</h1>
        <p style={bodyStyle}>
          This link looks incomplete. Please use the unsubscribe link from one
          of our emails.
        </p>
        <p style={{ marginTop: 24 }}>
          <Link
            href="/"
            style={{ color: A.navy, fontWeight: 600, textDecoration: "none" }}
          >
            Back to home
          </Link>
        </p>
      </main>
    );
  }

  if (state.kind === "unknown") {
    return (
      <main style={wrap}>
        <h1 style={headingStyle}>Unsubscribe link not found</h1>
        <p style={bodyStyle}>
          We couldn&apos;t match this link to a recipient. If you keep getting
          our emails, reply to any of them and we&apos;ll remove you manually.
        </p>
        <p style={{ marginTop: 24 }}>
          <Link
            href="/contact"
            style={{ color: A.navy, fontWeight: 600, textDecoration: "none" }}
          >
            Contact us
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main style={wrap}>
      <h1 style={headingStyle}>You&apos;re unsubscribed</h1>
      <p style={bodyStyle}>
        <strong>{state.email}</strong> won&apos;t receive any more broadcast
        emails from Empower Teens United. Important transactional emails (event
        confirmations, password resets) still work — they keep our programs
        running.
      </p>
      <p style={{ ...bodyStyle, color: A.muted, fontSize: 14 }}>
        Changed your mind? <Link href="/contact" style={{ color: A.navy, fontWeight: 600 }}>Reach out</Link> and we&apos;ll re-subscribe you.
      </p>
    </main>
  );
}

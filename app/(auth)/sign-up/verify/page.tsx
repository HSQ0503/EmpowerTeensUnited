import Link from "next/link";
import { authStyles as s } from "../../_styles";
import { A } from "@/app/components/tokens";

export const metadata = { title: "Verify email · Empower Teens United" };

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 56,
          height: 56,
          borderRadius: 99,
          background: "rgba(252, 204, 0, 0.18)",
          marginBottom: 18,
        }}
        aria-hidden
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={A.navy} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      </div>

      <h1 style={s.heading}>Check your email</h1>
      <p style={s.subheading}>
        We sent a verification link to{" "}
        <strong style={{ color: A.ink, fontWeight: 700 }}>{email ?? "your inbox"}</strong>.
        Click the link to finish setting up your account — then sign in.
      </p>

      <div style={{ ...s.alertInfo, marginTop: 24 }}>
        Didn&apos;t get it? Check spam, or try signing up again with the same email.
      </div>

      <div style={{ ...s.rowBetween, marginTop: 24 }}>
        <Link href="/sign-up" style={s.link}>Use a different email</Link>
        <Link href="/sign-in" style={s.link}>Go to sign in</Link>
      </div>
    </>
  );
}

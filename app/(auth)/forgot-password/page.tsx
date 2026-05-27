import Link from "next/link";
import { authStyles as s } from "../_styles";
import { A } from "@/app/components/tokens";
import { forgotPasswordAction } from "./actions";

export const metadata = { title: "Forgot password · Empower Teens United" };

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;

  if (sent) {
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
          If that address is on file, we&apos;ve sent a password reset link. The link expires in
          one hour.
        </p>
        <div style={{ ...s.rowBetween, marginTop: 24 }}>
          <Link href="/sign-in" style={s.link}>Back to sign in</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <h1 style={s.heading}>Reset your password</h1>
      <p style={s.subheading}>
        Enter the email on your account. We&apos;ll send a link to set a new password.
      </p>

      <form action={forgotPasswordAction} style={s.form}>
        <div>
          <label htmlFor="email" style={s.fieldLabel}>Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            style={s.input}
          />
        </div>

        <button type="submit" style={s.primaryButton}>Send reset link</button>

        <div style={s.rowBetween}>
          <Link href="/sign-in" style={s.link}>Back to sign in</Link>
        </div>
      </form>
    </>
  );
}

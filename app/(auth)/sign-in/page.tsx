import Link from "next/link";
import { authStyles as s } from "../_styles";
import { signInAction } from "./actions";

export const metadata = { title: "Sign in · Empower Teens United" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; banned?: string; next?: string; reset?: string }>;
}) {
  const { error, banned, next, reset } = await searchParams;

  return (
    <>
      <h1 style={s.heading}>Welcome back</h1>
      <p style={s.subheading}>
        Sign in to access your dashboard, courses, and mentorship sessions.
      </p>

      {banned && (
        <div style={{ ...s.alertError, marginTop: 20 }}>
          Your account has been suspended. Contact{" "}
          <a href="mailto:info@empowerteensunited.org" style={{ color: "inherit", fontWeight: 700 }}>
            info@empowerteensunited.org
          </a>
          .
        </div>
      )}
      {reset && (
        <div style={{ ...s.alertInfo, marginTop: 20 }}>
          Password updated. Sign in with your new password.
        </div>
      )}
      {error && <div style={{ ...s.alertError, marginTop: 20 }}>{error}</div>}

      <form action={signInAction} style={s.form}>
        <input type="hidden" name="next" value={next ?? ""} />

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

        <div>
          <label htmlFor="password" style={s.fieldLabel}>Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            style={s.input}
          />
        </div>

        <button type="submit" style={s.primaryButton}>Sign in</button>

        <div style={s.rowBetween}>
          <Link href="/forgot-password" style={s.link}>Forgot password?</Link>
          <Link href="/sign-up" style={s.link}>Create student account</Link>
        </div>
      </form>
    </>
  );
}

import Link from "next/link";
import { authStyles as s } from "../_styles";
import { signUpAction } from "./actions";

export const metadata = { title: "Create account · Empower Teens United" };

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <>
      <h1 style={s.heading}>Create your student account</h1>
      <p style={s.subheading}>
        Free for teens. Join cohorts, enroll in courses, and connect with mentors.
      </p>

      {error && <div style={{ ...s.alertError, marginTop: 20 }}>{error}</div>}

      <form action={signUpAction} style={s.form}>
        <div style={s.fieldRow}>
          <div>
            <label htmlFor="first_name" style={s.fieldLabel}>First name</label>
            <input id="first_name" name="first_name" required autoComplete="given-name" style={s.input} />
          </div>
          <div>
            <label htmlFor="last_name" style={s.fieldLabel}>Last name</label>
            <input id="last_name" name="last_name" required autoComplete="family-name" style={s.input} />
          </div>
        </div>

        <div>
          <label htmlFor="email" style={s.fieldLabel}>Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" style={s.input} />
        </div>

        <div>
          <label htmlFor="password" style={s.fieldLabel}>Password</label>
          <input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" placeholder="At least 8 characters" style={s.input} />
        </div>

        <div style={{ ...s.fieldRow, gridTemplateColumns: "1fr 2fr" }}>
          <div>
            <label htmlFor="grade" style={s.fieldLabel}>Grade</label>
            <select id="grade" name="grade" defaultValue="" style={s.input}>
              <option value="" disabled>—</option>
              {[7, 8, 9, 10, 11, 12].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="school" style={s.fieldLabel}>School</label>
            <input id="school" name="school" style={s.input} placeholder="Optional" />
          </div>
        </div>

        <div>
          <label htmlFor="parent_email" style={s.fieldLabel}>Parent / guardian email</label>
          <input id="parent_email" name="parent_email" type="email" style={s.input} placeholder="Optional" />
        </div>

        <div>
          <label htmlFor="parent_phone" style={s.fieldLabel}>Parent / guardian phone</label>
          <input id="parent_phone" name="parent_phone" type="tel" style={s.input} placeholder="Optional" />
        </div>

        <button type="submit" style={s.primaryButton}>Create account</button>

        <div style={s.rowBetween}>
          <span style={{ fontSize: 13, color: "#6b7785" }}>Already have an account?</span>
          <Link href="/sign-in" style={s.link}>Sign in</Link>
        </div>
      </form>
    </>
  );
}

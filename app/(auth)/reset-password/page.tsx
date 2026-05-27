import { authStyles as s } from "../_styles";
import { resetPasswordAction } from "./actions";

export const metadata = { title: "Set new password · Empower Teens United" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <>
      <h1 style={s.heading}>Set a new password</h1>
      <p style={s.subheading}>
        Choose a password at least 8 characters long. You&apos;ll be signed in after saving.
      </p>

      {error && <div style={{ ...s.alertError, marginTop: 20 }}>{error}</div>}

      <form action={resetPasswordAction} style={s.form}>
        <div>
          <label htmlFor="password" style={s.fieldLabel}>New password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            style={s.input}
          />
        </div>

        <button type="submit" style={s.primaryButton}>Update password</button>
      </form>
    </>
  );
}

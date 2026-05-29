import { requireRole } from "@/lib/auth";
import { A } from "@/app/components/tokens";
import { authStyles as s } from "@/app/(auth)/_styles";
import { updateProfileAction } from "./actions";

export const metadata = { title: "My profile · Empower Teens United" };

export default async function StudentProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { profile } = await requireRole("student");
  const { saved } = await searchParams;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
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
          Account
        </div>
        <h1
          className="etu-h1"
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
          My profile
        </h1>
        <p style={{ marginTop: 10, color: A.muted, fontSize: 15, lineHeight: 1.5 }}>
          Keep your contact info current so your mentor and the program staff can reach you.
        </p>
      </div>

      {saved && (
        <div style={{ ...s.alertInfo, marginBottom: 20 }}>Profile updated.</div>
      )}

      <form
        action={updateProfileAction}
        className="etu-px"
        style={{
          background: "#fff",
          border: `1px solid ${A.rule}`,
          borderRadius: 6,
          padding: 32,
          display: "flex",
          flexDirection: "column",
          gap: 18,
          boxShadow: "0 12px 32px -24px rgba(15, 69, 102, 0.2)",
        }}
      >
        <div className="etu-collapse" style={s.fieldRow}>
          <div>
            <label htmlFor="first_name" style={s.fieldLabel}>First name</label>
            <input
              id="first_name"
              name="first_name"
              defaultValue={profile.firstName}
              required
              autoComplete="given-name"
              style={s.input}
            />
          </div>
          <div>
            <label htmlFor="last_name" style={s.fieldLabel}>Last name</label>
            <input
              id="last_name"
              name="last_name"
              defaultValue={profile.lastName}
              required
              autoComplete="family-name"
              style={s.input}
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" style={s.fieldLabel}>Email</label>
          <input
            id="email"
            value={profile.email}
            disabled
            style={{ ...s.input, ...s.inputDisabled }}
          />
          <p style={{ fontSize: 12, color: A.muted, marginTop: 6 }}>
            Changing your email requires contacting an admin.
          </p>
        </div>

        <div>
          <label htmlFor="phone" style={s.fieldLabel}>Phone</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={profile.phone ?? ""}
            autoComplete="tel"
            style={s.input}
          />
        </div>

        <div className="etu-collapse" style={{ ...s.fieldRow, gridTemplateColumns: "1fr 2fr" }}>
          <div>
            <label htmlFor="grade" style={s.fieldLabel}>Grade</label>
            <select
              id="grade"
              name="grade"
              defaultValue={profile.grade ?? ""}
              style={s.input}
            >
              <option value="">—</option>
              {[7, 8, 9, 10, 11, 12].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="school" style={s.fieldLabel}>School</label>
            <input
              id="school"
              name="school"
              defaultValue={profile.school ?? ""}
              style={s.input}
            />
          </div>
        </div>

        <div className="etu-collapse" style={s.fieldRow}>
          <div>
            <label htmlFor="parent_email" style={s.fieldLabel}>Parent / guardian email</label>
            <input
              id="parent_email"
              name="parent_email"
              type="email"
              defaultValue={profile.parentEmail ?? ""}
              style={s.input}
            />
          </div>
          <div>
            <label htmlFor="parent_phone" style={s.fieldLabel}>Parent / guardian phone</label>
            <input
              id="parent_phone"
              name="parent_phone"
              type="tel"
              defaultValue={profile.parentPhone ?? ""}
              style={s.input}
            />
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          <button type="submit" className="etu-fullw" style={s.primaryButton}>Save changes</button>
        </div>
      </form>
    </div>
  );
}

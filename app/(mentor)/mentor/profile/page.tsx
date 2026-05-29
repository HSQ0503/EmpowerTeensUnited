import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { A } from "@/app/components/tokens";
import { authStyles as s } from "@/app/(auth)/_styles";
import { updateMentorProfileAction } from "./actions";

export const metadata = { title: "My profile · Mentor" };

export default async function MentorProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { profile } = await requireRole("mentor");
  const { saved } = await searchParams;

  const activeStudents = await prisma.mentorAssignment.count({
    where: { mentorId: profile.id, endedAt: null },
  });

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <Link
          href="/mentor"
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: A.muted,
            textDecoration: "none",
          }}
        >
          ← Mentor dashboard
        </Link>
        <h1
          className="etu-h1"
          style={{
            marginTop: 12,
            fontFamily: A.fontHead,
            fontSize: 38,
            fontWeight: 500,
            color: A.navy,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          My profile
        </h1>
        <p
          style={{
            marginTop: 10,
            color: A.muted,
            fontSize: 15,
            lineHeight: 1.5,
          }}
        >
          Your name and bio show up on your student&apos;s dashboard. Keep them
          current.
        </p>
        <div
          style={{
            marginTop: 18,
            display: "inline-flex",
            alignItems: "baseline",
            gap: 8,
            padding: "6px 14px",
            background: "rgba(252, 204, 0, 0.18)",
            border: "1px solid rgba(252, 204, 0, 0.45)",
            borderRadius: 99,
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              color: "#7a5a00",
            }}
          >
            Currently mentoring
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: A.navy }}>
            {activeStudents} student{activeStudents === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {saved && (
        <div style={{ ...s.alertInfo, marginBottom: 20 }}>Profile updated.</div>
      )}

      <form
        action={updateMentorProfileAction}
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
            <label htmlFor="first_name" style={s.fieldLabel}>
              First name
            </label>
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
            <label htmlFor="last_name" style={s.fieldLabel}>
              Last name
            </label>
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
          <label htmlFor="email" style={s.fieldLabel}>
            Email
          </label>
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
          <label htmlFor="phone" style={s.fieldLabel}>
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={profile.phone ?? ""}
            autoComplete="tel"
            style={s.input}
          />
        </div>

        <div>
          <label htmlFor="title" style={s.fieldLabel}>
            Title / role
          </label>
          <input
            id="title"
            name="title"
            defaultValue={profile.title ?? ""}
            placeholder="Volunteer Mentor — Engineering"
            style={s.input}
          />
          <p style={{ fontSize: 12, color: A.muted, marginTop: 6 }}>
            How you want your role displayed to students.
          </p>
        </div>

        <div>
          <label htmlFor="bio" style={s.fieldLabel}>
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={5}
            defaultValue={profile.bio ?? ""}
            placeholder="A few sentences about your background, what you mentor on, and what students can expect."
            style={s.input}
          />
        </div>

        <div style={{ marginTop: 8 }}>
          <button type="submit" className="etu-fullw" style={s.primaryButton}>
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}

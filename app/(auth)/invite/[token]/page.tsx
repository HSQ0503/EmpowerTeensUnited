import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { A } from "@/app/components/tokens";
import { authStyles as s } from "../../_styles";
import { acceptInviteAction } from "./actions";

export const metadata = { title: "Accept invite · Empower Teens United" };

function StatusCard({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: { href: string; label: string };
}) {
  return (
    <>
      <h1 style={s.heading}>{title}</h1>
      <p style={s.subheading}>{body}</p>
      {action && (
        <div style={{ marginTop: 24 }}>
          <Link href={action.href} style={s.link}>{action.label}</Link>
        </div>
      )}
    </>
  );
}

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;

  const invite = await prisma.invitation.findUnique({
    where: { token },
    include: { invitedBy: true },
  });

  if (!invite) {
    return (
      <StatusCard
        title="Invite not found"
        body="The link you opened doesn't match an invitation in our system. Ask whoever invited you to send a fresh one."
        action={{ href: "/", label: "← Back to home" }}
      />
    );
  }
  if (invite.acceptedAt) {
    return (
      <StatusCard
        title="Already accepted"
        body="This invitation has already been used. Sign in with the email it was sent to."
        action={{ href: "/sign-in", label: "Go to sign in" }}
      />
    );
  }
  if (invite.revokedAt) {
    return (
      <StatusCard
        title="Invite revoked"
        body="An admin revoked this invitation. Ask them to send a new one."
        action={{ href: "/", label: "← Back to home" }}
      />
    );
  }
  if (invite.expiresAt < new Date()) {
    return (
      <StatusCard
        title="Invite expired"
        body="Invitations are good for 14 days. Ask an admin to send a fresh one."
        action={{ href: "/", label: "← Back to home" }}
      />
    );
  }

  const inviterName = `${invite.invitedBy.firstName} ${invite.invitedBy.lastName}`.trim();

  return (
    <>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1.4,
          textTransform: "uppercase",
          color: A.gold,
          background: A.navy,
          display: "inline-block",
          padding: "5px 10px",
          borderRadius: 4,
          marginBottom: 14,
        }}
      >
        {invite.role} invite
      </div>

      <h1 style={s.heading}>You&apos;re invited to ETU</h1>
      <p style={s.subheading}>
        {inviterName ? <strong style={{ color: A.ink, fontWeight: 700 }}>{inviterName}</strong> : "An admin"}
        {" "}invited you to join as <strong style={{ color: A.ink, fontWeight: 700 }}>{invite.role}</strong>{" "}
        using <strong style={{ color: A.ink, fontWeight: 700 }}>{invite.email}</strong>. Set a password
        to finish.
      </p>

      {error && <div style={{ ...s.alertError, marginTop: 20 }}>{error}</div>}

      <form action={acceptInviteAction} style={s.form}>
        <input type="hidden" name="token" value={token} />

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
          <label htmlFor="password" style={s.fieldLabel}>Password</label>
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

        <button type="submit" style={s.primaryButton}>Accept and sign in</button>
      </form>
    </>
  );
}

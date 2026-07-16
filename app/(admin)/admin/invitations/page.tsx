import { prisma } from "@/lib/prisma";
import { A } from "@/app/components/tokens";
import { authStyles as s } from "@/app/(auth)/_styles";
import { createInviteAction, revokeInviteAction } from "./actions";

export const metadata = { title: "Invitations · Admin" };

function StatusBadge({ status }: { status: "Pending" | "Accepted" | "Revoked" | "Expired" }) {
  const colors: Record<typeof status, { bg: string; fg: string }> = {
    Pending: { bg: "rgba(252, 204, 0, 0.18)", fg: "#8a6b00" },
    Accepted: { bg: "rgba(31, 138, 91, 0.12)", fg: "#1f8a5b" },
    Revoked: { bg: "rgba(178, 34, 52, 0.10)", fg: "#7a1620" },
    Expired: { bg: "rgba(107, 119, 133, 0.14)", fg: A.muted },
  };
  const c = colors[status];
  return (
    <span
      style={{
        display: "inline-block",
        background: c.bg,
        color: c.fg,
        padding: "4px 10px",
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.6,
        textTransform: "uppercase",
      }}
    >
      {status}
    </span>
  );
}

export default async function InvitationsPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;

  const invites = await prisma.invitation.findMany({
    orderBy: { invitedAt: "desc" },
    include: { invitedBy: true },
  });

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
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
          Team management
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
          Invitations
        </h1>
        <p style={{ marginTop: 10, color: A.muted, fontSize: 15, lineHeight: 1.5 }}>
          Send mentor or admin invites. Each link is valid for 14 days and can be revoked.
        </p>
      </div>

      {sent && (
        <div style={{ ...s.alertInfo, marginBottom: 20 }}>
          Invite sent. The recipient will see it within a minute or two.
        </div>
      )}
      {error && <div style={{ ...s.alertError, marginBottom: 20 }}>{error}</div>}

      <form
        action={createInviteAction}
        className="etu-collapse"
        style={{
          background: "#fff",
          border: `1px solid ${A.rule}`,
          borderRadius: 6,
          padding: 28,
          display: "grid",
          gridTemplateColumns: "2fr 1fr auto",
          gap: 16,
          alignItems: "end",
          boxShadow: "0 12px 32px -24px rgba(15, 69, 102, 0.2)",
        }}
      >
        <div>
          <label htmlFor="invite-email" style={s.fieldLabel}>Email</label>
          <input
            id="invite-email"
            name="email"
            type="email"
            required
            placeholder="mentor@example.com"
            style={s.input}
          />
        </div>
        <div>
          <label htmlFor="invite-role" style={s.fieldLabel}>Role</label>
          <select
            id="invite-role"
            name="role"
            required
            defaultValue="mentor"
            style={s.input}
          >
            <option value="mentor">Mentor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button type="submit" style={s.primaryButton}>
          Send invite
        </button>
      </form>

      <h2
        style={{
          marginTop: 40,
          marginBottom: 16,
          fontFamily: A.fontHead,
          fontSize: 22,
          fontWeight: 500,
          color: A.navy,
          letterSpacing: "-0.01em",
        }}
      >
        All invitations
      </h2>

      <div
        style={{
          background: "#fff",
          border: `1px solid ${A.rule}`,
          borderRadius: 6,
          overflow: "hidden",
          boxShadow: "0 12px 32px -24px rgba(15, 69, 102, 0.18)",
        }}
      >
        <div className="etu-table-wrap">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr
              style={{
                background: A.ruleSoft,
                textAlign: "left",
                color: A.muted,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              <th style={{ padding: "14px 18px" }}>Email</th>
              <th style={{ padding: "14px 18px" }}>Role</th>
              <th style={{ padding: "14px 18px" }}>Invited</th>
              <th style={{ padding: "14px 18px" }}>Status</th>
              <th style={{ padding: "14px 18px" }} />
            </tr>
          </thead>
          <tbody>
            {invites.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{ padding: 32, textAlign: "center", color: A.muted, fontStyle: "italic" }}
                >
                  No invitations yet.
                </td>
              </tr>
            )}
            {invites.map((i) => {
              const status: "Pending" | "Accepted" | "Revoked" | "Expired" = i.acceptedAt
                ? "Accepted"
                : i.revokedAt
                  ? "Revoked"
                  : i.expiresAt < new Date()
                    ? "Expired"
                    : "Pending";
              return (
                <tr className="etu-row-hover" key={i.id} style={{ borderTop: `1px solid ${A.rule}` }}>
                  <td style={{ padding: "14px 18px", color: A.ink, fontWeight: 600 }}>{i.email}</td>
                  <td style={{ padding: "14px 18px", textTransform: "capitalize", color: A.body }}>{i.role}</td>
                  <td style={{ padding: "14px 18px", color: A.muted }}>
                    {i.invitedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td style={{ padding: "14px 18px" }}>
                    <StatusBadge status={status} />
                  </td>
                  <td style={{ padding: "14px 18px", textAlign: "right" }}>
                    {status === "Pending" && (
                      <form action={revokeInviteAction}>
                        <input type="hidden" name="id" value={i.id} />
                        <button
                          type="submit"
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#7a1620",
                            fontFamily: A.fontBody,
                            fontWeight: 700,
                            fontSize: 12,
                            letterSpacing: 0.6,
                            textTransform: "uppercase",
                            cursor: "pointer",
                            padding: 4,
                          }}
                        >
                          Revoke
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

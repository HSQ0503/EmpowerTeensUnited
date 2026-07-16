import { A } from "@/app/components/tokens";

export function SandboxNotice() {
  const from = process.env.RESEND_FROM_EMAIL ?? "";
  if (!from.endsWith("@resend.dev")) return null;

  return (
    <div
      style={{
        background: "rgba(178, 34, 52, 0.06)",
        border: "1px solid rgba(178, 34, 52, 0.35)",
        borderRadius: 6,
        padding: "14px 18px",
        marginBottom: 20,
        fontSize: 13,
        color: A.body,
        lineHeight: 1.6,
      }}
    >
      <strong style={{ color: "#b22234" }}>Test mode.</strong> Email is being
      sent from <code>{from}</code>, Resend&apos;s sandbox address — Resend
      only delivers sandbox mail to the account owner&apos;s inbox, so
      broadcasts to students will not arrive. To go live: verify{" "}
      <code>empowerteensunited.org</code> in the Resend dashboard (add the DNS
      records), then set <code>RESEND_FROM_EMAIL</code> to an address on that
      domain.
    </div>
  );
}

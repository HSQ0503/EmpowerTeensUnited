import type { ReactNode } from "react";
import Link from "next/link";
import { requireRoleOrRedirect } from "@/lib/auth";
import { EtuLockup } from "@/app/components/Logo";
import { A } from "@/app/components/tokens";

export default async function MentorLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireRoleOrRedirect("mentor");

  const navLinks: Array<[string, string]> = [
    ["Students", "/mentor"],
    ["Profile", "/mentor/profile"],
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: A.paper,
        fontFamily: A.fontBody,
        color: A.ink,
      }}
    >
      <header
        style={{
          background: A.navy,
          color: "#fff",
          padding: "16px 32px",
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          alignItems: "center",
          gap: 32,
          borderBottom: `3px solid ${A.gold}`,
        }}
      >
        <Link
          href="/mentor"
          style={{ textDecoration: "none", display: "inline-flex" }}
        >
          <EtuLockup height={42} color="#fff" />
        </Link>

        <nav style={{ display: "flex", gap: 28, justifyContent: "center" }}>
          {navLinks.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              style={{
                color: "#fff",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 14,
                letterSpacing: 0.2,
                paddingBottom: 4,
                borderBottom: "2px solid transparent",
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ textAlign: "right", lineHeight: 1.15 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>
              {profile.firstName} {profile.lastName}
            </div>
            <div
              style={{
                fontSize: 11,
                color: A.gold,
                letterSpacing: 0.6,
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              Mentor
            </div>
          </div>
          <form action="/sign-out" method="post">
            <button
              type="submit"
              style={{
                background: "transparent",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.3)",
                padding: "8px 14px",
                borderRadius: 4,
                fontFamily: A.fontBody,
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: 0.6,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main style={{ padding: "48px 32px 80px" }}>{children}</main>
    </div>
  );
}

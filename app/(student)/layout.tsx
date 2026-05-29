import type { ReactNode } from "react";
import Link from "next/link";
import { requireRoleOrRedirect } from "@/lib/auth";
import { EtuLockup } from "@/app/components/Logo";
import { A } from "@/app/components/tokens";

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireRoleOrRedirect("student");

  const navLinks: Array<[string, string]> = [
    ["Dashboard", "/me"],
    ["Courses", "/courses"],
    ["Events", "/me/events"],
    ["Mentorship", "/me/mentorship"],
    ["Profile", "/me/profile"],
  ];

  return (
    <div style={{ minHeight: "100vh", background: A.paper, fontFamily: A.fontBody, color: A.ink }}>
      <header
        className="etu-appbar"
        style={{
          background: "#fff",
          borderBottom: `1px solid ${A.rule}`,
          padding: "16px 32px",
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          alignItems: "center",
          gap: 32,
        }}
      >
        <Link href="/me" className="etu-appbar-logo" style={{ textDecoration: "none", display: "inline-flex" }}>
          <EtuLockup height={42} color={A.navy} />
        </Link>

        <nav className="etu-appbar-nav" style={{ display: "flex", gap: 28, justifyContent: "center", whiteSpace: "nowrap" }}>
          {navLinks.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              style={{
                color: A.ink,
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

        <div className="etu-appbar-user" style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ textAlign: "right", lineHeight: 1.15 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: A.navy }}>
              {profile.firstName} {profile.lastName}
            </div>
            <div style={{ fontSize: 11, color: A.muted, letterSpacing: 0.6, textTransform: "uppercase" }}>
              Student
            </div>
          </div>
          <form action="/sign-out" method="post">
            <button
              type="submit"
              style={{
                background: "transparent",
                color: A.navy,
                border: `1px solid ${A.rule}`,
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

      <main className="etu-px" style={{ padding: "48px 32px 80px" }}>{children}</main>
    </div>
  );
}

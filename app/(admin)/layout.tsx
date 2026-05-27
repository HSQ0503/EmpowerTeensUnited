import type { ReactNode } from "react";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { EtuLockup } from "@/app/components/Logo";
import { A } from "@/app/components/tokens";

const NAV: Array<[string, string]> = [
  ["Dashboard", "/admin"],
  ["Events", "/admin/events"],
  ["Courses", "/admin/courses"],
  ["Mentorship", "/admin/mentorship"],
  ["Blog", "/admin/blog"],
  ["Contact", "/admin/contact"],
  ["Broadcasts", "/admin/broadcasts"],
  ["Users", "/admin/users"],
  ["Invitations", "/admin/invitations"],
  ["Team", "/admin/team"],
  ["Settings", "/admin/settings"],
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireRole("admin");

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "240px 1fr",
        minHeight: "100vh",
        background: A.paper,
        fontFamily: A.fontBody,
        color: A.ink,
      }}
    >
      <aside
        style={{
          background: A.navyDark,
          color: "#fff",
          padding: "24px 0 16px",
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          alignSelf: "start",
          height: "100vh",
        }}
      >
        <div style={{ padding: "0 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <Link
            href="/admin"
            style={{ textDecoration: "none", display: "inline-flex" }}
          >
            <EtuLockup height={36} color="#fff" />
          </Link>
          <div
            style={{
              marginTop: 14,
              fontSize: 11,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              fontWeight: 700,
              color: A.gold,
            }}
          >
            Admin console
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 13,
              fontWeight: 600,
              color: "#fff",
              lineHeight: 1.3,
            }}
          >
            {profile.firstName} {profile.lastName}
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", padding: "12px 0", flex: 1, overflowY: "auto" }}>
          {NAV.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              style={{
                padding: "10px 20px",
                color: "rgba(255,255,255,0.85)",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 500,
                borderLeft: "3px solid transparent",
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        <form action="/sign-out" method="post" style={{ padding: "12px 20px" }}>
          <button
            type="submit"
            style={{
              width: "100%",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
              padding: "10px 12px",
              borderRadius: 4,
              fontFamily: A.fontBody,
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Sign out
          </button>
        </form>
      </aside>

      <main style={{ padding: "40px 48px 80px" }}>{children}</main>
    </div>
  );
}

"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AdminShell({
  firstName,
  lastName,
  children,
}: {
  firstName: string;
  lastName: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div
      className="etu-admin-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "240px 1fr",
        minHeight: "100vh",
        background: A.paper,
        fontFamily: A.fontBody,
        color: A.ink,
      }}
    >
      {/* Mobile top bar */}
      <div className="etu-admin-topbar">
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          style={{
            background: "transparent",
            border: "1.5px solid rgba(255,255,255,0.25)",
            borderRadius: 6,
            width: 42,
            height: 42,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#fff",
            flexShrink: 0,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <Link href="/admin" style={{ textDecoration: "none", display: "inline-flex" }}>
          <EtuLockup height={30} color="#fff" />
        </Link>
      </div>

      {/* Scrim */}
      <div
        className={`etu-admin-scrim${open ? " is-open" : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      <aside
        className={`etu-admin-aside${open ? " is-open" : ""}`}
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
          overflowY: "auto",
        }}
      >
        <div style={{ padding: "0 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <Link href="/admin" style={{ textDecoration: "none", display: "inline-flex" }}>
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
            <div style={{ marginTop: 4, fontSize: 13, fontWeight: 600, color: "#fff", lineHeight: 1.3 }}>
              {firstName} {lastName}
            </div>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="etu-mobile-only"
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.7)",
              cursor: "pointer",
              padding: 4,
              marginTop: -2,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </svg>
          </button>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", padding: "12px 0", flex: 1, overflowY: "auto" }}>
          {NAV.map(([label, href]) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                style={{
                  padding: "10px 20px",
                  color: active ? "#fff" : "rgba(255,255,255,0.85)",
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: active ? 700 : 500,
                  borderLeft: `3px solid ${active ? A.gold : "transparent"}`,
                  background: active ? "rgba(255,255,255,0.06)" : "transparent",
                }}
              >
                {label}
              </Link>
            );
          })}
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

      <main className="etu-admin-main" style={{ padding: "40px 48px 80px", minWidth: 0 }}>{children}</main>
    </div>
  );
}

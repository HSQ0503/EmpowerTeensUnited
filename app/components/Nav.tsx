"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { A } from "./tokens";
import { EtuLockup } from "./Logo";
import { LangToggle } from "./LangToggle";
import { useLang } from "../i18n/LanguageProvider";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Nav({ dashboardHref }: { dashboardHref?: string | null }) {
  const { t } = useLang();
  const pathname = usePathname();
  const items: Array<[string, string, string]> = [
    ["home", t.nav.home, "/"],
    ["about", t.nav.about, "/about"],
    ["courses", t.nav.courses, "/courses"],
    ["events", t.nav.events, "/events"],
    ["blog", t.nav.blog, "/blog"],
    ["contact", t.nav.contact, "/contact"],
  ];
  const fg = A.ink;
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      style={{ background: "#fff", borderBottom: `1px solid ${A.rule}`, position: "relative", zIndex: 10 }}
    >
      <div
        style={{
          background: A.navyDark,
          color: "#fff",
          padding: "8px 56px",
          fontSize: 12,
          fontFamily: A.fontBody,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 24,
        }}
      >
        <div style={{ display: "flex", gap: 24, opacity: 0.85 }}>
          <span>+1 (407) 413-7384</span>
          <span>info@empowerteensunited.org</span>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center", opacity: 0.95 }}>
          <span style={{ opacity: 0.85 }}>{t.nav.hours}</span>
          <LangToggle dark />
        </div>
      </div>
      <div
        style={{
          padding: "20px 56px",
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          alignItems: "center",
          gap: 32,
          background: "#fff",
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <EtuLockup height={56} color={A.navy} />
        </Link>
        <nav
          style={{
            display: "flex",
            gap: 36,
            justifyContent: "center",
            fontFamily: A.fontBody,
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          {items.map(([key, label, href]) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={key}
                href={href}
                style={{
                  color: active ? A.navy : fg,
                  textDecoration: "none",
                  position: "relative",
                  paddingBottom: 6,
                  letterSpacing: 0.2,
                }}
                className="etu-nav-link"
              >
                <span style={{ position: "relative", display: "inline-block" }}>
                  {label}
                  <motion.span
                    layoutId={active ? "active-underline" : undefined}
                    initial={false}
                    animate={{ scaleX: active ? 1 : 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: -6,
                      height: 2,
                      background: A.gold,
                      transformOrigin: "left center",
                      pointerEvents: "none",
                    }}
                  />
                </span>
              </Link>
            );
          })}
        </nav>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <motion.button
            type="button"
            whileHover={{ scale: 1.08, color: A.navy }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 360, damping: 22 }}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: fg,
              padding: 8,
            }}
            aria-label={t.nav.search}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </motion.button>
          <motion.span style={{ display: "inline-block" }} whileHover={{ y: -2, boxShadow: "0 14px 24px -14px rgba(252,204,0,0.6)" }} whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 360, damping: 22 }}>
            <Link
              href="/contact"
              style={{
                display: "inline-block",
                background: A.gold,
                color: A.navy,
                border: "none",
                padding: "12px 22px",
                borderRadius: 4,
                fontFamily: A.fontBody,
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: 0.4,
                textDecoration: "none",
              }}
            >
              {t.nav.donate}
            </Link>
          </motion.span>
          <motion.span style={{ display: "inline-block" }} whileHover={{ y: -2, background: "rgba(15,69,102,0.05)" }} whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 360, damping: 22 }}>
            <Link
              href={dashboardHref ?? "/sign-in"}
              style={{
                display: "inline-block",
                background: dashboardHref ? A.navy : "transparent",
                color: dashboardHref ? "#fff" : fg,
                border: `1.5px solid ${dashboardHref ? A.navy : A.rule}`,
                padding: "11px 18px",
                borderRadius: 4,
                fontFamily: A.fontBody,
                fontWeight: 600,
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              {dashboardHref ? "Dashboard" : t.nav.signIn}
            </Link>
          </motion.span>
        </div>
      </div>
    </motion.header>
  );
}

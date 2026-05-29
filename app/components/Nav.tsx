"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);
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
        className="etu-px"
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
          <span className="etu-desktop-only">info@empowerteensunited.org</span>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center", opacity: 0.95 }}>
          <span className="etu-desktop-only" style={{ opacity: 0.85 }}>{t.nav.hours}</span>
          <LangToggle dark />
        </div>
      </div>
      <div
        className="etu-px etu-navbar"
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
          className="etu-desktop-only"
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
        <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "flex-end" }}>
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="etu-mobile-only"
            style={{
              background: "transparent",
              border: `1.5px solid ${A.rule}`,
              borderRadius: 6,
              width: 44,
              height: 44,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: A.navy,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? (
                <>
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
          <motion.span className="etu-desktop-only" style={{ display: "inline-block" }} whileHover={{ y: -2, boxShadow: "0 14px 24px -14px rgba(252,204,0,0.6)" }} whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 360, damping: 22 }}>
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
          <motion.span className="etu-desktop-only" style={{ display: "inline-block" }} whileHover={{ y: -2, background: "rgba(15,69,102,0.05)" }} whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 360, damping: 22 }}>
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
              {dashboardHref ? t.nav.dashboard : t.nav.signIn}
            </Link>
          </motion.span>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="etu-mobile-only"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden", background: "#fff", borderTop: `1px solid ${A.rule}` }}
          >
            <nav style={{ display: "flex", flexDirection: "column", padding: "8px 0" }}>
              {items.map(([key, label, href]) => {
                const active = isActive(pathname, href);
                return (
                  <Link
                    key={key}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    style={{
                      padding: "14px 20px",
                      fontSize: 16,
                      fontWeight: 600,
                      color: active ? A.navy : A.ink,
                      textDecoration: "none",
                      borderLeft: `3px solid ${active ? A.gold : "transparent"}`,
                    }}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "12px 20px 20px" }}>
              <Link
                href="/contact"
                onClick={() => setMenuOpen(false)}
                style={{
                  textAlign: "center",
                  background: A.gold,
                  color: A.navy,
                  padding: "14px 22px",
                  borderRadius: 4,
                  fontWeight: 700,
                  fontSize: 15,
                  textDecoration: "none",
                }}
              >
                {t.nav.donate}
              </Link>
              <Link
                href={dashboardHref ?? "/sign-in"}
                onClick={() => setMenuOpen(false)}
                style={{
                  textAlign: "center",
                  background: dashboardHref ? A.navy : "transparent",
                  color: dashboardHref ? "#fff" : A.ink,
                  border: `1.5px solid ${dashboardHref ? A.navy : A.rule}`,
                  padding: "13px 18px",
                  borderRadius: 4,
                  fontWeight: 600,
                  fontSize: 15,
                  textDecoration: "none",
                }}
              >
                {dashboardHref ? t.nav.dashboard : t.nav.signIn}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

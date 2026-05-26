"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { A, PARTNERS } from "./tokens";
import { EtuLockup } from "./Logo";
import { useLang } from "../i18n/LanguageProvider";

export function Footer() {
  const { t } = useLang();

  const cols: Array<{ h: string; l: Array<[string, string]> }> = [
    {
      h: t.footer.programs,
      l: [
        ["Purpose & Leadership", "/courses/purpose-leadership"],
        ["Academic & Career", "/courses"],
        ["Emotional Support", "/courses"],
        ["Life Coaching", "/courses"],
        ["Parent Orientation", "/courses"],
      ],
    },
    {
      h: t.footer.organization,
      l: [
        [t.nav.about, "/about"],
        ["Our Team", "/about"],
        ["News & Blog", "/blog"],
        ["Events Calendar", "/events"],
        ["Press Kit", "/about"],
      ],
    },
    {
      h: t.footer.connect,
      l: [
        [t.nav.contact, "/contact"],
        ["Book a Consultation", "/contact"],
        [t.nav.donate, "/contact"],
        ["Volunteer", "/contact"],
        ["Newsletter signup", "/"],
      ],
    },
  ];

  return (
    <footer style={{ background: A.navy, color: "#fff", fontFamily: A.fontBody }}>
      <div
        style={{
          background: "#fff",
          color: A.navy,
          padding: "40px 56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 32,
          borderBottom: `1px solid ${A.rule}`,
        }}
      >
        <div
          style={{
            fontFamily: A.fontHead,
            fontSize: 18,
            fontWeight: 500,
            fontStyle: "italic",
            color: A.muted,
            maxWidth: 240,
          }}
        >
          {t.footer.partnership}
        </div>
        <div
          style={{
            display: "flex",
            gap: 56,
            alignItems: "center",
            flex: 1,
            justifyContent: "flex-end",
          }}
        >
          {PARTNERS.map((p) => (
            <motion.div
              key={p}
              whileHover={{ y: -2, opacity: 1 }}
              transition={{ type: "spring", stiffness: 360, damping: 22 }}
              style={{
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: 1,
                textTransform: "uppercase",
                opacity: 0.75,
                color: A.navy,
                cursor: "default",
              }}
            >
              {p}
            </motion.div>
          ))}
        </div>
      </div>
      <div
        style={{
          padding: "64px 56px 40px",
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr 1fr 1.2fr",
          gap: 56,
        }}
      >
        <div>
          <EtuLockup height={56} color="#fff" />
          <p
            style={{
              marginTop: 24,
              fontSize: 14,
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.78)",
              maxWidth: 320,
            }}
          >
            {t.footer.tagline}
          </p>
          <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
            {["IG", "in", "FB", "YT"].map((s) => (
              <motion.a
                key={s}
                href="#"
                whileHover={{ y: -3, background: A.gold, color: A.navy, borderColor: A.gold }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: "spring", stiffness: 360, damping: 22 }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 99,
                  border: "1px solid rgba(255,255,255,0.25)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {s}
              </motion.a>
            ))}
          </div>
        </div>
        {cols.map((col) => (
          <div key={col.h}>
            <div
              style={{
                fontFamily: A.fontHead,
                fontSize: 16,
                fontWeight: 600,
                marginBottom: 18,
                color: A.gold,
                letterSpacing: 0.4,
              }}
            >
              {col.h}
            </div>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {col.l.map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    style={{
                      color: "rgba(255,255,255,0.78)",
                      textDecoration: "none",
                      fontSize: 14,
                      transition: "color 200ms ease, padding-left 200ms ease",
                    }}
                    className="etu-footer-link"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div
        style={{
          padding: "20px 56px",
          borderTop: "1px solid rgba(255,255,255,0.12)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 12,
          color: "rgba(255,255,255,0.6)",
        }}
      >
        <div>{t.footer.copy}</div>
        <div style={{ display: "flex", gap: 20 }}>
          <a href="#" style={{ color: "inherit", textDecoration: "none" }}>{t.footer.legal}</a>
          <a href="#" style={{ color: "inherit", textDecoration: "none" }}>{t.footer.privacy}</a>
          <a href="#" style={{ color: "inherit", textDecoration: "none" }}>{t.footer.accessibility}</a>
        </div>
      </div>
    </footer>
  );
}

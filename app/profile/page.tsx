"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { A, aBase } from "../components/tokens";
import { PHOTOS } from "../components/photos";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { ConcentricArcs } from "../components/ConcentricArcs";
import { SectionLabel } from "../components/SectionLabel";
import { Button } from "../components/Button";
import { Reveal } from "../components/motion/Reveal";
import { Stagger, StaggerItem } from "../components/motion/Stagger";
import { useLang } from "../i18n/LanguageProvider";

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

const sidebarIcons = ["⊟", "📚", "📅", "🤝", "📁", "🏆", "⚙"];

const enrolledData = [
  { t: "Purpose & Leadership Development", p: 40, n: "4/10" },
  { t: "Academic & Career Pathways", p: 70, n: "7/10" },
  { t: "One-on-One Mentorship", p: 25, n: "Ongoing" },
];

const upcomingData = [
  { d: "Thu", n: "26", t: "Cohort #5 · Week 4 session", loc: "Windermere Studio · 6:00pm" },
  { d: "Sat", n: "28", t: "Mentor check-in with Evan", loc: "Online · 10:00am" },
  { d: "Sun", n: "15", t: "Rollins College Private Tour", loc: "Winter Park · 11:00am" },
];

const activityData = [
  { i: "✓", c: "#1f8a5b", t: "Completed Week 3 reflection journal", d: "2 days ago" },
  { i: "★", c: A.gold, t: "Earned the \"Active Listener\" badge", d: "5 days ago" },
  { i: "↗", c: A.navy, t: "Submitted application for Summer Internship Program", d: "1 week ago" },
  { i: "◆", c: A.navy, t: "Read article: \"5 questions every teen should ask a mentor\"", d: "2 weeks ago" },
];

export default function Profile() {
  const { t } = useLang();

  return (
    <div style={aBase}>
      <Nav active="profile" />

      <section style={{ background: A.navy, color: "#fff", padding: "48px 56px 56px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, right: 0 }}>
          <ConcentricArcs size={300} color="#FCCC00" opacity={0.15} corner="tr" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easeOutExpo }}
          style={{ position: "relative", display: "flex", alignItems: "center", gap: 28 }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: easeOutExpo, delay: 0.2 }}
            style={{ width: 96, height: 96, borderRadius: 99, background: `url(${PHOTOS.studentSmile2}) center/cover`, border: `3px solid ${A.gold}` }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, letterSpacing: 1.6, textTransform: "uppercase", color: A.gold, marginBottom: 6, fontWeight: 700 }}>{t.profile.cohort}</div>
            <h1 style={{ fontFamily: A.fontHead, fontSize: 38, fontWeight: 400, margin: 0, letterSpacing: "-0.02em" }}>{t.profile.welcome}</h1>
            <div style={{ marginTop: 8, fontSize: 15, color: "rgba(255,255,255,0.85)" }}>{t.profile.profileSub}</div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <motion.button
              type="button"
              whileHover={{ y: -2, background: "rgba(255,255,255,0.08)" }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 360, damping: 22 }}
              style={{ padding: "11px 18px", background: "transparent", color: "#fff", border: "1.5px solid rgba(255,255,255,0.3)", fontWeight: 700, fontSize: 14, fontFamily: A.fontBody, cursor: "pointer", letterSpacing: 0.3 }}
            >
              {t.cta.editProfile}
            </motion.button>
            <Button small href="/courses">{t.cta.browseCourses}</Button>
          </div>
        </motion.div>
      </section>

      <section style={{ padding: "48px 56px 96px", background: A.bg }}>
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 40 }}>
          <Reveal as="aside" direction="right">
            <nav style={{ background: "#fff", border: `1px solid ${A.rule}`, padding: "12px 0" }}>
              {t.profile.sidebar.map((label, i) => {
                const active = i === 0;
                return (
                  <motion.div key={label} whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 360, damping: 24 }}>
                    <Link
                      href="/profile"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "12px 20px",
                        borderLeft: active ? `3px solid ${A.gold}` : "3px solid transparent",
                        background: active ? A.bg : "transparent",
                        color: active ? A.navy : A.body,
                        textDecoration: "none",
                        fontWeight: active ? 700 : 500,
                        fontSize: 14,
                        fontFamily: A.fontBody,
                      }}
                    >
                      <span style={{ fontSize: 14, width: 20, color: active ? A.navy : A.muted }}>{sidebarIcons[i]}</span>
                      {label}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ type: "spring", stiffness: 360, damping: 22 }}
              style={{ marginTop: 20, padding: 24, background: A.navy, color: "#fff" }}
            >
              <div style={{ fontSize: 12, letterSpacing: 1.4, textTransform: "uppercase", fontWeight: 700, color: A.gold, marginBottom: 10 }}>{t.profile.mentor}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 99, background: `url(${PHOTOS.studentMale}) center/cover` }} />
                <div>
                  <div style={{ fontFamily: A.fontHead, fontSize: 15, fontWeight: 600 }}>Evan Quiquia</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Founder &amp; President</div>
                </div>
              </div>
              <a href="#" style={{ display: "block", marginTop: 14, color: A.gold, fontWeight: 700, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", textDecoration: "none" }}>{t.cta.scheduleCheckin} →</a>
            </motion.div>
          </Reveal>

          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <Reveal style={{ background: "#fff", border: `1px solid ${A.rule}`, padding: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 24 }}>
                <div>
                  <SectionLabel>{t.profile.progressLabel}</SectionLabel>
                  <h2 style={{ fontFamily: A.fontHead, fontSize: 24, fontWeight: 500, color: A.navy, margin: 0, letterSpacing: "-0.01em" }}>{t.profile.progressTitle}</h2>
                </div>
                <div style={{ fontSize: 13, color: A.muted }}>{t.profile.nextSession} · <strong style={{ color: A.navy }}>{t.profile.nextSessionDate}</strong></div>
              </div>
              <div style={{ height: 8, background: A.bg, borderRadius: 99, overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "40%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, ease: easeOutExpo, delay: 0.2 }}
                  style={{ height: "100%", background: `linear-gradient(90deg, ${A.navy} 0%, ${A.gold} 100%)` }}
                />
              </div>
              <Stagger staggerChildren={0.04} style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 6 }}>
                {Array.from({ length: 10 }, (_, i) => (
                  <StaggerItem
                    key={i}
                    style={{
                      height: 36,
                      background: i < 4 ? A.navy : i === 4 ? A.gold : "#fff",
                      border: `1px solid ${A.rule}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      color: i < 4 ? "#fff" : i === 4 ? A.navy : A.muted,
                    }}
                  >
                    W{i + 1}
                  </StaggerItem>
                ))}
              </Stagger>
            </Reveal>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <Reveal style={{ background: "#fff", border: `1px solid ${A.rule}`, padding: 28 }}>
                <SectionLabel>{t.profile.enrolledLabel}</SectionLabel>
                <h3 style={{ fontFamily: A.fontHead, fontSize: 20, fontWeight: 500, color: A.navy, margin: 0, marginBottom: 18 }}>{t.profile.enrolledTitle}</h3>
                {enrolledData.map((c) => (
                  <div key={c.t} style={{ paddingTop: 14, paddingBottom: 14, borderBottom: `1px solid ${A.ruleSoft}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <div style={{ fontFamily: A.fontHead, fontSize: 14, fontWeight: 500, color: A.navy }}>{c.t}</div>
                      <div style={{ fontSize: 12, color: A.muted, fontWeight: 700 }}>{c.n}</div>
                    </div>
                    <div style={{ height: 4, background: A.bg, borderRadius: 99, overflow: "hidden" }}>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${c.p}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: easeOutExpo }}
                        style={{ height: "100%", background: A.gold }}
                      />
                    </div>
                  </div>
                ))}
              </Reveal>
              <Reveal direction="left" style={{ background: "#fff", border: `1px solid ${A.rule}`, padding: 28 }}>
                <SectionLabel>{t.profile.upNextLabel}</SectionLabel>
                <h3 style={{ fontFamily: A.fontHead, fontSize: 20, fontWeight: 500, color: A.navy, margin: 0, marginBottom: 18 }}>{t.profile.upNextTitle}</h3>
                {upcomingData.map((e) => (
                  <motion.div
                    key={e.t}
                    whileHover={{ x: 4 }}
                    transition={{ type: "spring", stiffness: 360, damping: 22 }}
                    style={{ display: "grid", gridTemplateColumns: "52px 1fr", gap: 14, padding: "14px 0", borderBottom: `1px solid ${A.ruleSoft}` }}
                  >
                    <div style={{ textAlign: "center", borderLeft: `3px solid ${A.gold}`, paddingLeft: 12 }}>
                      <div style={{ fontFamily: A.fontHead, fontSize: 20, fontWeight: 600, color: A.navy, lineHeight: 1 }}>{e.n}</div>
                      <div style={{ fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase", color: A.muted, fontWeight: 700, marginTop: 2 }}>{e.d}</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: A.fontHead, fontSize: 15, fontWeight: 500, color: A.navy, lineHeight: 1.3 }}>{e.t}</div>
                      <div style={{ fontSize: 12, color: A.muted, marginTop: 3 }}>{e.loc}</div>
                    </div>
                  </motion.div>
                ))}
              </Reveal>
            </div>

            <Reveal style={{ background: "#fff", border: `1px solid ${A.rule}`, padding: 28 }}>
              <SectionLabel>{t.profile.activityLabel}</SectionLabel>
              <h3 style={{ fontFamily: A.fontHead, fontSize: 20, fontWeight: 500, color: A.navy, margin: 0, marginBottom: 18 }}>{t.profile.activityTitle}</h3>
              <Stagger staggerChildren={0.05}>
                {activityData.map((a, i) => (
                  <StaggerItem key={i} style={{ display: "flex", gap: 16, padding: "14px 0", borderBottom: i < activityData.length - 1 ? `1px solid ${A.ruleSoft}` : "none" }}>
                    <div style={{ width: 32, height: 32, borderRadius: 99, background: a.c, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{a.i}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: A.fontHead, fontSize: 15, fontWeight: 500, color: A.navy }}>{a.t}</div>
                      <div style={{ fontSize: 12, color: A.muted, marginTop: 2 }}>{a.d}</div>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
            </Reveal>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

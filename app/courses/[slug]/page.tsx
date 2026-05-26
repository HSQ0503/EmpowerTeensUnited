"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { A, aBase } from "../../components/tokens";
import { PHOTOS } from "../../components/photos";
import { Nav } from "../../components/Nav";
import { Footer } from "../../components/Footer";
import { ConcentricArcs } from "../../components/ConcentricArcs";
import { SectionLabel } from "../../components/SectionLabel";
import { Button } from "../../components/Button";
import { Reveal } from "../../components/motion/Reveal";
import { Stagger, StaggerItem } from "../../components/motion/Stagger";
import { ZoomImage } from "../../components/motion/ZoomImage";
import { useLang } from "../../i18n/LanguageProvider";

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

const weeks = [
  { n: 1, t: "Foundations: Who you are right now", d: "Strengths assessment, story of self, defining \"purpose\"" },
  { n: 2, t: "Goal architecture", d: "SMART goals, 1/3/5-year framework, accountability partner pairings" },
  { n: 3, t: "Identity & influence", d: "Personal brand, digital footprint, how leaders show up online" },
  { n: 4, t: "Communication that connects", d: "Active listening, public speaking lab, conflict de-escalation" },
  { n: 5, t: "Teamwork & followership", d: "Group challenge with mentors, decision-making frameworks" },
  { n: 6, t: "Decision-making under pressure", d: "Case studies, ethical dilemmas, time-boxed exercises" },
  { n: 7, t: "Mentorship & networks", d: "How to ask, give and receive — alumni panel session" },
  { n: 8, t: "Service & leadership in practice", d: "Plan a 4-hr community service project as a cohort" },
  { n: 9, t: "Telling your story", d: "Personal essay & college-prompt writing workshop" },
  { n: 10, t: "Capstone presentations", d: "Each teen presents their leadership thesis to family + mentors" },
];

export default function CourseDetail() {
  const { t } = useLang();

  return (
    <div style={aBase}>
      <Nav active="courses" />

      <section style={{ background: A.navy, color: "#fff", padding: "48px 56px 72px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, right: 0 }}>
          <ConcentricArcs size={300} color="#FCCC00" opacity={0.15} corner="tr" />
        </div>
        <div style={{ position: "relative" }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOutExpo }}
            style={{ fontSize: 13, letterSpacing: 1.6, textTransform: "uppercase", color: A.gold, marginBottom: 14, fontWeight: 600 }}
          >
            <Link href="/" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>{t.courseDetail.crumbHome}</Link> ·{" "}
            <Link href="/courses" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>{t.courseDetail.crumbCourses}</Link> · {t.courseDetail.title}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease: easeOutExpo, delay: 0.1 }}
            style={{ fontFamily: A.fontHead, fontSize: "clamp(34px, 4.4vw, 52px)", fontWeight: 400, margin: 0, maxWidth: 880, lineHeight: 1.08, letterSpacing: "-0.025em" }}
          >
            {t.courseDetail.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeOutExpo, delay: 0.3 }}
            style={{ fontSize: 17, marginTop: 18, maxWidth: 720, color: "rgba(255,255,255,0.82)", lineHeight: 1.6 }}
          >
            {t.courseDetail.intro}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeOutExpo, delay: 0.45 }}
            style={{ display: "flex", gap: 32, marginTop: 28, alignItems: "center", flexWrap: "wrap" }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14 }}>
              <span style={{ color: A.gold }}>★★★★★</span>
              <span style={{ color: "rgba(255,255,255,0.85)" }}>{t.courseDetail.reviews}</span>
            </div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.85)" }}>{t.courseDetail.cadence}</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.85)" }}>{t.courseDetail.by} <strong style={{ color: "#fff" }}>Ivan Quiquia, MBA</strong></div>
          </motion.div>
        </div>
      </section>

      <section style={{ padding: "64px 56px 96px", background: "#fff" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 56, alignItems: "start" }}>
          <div>
            <Reveal>
              <ZoomImage src={PHOTOS.notebook} alt="Course preview" height={400} />
            </Reveal>

            <div style={{ display: "flex", gap: 36, borderBottom: `1px solid ${A.rule}`, marginTop: 36 }}>
              {t.courseDetail.tabs.map((tab, i) => (
                <motion.button
                  key={tab}
                  type="button"
                  whileHover={{ y: -1 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    padding: "14px 0",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: A.fontBody,
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: 0.4,
                    textTransform: "uppercase",
                    color: i === 0 ? A.navy : A.muted,
                    borderBottom: i === 0 ? `3px solid ${A.gold}` : "3px solid transparent",
                    marginBottom: -1,
                  }}
                  className="etu-tab"
                >
                  {tab}
                </motion.button>
              ))}
            </div>

            <Reveal style={{ marginTop: 36 }}>
              <SectionLabel>{t.courseDetail.aboutLabel}</SectionLabel>
              <h2 style={{ fontFamily: A.fontHead, fontSize: 30, fontWeight: 400, color: A.navy, margin: 0, marginBottom: 16, letterSpacing: "-0.02em" }}>
                {t.courseDetail.aboutTitle}
              </h2>
              <p style={{ fontSize: 16, color: A.body, lineHeight: 1.75, margin: 0 }}>
                {t.courseDetail.aboutBody}
              </p>

              <h3 style={{ fontFamily: A.fontHead, fontSize: 22, fontWeight: 500, color: A.navy, marginTop: 40, marginBottom: 16 }}>{t.courseDetail.learn}</h3>
              <Stagger staggerChildren={0.05} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {t.courseDetail.outcomes.map((it) => (
                  <StaggerItem key={it} style={{ display: "flex", gap: 12, alignItems: "start", padding: "12px 0" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={A.gold} strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 2 }}>
                      <circle cx="12" cy="12" r="10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    <span style={{ fontSize: 14, color: A.body, lineHeight: 1.5 }}>{it}</span>
                  </StaggerItem>
                ))}
              </Stagger>

              <h3 style={{ fontFamily: A.fontHead, fontSize: 22, fontWeight: 500, color: A.navy, marginTop: 48, marginBottom: 8 }}>{t.courseDetail.curriculum}</h3>
              <p style={{ fontSize: 14, color: A.muted, marginBottom: 20 }}>{t.courseDetail.curriculumSub}</p>
              <Stagger staggerChildren={0.04} style={{ border: `1px solid ${A.rule}` }}>
                {weeks.map((w, i) => (
                  <StaggerItem key={w.n}>
                    <motion.div
                      whileHover={{ backgroundColor: "rgba(252,204,0,0.06)" }}
                      transition={{ duration: 0.2 }}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "84px 1fr auto",
                        gap: 20,
                        alignItems: "center",
                        padding: "18px 24px",
                        borderTop: i > 0 ? `1px solid ${A.rule}` : "none",
                        background: i === 0 ? A.bg : "#fff",
                      }}
                    >
                      <div style={{ fontFamily: A.fontHead, fontSize: 13, fontWeight: 600, color: A.gold, letterSpacing: 1, textTransform: "uppercase" }}>{t.courses.week} {w.n}</div>
                      <div>
                        <div style={{ fontFamily: A.fontHead, fontSize: 17, fontWeight: 500, color: A.navy }}>{w.t}</div>
                        <div style={{ fontSize: 13, color: A.muted, marginTop: 3 }}>{w.d}</div>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={A.muted} strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                    </motion.div>
                  </StaggerItem>
                ))}
              </Stagger>
            </Reveal>
          </div>

          <Reveal as="aside" direction="left" style={{ position: "sticky", top: 24 }}>
            <div style={{ border: `1px solid ${A.rule}`, background: "#fff" }}>
              <div style={{ background: A.navy, color: "#fff", padding: "24px 28px" }}>
                <div style={{ fontSize: 13, letterSpacing: 1.6, textTransform: "uppercase", color: A.gold, fontWeight: 700, marginBottom: 4 }}>{t.courseDetail.tuition}</div>
                <div style={{ fontFamily: A.fontHead, fontSize: 40, fontWeight: 500, letterSpacing: "-0.03em" }}>{t.courseDetail.free}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", marginTop: 2 }}>{t.courseDetail.funded}</div>
              </div>
              <div style={{ padding: "24px 28px 28px" }}>
                <div style={{ marginBottom: 18 }}>
                  <Button href="/profile">{t.cta.enrollSpring}</Button>
                </div>
                <motion.button
                  type="button"
                  whileHover={{ y: -2, background: A.bg }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 360, damping: 22 }}
                  style={{ width: "100%", background: "#fff", color: A.navy, border: `1.5px solid ${A.rule}`, padding: "14px 18px", fontWeight: 700, letterSpacing: 0.5, fontSize: 14, fontFamily: A.fontBody, cursor: "pointer" }}
                >
                  ♡  {t.cta.saveForLater}
                </motion.button>

                <ul style={{ listStyle: "none", padding: 0, margin: "28px 0 0", display: "flex", flexDirection: "column", gap: 14 }}>
                  {t.courseDetail.facts.map(([k, v]) => (
                    <li key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, paddingBottom: 14, borderBottom: `1px solid ${A.rule}` }}>
                      <span style={{ color: A.muted }}>{k}</span>
                      <strong style={{ color: A.navy }}>{v}</strong>
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ borderTop: `1px solid ${A.rule}`, padding: "20px 28px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: 99, background: `url(${PHOTOS.studentMale2}) center/cover`, border: `2px solid ${A.gold}` }} />
                <div>
                  <div style={{ fontFamily: A.fontHead, fontSize: 15, fontWeight: 600, color: A.navy }}>Ivan Quiquia, MBA</div>
                  <div style={{ fontSize: 12, color: A.muted }}>Chief Empowerment Officer</div>
                </div>
              </div>
            </div>
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ type: "spring", stiffness: 320, damping: 24 }}
              style={{ marginTop: 20, padding: 24, background: A.gold, color: A.navy }}
            >
              <div style={{ fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>{t.courseDetail.needHelp}</div>
              <div style={{ fontFamily: A.fontHead, fontSize: 18, lineHeight: 1.35, marginBottom: 12 }}>{t.courseDetail.needHelpBody}</div>
              <Link href="/contact" style={{ color: A.navy, fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", textDecoration: "none" }}>
                {t.cta.bookCall} →
              </Link>
            </motion.div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}

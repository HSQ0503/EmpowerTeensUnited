"use client";

import { motion } from "motion/react";
import { A, aBase } from "../components/tokens";
import { PHOTOS } from "../components/photos";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { PageHero } from "../components/PageHero";
import { Reveal } from "../components/motion/Reveal";
import { Stagger, StaggerItem } from "../components/motion/Stagger";
import { HoverCard } from "../components/motion/HoverCard";
import { ZoomImage } from "../components/motion/ZoomImage";
import { useLang } from "../i18n/LanguageProvider";

const courses = [
  { t: "One-on-One Mentorship", d: "Personalized guidance from high-achieving students who have navigated advanced classes and academic pathways.", img: PHOTOS.mentoring, cat: "Members", dur: "10 wks", lessons: 1, students: 21, slug: "one-on-one-mentorship" },
  { t: "Personal Development Community Service & Leadership", d: "Teens lead community service projects that strengthen character, responsibility, teamwork and problem-solving.", img: PHOTOS.pumpkin, cat: "Members", dur: "10 wks", lessons: 0, students: 5, slug: "community-service-leadership" },
  { t: "Conversational English Class", d: "Online group English for parents and students — strengthens communication and smooths integration into school and work.", img: PHOTOS.online, cat: "Members", dur: "10 wks", lessons: 0, students: 0, slug: "conversational-english" },
  { t: "Purpose & Leadership Development", d: "Self-discovery, strengths assessment, and mentorship that builds confidence and direction for life after high school.", img: PHOTOS.notebook, cat: "Members", dur: "10 wks", lessons: 3, students: 18, slug: "purpose-leadership" },
  { t: "Academic & Career Pathways", d: "College, vocational and career coaching — scholarship prep through to internships and career exploration.", img: PHOTOS.campus, cat: "Academic & Career", dur: "10 wks", lessons: 4, students: 24, slug: "academic-career" },
  { t: "Emotional, Social & Family Support", d: "Safe spaces to connect with peers and mentors while building emotional intelligence and resilience.", img: PHOTOS.family, cat: "Members", dur: "10 wks", lessons: 2, students: 16, slug: "emotional-support" },
  { t: "Parent Orientation Workshop", d: "Demystifies the U.S. education system — academic planning, dual enrollment, extracurriculars and college prep.", img: PHOTOS.workshop, cat: "Academic & Career", dur: "10 wks", lessons: 3, students: 11, slug: "parent-orientation" },
  { t: "Life Coaching Session", d: "Guided online group life-coaching focused on purpose, communication and emotional intelligence.", img: PHOTOS.classroom, cat: "Members", dur: "10 wks", lessons: 2, students: 9, slug: "life-coaching" },
  { t: "Student Group Education or Career Visit", d: "In-person and online workshops with immersive visits to campuses, hospitals and businesses.", img: PHOTOS.collegeTour, cat: "Academic & Career", dur: "2 hrs", lessons: 1, students: 30, slug: "career-visits" },
];

export default function Courses() {
  const { t } = useLang();

  const filterGroups: Array<{ h: string; items: Array<[string, number]> }> = [
    { h: t.courses.filterGroups.categories, items: [["Academic & Career", 3], ["Members", 6], ["Parent Programs", 2], ["Life Coaching", 1]] },
    { h: t.courses.filterGroups.format, items: [["In-person", 4], ["Online", 5], ["Hybrid", 2]] },
    { h: t.courses.filterGroups.duration, items: [["2 hours", 1], ["4 weeks", 0], ["10 weeks", 8]] },
    { h: t.courses.filterGroups.author, items: [["Ivan Quiquia", 3], ["Admin", 6]] },
  ];

  return (
    <div style={aBase}>
      <Nav active="courses" />
      <PageHero
        breadcrumb={t.courses.breadcrumb}
        title={t.courses.title}
        subtitle={t.courses.subtitle}
        image={PHOTOS.heroLibrary}
      />

      <section style={{ padding: "56px 56px 96px", background: "#fff" }}>
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 56 }}>
          <Reveal as="aside" direction="right">
            <div style={{ border: `1px solid ${A.rule}`, padding: "24px 24px 28px", marginBottom: 24 }}>
              <h3 style={{ fontFamily: A.fontHead, fontSize: 20, fontWeight: 500, color: A.navy, margin: 0, marginBottom: 18, letterSpacing: "-0.01em" }}>{t.courses.searchHeading}</h3>
              <div style={{ position: "relative" }}>
                <input placeholder={t.courses.searchPlaceholder} style={{ width: "100%", padding: "12px 14px 12px 38px", border: `1px solid ${A.rule}`, fontSize: 14, fontFamily: A.fontBody, borderRadius: 2, color: A.ink, boxSizing: "border-box" }} />
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={A.muted} strokeWidth="2" style={{ position: "absolute", left: 14, top: 14 }}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
              </div>
            </div>
            {filterGroups.map((g) => (
              <div key={g.h} style={{ border: `1px solid ${A.rule}`, padding: "20px 24px 24px", marginBottom: 16 }}>
                <h3 style={{ fontFamily: A.fontHead, fontSize: 16, fontWeight: 600, color: A.navy, margin: 0, marginBottom: 14, letterSpacing: 0.3, textTransform: "uppercase" }}>{g.h}</h3>
                {g.items.map(([n, c]) => (
                  <label key={n} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", fontSize: 14, color: A.body, cursor: "pointer" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 14, height: 14, border: `1.5px solid ${A.muted}`, borderRadius: 2, display: "inline-block" }} />
                      {n}
                    </span>
                    <span style={{ color: A.muted, fontSize: 13 }}>{c}</span>
                  </label>
                ))}
              </div>
            ))}
            <motion.button
              type="button"
              whileHover={{ y: -2, boxShadow: "0 16px 28px -16px rgba(15,69,102,0.5)" }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 360, damping: 22 }}
              style={{ width: "100%", background: A.navy, color: "#fff", border: "none", padding: "14px 16px", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", fontFamily: A.fontBody, fontSize: 13, borderRadius: 2, cursor: "pointer" }}
            >
              {t.cta.applyFilters}
            </motion.button>
          </Reveal>

          <div>
            <Reveal style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 20, borderBottom: `1px solid ${A.rule}`, marginBottom: 28 }}>
              <div style={{ fontSize: 14, color: A.muted }}>
                {t.courses.showing} <strong style={{ color: A.navy }}>1–9</strong> {t.courses.of} <strong style={{ color: A.navy }}>9</strong> {t.courses.programsCount}
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ display: "flex", border: `1px solid ${A.rule}` }}>
                  <button type="button" style={{ padding: 9, background: A.navy, color: "#fff", border: "none", cursor: "pointer" }} aria-label="Grid view">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="8" height="8" /><rect x="13" y="3" width="8" height="8" /><rect x="3" y="13" width="8" height="8" /><rect x="13" y="13" width="8" height="8" /></svg>
                  </button>
                  <button type="button" style={{ padding: 9, background: "#fff", color: A.muted, border: "none", cursor: "pointer" }} aria-label="List view">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="18" height="3" /><rect x="3" y="10" width="18" height="3" /><rect x="3" y="16" width="18" height="3" /></svg>
                  </button>
                </div>
                <select defaultValue="new" style={{ padding: "9px 14px", border: `1px solid ${A.rule}`, fontSize: 14, fontFamily: A.fontBody, color: A.ink, background: "#fff" }}>
                  <option value="new">{t.courses.sort.new}</option>
                  <option value="popular">{t.courses.sort.popular}</option>
                  <option value="alpha">{t.courses.sort.alpha}</option>
                </select>
              </div>
            </Reveal>
            <Stagger staggerChildren={0.06} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
              {courses.map((c) => (
                <StaggerItem key={c.t}>
                  <HoverCard href={`/courses/${c.slug}`} style={{ border: `1px solid ${A.rule}`, background: "#fff", display: "flex", flexDirection: "column" }}>
                    <div style={{ position: "relative" }}>
                      <ZoomImage src={c.img} alt={c.t} height={160} />
                      <div style={{ position: "absolute", top: 12, left: 12, background: A.navy, color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "5px 10px" }}>{c.cat}</div>
                    </div>
                    <div style={{ padding: "20px 22px 24px", flex: 1, display: "flex", flexDirection: "column" }}>
                      <div style={{ fontSize: 11, color: A.muted, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 8, display: "flex", gap: 10 }}>
                        <span style={{ color: "#1f8a5b" }}>{t.home.free}</span>
                        <span>·</span>
                        <span>{c.dur}</span>
                        <span>·</span>
                        <span>{t.home.allLevels}</span>
                      </div>
                      <h3 style={{ fontFamily: A.fontHead, fontSize: 18, fontWeight: 500, color: A.navy, margin: 0, marginBottom: 10, lineHeight: 1.3 }}>{c.t}</h3>
                      <p style={{ fontSize: 13.5, lineHeight: 1.6, color: A.body, margin: 0, marginBottom: 16 }}>{c.d.slice(0, 130)}…</p>
                      <div style={{ marginTop: "auto", paddingTop: 16, borderTop: `1px solid ${A.rule}`, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, color: A.muted }}>
                        <span><strong style={{ color: A.navy }}>{c.lessons}</strong> {t.courses.lessons} · <strong style={{ color: A.navy }}>{c.students}</strong> {t.courses.enrolled}</span>
                        <span style={{ color: A.navy, fontWeight: 700, letterSpacing: 0.5 }}>{t.cta.viewArrow} →</span>
                      </div>
                    </div>
                  </HoverCard>
                </StaggerItem>
              ))}
            </Stagger>
            <Reveal style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 48 }}>
              {["‹", "1", "2", "3", "›"].map((p, i) => (
                <motion.button
                  key={i}
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: "spring", stiffness: 360, damping: 22 }}
                  style={{
                    width: 40,
                    height: 40,
                    background: p === "1" ? A.navy : "#fff",
                    color: p === "1" ? "#fff" : A.navy,
                    border: `1px solid ${A.rule}`,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: A.fontBody,
                  }}
                >
                  {p}
                </motion.button>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

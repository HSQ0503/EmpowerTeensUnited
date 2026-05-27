"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { A, aBase } from "@/app/components/tokens";
import { PHOTOS } from "@/app/components/photos";
import { Nav } from "@/app/components/Nav";
import { Footer } from "@/app/components/Footer";
import { ConcentricArcs } from "@/app/components/ConcentricArcs";
import { SectionLabel } from "@/app/components/SectionLabel";
import { Button } from "@/app/components/Button";
import { HomeHero } from "@/app/components/HomeHero";
import { Reveal } from "@/app/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/app/components/motion/Stagger";
import { HoverCard } from "@/app/components/motion/HoverCard";
import { ZoomImage } from "@/app/components/motion/ZoomImage";
import { useLang } from "@/app/i18n/LanguageProvider";

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export default function Home() {
  const { t } = useLang();

  const stats: Array<[string, string]> = [
    ["83", t.home.statsLabels.teens],
    ["25", t.home.statsLabels.mentors],
    ["15", t.home.statsLabels.leadership],
    ["1,188", t.home.statsLabels.hours],
  ];

  const pillars = [
    { t: "Mission", img: PHOTOS.workshop, p: "Inspire and empower teens to discover their purpose, grow as leaders, and thrive academically and personally through mentorship, career exploration, emotional support, and family partnerships." },
    { t: "Vision", img: PHOTOS.panel, p: "A future where every teen — regardless of background — is equipped with confidence, skills and support to pursue meaningful careers, uplift their families, and leave a legacy of leadership." },
    { t: "Purpose", img: PHOTOS.classroom, p: "A supportive ecosystem that nurtures teens' academic growth, emotional well-being and leadership potential — empowering them to design their own paths and contribute positively to society." },
  ];

  const programs = [
    { t: "Purpose & Leadership Development", d: "Self-discovery, leadership cohorts and mentorship that builds confidence and direction.", img: PHOTOS.notebook, dur: "10 weeks", slug: "purpose-leadership" },
    { t: "Academic & Career Pathways", d: "Personalized coaching for college, vocational and career opportunities — including scholarship prep.", img: PHOTOS.online, dur: "10 weeks", slug: "academic-career" },
    { t: "Emotional, Social & Family Support", d: "Safe spaces to build emotional intelligence, resilience and healthy relationships.", img: PHOTOS.family, dur: "10 weeks", slug: "emotional-support" },
    { t: "Student Group Education & Career Visits", d: "Immersive in-person visits to campuses, hospitals and businesses.", img: PHOTOS.campus, dur: "2 hours", slug: "career-visits" },
    { t: "Parent Orientation Workshop", d: "Demystifies the U.S. education system — academic planning, dual enrollment, extracurriculars.", img: PHOTOS.workshop, dur: "10 weeks", slug: "parent-orientation" },
    { t: "Life Coaching Session", d: "Guided group life-coaching focused on purpose, confidence, and emotional intelligence.", img: PHOTOS.mentoring, dur: "10 weeks", slug: "life-coaching" },
  ];

  const newsTiles = [
    { d: "Dec 12, 2025", t: "Student Leaders Capture community impact", img: PHOTOS.classroom },
    { d: "Oct 30, 2025", t: "Student and adult leaders serving together", img: PHOTOS.pumpkin },
  ];

  const upcoming = [
    { d: "7", m: "Feb", t: "Miles To Go · 8th Anniversary & Bag Packing", loc: "Dr Phillips YMCA · 10am–1pm", slug: "miles-to-go" },
    { d: "15", m: "Feb", t: "Rollins College Private Tour", loc: "Rollins Campus · 11am–2pm", slug: "rollins-tour" },
    { d: "22", m: "Feb", t: "Tour of Fire Station 35", loc: "Windermere · 9am–11am", slug: "fire-station-35" },
    { d: "5", m: "Mar", t: "Parent Orientation Workshop (Spring)", loc: "Online · 7pm–8:30pm", slug: "parent-orientation-spring" },
    { d: "12", m: "Mar", t: "Breaking Thru — Mental Health Panel", loc: "Content Studio+ · 6pm", slug: "breaking-thru" },
  ];

  return (
    <div style={aBase}>
      <Nav active="home" />

      <HomeHero />

      <section style={{ background: "#fff", padding: "56px 56px", borderBottom: `1px solid ${A.rule}` }}>
        <Stagger style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 40 }}>
          {stats.map(([n, label]) => (
            <StaggerItem key={label} style={{ borderLeft: `2px solid ${A.gold}`, paddingLeft: 20 }}>
              <div style={{ fontFamily: A.fontHead, fontSize: 52, fontWeight: 500, color: A.navy, lineHeight: 1, letterSpacing: "-0.03em" }}>{n}</div>
              <div style={{ marginTop: 10, fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", color: A.muted, fontWeight: 600 }}>{label}</div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section style={{ padding: "96px 56px", background: A.bg }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 80, alignItems: "center" }}>
          <Reveal>
            <SectionLabel>{t.home.missionLabel}</SectionLabel>
            <h2 style={{ fontFamily: A.fontHead, fontSize: 44, fontWeight: 400, color: A.navy, margin: 0, lineHeight: 1.12, letterSpacing: "-0.02em" }}>
              {t.home.missionTitle1}<br />{t.home.missionTitle2}
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.75, marginTop: 24, color: A.body, maxWidth: 520 }}>
              {t.home.missionBody1}{" "}
              <em style={{ color: A.navy, fontStyle: "italic" }}>{t.home.missionBody2}</em>
            </p>
            <div style={{ marginTop: 28, display: "flex", gap: 14 }}>
              <Button href="/about" primary={false}>{t.cta.readOurStory}</Button>
            </div>
          </Reveal>
          <Reveal direction="left" delay={0.15}>
            <div style={{ position: "relative" }}>
              <ZoomImage src={PHOTOS.groupHands} alt="Teens in a fist-bump circle" height={460} radius={2} />
              <motion.div
                initial={{ opacity: 0, y: 20, x: -20 }}
                whileInView={{ opacity: 1, y: 0, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.8, ease: easeOutExpo, delay: 0.3 }}
                style={{ position: "absolute", bottom: -28, left: -28, width: 240, background: A.gold, padding: "22px 26px", fontFamily: A.fontHead, fontStyle: "italic", color: A.navy, fontSize: 17, lineHeight: 1.4, fontWeight: 500, boxShadow: "0 24px 50px -28px rgba(15,69,102,0.4)" }}
              >
                &ldquo;{t.home.missionPullQuote}&rdquo;
              </motion.div>
            </div>
          </Reveal>
        </div>
      </section>

      <section style={{ padding: "96px 56px", background: "#fff" }}>
        <Reveal style={{ textAlign: "center", marginBottom: 56 }}>
          <SectionLabel>{t.home.pillarsLabel}</SectionLabel>
          <h2 style={{ fontFamily: A.fontHead, fontSize: 44, fontWeight: 400, color: A.navy, margin: 0, letterSpacing: "-0.02em" }}>
            {t.home.pillarsTitle}
          </h2>
        </Reveal>
        <Stagger style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
          {pillars.map((c) => (
            <StaggerItem key={c.t}>
              <HoverCard style={{ background: "#fff", border: `1px solid ${A.rule}` }}>
                <ZoomImage src={c.img} alt={c.t} height={220} />
                <div style={{ padding: "28px 28px 32px" }}>
                  <h3 style={{ fontFamily: A.fontHead, fontSize: 26, fontWeight: 500, color: A.navy, margin: 0, marginBottom: 14 }}>{c.t}</h3>
                  <p style={{ fontSize: 15, lineHeight: 1.7, color: A.body, margin: 0 }}>{c.p}</p>
                </div>
              </HoverCard>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section style={{ padding: "96px 56px", background: A.bg }}>
        <Reveal style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 48 }}>
          <div>
            <SectionLabel>{t.home.programsLabel}</SectionLabel>
            <h2 style={{ fontFamily: A.fontHead, fontSize: 44, fontWeight: 400, color: A.navy, margin: 0, letterSpacing: "-0.02em" }}>
              {t.home.programsTitle1}<br />{t.home.programsTitle2}
            </h2>
          </div>
          <Link href="/courses" className="etu-arrow-link" style={{ color: A.navy, fontWeight: 700, textDecoration: "none", fontSize: 14, letterSpacing: 1, textTransform: "uppercase", borderBottom: `2px solid ${A.gold}`, paddingBottom: 4 }}>
            {t.cta.viewAllCourses} →
          </Link>
        </Reveal>
        <Stagger style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
          {programs.map((c) => (
            <StaggerItem key={c.t}>
              <HoverCard href={`/courses/${c.slug}`} style={{ background: "#fff", display: "flex", flexDirection: "column" }}>
                <ZoomImage src={c.img} alt={c.t} height={180} />
                <div style={{ padding: "24px 26px 28px", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", fontWeight: 700, color: A.muted, marginBottom: 10, display: "flex", gap: 12 }}>
                    <span style={{ color: "#1f8a5b" }}>● {t.home.free}</span>
                    <span>{c.dur}</span>
                    <span>{t.home.allLevels}</span>
                  </div>
                  <h3 style={{ fontFamily: A.fontHead, fontSize: 20, fontWeight: 500, color: A.navy, margin: 0, marginBottom: 10 }}>{c.t}</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.65, color: A.body, margin: 0, marginBottom: 18 }}>{c.d}</p>
                  <span style={{ marginTop: "auto", color: A.navy, fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", borderBottom: `2px solid ${A.gold}`, alignSelf: "flex-start", paddingBottom: 3 }}>
                    {t.cta.learnMore} →
                  </span>
                </div>
              </HoverCard>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section style={{ padding: "96px 56px", background: "#fff" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 64 }}>
          <Reveal>
            <SectionLabel>{t.home.fromFieldLabel}</SectionLabel>
            <h2 style={{ fontFamily: A.fontHead, fontSize: 36, fontWeight: 400, color: A.navy, margin: 0, marginBottom: 32, letterSpacing: "-0.02em" }}>
              {t.home.recentNews}
            </h2>
            <article style={{ marginBottom: 28 }}>
              <ZoomImage src={PHOTOS.collegeTour} alt="UCF Campus Tour" height={280} />
              <div style={{ marginTop: 20, display: "flex", gap: 16, fontSize: 12, color: A.muted, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
                <span>Sep 21, 2025</span>
                <span style={{ color: A.gold }}>·</span>
                <span>Campus tour</span>
              </div>
              <h3 style={{ fontFamily: A.fontHead, fontSize: 26, fontWeight: 500, color: A.navy, margin: "12px 0 12px", lineHeight: 1.25 }}>
                More than 30 students explore future opportunities at UCF
              </h3>
              <p style={{ fontSize: 15, lineHeight: 1.65, color: A.body, margin: 0 }}>
                A full-day campus tour brought our Academic &amp; Career cohort to the University of Central Florida, where students met admissions officers and walked academic spaces firsthand.
              </p>
            </article>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
              {newsTiles.map((a) => (
                <article key={a.t}>
                  <ZoomImage src={a.img} alt={a.t} height={140} />
                  <div style={{ marginTop: 14, fontSize: 12, color: A.muted, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>{a.d}</div>
                  <h4 style={{ fontFamily: A.fontHead, fontSize: 17, fontWeight: 500, color: A.navy, margin: "8px 0 0", lineHeight: 1.35 }}>{a.t}</h4>
                </article>
              ))}
            </div>
          </Reveal>
          <Reveal direction="left" delay={0.1}>
            <SectionLabel>{t.home.whatsNextLabel}</SectionLabel>
            <h2 style={{ fontFamily: A.fontHead, fontSize: 36, fontWeight: 400, color: A.navy, margin: 0, marginBottom: 32, letterSpacing: "-0.02em" }}>
              {t.home.upcomingEvents}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {upcoming.map((e) => (
                <motion.div
                  key={e.t}
                  whileHover={{ x: 6, backgroundColor: "rgba(252,204,0,0.06)" }}
                  transition={{ type: "spring", stiffness: 320, damping: 24 }}
                  style={{ borderBottom: `1px solid ${A.rule}` }}
                >
                  <Link
                    href={`/events/${e.slug}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "64px 1fr auto",
                      gap: 20,
                      alignItems: "center",
                      padding: "22px 12px",
                      textDecoration: "none",
                      color: "inherit",
                    }}
                  >
                    <div style={{ textAlign: "center", borderLeft: `3px solid ${A.gold}`, paddingLeft: 14 }}>
                      <div style={{ fontFamily: A.fontHead, fontSize: 28, fontWeight: 500, color: A.navy, lineHeight: 1 }}>{e.d}</div>
                      <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: A.muted, fontWeight: 700, marginTop: 4 }}>{e.m}</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: A.fontHead, fontSize: 17, fontWeight: 500, color: A.navy, lineHeight: 1.3 }}>{e.t}</div>
                      <div style={{ fontSize: 13, color: A.muted, marginTop: 4 }}>{e.loc}</div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={A.navy} strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
                  </Link>
                </motion.div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section style={{ background: A.navy, color: "#fff", padding: "96px 56px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", bottom: 0, left: 0 }}>
          <ConcentricArcs size={300} color="#FCCC00" opacity={0.15} corner="bl" />
        </div>
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 80, alignItems: "center" }}>
          <Reveal>
            <SectionLabel color={A.gold}>{t.home.joinLabel}</SectionLabel>
            <h2 style={{ fontFamily: A.fontHead, fontSize: 44, fontWeight: 400, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.12 }}>
              {t.home.joinTitle}
            </h2>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.82)", marginTop: 20, maxWidth: 500, lineHeight: 1.65 }}>
              {t.home.joinIntro}
            </p>
          </Reveal>
          <Reveal direction="left" delay={0.15}>
            <form style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <input placeholder={t.home.firstName} style={{ padding: "14px 16px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", color: "#fff", fontFamily: A.fontBody, fontSize: 15, borderRadius: 4 }} />
                <input placeholder={t.home.lastName} style={{ padding: "14px 16px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", color: "#fff", fontFamily: A.fontBody, fontSize: 15, borderRadius: 4 }} />
              </div>
              <input placeholder={t.home.emailAddress} style={{ padding: "14px 16px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", color: "#fff", fontFamily: A.fontBody, fontSize: 15, borderRadius: 4 }} />
              <select defaultValue="teen" style={{ padding: "14px 16px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.85)", fontFamily: A.fontBody, fontSize: 15, borderRadius: 4 }}>
                <option value="teen">{t.home.iAm.teen}</option>
                <option value="parent">{t.home.iAm.parent}</option>
                <option value="educator">{t.home.iAm.educator}</option>
                <option value="donor">{t.home.iAm.donor}</option>
              </select>
              <div style={{ marginTop: 4 }}>
                <Button type="submit">{t.cta.joinMovement}</Button>
              </div>
            </form>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}

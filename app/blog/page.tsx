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

const posts = [
  { t: "Why we put \"purpose\" before \"résumé\"", cat: "Philosophy", d: "Feb 18, 2026", img: PHOTOS.classroom, excerpt: "A 17-year-old with a clear \"why\" outperforms a 17-year-old with a perfect transcript every time. Here's why we hold the line on purpose-first programming." },
  { t: "Field notes: a parent's first orientation", cat: "Programs", d: "Feb 09, 2026", img: PHOTOS.family, excerpt: "What it looks like to demystify dual-enrollment, FAFSA and extracurricular pathways for a family arriving in the U.S. this year." },
  { t: "The senior project that became a foundation", cat: "Our story", d: "Jan 27, 2026", img: PHOTOS.workshop, excerpt: "Founder Evan Quiquia on how a community-service requirement turned into a 6-year nonprofit serving 80+ teens." },
  { t: "5 questions every teen should ask a mentor", cat: "Mentorship", d: "Jan 14, 2026", img: PHOTOS.mentoring, excerpt: "The conversations that actually move the needle aren't about advice — they're about asking better questions." },
  { t: "Building safe spaces for teen mental health", cat: "Wellness", d: "Dec 22, 2025", img: PHOTOS.panel, excerpt: "A look inside Breaking Thru — our March 31 launch event with Orlando Health on the mental-health crisis for the next generation." },
  { t: "What 1,188 volunteer hours bought us", cat: "Impact", d: "Dec 03, 2025", img: PHOTOS.pumpkin, excerpt: "A year-end recap of where our volunteers spent their time — and what changed in our cohorts because of it." },
];

const topics: Array<[string, number]> = [
  ["Programs", 12],
  ["Mentorship", 8],
  ["Wellness", 7],
  ["Our story", 5],
  ["Impact", 4],
  ["Philosophy", 3],
  ["Parents", 6],
];

export default function Blog() {
  const { t } = useLang();
  return (
    <div style={aBase}>
      <Nav active="blog" />
      <PageHero
        breadcrumb={t.blog.breadcrumb}
        title={t.blog.title}
        subtitle={t.blog.subtitle}
        image={PHOTOS.heroLibrary}
      />

      <section style={{ padding: "64px 56px 96px", background: "#fff" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 56 }}>
          <div>
            <Reveal>
              <article style={{ marginBottom: 56 }}>
                <ZoomImage src={PHOTOS.panel} alt="featured" height={420} />
                <div style={{ marginTop: 24, display: "flex", gap: 16, fontSize: 12, color: A.muted, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase" }}>
                  <span style={{ background: A.gold, color: A.navy, padding: "4px 10px" }}>{t.blog.featured}</span>
                  <span>{t.blog.featuredMeta}</span>
                  <span style={{ color: A.gold }}>·</span>
                  <span>{t.blog.featuredKicker}</span>
                </div>
                <h2 style={{ fontFamily: A.fontHead, fontSize: 38, fontWeight: 400, color: A.navy, margin: "20px 0 16px", lineHeight: 1.18, letterSpacing: "-0.02em" }}>
                  {t.blog.featuredTitle}
                </h2>
                <p style={{ fontSize: 17, color: A.body, lineHeight: 1.65, marginBottom: 20, maxWidth: 760 }}>
                  {t.blog.featuredBody}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 99, background: `url(${PHOTOS.studentMale2}) center/cover`, border: `2px solid ${A.gold}` }} />
                  <div>
                    <div style={{ fontFamily: A.fontHead, fontSize: 15, fontWeight: 600, color: A.navy }}>Ivan M. Quiquia</div>
                    <div style={{ fontSize: 12, color: A.muted }}>Chief Empowerment Officer</div>
                  </div>
                  <a href="#" style={{ marginLeft: "auto", color: A.navy, fontWeight: 700, fontSize: 13, letterSpacing: 1, textTransform: "uppercase", textDecoration: "none", borderBottom: `2px solid ${A.gold}`, paddingBottom: 3 }}>{t.cta.readArticle} →</a>
                </div>
              </article>
            </Reveal>

            <Stagger style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36 }}>
              {posts.map((p) => (
                <StaggerItem key={p.t}>
                  <HoverCard lift={4} shadow={false}>
                    <ZoomImage src={p.img} alt={p.t} height={220} />
                    <div style={{ marginTop: 16, display: "flex", gap: 12, fontSize: 11, color: A.muted, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase" }}>
                      <span>{p.cat}</span>
                      <span style={{ color: A.gold }}>·</span>
                      <span>{p.d}</span>
                    </div>
                    <h3 style={{ fontFamily: A.fontHead, fontSize: 22, fontWeight: 500, color: A.navy, margin: "12px 0 10px", lineHeight: 1.3 }}>{p.t}</h3>
                    <p style={{ fontSize: 14.5, color: A.body, lineHeight: 1.65, margin: 0, marginBottom: 14 }}>{p.excerpt}</p>
                    <a href="#" style={{ color: A.navy, fontWeight: 700, fontSize: 12, letterSpacing: 1, textTransform: "uppercase", textDecoration: "none" }}>{t.cta.continueReading} →</a>
                  </HoverCard>
                </StaggerItem>
              ))}
            </Stagger>

            <Reveal style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 56 }}>
              {["‹", "1", "2", "3", "4", "›"].map((p, i) => (
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

          <Reveal as="aside" direction="left">
            <div style={{ border: `1px solid ${A.rule}`, padding: "20px 24px 24px", marginBottom: 24 }}>
              <input placeholder={t.blog.searchPlaceholder} style={{ width: "100%", padding: "12px 14px", border: `1px solid ${A.rule}`, fontSize: 14, fontFamily: A.fontBody, color: A.ink, boxSizing: "border-box" }} />
            </div>
            <div style={{ border: `1px solid ${A.rule}`, padding: "24px 26px 26px", marginBottom: 24 }}>
              <h3 style={{ fontFamily: A.fontHead, fontSize: 17, fontWeight: 600, color: A.navy, margin: 0, marginBottom: 16, letterSpacing: 0.5, textTransform: "uppercase" }}>{t.blog.topicsHeading}</h3>
              {topics.map(([n, c]) => (
                <motion.a
                  key={n}
                  href="#"
                  whileHover={{ x: 4, color: A.navy }}
                  transition={{ type: "spring", stiffness: 360, damping: 24 }}
                  style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${A.ruleSoft}`, fontSize: 14, color: A.body, textDecoration: "none" }}
                >
                  <span>{n}</span>
                  <span style={{ color: A.muted, fontSize: 13 }}>{c}</span>
                </motion.a>
              ))}
            </div>
            <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 360, damping: 22 }} style={{ background: A.gold, padding: "28px 26px" }}>
              <div style={{ fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700, color: A.navy, marginBottom: 12 }}>{t.blog.newsletterLabel}</div>
              <div style={{ fontFamily: A.fontHead, fontSize: 22, fontWeight: 500, color: A.navy, lineHeight: 1.25, marginBottom: 18 }}>{t.blog.newsletterTitle}</div>
              <input placeholder="your@email.com" style={{ width: "100%", padding: "12px 14px", border: `1px solid ${A.navy}`, fontSize: 14, fontFamily: A.fontBody, color: A.navy, background: "#fff", marginBottom: 10, boxSizing: "border-box" }} />
              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 360, damping: 22 }}
                style={{ width: "100%", background: A.navy, color: "#fff", border: "none", padding: "13px 16px", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", fontFamily: A.fontBody, fontSize: 13, cursor: "pointer" }}
              >
                {t.cta.subscribe}
              </motion.button>
            </motion.div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}

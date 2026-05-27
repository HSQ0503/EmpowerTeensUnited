"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { A } from "@/app/components/tokens";
import { PHOTOS } from "@/app/components/photos";
import { PageHero } from "@/app/components/PageHero";
import { SectionLabel } from "@/app/components/SectionLabel";
import { Button } from "@/app/components/Button";
import { Reveal } from "@/app/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/app/components/motion/Stagger";
import { HoverCard } from "@/app/components/motion/HoverCard";
import { ZoomImage } from "@/app/components/motion/ZoomImage";
import { useLang } from "@/app/i18n/LanguageProvider";

type EventInfo = { t: string; tag: "community" | "visit" | "cohort" };

const eventsMap: Record<number, EventInfo> = {
  7: { t: "Miles To Go · 8th Anniversary", tag: "community" },
  15: { t: "Rollins Private Tour", tag: "visit" },
  22: { t: "Fire Station 35 Tour", tag: "visit" },
  27: { t: "Leadership Cohort #5 Begins", tag: "cohort" },
};

type Cell = { d: number; muted: boolean };
const cells: Cell[] = [];
for (let d = 26; d <= 30; d++) cells.push({ d, muted: true });
for (let d = 1; d <= 31; d++) cells.push({ d, muted: false });
while (cells.length < 42) cells.push({ d: cells.length - 30 - 5, muted: true });

const upcoming = [
  { d: "07", m: "Feb", t: "Miles To Go · 8th Anniversary & Bag Packing", loc: "Dr Phillips YMCA · 10am–1pm", img: PHOTOS.collegeTour, tag: "Community", slug: "miles-to-go" },
  { d: "15", m: "Feb", t: "Rollins College Private Tour", loc: "Rollins Campus · 11am–2pm", img: PHOTOS.campus, tag: "Visit", slug: "rollins-tour" },
  { d: "22", m: "Feb", t: "Tour of Fire Station 35", loc: "Windermere · 9am–11am", img: PHOTOS.workshop, tag: "Visit", slug: "fire-station-35" },
];

export default function Events() {
  const { t } = useLang();

  return (
    <>
      <PageHero
        breadcrumb={t.events.breadcrumb}
        title={t.events.title}
        subtitle={t.events.subtitle}
        image={PHOTOS.heroLibrary}
      />

      <section style={{ padding: "64px 56px 96px", background: "#fff" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 56 }}>
          <div>
            <Reveal style={{ display: "flex", justifyContent: "space-between", alignItems: "end", borderBottom: `1px solid ${A.rule}`, marginBottom: 32 }}>
              <div style={{ display: "flex", gap: 32 }}>
                {t.events.tabs.map((tab, i) => (
                  <motion.button
                    key={tab}
                    type="button"
                    whileHover={{ y: -1 }}
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
              <div style={{ display: "flex", gap: 8, alignItems: "center", paddingBottom: 10 }}>
                <button type="button" style={{ padding: "8px 14px", border: `1px solid ${A.rule}`, background: "#fff", cursor: "pointer", fontSize: 13, fontFamily: A.fontBody, fontWeight: 600 }}>{t.cta.today}</button>
                <button type="button" style={{ width: 32, height: 32, border: `1px solid ${A.rule}`, background: "#fff", cursor: "pointer" }} aria-label="Previous">‹</button>
                <button type="button" style={{ width: 32, height: 32, border: `1px solid ${A.rule}`, background: "#fff", cursor: "pointer" }} aria-label="Next">›</button>
              </div>
            </Reveal>

            <Reveal style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
              <h2 style={{ fontFamily: A.fontHead, fontSize: 32, fontWeight: 400, color: A.navy, margin: 0, letterSpacing: "-0.02em" }}>
                {t.events.monthLabel}
              </h2>
              <div style={{ display: "flex", gap: 16, fontSize: 12, fontFamily: A.fontBody, color: A.muted }}>
                {([["cohort", A.navy], ["visit", A.gold], ["community", "#1f8a5b"]] as Array<[string, string]>).map(([n, c]) => (
                  <span key={n} style={{ display: "flex", alignItems: "center", gap: 6, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, background: c }} />{n}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal style={{ border: `1px solid ${A.rule}`, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: `1px solid ${A.rule}`, background: A.bg }}>
                {t.events.days.map((d) => (
                  <div key={d} style={{ padding: "12px 16px", fontFamily: A.fontBody, fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: A.muted }}>{d}</div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gridAutoRows: "110px" }}>
                {cells.map((c, i) => {
                  const ev = !c.muted ? eventsMap[c.d] : undefined;
                  const evColor = ev?.tag === "cohort" ? A.navy : ev?.tag === "visit" ? A.gold : "#1f8a5b";
                  return (
                    <motion.div
                      key={i}
                      whileHover={ev ? { backgroundColor: "rgba(252,204,0,0.08)" } : undefined}
                      transition={{ duration: 0.2 }}
                      style={{
                        borderRight: (i + 1) % 7 !== 0 ? `1px solid ${A.rule}` : "none",
                        borderTop: i >= 7 ? `1px solid ${A.rule}` : "none",
                        padding: 10,
                        position: "relative",
                        background: c.d === 26 && !c.muted ? "#FBF7EB" : "#fff",
                        cursor: ev ? "pointer" : "default",
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600, color: c.muted ? A.muted : A.navy }}>{c.d}</div>
                      {ev && (
                        <div
                          style={{
                            marginTop: 8,
                            padding: "6px 8px",
                            background: ev.tag === "visit" ? evColor : "transparent",
                            borderLeft: ev.tag !== "visit" ? `3px solid ${evColor}` : "none",
                            color: A.navy,
                            fontSize: 12,
                            fontFamily: A.fontBody,
                            fontWeight: 600,
                            lineHeight: 1.3,
                          }}
                        >
                          {ev.t}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </Reveal>
          </div>

          <Reveal as="aside" direction="left">
            <SectionLabel>{t.events.featuredLabel}</SectionLabel>
            <h3 style={{ fontFamily: A.fontHead, fontSize: 22, fontWeight: 500, color: A.navy, margin: 0, marginBottom: 20, letterSpacing: "-0.01em" }}>{t.events.spotlight}</h3>
            <HoverCard href="/events/breaking-thru" style={{ border: `1px solid ${A.rule}`, marginBottom: 24, display: "block" }}>
              <ZoomImage src={PHOTOS.panel} alt="Breaking Thru" height={160} />
              <div style={{ padding: "18px 20px 22px" }}>
                <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: A.gold, fontWeight: 700, marginBottom: 6 }}>{t.events.breakingThruDate}</div>
                <h4 style={{ fontFamily: A.fontHead, fontSize: 18, fontWeight: 500, color: A.navy, margin: 0, marginBottom: 8, lineHeight: 1.3 }}>{t.events.breakingThruTitle}</h4>
                <p style={{ fontSize: 13, color: A.body, margin: 0, lineHeight: 1.55, marginBottom: 14 }}>{t.events.breakingThruBlurb}</p>
                <span style={{ color: A.navy, fontWeight: 700, fontSize: 12, textDecoration: "none", letterSpacing: 1, textTransform: "uppercase", borderBottom: `2px solid ${A.gold}`, paddingBottom: 3 }}>{t.cta.rsvpArrow} →</span>
              </div>
            </HoverCard>

            <SectionLabel>{t.events.popularLabel}</SectionLabel>
            <Stagger staggerChildren={0.06} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {([
                ["One-on-One Mentorship", PHOTOS.mentoring, "one-on-one-mentorship"],
                ["Purpose & Leadership", PHOTOS.notebook, "purpose-leadership"],
                ["Personal Development", PHOTOS.pumpkin, "community-service-leadership"],
              ] as Array<[string, string, string]>).map(([title, img, slug]) => (
                <StaggerItem key={title}>
                  <motion.div whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 360, damping: 24 }}>
                    <Link href={`/courses/${slug}`} style={{ display: "flex", gap: 14, alignItems: "center", textDecoration: "none", color: "inherit" }}>
                      <div style={{ width: 64, height: 64, flexShrink: 0, background: `url(${img}) center/cover` }} />
                      <div>
                        <div style={{ fontFamily: A.fontHead, fontSize: 15, fontWeight: 500, color: A.navy, lineHeight: 1.3 }}>{title}</div>
                        <div style={{ fontSize: 12, color: "#1f8a5b", fontWeight: 700, marginTop: 4 }}>{t.home.free}</div>
                      </div>
                    </Link>
                  </motion.div>
                </StaggerItem>
              ))}
            </Stagger>
          </Reveal>
        </div>

        <div style={{ marginTop: 80 }}>
          <Reveal>
            <SectionLabel>{t.events.next30}</SectionLabel>
            <h2 style={{ fontFamily: A.fontHead, fontSize: 36, fontWeight: 400, color: A.navy, margin: 0, marginBottom: 32, letterSpacing: "-0.02em" }}>{t.events.upcomingEvents}</h2>
          </Reveal>
          <Stagger style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
            {upcoming.map((e) => (
              <StaggerItem key={e.t}>
                <HoverCard href={`/events/${e.slug}`} style={{ border: `1px solid ${A.rule}`, display: "block" }}>
                  <div style={{ position: "relative" }}>
                    <ZoomImage src={e.img} alt={e.t} height={180} />
                    <div style={{ position: "absolute", top: 16, left: 16, background: "#fff", padding: "10px 14px", textAlign: "center", borderLeft: `3px solid ${A.gold}` }}>
                      <div style={{ fontFamily: A.fontHead, fontSize: 24, fontWeight: 600, color: A.navy, lineHeight: 1 }}>{e.d}</div>
                      <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: A.muted, fontWeight: 700, marginTop: 2 }}>{e.m}</div>
                    </div>
                    <div style={{ position: "absolute", top: 16, right: 16, background: A.navy, color: "#fff", padding: "5px 10px", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}>{e.tag}</div>
                  </div>
                  <div style={{ padding: "20px 22px 24px" }}>
                    <h3 style={{ fontFamily: A.fontHead, fontSize: 19, fontWeight: 500, color: A.navy, margin: 0, marginBottom: 8, lineHeight: 1.3 }}>{e.t}</h3>
                    <div style={{ fontSize: 13, color: A.muted, marginBottom: 16 }}>{e.loc}</div>
                    <Button small primary={false} icon={false}>{t.cta.details}</Button>
                  </div>
                </HoverCard>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

    </>
  );
}

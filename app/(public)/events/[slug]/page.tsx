"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { A } from "@/app/components/tokens";
import { PHOTOS } from "@/app/components/photos";
import { ConcentricArcs } from "@/app/components/ConcentricArcs";
import { SectionLabel } from "@/app/components/SectionLabel";
import { Button } from "@/app/components/Button";
import { Reveal } from "@/app/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/app/components/motion/Stagger";
import { useLang } from "@/app/i18n/LanguageProvider";

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

const goingAvatars = [
  PHOTOS.studentSmile,
  PHOTOS.studentMale,
  PHOTOS.studentSmile2,
  PHOTOS.studentMale2,
  PHOTOS.studentSmile,
];

export default function EventDetail() {
  const { t } = useLang();
  const ref = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 500], [0, 80]);

  const schedule: Array<[string, string, string]> = [
    ["11:00am", "Meet & greet at Mills Lawn", "Sign-in, ETU lanyard pickup, mentor introductions."],
    ["11:30am", "Welcome from Admissions", "Q&A with Dean of Undergraduate Admissions."],
    ["12:15pm", "Lunch + current students panel", "In the campus dining hall with three Rollins juniors."],
    ["1:00pm", "Campus walking tour", "Library, residence halls, science labs, performing arts."],
    ["1:45pm", "Reflection circle", "Mentor-led debrief — what surprised you, what excited you."],
  ];

  return (
    <>
      <motion.section ref={ref} style={{ position: "relative", height: 420, overflow: "hidden" }}>
        <motion.div style={{ position: "absolute", inset: -20, background: `url(${PHOTOS.collegeTour}) center/cover`, y: bgY }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(15,69,102,0.55) 0%, rgba(15,69,102,0.88) 100%)" }} />
        <div style={{ position: "absolute", top: 0, right: 0 }}>
          <ConcentricArcs size={300} color="#FCCC00" opacity={0.18} corner="tr" />
        </div>
        <div style={{ position: "relative", padding: "64px 56px", color: "#fff", maxWidth: 1000 }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOutExpo }}
            style={{ fontSize: 13, letterSpacing: 1.6, textTransform: "uppercase", color: A.gold, marginBottom: 14, fontWeight: 600 }}
          >
            <Link href="/" style={{ color: "rgba(255,255,255,0.75)", textDecoration: "none" }}>{t.eventDetail.crumbHome}</Link> ·{" "}
            <Link href="/events" style={{ color: "rgba(255,255,255,0.75)", textDecoration: "none" }}>{t.eventDetail.crumbEvents}</Link> · {t.eventDetail.title}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOutExpo, delay: 0.15 }}
            style={{ display: "inline-flex", gap: 12, marginBottom: 18 }}
          >
            <span style={{ padding: "6px 14px", background: A.gold, color: A.navy, fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{t.eventDetail.tagVisit}</span>
            <span style={{ padding: "6px 14px", background: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{t.eventDetail.tagSeats}</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease: easeOutExpo, delay: 0.2 }}
            style={{ fontFamily: A.fontHead, fontSize: "clamp(36px, 4.8vw, 56px)", fontWeight: 400, margin: 0, letterSpacing: "-0.025em", lineHeight: 1.05, maxWidth: 900 }}
          >
            {t.eventDetail.title}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeOutExpo, delay: 0.4 }}
            style={{ marginTop: 24, display: "flex", gap: 28, fontSize: 15, color: "rgba(255,255,255,0.9)", flexWrap: "wrap" }}
          >
            <span>📅 {t.eventDetail.when}</span>
            <span>📍 {t.eventDetail.where}</span>
            <span>👥 {t.eventDetail.spots}</span>
          </motion.div>
        </div>
      </motion.section>

      <section style={{ padding: "64px 56px 96px", background: "#fff" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 56 }}>
          <div>
            <Reveal>
              <SectionLabel>{t.eventDetail.aboutLabel}</SectionLabel>
              <h2 style={{ fontFamily: A.fontHead, fontSize: 30, fontWeight: 400, color: A.navy, margin: 0, marginBottom: 18, letterSpacing: "-0.02em" }}>
                {t.eventDetail.aboutTitle}
              </h2>
              <p style={{ fontSize: 16, color: A.body, lineHeight: 1.75 }}>
                {t.eventDetail.aboutBody}
              </p>
            </Reveal>

            <Reveal>
              <h3 style={{ fontFamily: A.fontHead, fontSize: 22, fontWeight: 500, color: A.navy, marginTop: 40, marginBottom: 16 }}>{t.eventDetail.schedule}</h3>
            </Reveal>
            <Stagger staggerChildren={0.05} style={{ border: `1px solid ${A.rule}` }}>
              {schedule.map(([tm, h, d], i) => (
                <StaggerItem key={i}>
                  <motion.div
                    whileHover={{ backgroundColor: "rgba(252,204,0,0.06)" }}
                    transition={{ duration: 0.2 }}
                    style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 20, padding: "18px 24px", borderTop: i > 0 ? `1px solid ${A.rule}` : "none" }}
                  >
                    <div style={{ fontFamily: A.fontHead, fontSize: 15, fontWeight: 600, color: A.gold }}>{tm}</div>
                    <div>
                      <div style={{ fontFamily: A.fontHead, fontSize: 16, fontWeight: 500, color: A.navy, marginBottom: 4 }}>{h}</div>
                      <div style={{ fontSize: 14, color: A.body, lineHeight: 1.55 }}>{d}</div>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </Stagger>

            <Reveal>
              <h3 style={{ fontFamily: A.fontHead, fontSize: 22, fontWeight: 500, color: A.navy, marginTop: 40, marginBottom: 16 }}>{t.eventDetail.bring}</h3>
            </Reveal>
            <Stagger staggerChildren={0.05} style={{ paddingLeft: 0, listStyle: "none", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {t.eventDetail.bringList.map((it) => (
                <StaggerItem key={it} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0", fontSize: 14, color: A.body }}>
                  <span style={{ width: 8, height: 8, borderRadius: 99, background: A.gold }} />
                  {it}
                </StaggerItem>
              ))}
            </Stagger>

            <Reveal>
              <h3 style={{ fontFamily: A.fontHead, fontSize: 22, fontWeight: 500, color: A.navy, marginTop: 40, marginBottom: 16 }}>{t.eventDetail.location}</h3>
              <div style={{ height: 280, background: `linear-gradient(135deg, ${A.cream} 0%, #e7dfc8 100%)`, position: "relative", border: `1px solid ${A.rule}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="100%" height="100%" viewBox="0 0 800 280" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
                  <path d="M0,180 Q120,160 240,180 T480,160 T720,200 L800,180 L800,280 L0,280 Z" fill="rgba(15,69,102,0.08)" />
                  <path d="M0,200 Q120,210 280,180 T560,190 T800,170 L800,280 L0,280 Z" fill="rgba(15,69,102,0.12)" />
                  <path d="M0,140 L800,140" stroke="rgba(15,69,102,0.18)" strokeWidth="1.5" strokeDasharray="6 6" />
                  <path d="M280,0 L280,280" stroke="rgba(15,69,102,0.18)" strokeWidth="1.5" strokeDasharray="6 6" />
                </svg>
                <div style={{ position: "relative", textAlign: "center" }}>
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    style={{ width: 44, height: 44, borderRadius: "50% 50% 50% 0", background: A.gold, transform: "rotate(-45deg)", margin: "0 auto", display: "inline-block" }}
                  />
                  <div style={{ marginTop: 16, fontFamily: A.fontHead, fontSize: 17, color: A.navy, fontWeight: 600 }}>1000 Holt Ave, Winter Park, FL 32789</div>
                  <div style={{ fontSize: 13, color: A.muted, marginTop: 4 }}>22 min drive from Windermere</div>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal as="aside" direction="left" style={{ position: "sticky", top: 24 }}>
            <div style={{ background: A.navy, color: "#fff", padding: "28px 28px 32px" }}>
              <div style={{ fontSize: 13, letterSpacing: 1.6, textTransform: "uppercase", color: A.gold, fontWeight: 700 }}>{t.eventDetail.reserveLabel}</div>
              <div style={{ marginTop: 8, fontFamily: A.fontHead, fontSize: 30, fontWeight: 400, letterSpacing: "-0.02em" }}>{t.eventDetail.reservePrice}</div>
              <div style={{ marginTop: 16, height: 6, background: "rgba(255,255,255,0.15)", borderRadius: 99, overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "80%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.4, ease: easeOutExpo, delay: 0.2 }}
                  style={{ height: "100%", background: A.gold }}
                />
              </div>
              <div style={{ marginTop: 8, fontSize: 13, color: "rgba(255,255,255,0.78)" }}>{t.eventDetail.seatsTaken}</div>
              <div style={{ marginTop: 20 }}>
                <Button href="/profile">{t.cta.rsvpNow}</Button>
              </div>
              <motion.button
                type="button"
                whileHover={{ y: -2, background: "rgba(255,255,255,0.08)" }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 360, damping: 22 }}
                style={{ marginTop: 10, width: "100%", background: "transparent", color: "#fff", border: "1.5px solid rgba(255,255,255,0.3)", padding: "14px 18px", fontWeight: 700, letterSpacing: 0.5, fontSize: 14, fontFamily: A.fontBody, cursor: "pointer" }}
              >
                {t.cta.addToCalendar}
              </motion.button>
            </div>
            <div style={{ marginTop: 24, padding: "24px 28px", border: `1px solid ${A.rule}` }}>
              <div style={{ fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700, color: A.muted, marginBottom: 14 }}>{t.eventDetail.hostedBy}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 99, background: `url(${PHOTOS.studentSmile}) center/cover`, border: `2px solid ${A.gold}` }} />
                <div>
                  <div style={{ fontFamily: A.fontHead, fontSize: 15, fontWeight: 600, color: A.navy }}>Nicole Piña Fernandez</div>
                  <div style={{ fontSize: 12, color: A.muted }}>Vice President · Tour lead</div>
                </div>
              </div>
              <div style={{ fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700, color: A.muted, marginBottom: 12, marginTop: 24 }}>{t.eventDetail.going}</div>
              <div style={{ display: "flex", marginBottom: 8 }}>
                {goingAvatars.map((p, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.15, zIndex: 2 }}
                    transition={{ type: "spring", stiffness: 360, damping: 22 }}
                    style={{ width: 36, height: 36, borderRadius: 99, background: `url(${p}) center/cover`, border: "2px solid #fff", marginLeft: i > 0 ? -8 : 0, boxShadow: `0 0 0 1px ${A.rule}`, position: "relative" }}
                  />
                ))}
                <div style={{ width: 36, height: 36, borderRadius: 99, background: A.gold, color: A.navy, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, marginLeft: -8, border: "2px solid #fff" }}>+19</div>
              </div>
              <div style={{ fontSize: 13, color: A.body }}>{t.eventDetail.plusOthers}</div>
            </div>
          </Reveal>
        </div>
      </section>

    </>
  );
}

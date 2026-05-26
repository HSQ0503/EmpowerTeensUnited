"use client";

import { motion } from "motion/react";
import { A, aBase } from "../components/tokens";
import { PHOTOS } from "../components/photos";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { PageHero } from "../components/PageHero";
import { SectionLabel } from "../components/SectionLabel";
import { Button } from "../components/Button";
import { Reveal } from "../components/motion/Reveal";
import { Stagger, StaggerItem } from "../components/motion/Stagger";
import { useLang } from "../i18n/LanguageProvider";

const slots = ["Thu 11:00am", "Thu 2:30pm", "Fri 10:00am", "Fri 1:00pm", "Mon 9:30am", "Mon 4:00pm"];

export default function Contact() {
  const { t } = useLang();

  const cards = [
    { i: "📍", t: t.contact.visit, l1: t.contact.visitL1, l2: t.contact.visitL2 },
    { i: "✉️", t: t.contact.inTouch, l1: "info@empowerteensunited.org", l2: "+1 (407) 413-7384" },
    { i: "🕐", t: t.contact.hours, l1: t.contact.hoursL1, l2: t.contact.hoursL2 },
  ];

  return (
    <div style={aBase}>
      <Nav active="contact" />
      <PageHero
        breadcrumb={t.contact.breadcrumb}
        title={t.contact.title}
        subtitle={t.contact.subtitle}
        image={PHOTOS.heroLibrary}
      />

      <section style={{ padding: "64px 56px", background: "#fff" }}>
        <Stagger style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28, marginBottom: 80 }}>
          {cards.map((c) => (
            <StaggerItem key={c.t}>
              <motion.div
                whileHover={{ y: -6, boxShadow: "0 24px 50px -28px rgba(15,69,102,0.35)" }}
                transition={{ type: "spring", stiffness: 220, damping: 22 }}
                style={{ border: `1px solid ${A.rule}`, padding: "36px 36px 40px", position: "relative", background: "#fff" }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, width: 48, height: 3, background: A.gold }} />
                <div style={{ width: 56, height: 56, background: A.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 20, border: `1px solid ${A.rule}` }}>{c.i}</div>
                <h3 style={{ fontFamily: A.fontHead, fontSize: 22, fontWeight: 500, color: A.navy, margin: 0, marginBottom: 12 }}>{c.t}</h3>
                <div style={{ fontSize: 15, color: A.body, lineHeight: 1.65 }}>{c.l1}</div>
                <div style={{ fontSize: 15, color: A.body, lineHeight: 1.65 }}>{c.l2}</div>
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64 }}>
          <Reveal>
            <SectionLabel>{t.contact.sendLabel}</SectionLabel>
            <h2 style={{ fontFamily: A.fontHead, fontSize: 36, fontWeight: 400, color: A.navy, margin: 0, marginBottom: 12, letterSpacing: "-0.02em" }}>{t.contact.sendTitle}</h2>
            <p style={{ fontSize: 15, color: A.muted, marginBottom: 28 }}>{t.contact.sendIntro}</p>
            <form style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {([[t.contact.firstName, "Maria"], [t.contact.lastName, "Hernandez"]] as Array<[string, string]>).map(([l, p]) => (
                  <label key={l} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <span style={{ fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700, color: A.navy }}>{l}</span>
                    <input placeholder={p} style={{ padding: "13px 14px", border: `1px solid ${A.rule}`, fontSize: 15, fontFamily: A.fontBody, color: A.ink, background: "#fff" }} />
                  </label>
                ))}
              </div>
              {([[t.contact.email, "maria@example.com"], [t.contact.phone, "(407) 555-0124"]] as Array<[string, string]>).map(([l, p]) => (
                <label key={l} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700, color: A.navy }}>{l}</span>
                  <input placeholder={p} style={{ padding: "13px 14px", border: `1px solid ${A.rule}`, fontSize: 15, fontFamily: A.fontBody, color: A.ink, background: "#fff" }} />
                </label>
              ))}
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700, color: A.navy }}>{t.contact.iAm}</span>
                <select defaultValue="parent" style={{ padding: "13px 14px", border: `1px solid ${A.rule}`, fontSize: 15, fontFamily: A.fontBody, color: A.ink, background: "#fff" }}>
                  <option value="parent">{t.contact.iAmOptions.parent}</option>
                  <option value="teen">{t.contact.iAmOptions.teen}</option>
                  <option value="educator">{t.contact.iAmOptions.educator}</option>
                  <option value="donor">{t.contact.iAmOptions.donor}</option>
                </select>
              </label>
              <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700, color: A.navy }}>{t.contact.helpLabel}</span>
                <textarea rows={6} placeholder={t.contact.helpPlaceholder} style={{ padding: "13px 14px", border: `1px solid ${A.rule}`, fontSize: 15, fontFamily: A.fontBody, color: A.ink, background: "#fff", resize: "vertical" }} />
              </label>
              <label style={{ display: "flex", gap: 10, fontSize: 13, color: A.body, alignItems: "start" }}>
                <input type="checkbox" style={{ marginTop: 3 }} />
                <span>{t.contact.subscribeOpt}</span>
              </label>
              <div style={{ marginTop: 8 }}>
                <Button type="submit">{t.cta.sendMessage}</Button>
              </div>
            </form>
          </Reveal>

          <Reveal direction="left" delay={0.1}>
            <SectionLabel>{t.contact.consultationLabel}</SectionLabel>
            <h2 style={{ fontFamily: A.fontHead, fontSize: 36, fontWeight: 400, color: A.navy, margin: 0, marginBottom: 24, letterSpacing: "-0.02em" }}>{t.contact.consultationTitle}</h2>
            <div style={{ background: A.bg, border: `1px solid ${A.rule}`, padding: 32, display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                <div style={{ width: 80, height: 80, borderRadius: 99, background: `url(${PHOTOS.studentMale2}) center/cover`, border: `3px solid ${A.gold}`, flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: A.fontHead, fontSize: 22, fontWeight: 500, color: A.navy }}>{t.contact.consultationName}</div>
                  <div style={{ fontSize: 14, color: A.muted, marginTop: 2 }}>{t.contact.consultationMeta}</div>
                </div>
              </div>
              <p style={{ fontSize: 14.5, color: A.body, lineHeight: 1.65, margin: 0 }}>
                {t.contact.consultationBody}
              </p>
              <div>
                <div style={{ fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700, color: A.navy, marginBottom: 12 }}>{t.contact.availableSlots}</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {slots.map((s, i) => (
                    <motion.button
                      key={s}
                      type="button"
                      whileHover={{ y: -2, scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 360, damping: 22 }}
                      style={{
                        padding: "12px 8px",
                        background: i === 0 ? A.navy : "#fff",
                        color: i === 0 ? "#fff" : A.navy,
                        border: `1px solid ${i === 0 ? A.navy : A.rule}`,
                        fontFamily: A.fontBody,
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
              </div>
              <Button href="/profile">{t.cta.bookConsultation}</Button>
            </div>

            <div style={{ marginTop: 28, height: 220, background: `linear-gradient(135deg, ${A.cream} 0%, #e7dfc8 100%)`, position: "relative", border: `1px solid ${A.rule}` }}>
              <svg width="100%" height="100%" viewBox="0 0 600 220" preserveAspectRatio="none" style={{ position: "absolute", inset: 0 }}>
                <path d="M0,140 L600,140" stroke="rgba(15,69,102,0.2)" strokeWidth="1.5" strokeDasharray="6 6" />
                <path d="M280,0 L280,220" stroke="rgba(15,69,102,0.2)" strokeWidth="1.5" strokeDasharray="6 6" />
                <path d="M0,80 Q200,70 350,90 T600,80" stroke="rgba(15,69,102,0.12)" strokeWidth="20" fill="none" />
              </svg>
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -100%)" }}
              >
                <div style={{ width: 36, height: 36, borderRadius: "50% 50% 50% 0", background: A.gold, transform: "rotate(-45deg)", border: `2px solid ${A.navy}` }} />
              </motion.div>
              <div style={{ position: "absolute", bottom: 16, left: 16, background: "#fff", padding: "12px 16px", fontSize: 13, fontFamily: A.fontBody, color: A.navy, fontWeight: 600 }}>
                6526 Old Brick Rd, Windermere FL
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}

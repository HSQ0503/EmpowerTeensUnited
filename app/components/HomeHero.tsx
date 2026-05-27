"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { A } from "./tokens";
import { PHOTOS } from "./photos";
import { ConcentricArcs } from "./ConcentricArcs";
import { Button } from "./Button";
import { useLang } from "../i18n/LanguageProvider";

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export function HomeHero() {
  const { t } = useLang();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 700], [0, 120]);
  const txtY = useTransform(scrollY, [0, 700], [0, -40]);
  const overlayOpacity = useTransform(scrollY, [0, 500], [1, 0.6]);

  return (
    <section
      ref={ref}
      style={{
        position: "relative",
        height: 680,
        overflow: "hidden",
        background: A.navy,
        isolation: "isolate",
      }}
    >
      <motion.div
        style={{
          position: "absolute",
          inset: -40,
          background: `url(${PHOTOS.heroLibrary}) center/cover`,
          y: bgY,
          scale: 1.06,
        }}
      />
      <motion.div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(10,51,73,0.94) 0%, rgba(15,69,102,0.72) 40%, rgba(15,69,102,0.30) 80%, rgba(15,69,102,0.10) 100%)",
          opacity: overlayOpacity,
        }}
      />
      <div style={{ position: "absolute", top: 0, right: 0, pointerEvents: "none" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.4, ease: easeOutExpo, delay: 0.2 }}
        >
          <ConcentricArcs size={460} color="#FCCC00" opacity={0.28} corner="tr" />
        </motion.div>
      </div>

      <motion.div
        style={{
          position: "relative",
          padding: "150px 56px 90px",
          color: "#fff",
          maxWidth: 980,
          y: txtY,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easeOutExpo }}
          style={{
            fontFamily: A.fontBody,
            fontSize: 12.5,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: A.gold,
            marginBottom: 28,
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.1, ease: easeOutExpo, delay: 0.3 }}
            style={{
              display: "inline-block",
              width: 48,
              height: 1.5,
              background: A.gold,
              transformOrigin: "left center",
            }}
          />
          {t.home.eyebrow}
        </motion.div>

        <h1
          style={{
            fontFamily: A.fontBody,
            fontSize: "clamp(44px, 6.2vw, 78px)",
            lineHeight: 1.05,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            margin: 0,
            color: "#fff",
          }}
        >
          {[t.home.headLine1, t.home.headLine2].map((line, i) => (
            <motion.span
              key={line}
              initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.95, ease: easeOutExpo, delay: 0.25 + i * 0.12 }}
              style={{ display: "block" }}
            >
              {line}
            </motion.span>
          ))}
          <motion.span
            initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: easeOutExpo, delay: 0.55 }}
            style={{ display: "block", marginTop: 6 }}
          >
            <span style={{ color: "#fff", fontWeight: 800 }}>
              {t.home.headLine3prefix}{" "}
            </span>
            <span
              style={{
                color: A.gold,
                fontWeight: 800,
                letterSpacing: "-0.03em",
              }}
            >
              {t.home.headLine3accent}
            </span>
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: easeOutExpo, delay: 0.85 }}
          style={{
            fontSize: 18,
            marginTop: 28,
            maxWidth: 580,
            lineHeight: 1.65,
            color: "rgba(255,255,255,0.88)",
            fontWeight: 400,
          }}
        >
          {t.home.intro}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: easeOutExpo, delay: 1.0 }}
          style={{ marginTop: 36, display: "flex", gap: 14 }}
        >
          <Button href="/courses">{t.cta.explorePrograms}</Button>
          <Button href="/about" primary={false} dark icon={false}>
            {t.cta.watchStory}
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 1.3 }}
        style={{
          position: "absolute",
          bottom: 28,
          left: 56,
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "rgba(255,255,255,0.7)",
          fontSize: 11,
          letterSpacing: 2.4,
          textTransform: "uppercase",
          fontWeight: 600,
        }}
      >
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ display: "inline-block" }}
        >
          ↓
        </motion.span>
        Scroll
      </motion.div>
    </section>
  );
}

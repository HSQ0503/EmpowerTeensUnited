"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { A } from "./tokens";
import { ConcentricArcs } from "./ConcentricArcs";

const easeOutExpo = [0.16, 1, 0.3, 1] as const;

export function PageHero({
  title,
  breadcrumb,
  subtitle,
  image,
}: {
  title: string;
  breadcrumb: string;
  subtitle?: string;
  image: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 500], [0, 80]);

  return (
    <motion.section
      ref={ref}
      style={{
        position: "relative",
        background: A.navy,
        color: "#fff",
        overflow: "hidden",
      }}
    >
      <motion.div
        style={{
          position: "absolute",
          inset: -20,
          background: `url(${image}) center/cover`,
          opacity: 0.32,
          y: bgY,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(15,69,102,0.65) 0%, rgba(15,69,102,0.88) 100%)",
        }}
      />
      <div style={{ position: "absolute", top: 0, right: 0 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: easeOutExpo, delay: 0.15 }}
        >
          <ConcentricArcs size={280} color="#FCCC00" opacity={0.22} corner="tr" />
        </motion.div>
      </div>
      <div className="etu-px" style={{ position: "relative", padding: "72px 56px 84px" }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeOutExpo }}
          style={{
            fontFamily: A.fontBody,
            fontSize: 12.5,
            letterSpacing: 2.4,
            textTransform: "uppercase",
            color: A.gold,
            marginBottom: 18,
            fontWeight: 700,
          }}
        >
          {breadcrumb}
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 28, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease: easeOutExpo, delay: 0.1 }}
          style={{
            fontFamily: A.fontHead,
            fontSize: "clamp(40px, 5vw, 60px)",
            fontWeight: 400,
            margin: 0,
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
            maxWidth: 880,
          }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeOutExpo, delay: 0.35 }}
            style={{
              fontFamily: A.fontBody,
              fontSize: 18,
              color: "rgba(255,255,255,0.85)",
              maxWidth: 660,
              marginTop: 22,
              lineHeight: 1.6,
            }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </motion.section>
  );
}

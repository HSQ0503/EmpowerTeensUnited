"use client";

import { motion } from "motion/react";
import { useLang } from "../i18n/LanguageProvider";
import { A } from "./tokens";

export function LangToggle({ dark = false }: { dark?: boolean }) {
  const { lang, toggle } = useLang();
  return (
    <motion.button
      type="button"
      onClick={toggle}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      aria-label={lang === "en" ? "Switch to Spanish" : "Cambiar a inglés"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 12px",
        borderRadius: 99,
        background: dark
          ? "rgba(255,255,255,0.08)"
          : "rgba(15,69,102,0.06)",
        fontFamily: A.fontBody,
        fontSize: 12,
        fontWeight: 700,
        color: dark ? "#fff" : A.navy,
        cursor: "pointer",
        border: dark
          ? "1px solid rgba(255,255,255,0.18)"
          : `1px solid ${A.rule}`,
        letterSpacing: 0.6,
        position: "relative",
      }}
    >
      <span
        aria-hidden
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 16,
          height: 11,
          borderRadius: 2,
          overflow: "hidden",
          background:
            lang === "en"
              ? "linear-gradient(180deg,#b22234 33%,#fff 33%,#fff 66%,#3c3b6e 66%)"
              : "linear-gradient(180deg,#aa151b 50%,#f1bf00 50%)",
        }}
      />
      <motion.span
        key={lang}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        style={{ display: "inline-block", minWidth: 16, textAlign: "center" }}
      >
        {lang.toUpperCase()}
      </motion.span>
      <span aria-hidden style={{ opacity: 0.6, fontSize: 10 }}>
        ⇄
      </span>
    </motion.button>
  );
}

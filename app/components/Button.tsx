"use client";

import { motion } from "motion/react";
import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";
import { A } from "./tokens";

type Props = {
  children: ReactNode;
  primary?: boolean;
  dark?: boolean;
  small?: boolean;
  icon?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
  href?: string;
  type?: "button" | "submit";
};

export function Button({
  children,
  primary = true,
  dark = false,
  small = false,
  icon = true,
  onClick,
  href,
  type = "button",
}: Props) {
  const styles: React.CSSProperties = primary
    ? { background: A.gold, color: A.navy, border: "none" }
    : {
        background: "transparent",
        color: dark ? "#fff" : A.navy,
        border: `1.5px solid ${dark ? "rgba(255,255,255,0.4)" : A.navy}`,
      };

  const baseStyle: React.CSSProperties = {
    ...styles,
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: small ? "10px 18px" : "14px 24px",
    fontFamily: A.fontBody,
    fontSize: small ? 13 : 15,
    fontWeight: 700,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    borderRadius: 4,
    cursor: "pointer",
    textDecoration: "none",
    position: "relative",
    overflow: "hidden",
    willChange: "transform",
  };

  const inner = (
    <>
      <span style={{ position: "relative", zIndex: 1, display: "inline-flex", alignItems: "center", gap: 10 }}>
        {children}
        {icon && (
          <motion.svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            initial={{ x: 0 }}
            whileHover={{ x: 0 }}
            style={{ display: "inline-block" }}
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </motion.svg>
        )}
      </span>
    </>
  );

  const hover = primary
    ? { y: -2, boxShadow: "0 16px 28px -16px rgba(252,204,0,0.65)" }
    : dark
    ? { y: -2, background: "rgba(255,255,255,0.08)" }
    : { y: -2, background: "rgba(15,69,102,0.05)" };

  const motionProps = {
    whileHover: hover,
    whileTap: { scale: 0.97 },
    transition: { type: "spring" as const, stiffness: 360, damping: 22 },
  };

  if (href) {
    return (
      <motion.span style={{ display: "inline-block" }} {...motionProps}>
        <Link href={href} style={baseStyle} onClick={onClick}>
          {inner}
        </Link>
      </motion.span>
    );
  }

  return (
    <motion.button type={type} onClick={onClick} style={baseStyle} {...motionProps}>
      {inner}
    </motion.button>
  );
}

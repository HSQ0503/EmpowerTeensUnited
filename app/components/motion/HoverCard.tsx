"use client";

import { motion } from "motion/react";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

type Props = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
  lift?: number;
  shadow?: boolean;
  asArticle?: boolean;
};

export function HoverCard({
  children,
  href,
  onClick,
  className,
  style,
  lift = 6,
  shadow = true,
  asArticle = false,
}: Props) {
  const baseStyle: CSSProperties = {
    display: "block",
    textDecoration: "none",
    color: "inherit",
    cursor: href || onClick ? "pointer" : "default",
    willChange: "transform",
    ...style,
  };

  const motionProps = {
    whileHover: {
      y: -lift,
      boxShadow: shadow
        ? "0 24px 50px -28px rgba(15, 69, 102, 0.35)"
        : undefined,
    },
    transition: { type: "spring" as const, stiffness: 220, damping: 22 },
  };

  if (href) {
    return (
      <motion.div {...motionProps} className={className} style={baseStyle}>
        <Link
          href={href}
          style={{
            display: "block",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          {children}
        </Link>
      </motion.div>
    );
  }

  if (asArticle) {
    return (
      <motion.article
        {...motionProps}
        onClick={onClick}
        className={className}
        style={baseStyle}
      >
        {children}
      </motion.article>
    );
  }

  return (
    <motion.div
      {...motionProps}
      onClick={onClick}
      className={className}
      style={baseStyle}
    >
      {children}
    </motion.div>
  );
}

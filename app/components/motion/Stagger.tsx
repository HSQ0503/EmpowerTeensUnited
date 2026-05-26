"use client";

import { motion, type Variants } from "motion/react";
import type { CSSProperties, ReactNode } from "react";

type Props = {
  children: ReactNode;
  staggerChildren?: number;
  delayChildren?: number;
  once?: boolean;
  amount?: number;
  className?: string;
  style?: CSSProperties;
};

export function Stagger({
  children,
  staggerChildren = 0.08,
  delayChildren = 0,
  once = true,
  amount = 0.15,
  className,
  style,
}: Props) {
  const variants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren, delayChildren },
    },
  };
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount, margin: "0px 0px -10% 0px" }}
      variants={variants}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

const childVariants: Variants = {
  hidden: { y: 24, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

export function StaggerItem({
  children,
  className,
  style,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: "div" | "article" | "li";
}) {
  const Comp = motion[as];
  return (
    <Comp variants={childVariants} className={className} style={style}>
      {children}
    </Comp>
  );
}

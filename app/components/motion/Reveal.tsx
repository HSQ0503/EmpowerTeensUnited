"use client";

import { motion, type Variants } from "motion/react";
import type { CSSProperties, ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "none";

type Props = {
  children: ReactNode;
  delay?: number;
  duration?: number;
  distance?: number;
  direction?: Direction;
  once?: boolean;
  amount?: number;
  className?: string;
  style?: CSSProperties;
  as?: "div" | "section" | "article" | "header" | "footer" | "aside";
};

const initialFor = (d: Direction, distance: number) => {
  switch (d) {
    case "up":
      return { y: distance, opacity: 0 };
    case "down":
      return { y: -distance, opacity: 0 };
    case "left":
      return { x: distance, opacity: 0 };
    case "right":
      return { x: -distance, opacity: 0 };
    default:
      return { opacity: 0 };
  }
};

export function Reveal({
  children,
  delay = 0,
  duration = 0.7,
  distance = 28,
  direction = "up",
  once = true,
  amount = 0.2,
  className,
  style,
  as = "div",
}: Props) {
  const Comp = motion[as];
  const variants: Variants = {
    hidden: initialFor(direction, distance),
    visible: { x: 0, y: 0, opacity: 1 },
  };
  return (
    <Comp
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount, margin: "0px 0px -10% 0px" }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      variants={variants}
      className={className}
      style={style}
    >
      {children}
    </Comp>
  );
}

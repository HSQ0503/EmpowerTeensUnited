"use client";

import { motion } from "motion/react";
import type { CSSProperties } from "react";

export function ZoomImage({
  src,
  alt,
  height = 320,
  radius = 0,
  style,
}: {
  src: string;
  alt: string;
  height?: number;
  radius?: number;
  style?: CSSProperties;
}) {
  return (
    <div
      role="img"
      aria-label={alt}
      style={{
        width: "100%",
        height,
        borderRadius: radius,
        overflow: "hidden",
        background: "#dcd8cc",
        ...style,
      }}
    >
      <motion.div
        whileHover={{ scale: 1.06 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: "100%",
          height: "100%",
          background: `url(${src}) center/cover no-repeat`,
        }}
      />
    </div>
  );
}

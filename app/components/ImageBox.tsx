import type { CSSProperties } from "react";

export function ImageBox({
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
      style={{
        width: "100%",
        height,
        borderRadius: radius,
        background: `#dcd8cc url(${src}) center/cover no-repeat`,
        ...style,
      }}
      aria-label={alt}
      role="img"
    />
  );
}

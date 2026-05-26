import { A } from "./tokens";

type Corner = "tr" | "tl" | "br" | "bl";

const transforms: Record<Corner, string> = {
  tr: "",
  tl: "scaleX(-1)",
  br: "scaleY(-1)",
  bl: "scale(-1,-1)",
};

export function ConcentricArcs({
  size = 200,
  color = A.navy,
  opacity = 0.18,
  corner = "tr",
}: {
  size?: number;
  color?: string;
  opacity?: number;
  corner?: Corner;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      style={{ transform: transforms[corner], opacity }}
    >
      {[60, 95, 130, 165].map((r, i) => (
        <path
          key={i}
          d={`M 200 ${200 - r} A ${r} ${r} 0 0 0 ${200 - r} 200`}
          fill="none"
          stroke={color}
          strokeWidth={i === 1 || i === 3 ? 1 : 2}
        />
      ))}
    </svg>
  );
}

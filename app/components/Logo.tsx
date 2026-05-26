import { A } from "./tokens";

export function EtuMark({ size = 56 }: { size?: number }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} style={{ display: "block" }}>
      <defs>
        <radialGradient id="etu-gold" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="60%" stopColor={A.gold} />
          <stop offset="100%" stopColor={A.goldDeep} />
        </radialGradient>
        <radialGradient id="etu-blue" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#3479a4" />
          <stop offset="60%" stopColor={A.navy} />
          <stop offset="100%" stopColor="#082b40" />
        </radialGradient>
        <path id="etu-arc" d="M 28 100 a 72 72 0 1 1 144 0" fill="none" />
      </defs>
      <circle cx="100" cy="100" r="92" fill="none" stroke={A.navy} strokeWidth="9" strokeDasharray="540 60" strokeDashoffset="-30" strokeLinecap="butt" />
      <circle cx="100" cy="100" r="78" fill="none" stroke={A.gold} strokeWidth="2" />
      <g transform="translate(100 100)">
        {[0, 120, 240].map((deg, i) => (
          <g key={i} transform={`rotate(${deg})`}>
            <path d="M -8 -32 C -22 -22 -28 -2 -18 18 C -8 32 6 30 12 18 C 18 4 14 -16 4 -28 C 0 -34 -4 -34 -8 -32 Z" fill="url(#etu-blue)" />
            <circle cx="22" cy="-22" r="11" fill="url(#etu-gold)" />
          </g>
        ))}
      </g>
      <text fontSize="13.5" fontWeight="700" letterSpacing="2.4" fill={A.navy} style={{ fontFamily: "Manrope, system-ui, sans-serif" }}>
        <textPath href="#etu-arc" startOffset="50%" textAnchor="middle">EMPOWER  TEENS  UNITED</textPath>
      </text>
    </svg>
  );
}

export function EtuLockup({ height = 48, color = A.navy }: { height?: number; color?: string }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 12, height }}>
      <EtuMark size={height} />
      <div
        style={{
          fontFamily: A.fontBody,
          fontWeight: 800,
          letterSpacing: 1.4,
          lineHeight: 0.95,
          fontSize: height * 0.32,
          color,
          textTransform: "uppercase",
        }}
      >
        <div>Empower</div>
        <div>Teens</div>
        <div>United</div>
      </div>
    </div>
  );
}

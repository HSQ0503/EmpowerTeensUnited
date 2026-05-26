export const A = {
  navy: "#0F4566",
  navyDark: "#0a3349",
  navyLight: "#1d5d83",
  navyMuted: "#2a6f93",
  gold: "#FCCC00",
  goldDeep: "#e0b300",
  ink: "#101820",
  body: "#3a4754",
  muted: "#6b7785",
  rule: "rgba(15, 69, 102, 0.12)",
  ruleSoft: "rgba(15, 69, 102, 0.06)",
  cream: "#FBF7EB",
  paper: "#FAF8F3",
  off: "#F4F1E8",
  white: "#FFFFFF",
  bg: "#FAF8F3",
  fontHead: 'var(--font-source-serif), "Source Serif 4", Georgia, serif',
  fontBody: "var(--font-manrope), Manrope, system-ui, sans-serif",
} as const;

export const aBase = {
  fontFamily: A.fontBody,
  color: A.ink,
  background: A.white,
  lineHeight: 1.55,
} as const;

export const PARTNERS = [
  "West Orange Chamber",
  "Orlando Health",
  "Content Studio+",
  "Windermere Schools",
] as const;

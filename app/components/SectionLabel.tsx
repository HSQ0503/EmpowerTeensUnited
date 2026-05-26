import { A } from "./tokens";

export function SectionLabel({
  children,
  color = A.navy,
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        fontFamily: A.fontBody,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 2,
        textTransform: "uppercase",
        color,
        marginBottom: 16,
      }}
    >
      <span style={{ width: 24, height: 1.5, background: A.gold }} />
      {children}
    </div>
  );
}

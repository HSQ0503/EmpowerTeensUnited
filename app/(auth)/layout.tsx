import type { ReactNode } from "react";
import Link from "next/link";
import { EtuLockup } from "@/app/components/Logo";
import { ConcentricArcs } from "@/app/components/ConcentricArcs";
import { A } from "@/app/components/tokens";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: A.paper,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "48px 24px 64px",
        gap: 32,
        fontFamily: A.fontBody,
      }}
    >
      <div style={{ position: "absolute", top: -40, right: -40, pointerEvents: "none" }}>
        <ConcentricArcs size={420} color={A.navy} opacity={0.06} corner="tr" />
      </div>
      <div style={{ position: "absolute", bottom: -60, left: -60, pointerEvents: "none" }}>
        <ConcentricArcs size={360} color={A.gold} opacity={0.1} corner="bl" />
      </div>

      <Link
        href="/"
        style={{
          textDecoration: "none",
          position: "relative",
          zIndex: 1,
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        <EtuLockup height={52} color={A.navy} />
      </Link>

      <div
        className="etu-px"
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 460,
          background: "#fff",
          borderRadius: 6,
          padding: "40px 40px 36px",
          boxShadow: "0 24px 60px -28px rgba(15, 69, 102, 0.28), 0 2px 8px rgba(15, 69, 102, 0.06)",
          border: `1px solid ${A.rule}`,
        }}
      >
        {children}
      </div>

      <Link
        href="/"
        style={{
          position: "relative",
          zIndex: 1,
          fontSize: 13,
          color: A.muted,
          textDecoration: "none",
          fontFamily: A.fontBody,
          fontWeight: 600,
          letterSpacing: 0.6,
        }}
      >
        ← Back to home
      </Link>
    </div>
  );
}

import * as React from "react";
import { Section, Text, Hr } from "@react-email/components";

export const BRAND = {
  navy: "#0F4566",
  navyDark: "#0a3349",
  gold: "#FCCC00",
  ink: "#101820",
  body: "#3a4754",
  muted: "#6b7785",
  paper: "#FAF8F3",
  rule: "rgba(15, 69, 102, 0.12)",
} as const;

export function BrandHeader() {
  return (
    <Section
      style={{
        background: BRAND.navy,
        padding: "24px 24px",
        textAlign: "center" as const,
        borderBottom: `4px solid ${BRAND.gold}`,
      }}
    >
      <Text
        style={{
          color: "#fff",
          fontSize: 16,
          fontWeight: 800,
          letterSpacing: 1.5,
          textTransform: "uppercase" as const,
          margin: 0,
          fontFamily: "Manrope, Helvetica, Arial, sans-serif",
        }}
      >
        Empower Teens United
      </Text>
    </Section>
  );
}

export function BrandFooter() {
  return (
    <>
      <Hr style={{ borderColor: BRAND.rule, margin: "0 24px" }} />
      <Section style={{ padding: "20px 24px", textAlign: "center" as const }}>
        <Text
          style={{
            color: BRAND.muted,
            fontSize: 12,
            margin: 0,
            fontFamily: "Manrope, Helvetica, Arial, sans-serif",
            lineHeight: 1.6,
          }}
        >
          Empower Teens United · Orlando, FL
          <br />
          info@empowerteensunited.org · +1 (407) 413-7384
        </Text>
      </Section>
    </>
  );
}

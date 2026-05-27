import * as React from "react";
import { Html, Head, Body, Container, Section, Heading, Text, Button } from "@react-email/components";
import { BrandHeader, BrandFooter, BRAND } from "./_components/Brand";

type Props = {
  inviteUrl: string;
  role: string;
  invitedByName: string;
};

export default function InviteEmail({ inviteUrl, role, invitedByName }: Props) {
  return (
    <Html>
      <Head />
      <Body
        style={{
          background: BRAND.paper,
          fontFamily: "Manrope, Helvetica, Arial, sans-serif",
          margin: 0,
          padding: 0,
        }}
      >
        <Container
          style={{
            maxWidth: 600,
            margin: "32px auto",
            background: "#fff",
            border: `1px solid ${BRAND.rule}`,
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          <BrandHeader />

          <Section style={{ padding: "36px 32px 16px" }}>
            <Heading
              as="h1"
              style={{
                color: BRAND.navy,
                fontSize: 26,
                fontWeight: 500,
                margin: 0,
                letterSpacing: "-0.02em",
                fontFamily: 'Georgia, "Source Serif 4", serif',
              }}
            >
              You&rsquo;re invited
            </Heading>
            <Text
              style={{
                color: BRAND.body,
                fontSize: 15,
                lineHeight: 1.65,
                margin: "16px 0 0",
              }}
            >
              <strong style={{ color: BRAND.ink }}>{invitedByName}</strong> invited you to join
              Empower Teens United as a <strong style={{ color: BRAND.ink }}>{role}</strong>.
            </Text>
          </Section>

          <Section style={{ padding: "8px 32px 32px", textAlign: "center" as const }}>
            <Button
              href={inviteUrl}
              style={{
                background: BRAND.navy,
                color: "#fff",
                padding: "14px 28px",
                borderRadius: 4,
                textDecoration: "none",
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: 0.6,
                textTransform: "uppercase" as const,
                display: "inline-block",
              }}
            >
              Accept invite
            </Button>
          </Section>

          <Section style={{ padding: "0 32px 32px" }}>
            <Text
              style={{
                color: BRAND.muted,
                fontSize: 12,
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              This link expires in 14 days. If the button doesn&rsquo;t work, paste this URL into
              your browser:
              <br />
              <a href={inviteUrl} style={{ color: BRAND.navy, wordBreak: "break-all" }}>
                {inviteUrl}
              </a>
            </Text>
          </Section>

          <BrandFooter />
        </Container>
      </Body>
    </Html>
  );
}

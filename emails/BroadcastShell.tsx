import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
} from "@react-email/components";
import { BrandHeader, BrandFooter, BRAND } from "./_components/Brand";

export default function BroadcastShell(props: {
  bodyHtml: string;
  unsubscribeUrl: string;
}) {
  return (
    <Html>
      <Head />
      <Body
        style={{
          background: "#fff",
          fontFamily: "Manrope, Helvetica, Arial, sans-serif",
        }}
      >
        <Container style={{ maxWidth: 600, margin: "0 auto" }}>
          <BrandHeader />
          <Section
            style={{
              padding: "32px 24px",
              color: BRAND.ink,
              fontSize: 15,
              lineHeight: 1.65,
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: props.bodyHtml }} />
          </Section>
          <BrandFooter />
          <Section
            style={{
              padding: "0 24px 24px",
              textAlign: "center" as const,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                color: BRAND.muted,
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              You&apos;re receiving this because you&apos;re part of Empower
              Teens United.{" "}
              <a
                href={props.unsubscribeUrl}
                style={{ color: BRAND.navy, fontWeight: 600 }}
              >
                Unsubscribe
              </a>
              .
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

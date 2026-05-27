import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
} from "@react-email/components";
import { BrandHeader, BrandFooter, BRAND } from "./_components/Brand";

export default function ContactNotification(props: {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
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
          <Section style={{ padding: "32px 24px 8px" }}>
            <Heading
              as="h1"
              style={{
                color: BRAND.ink,
                fontSize: 22,
                margin: 0,
                fontWeight: 600,
              }}
            >
              New contact message
            </Heading>
            <Text style={{ color: BRAND.body, fontSize: 14, lineHeight: 1.6 }}>
              <strong>From:</strong> {props.name} &lt;{props.email}&gt;
              <br />
              {props.phone && (
                <>
                  <strong>Phone:</strong> {props.phone}
                  <br />
                </>
              )}
              <strong>Subject:</strong> {props.subject}
            </Text>
          </Section>
          <Section style={{ padding: "0 24px 24px" }}>
            <Text
              style={{
                color: BRAND.ink,
                fontSize: 15,
                whiteSpace: "pre-wrap",
                lineHeight: 1.65,
                background: BRAND.paper,
                padding: "16px 18px",
                borderLeft: `3px solid ${BRAND.gold}`,
                margin: 0,
              }}
            >
              {props.message}
            </Text>
          </Section>
          <BrandFooter />
        </Container>
      </Body>
    </Html>
  );
}

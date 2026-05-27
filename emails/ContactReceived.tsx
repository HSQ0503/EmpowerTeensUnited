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

export default function ContactReceived(props: { name: string }) {
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
          <Section style={{ padding: "32px 24px" }}>
            <Heading
              as="h1"
              style={{
                color: BRAND.ink,
                fontSize: 24,
                margin: 0,
                fontWeight: 600,
              }}
            >
              Thanks for reaching out!
            </Heading>
            <Text style={{ color: BRAND.body, fontSize: 15, lineHeight: 1.65 }}>
              Hi {props.name}, we received your message and someone from the
              ETU team will get back to you within 2 business days.
            </Text>
            <Text style={{ color: BRAND.muted, fontSize: 13, lineHeight: 1.6 }}>
              In the meantime, feel free to explore our upcoming events and
              stories on{" "}
              <a
                href="https://empowerteensunited.org"
                style={{ color: BRAND.navy, fontWeight: 600 }}
              >
                empowerteensunited.org
              </a>
              .
            </Text>
          </Section>
          <BrandFooter />
        </Container>
      </Body>
    </Html>
  );
}

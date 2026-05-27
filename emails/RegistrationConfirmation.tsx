import * as React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Img,
  Link,
} from "@react-email/components";
import { BrandHeader, BrandFooter, BRAND } from "./_components/Brand";

type Props = {
  attendeeName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  qrDataUrl: string;
  eventUrl?: string;
};

export default function RegistrationConfirmation(props: Props) {
  return (
    <Html>
      <Head />
      <Preview>You&apos;re registered for {props.eventTitle}</Preview>
      <Body
        style={{
          background: BRAND.paper,
          margin: 0,
          fontFamily: "Manrope, Helvetica, Arial, sans-serif",
        }}
      >
        <Container
          style={{ maxWidth: 600, margin: "0 auto", background: "#fff" }}
        >
          <BrandHeader />
          <Section style={{ padding: "32px 32px 12px" }}>
            <Heading
              as="h1"
              style={{
                color: BRAND.navy,
                fontSize: 24,
                margin: 0,
                fontWeight: 700,
                letterSpacing: -0.3,
              }}
            >
              You&apos;re registered
            </Heading>
            <Text
              style={{
                color: BRAND.body,
                fontSize: 15,
                lineHeight: 1.6,
                marginTop: 12,
              }}
            >
              Hi {props.attendeeName}, you&apos;re confirmed for{" "}
              <strong style={{ color: BRAND.navy }}>{props.eventTitle}</strong>.
            </Text>
            <Section
              style={{
                background: BRAND.paper,
                border: `1px solid ${BRAND.rule}`,
                padding: "16px 18px",
                borderRadius: 6,
                marginTop: 16,
              }}
            >
              <Text
                style={{ color: BRAND.body, fontSize: 14, lineHeight: 1.6, margin: 0 }}
              >
                <strong style={{ color: BRAND.navy }}>When:</strong>{" "}
                {props.eventDate}
                <br />
                <strong style={{ color: BRAND.navy }}>Where:</strong>{" "}
                {props.eventLocation}
              </Text>
            </Section>
            <Text
              style={{
                color: BRAND.body,
                fontSize: 15,
                lineHeight: 1.6,
                marginTop: 28,
              }}
            >
              Show this QR at the door to check in:
            </Text>
          </Section>
          <Section style={{ textAlign: "center", padding: "0 32px 32px" }}>
            <Img
              src={props.qrDataUrl}
              alt="Check-in QR code"
              width={240}
              height={240}
              style={{ margin: "0 auto", display: "block" }}
            />
            {props.eventUrl && (
              <Text style={{ marginTop: 16, fontSize: 13 }}>
                <Link
                  href={props.eventUrl}
                  style={{ color: BRAND.navy, fontWeight: 600 }}
                >
                  View event details
                </Link>
              </Text>
            )}
          </Section>
          <BrandFooter />
        </Container>
      </Body>
    </Html>
  );
}

import * as React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
} from "@react-email/components";
import { BRAND, BrandHeader, BrandFooter } from "./_components/Brand";

type Props = {
  studentName: string;
  mentorName: string;
  sessionNo: number;
  mentorshipUrl: string;
};

export default function SessionLogged({
  studentName,
  mentorName,
  sessionNo,
  mentorshipUrl,
}: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ background: BRAND.paper, margin: 0, padding: "24px 0" }}>
        <Container
          style={{
            maxWidth: 560,
            margin: "0 auto",
            background: "#fff",
            borderRadius: 8,
            overflow: "hidden",
            border: `1px solid ${BRAND.rule}`,
          }}
        >
          <BrandHeader />
          <Section style={{ padding: "28px 24px" }}>
            <Text style={{ fontSize: 18, fontWeight: 700, color: BRAND.navy, margin: "0 0 12px", fontFamily: "Manrope, Helvetica, Arial, sans-serif" }}>
              Session {sessionNo} notes are ready
            </Text>
            <Text style={{ fontSize: 15, color: BRAND.body, lineHeight: 1.6, margin: "0 0 16px", fontFamily: "Manrope, Helvetica, Arial, sans-serif" }}>
              Hi {studentName}, {mentorName} just logged notes from your latest
              mentorship session. You can review the recap and any action items
              on your mentorship page.
            </Text>
            <Button
              href={mentorshipUrl}
              style={{
                background: BRAND.navy,
                color: "#fff",
                padding: "12px 22px",
                borderRadius: 4,
                fontSize: 14,
                fontWeight: 700,
                textDecoration: "none",
                fontFamily: "Manrope, Helvetica, Arial, sans-serif",
              }}
            >
              View session notes
            </Button>
          </Section>
          <BrandFooter />
        </Container>
      </Body>
    </Html>
  );
}

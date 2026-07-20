import { A } from "@/app/components/tokens";
import { PHOTOS } from "@/app/components/photos";
import { PageHero } from "@/app/components/PageHero";

export const metadata = {
  title: "Legal & Safety · Empower Teens United",
  description:
    "Legal disclaimer, safety policies, and participation terms for Empower Teens United, Inc., a Florida nonprofit organization.",
};

type LegalSection = {
  title: string;
  paras: string[];
  lists?: { lead: string; items: string[] }[];
};

const SECTIONS: LegalSection[] = [
  {
    title: "Informational and Educational Purpose Only",
    paras: [
      "All information contained on this website and within Empower Teens United programs, communications, materials, mentorship, workshops, coaching, activities, and events is provided solely for general informational and educational purposes.",
      "Nothing provided by Empower Teens United shall be construed as legal, medical, psychological, psychiatric, counseling, therapeutic, financial, or other professional advice. Parents, guardians, participants, and visitors should not act or refrain from acting based on any information provided without first seeking advice from a qualified professional licensed in their jurisdiction.",
      "Empower Teens United expressly disclaims all liability for actions taken or not taken based on reliance upon website content, communications, or program materials.",
    ],
  },
  {
    title: "No Professional, Therapeutic, or Fiduciary Relationship",
    paras: [
      "Participation in Empower Teens United programs does not create a therapist client, counselor client, attorney client, medical provider patient, fiduciary, custodial, or professional relationship of any kind.",
      "Empower Teens United does not provide diagnosis, treatment, therapy, counseling, legal services, or professional advice. All mentorship, coaching, and guidance is educational in nature only.",
    ],
  },
  {
    title: "No Guaranteed Outcomes",
    paras: [
      "Participation in Empower Teens United programs does not guarantee academic success, college admission, scholarships, employment, leadership roles, or specific outcomes. Results vary based on individual effort, circumstances, and factors beyond the organization’s control.",
    ],
  },
  {
    title: "Parental Responsibility and Consent",
    paras: [
      "All programs involving minors require written consent from a parent or legal guardian prior to participation.",
      "Parents and legal guardians acknowledge and agree that they retain sole responsibility for the supervision, decisions, conduct, health, safety, and wellbeing of their child at all times, including before, during, and after participation in any Empower Teens United activity, event, meeting, workshop, site visit, community service project, or program.",
      "Empower Teens United does not assume custodial responsibility, parental authority, or supervisory control over minors.",
    ],
  },
  {
    title: "Assumption of Risk and Limitation of Liability",
    paras: [
      "Participation in Empower Teens United programs and activities involves inherent risks, including but not limited to physical activity, emotional discomfort, transportation, travel, off site activities, and interaction with other participants.",
      "To the fullest extent permitted by Florida law and applicable federal law, parents, legal guardians, and participants voluntarily assume all risks associated with participation and hereby release, waive, discharge, and hold harmless Empower Teens United, Inc., its officers, directors, employees, volunteers, mentors, partners, sponsors, contractors, and representatives from any and all claims, demands, damages, losses, causes of action, or liabilities arising out of or related to participation, except in cases of gross negligence or willful misconduct.",
    ],
  },
  {
    title: "Code of Conduct",
    paras: [
      "All participants, parents, mentors, volunteers, staff, and guests are required to conduct themselves in a respectful, safe, and appropriate manner at all times.",
    ],
    lists: [
      {
        lead: "Expected conduct includes but is not limited to:",
        items: [
          "Treating all individuals with dignity, respect, and courtesy",
          "Following all safety guidelines, instructions, and policies",
          "Maintaining appropriate physical, verbal, and digital boundaries",
          "Respecting privacy and confidentiality",
          "Complying with all applicable laws and regulations",
        ],
      },
      {
        lead: "Prohibited conduct includes but is not limited to:",
        items: [
          "Abuse, neglect, exploitation, or inappropriate contact",
          "Bullying, harassment, discrimination, or intimidation",
          "One on one private interactions with minors outside approved settings",
          "Inappropriate communication via text, social media, or digital platforms",
          "Possession or use of illegal substances",
          "Threatening, aggressive, or disruptive behavior",
          "Failure to follow supervision or safety protocols",
        ],
      },
    ],
  },
  {
    title: "Removal and Disciplinary Action",
    paras: [
      "Empower Teens United reserves the absolute right to remove, suspend, or permanently restrict any participant, parent, mentor, volunteer, or attendee whose behavior violates this policy, organizational guidelines, or poses a safety, reputational, or operational risk.",
      "Removal may occur immediately, without prior notice, and without refund or liability. Empower Teens United further reserves the right to prohibit future participation at its sole discretion.",
    ],
  },
  {
    title: "Mentors and Volunteers",
    paras: [
      "Mentors and volunteers serve in non custodial, non professional, and non employee roles unless otherwise explicitly stated in writing.",
      "Mentors and volunteers are not licensed professionals acting on behalf of Empower Teens United and may not provide medical, mental health, legal, or therapeutic advice. All mentors and volunteers must adhere to strict boundary, safety, communication, and reporting policies.",
    ],
  },
  {
    title: "Mandatory Reporting",
    paras: [
      "Empower Teens United complies fully with Florida and federal mandatory reporting laws. Any suspected abuse, neglect, self harm, threats of harm, or unlawful activity involving a minor may be reported to appropriate authorities without prior notice to parents or participants.",
    ],
  },
  {
    title: "Media Release",
    paras: [
      "By participating in Empower Teens United programs, parents or legal guardians grant permission for the organization to photograph, video record, audio record, and otherwise capture the likeness, image, voice, and participation of their child for educational, promotional, marketing, fundraising, and informational purposes.",
      "No compensation shall be provided. Written media release consent is required for minors.",
    ],
  },
  {
    title: "Third Party Organizations and Links",
    paras: [
      "This website may contain links to third party websites or references to partner organizations. These links are provided for convenience only. Empower Teens United does not control, endorse, or assume responsibility for the content, policies, supervision, or practices of third party organizations.",
    ],
  },
  {
    title: "Website Use and Communications",
    paras: [
      "Information transmitted through this website, email, or online forms is submitted on a non confidential basis. Submission of information does not create a professional, fiduciary, or attorney client relationship.",
      "This website and its contents are provided “as is” without warranties of any kind, express or implied, including warranties of merchantability, fitness for a particular purpose, or non infringement.",
    ],
  },
  {
    title: "Intellectual Property",
    paras: [
      "All website content, including text, graphics, logos, images, and materials, is the property of Empower Teens United unless otherwise stated. Reproduction, distribution, republication, or retransmission is prohibited without prior written permission.",
    ],
  },
  {
    title: "Governing Law and Jurisdiction",
    paras: [
      "All matters relating to Empower Teens United programs, website use, and organizational activities shall be governed by and construed in accordance with the laws of the State of Florida and applicable federal law. Venue for any dispute shall lie exclusively in the appropriate courts located within the State of Florida.",
    ],
  },
  {
    title: "Acknowledgment and Agreement",
    paras: [
      "By accessing this website, registering for programs, submitting forms, attending events, or participating in activities, parents, legal guardians, and participants acknowledge that they have read, understood, and voluntarily agreed to all terms, policies, disclosures, and releases set forth herein.",
      "Parents and legal guardians further acknowledge that they knowingly and voluntarily release Empower Teens United, Inc., and its officers, directors, employees, volunteers, mentors, partners, and representatives from liability to the fullest extent permitted by law.",
    ],
  },
];

export default function LegalPage() {
  return (
    <>
      <PageHero
        breadcrumb="Home · Legal & Safety"
        title="Legal Disclaimer, Safety Policies, and Participation Terms"
        subtitle="Empower Teens United, Inc. is a Florida nonprofit organization dedicated to teen leadership development, mentorship, education, and community engagement."
        image={PHOTOS.notebook}
      />

      <main style={{ background: "#fff", padding: "64px 24px 96px" }}>
        <article style={{ maxWidth: 760, margin: "0 auto" }}>
          {SECTIONS.map((s, i) => (
            <section key={s.title} style={{ marginTop: i === 0 ? 0 : 44 }}>
              <h2
                style={{
                  fontFamily: A.fontHead,
                  fontSize: 24,
                  fontWeight: 500,
                  color: A.navy,
                  margin: "0 0 14px",
                  letterSpacing: "-0.015em",
                  lineHeight: 1.25,
                }}
              >
                {i + 1}. {s.title}
              </h2>
              {s.paras.map((p) => (
                <p
                  key={p}
                  style={{
                    fontSize: 16,
                    color: A.body,
                    lineHeight: 1.7,
                    margin: "0 0 14px",
                    fontFamily: A.fontBody,
                  }}
                >
                  {p}
                </p>
              ))}
              {s.lists?.map((l) => (
                <div key={l.lead} style={{ margin: "0 0 14px" }}>
                  <p
                    style={{
                      fontSize: 16,
                      color: A.body,
                      fontWeight: 600,
                      lineHeight: 1.7,
                      margin: "0 0 8px",
                    }}
                  >
                    {l.lead}
                  </p>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: 24,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    {l.items.map((item) => (
                      <li
                        key={item}
                        style={{ fontSize: 16, color: A.body, lineHeight: 1.6 }}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          ))}
        </article>
      </main>
    </>
  );
}

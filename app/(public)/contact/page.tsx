import { A } from "@/app/components/tokens";
import { PHOTOS } from "@/app/components/photos";
import { PageHero } from "@/app/components/PageHero";
import { SectionLabel } from "@/app/components/SectionLabel";
import { authStyles as s } from "@/app/(auth)/_styles";
import { submitContactAction } from "./actions";

export const metadata = { title: "Contact · Empower Teens United" };

const CARDS = [
  { i: "📍", t: "Visit", l1: "6526 Old Brick Rd", l2: "Windermere, FL 34786" },
  {
    i: "✉️",
    t: "Get in touch",
    l1: "info@empowerteensunited.org",
    l2: "+1 (407) 413-7384",
  },
  {
    i: "🕐",
    t: "Hours",
    l1: "Mon – Fri · 9am – 6pm",
    l2: "By appointment on weekends",
  },
];

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;

  return (
    <>
      <PageHero
        breadcrumb="Home · Contact"
        title="Let's talk"
        subtitle="Tell us about your teen, your school, your organization — whatever brought you here. We read every message."
        image={PHOTOS.heroLibrary}
      />

      <section className="etu-px" style={{ padding: "64px 56px 96px", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div
            className="etu-collapse-2"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 24,
              marginBottom: 64,
            }}
          >
            {CARDS.map((c) => (
              <div
                key={c.t}
                style={{
                  border: `1px solid ${A.rule}`,
                  padding: "32px 32px 36px",
                  position: "relative",
                  background: "#fff",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: 48,
                    height: 3,
                    background: A.gold,
                  }}
                />
                <div
                  style={{
                    width: 56,
                    height: 56,
                    background: A.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    marginBottom: 20,
                    border: `1px solid ${A.rule}`,
                  }}
                >
                  {c.i}
                </div>
                <h3
                  style={{
                    fontFamily: A.fontHead,
                    fontSize: 22,
                    fontWeight: 500,
                    color: A.navy,
                    margin: 0,
                    marginBottom: 12,
                  }}
                >
                  {c.t}
                </h3>
                <div style={{ fontSize: 15, color: A.body, lineHeight: 1.65 }}>
                  {c.l1}
                </div>
                <div style={{ fontSize: 15, color: A.body, lineHeight: 1.65 }}>
                  {c.l2}
                </div>
              </div>
            ))}
          </div>

          <div style={{ maxWidth: 640 }}>
            <SectionLabel>Send a message</SectionLabel>
            <h2
              className="etu-h2"
              style={{
                fontFamily: A.fontHead,
                fontSize: 36,
                fontWeight: 400,
                color: A.navy,
                margin: "0 0 12px",
                letterSpacing: "-0.02em",
              }}
            >
              We&apos;d love to hear from you.
            </h2>
            <p style={{ fontSize: 15, color: A.muted, marginBottom: 28 }}>
              Tell us a bit about who you are and how we can help. We aim to
              respond within two business days.
            </p>

            {sent ? (
              <div
                style={{
                  ...s.alertInfo,
                  fontSize: 15,
                  padding: "20px 22px",
                }}
              >
                Thanks! We received your message and just sent you a
                confirmation email. Someone from the team will be in touch
                soon.
              </div>
            ) : (
              <form
                action={submitContactAction}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                }}
              >
                {error && <div style={s.alertError}>{error}</div>}

                <div>
                  <label htmlFor="name" style={s.fieldLabel}>
                    Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    required
                    style={s.input}
                    placeholder="Maria Hernandez"
                  />
                </div>

                <div style={s.fieldRow}>
                  <div>
                    <label htmlFor="email" style={s.fieldLabel}>
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      style={s.input}
                      placeholder="maria@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" style={s.fieldLabel}>
                      Phone (optional)
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      style={s.input}
                      placeholder="(407) 555-0124"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" style={s.fieldLabel}>
                    Subject
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    required
                    style={s.input}
                    placeholder="A question about the spring cohort"
                  />
                </div>

                <div>
                  <label htmlFor="message" style={s.fieldLabel}>
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    style={s.input}
                    placeholder="Share a bit about yourself and what you're hoping to talk about."
                  />
                </div>

                <div>
                  <button type="submit" style={s.primaryButton}>
                    Send message
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

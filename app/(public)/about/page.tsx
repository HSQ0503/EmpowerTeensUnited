"use client";

import { A, aBase } from "@/app/components/tokens";
import { PHOTOS } from "@/app/components/photos";
import { Nav } from "@/app/components/Nav";
import { Footer } from "@/app/components/Footer";
import { PageHero } from "@/app/components/PageHero";
import { ConcentricArcs } from "@/app/components/ConcentricArcs";
import { SectionLabel } from "@/app/components/SectionLabel";
import { Reveal } from "@/app/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/app/components/motion/Stagger";
import { ZoomImage } from "@/app/components/motion/ZoomImage";
import { HoverCard } from "@/app/components/motion/HoverCard";
import { useLang } from "@/app/i18n/LanguageProvider";

export default function About() {
  const { t } = useLang();

  const stats = [
    { n: "83", l: t.home.statsLabels.teens, sub: t.about.statsSub.teens },
    { n: "25", l: t.home.statsLabels.mentors, sub: t.about.statsSub.mentors },
    { n: "15", l: t.home.statsLabels.leadership, sub: t.about.statsSub.leadership },
    { n: "1,188", l: t.home.statsLabels.hours, sub: t.about.statsSub.hours },
  ];

  const mvp = [
    { t: "Mission", img: PHOTOS.workshop, p: "To inspire and empower teens to discover their purpose, grow as leaders, and thrive academically and personally — through mentorship, career exploration, emotional support and family partnerships." },
    { t: "Vision", img: PHOTOS.panel, p: "A future where every teen, regardless of background, is equipped with confidence, skills and support to pursue meaningful careers, uplift their families, and leave a legacy of service." },
    { t: "Purpose", img: PHOTOS.classroom, p: "To create a supportive ecosystem that nurtures teens' academic growth, emotional well-being and leadership potential — empowering them to design their own paths." },
  ];

  const team = [
    { n: "Ivan M. Quiquia, MBA", r: "Chief Empowerment Officer", img: PHOTOS.studentMale2, bio: "20+ years in education leadership. Founded our mentor pipeline with Orlando Health." },
    { n: "Evan Quiquia", r: "Founder & President", img: PHOTOS.studentMale, bio: "Empower Teens started as Evan's senior project. He still leads cohort design today." },
    { n: "Nicole Piña Fernandez", r: "Vice President", img: PHOTOS.studentSmile, bio: "Oversees curriculum, outreach and our growing chapter at UCF." },
  ];

  const journey = [
    { y: "2018", t: "A senior project", d: "Evan Quiquia launches Empower Teens as a community service initiative." },
    { y: "2021", t: "First full cohort", d: "12 teens complete the inaugural 10-week leadership cohort in Windermere." },
    { y: "2023", t: "Orlando Health partnership", d: "Career-pathways program adds shadowing opportunities at OH facilities." },
    { y: "2026", t: "Breaking Thru launch", d: "Mental-health initiative for the next generation rolls out March 31." },
  ];

  return (
    <div style={aBase}>
      <Nav active="about" />
      <PageHero
        breadcrumb={t.about.breadcrumb}
        title={t.about.title}
        subtitle={t.about.subtitle}
        image={PHOTOS.heroLibrary}
      />

      <section style={{ padding: "72px 56px", background: A.bg, borderBottom: `1px solid ${A.rule}` }}>
        <Stagger style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32 }}>
          {stats.map((s) => (
            <StaggerItem key={s.l}>
              <HoverCard lift={4} style={{ background: "#fff", padding: "32px 28px", border: `1px solid ${A.rule}`, position: "relative" }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: 48, height: 3, background: A.gold }} />
                <div style={{ fontFamily: A.fontHead, fontSize: 56, fontWeight: 500, color: A.navy, lineHeight: 1, letterSpacing: "-0.03em" }}>{s.n}</div>
                <div style={{ marginTop: 12, fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", color: A.navy, fontWeight: 700 }}>{s.l}</div>
                <div style={{ marginTop: 4, fontSize: 13, color: A.muted }}>{s.sub}</div>
              </HoverCard>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section style={{ padding: "96px 56px", background: "#fff" }}>
        <Reveal style={{ textAlign: "center", marginBottom: 56 }}>
          <SectionLabel>{t.about.synergyLabel}</SectionLabel>
          <h2 style={{ fontFamily: A.fontHead, fontSize: 44, fontWeight: 400, color: A.navy, margin: 0, letterSpacing: "-0.02em" }}>
            {t.about.synergyTitle}
          </h2>
          <p style={{ fontFamily: A.fontBody, fontSize: 17, color: A.muted, maxWidth: 620, margin: "20px auto 0", lineHeight: 1.65 }}>
            {t.about.synergyIntro}
          </p>
        </Reveal>
        <Stagger style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, border: `1px solid ${A.rule}` }}>
          {mvp.map((c, i) => (
            <StaggerItem key={c.t} style={{ borderRight: i < 2 ? `1px solid ${A.rule}` : "none" }}>
              <ZoomImage src={c.img} alt={c.t} height={220} />
              <div style={{ padding: "32px 32px 36px" }}>
                <div style={{ fontFamily: A.fontBody, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", fontWeight: 700, color: A.gold, marginBottom: 12 }}>0{i + 1} / 03</div>
                <h3 style={{ fontFamily: A.fontHead, fontSize: 30, fontWeight: 500, color: A.navy, margin: 0, marginBottom: 14, letterSpacing: "-0.02em" }}>{c.t}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: A.body, margin: 0 }}>{c.p}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section style={{ padding: "96px 56px", background: A.bg }}>
        <Reveal style={{ maxWidth: 920, margin: "0 auto", display: "grid", gridTemplateColumns: "120px 1fr", gap: 40, alignItems: "start" }}>
          <div style={{ fontFamily: A.fontHead, fontSize: 120, color: A.gold, lineHeight: 0.7, fontWeight: 700 }}>&ldquo;</div>
          <div>
            <p style={{ fontFamily: A.fontHead, fontSize: 32, fontWeight: 400, fontStyle: "italic", color: A.navy, margin: 0, lineHeight: 1.35, letterSpacing: "-0.01em" }}>
              {t.about.quoteBody}
            </p>
            <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 99, background: `url(${PHOTOS.studentMale2}) center/cover`, border: `2px solid ${A.gold}` }} />
              <div>
                <div style={{ fontFamily: A.fontHead, fontSize: 17, fontWeight: 600, color: A.navy }}>Ivan M. Quiquia, MBA</div>
                <div style={{ fontSize: 13, color: A.muted, letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 600 }}>Chief Empowerment Officer · CEO</div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section style={{ padding: "96px 56px", background: "#fff" }}>
        <Reveal style={{ textAlign: "center", marginBottom: 56 }}>
          <SectionLabel>{t.about.teamLabel}</SectionLabel>
          <h2 style={{ fontFamily: A.fontHead, fontSize: 44, fontWeight: 400, color: A.navy, margin: 0, letterSpacing: "-0.02em" }}>
            {t.about.teamTitle}
          </h2>
        </Reveal>
        <Stagger style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 48, maxWidth: 1100, margin: "0 auto" }}>
          {team.map((p) => (
            <StaggerItem key={p.n} style={{ textAlign: "center" }}>
              <HoverCard lift={6} shadow={false}>
                <div style={{ width: 200, height: 200, borderRadius: 99, margin: "0 auto", background: `url(${p.img}) center/cover`, border: `2px solid ${A.gold}`, padding: 6, boxShadow: `0 0 0 1px ${A.rule}` }} />
                <h3 style={{ fontFamily: A.fontHead, fontSize: 22, fontWeight: 500, color: A.navy, margin: "24px 0 6px" }}>{p.n}</h3>
                <div style={{ fontSize: 13, letterSpacing: 1.5, textTransform: "uppercase", color: A.muted, fontWeight: 700, marginBottom: 16 }}>{p.r}</div>
                <p style={{ fontSize: 14, color: A.body, lineHeight: 1.6, maxWidth: 280, margin: "0 auto" }}>{p.bio}</p>
              </HoverCard>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section style={{ padding: "96px 56px", background: A.navy, color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, right: 0 }}>
          <ConcentricArcs size={300} color="#FCCC00" opacity={0.12} corner="tr" />
        </div>
        <Reveal style={{ position: "relative", textAlign: "center", marginBottom: 56 }}>
          <SectionLabel color={A.gold}>{t.about.journeyLabel}</SectionLabel>
          <h2 style={{ fontFamily: A.fontHead, fontSize: 44, fontWeight: 400, margin: 0, letterSpacing: "-0.02em" }}>{t.about.journeyTitle}</h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.78)", maxWidth: 620, margin: "20px auto 0", lineHeight: 1.65 }}>
            {t.about.journeyIntro}
          </p>
        </Reveal>
        <Stagger style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32 }}>
          {journey.map((m) => (
            <StaggerItem key={m.y} style={{ position: "relative", paddingTop: 32 }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.18)" }} />
              <div style={{ position: "absolute", top: -6, left: 0, width: 12, height: 12, borderRadius: 99, background: A.gold, border: `2px solid ${A.navy}` }} />
              <div style={{ fontFamily: A.fontHead, fontSize: 36, fontWeight: 500, color: A.gold, letterSpacing: "-0.02em" }}>{m.y}</div>
              <h3 style={{ fontFamily: A.fontHead, fontSize: 20, fontWeight: 500, margin: "8px 0 10px" }}>{m.t}</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: 1.6 }}>{m.d}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <Footer />
    </div>
  );
}

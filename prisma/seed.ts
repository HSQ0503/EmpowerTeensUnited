import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "./generated/client/client";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

const settings: Array<{ key: string; value: string }> = [
  { key: "org.name", value: "Empower Teens United" },
  { key: "org.tagline", value: "Inspiring teens. Strengthening families." },
  { key: "org.phone", value: "+1 (407) 413-7384" },
  { key: "org.email", value: "info@empowerteensunited.org" },
  { key: "org.hours", value: "Mon–Fri 9:00–18:00" },
  { key: "org.donate_url", value: "" },
  { key: "social.instagram", value: "" },
  { key: "social.linkedin", value: "" },
  { key: "social.facebook", value: "" },
];

async function seedSettings() {
  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log(`Seeded ${settings.length} site settings`);
}

const day = 86_400_000;
const hour = 3_600_000;

async function seedDemo() {
  if (process.env.SEED_DEMO !== "1") return;

  const admin = await prisma.profile.findFirst({ where: { role: "admin" } });
  if (!admin) {
    console.log(
      "No admin profile yet — skipping demo seed. Set role=admin on your profile first.",
    );
    return;
  }

  const now = Date.now();

  const events = [
    {
      slug: "rollins-tour-demo",
      title: "Rollins College Private Tour",
      body: "<p>Walk the campus with admissions staff. Lunch is provided afterward.</p>",
      location: "Rollins Campus, Winter Park",
      startsAt: new Date(now + 7 * day),
      endsAt: new Date(now + 7 * day + 3 * hour),
      capacity: 25,
      publishedAt: new Date(),
      createdById: admin.id,
    },
    {
      slug: "breaking-thru-demo",
      title: "Breaking Thru — Mental Health Panel",
      body: "<p>Open conversation about mental health among teens, with clinicians from Orlando Health.</p>",
      location: "Content Studio+, Orlando",
      startsAt: new Date(now + 14 * day),
      endsAt: new Date(now + 14 * day + 2 * hour),
      capacity: 80,
      publishedAt: new Date(),
      createdById: admin.id,
    },
    {
      slug: "miles-to-go-demo",
      title: "Miles To Go · 8th Anniversary",
      body: "<p>Annual celebration and service drive. Bring the whole family.</p>",
      location: "Dr Phillips YMCA",
      startsAt: new Date(now + 21 * day),
      endsAt: new Date(now + 21 * day + 3 * hour),
      capacity: 150,
      publishedAt: new Date(),
      createdById: admin.id,
    },
  ];
  for (const e of events) {
    await prisma.event.upsert({
      where: { slug: e.slug },
      update: {},
      create: e,
    });
  }

  const courses = [
    {
      slug: "purpose-leadership-demo",
      title: "Purpose & Leadership Development",
      body: "<p>10-week cohort that helps teens articulate their purpose and build leadership skills. Weekly reflection prompts inside.</p>",
    },
    {
      slug: "academic-career-demo",
      title: "Academic & Career Pathways",
      body: "<p>Pathways into college and early-career exploration. Mentor pairings the entire way through.</p>",
    },
  ];
  for (const c of courses) {
    await prisma.course.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        slug: c.slug,
        title: c.title,
        body: c.body,
        location: "Windermere",
        startsOn: new Date(now),
        weeks: 3,
        publishedAt: new Date(),
        createdById: admin.id,
        courseWeeks: {
          create: [1, 2, 3].map((n) => ({
            weekNo: n,
            title: `Week ${n}: Reflection`,
            body: `<p>Week ${n} prompt — what did you notice this week?</p>`,
            questions: [
              {
                id: `q${n}a`,
                prompt: "What did you learn this week?",
                type: "long",
              },
              {
                id: `q${n}b`,
                prompt: "One word that describes how you feel today",
                type: "short",
              },
            ] as unknown as Prisma.InputJsonValue,
          })),
        },
      },
    });
  }

  const posts = [1, 2, 3].map((i) => ({
    slug: `welcome-${i}-demo`,
    title: `ETU update #${i}`,
    excerpt: `A short note about what we've been up to (${i}).`,
    body: `<p>Lorem ipsum placeholder body for post ${i}.</p><p>Replace with real content.</p>`,
    authorId: admin.id,
    publishedAt: new Date(now - i * day),
  }));
  for (const p of posts) {
    await prisma.blogPost.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }

  const members = [
    {
      fullName: "Ivan M. Quiquia, MBA",
      roleTitle: "Chief Empowerment Officer",
      bio: "20+ years in education leadership. Founded our mentor pipeline with Orlando Health.",
      sortOrder: 1,
      published: true,
    },
    {
      fullName: "Evan Quiquia",
      roleTitle: "Founder & President",
      bio: "Empower Teens started as Evan's senior project. He still leads cohort design today.",
      sortOrder: 2,
      published: true,
    },
    {
      fullName: "Nicole Piña Fernandez",
      roleTitle: "Vice President",
      bio: "Oversees curriculum, outreach and our growing chapter at UCF.",
      sortOrder: 3,
      published: true,
    },
  ];
  for (const m of members) {
    const existing = await prisma.teamMember.findFirst({
      where: { fullName: m.fullName },
    });
    if (!existing) await prisma.teamMember.create({ data: m });
  }

  console.log(
    `Demo data seeded: ${events.length} events, ${courses.length} courses, ${posts.length} blog posts, ${members.length} team members.`,
  );
}

async function main() {
  await seedSettings();
  await seedDemo();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

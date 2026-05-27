import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client/client";

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

async function main() {
  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log(`Seeded ${settings.length} site settings`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

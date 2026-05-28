import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

loadEnv({ path: ".env.local" });
loadEnv();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Read via process.env (not prisma's `env()` helper) so `prisma generate`
    // in Vercel's postinstall doesn't throw when DIRECT_URL is absent — only
    // migrate/seed actually need it, and those run with the var set.
    url: process.env.DIRECT_URL ?? "",
  },
});

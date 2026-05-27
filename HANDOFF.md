# ETU Platform — Handoff

**Goal:** Replace the WordPress site for Empower Teens United with a custom Next.js platform. Friday demo: **2026-05-29 at 1pm with Ivan at Starbucks**.

**Current state:** Phase 0 (foundation) DONE on `master`. ~13 remaining sub-phases ahead. Run `git log --oneline` for the latest.

---

## Where to find things

| | Path |
|---|---|
| Full spec | `docs/superpowers/specs/2026-05-26-etu-platform-design.md` |
| Full implementation plan | `docs/superpowers/plans/2026-05-26-etu-platform.md` |
| Memory (auto-loaded) | `~/.claude/projects/C--Dev-websites-empowerteensunited/memory/` |
| Env secrets (gitignored) | `.env.local` |
| Next 16 docs (project-local) | `node_modules/next/dist/docs/` |

---

## Critical gotchas (read before touching code)

These will trip you up if you follow the plan verbatim — Phase 0's implementer hit them and adapted. Treat these as overrides to the plan:

1. **Prisma 7 is installed**, not Prisma 6.
   - Import client from `@/prisma/generated/client/client`, **NOT** `@prisma/client`. The plan's code uses the old path — swap on every import.
   - `datasource db` block in `schema.prisma` has only `provider = "postgresql"`. URL/directUrl live in `prisma.config.ts`.
   - `lib/prisma.ts` uses `PrismaPg` adapter. Don't reinstall stock `PrismaClient`.
   - **Seed config lives in `prisma.config.ts` under `migrations.seed`, NOT in `package.json` `"prisma"`.** Prisma 7 dropped the package.json hook. Wire it as `migrations: { seed: "tsx prisma/seed.ts" }`. `prisma/seed.ts` must `loadEnv({ path: ".env.local" })` itself and instantiate `PrismaClient` with `PrismaPg` against `DIRECT_URL` (same pattern as `lib/prisma.ts`).

2. **Next.js 16**, not 14/15.
   - File is `proxy.ts` at project root, NOT `middleware.ts`.
   - `cookies()`, `headers()`, `params`, `searchParams` are all **async** — always `await`.
   - Read `node_modules/next/dist/docs/` before guessing.

3. **Tailwind v4** — tokens defined in `app/globals.css` inside `@theme { ... }` block. No `tailwind.config.ts`.

4. **shadcn:** `toast` is deprecated; use `sonner` instead. Already installed.

5. **Vitest:** `tests/__mocks__/server-only.ts` stubs `server-only` so server-side libs can be imported in tests. Don't remove.

6. **Eslint:** `tests/**/*` has `no-explicit-any: off`. The plan's test code uses `any` heavily — leave it.

7. **Trigger migration** wraps DDL in `DO $$ ... IF EXISTS` to survive Prisma's shadow-DB validation. Don't unwrap it.

8. **PowerShell is default shell** on Windows. The Bash tool works for POSIX commands. For file moves (Phase 1), use PowerShell-native `Move-Item`.

9. **Package manager:** npm only. Never yarn/pnpm/bun.

10. **Branch:** stay on `master`. Don't create feature branches unless user asks.

---

## How to hand off to the next agent

Each phase below is one session's worth of work for a fresh agent. Hand off by:

1. **Open a fresh Claude session** in this repo
2. Tell it: *"Read HANDOFF.md and execute Phase N. Don't touch other phases. Commit per task and report when done."*
3. The new agent will read this file (auto-loaded via `CLAUDE.md` → `@HANDOFF.md`), then the relevant plan section
4. Verify their commits before moving to the next phase

---

## Phase breakdown

Each row: **plan section**, **deliverable**, **how to verify**, **rough size**.

### ✅ Phase 0 — Foundation (DONE)
Supabase clients, Prisma 7 schema + migrations, `handle_new_user` trigger, `lib/auth.ts` (tested), `proxy.ts`, Tailwind tokens, shadcn base. 7 commits on master ending at `424fcb1`.

### ✅ Phase 1 — Public site reorg (DONE)
Public pages moved into `app/(public)/`, Nav/Footer hoisted into `(public)/layout.tsx`, Nav uses `usePathname` for active state, `site_settings` seeded. 4 commits ending at `f3dbaa0`. Logo (Task 1.3) skipped — `public/logo.svg` not delivered yet; drop one in and update `EtuLockup` per plan when received.

### ✅ Phase 2 — Auth (DONE)
All of 2a + 2b shipped. `/sign-in`, `/sign-up`, `/sign-up/verify`, `/forgot-password`, `/reset-password`, `/sign-out`, `/invite/[token]`, `/me/profile`, `/admin/invitations`. Brand-styled `app/(auth)/_styles.ts` shared across every auth surface (also reused by the student/admin profile/invitations forms). Stub `app/(admin)/layout.tsx` exists and will be **replaced** by the full sidebar version in Task 3.5. First transactional email (`emails/InviteEmail.tsx` + `lib/email/transactional.ts`) plus `emails/_components/Brand.tsx` shared header/footer for all future templates. 7 commits ending at `44feab0`.

**Manual one-time setup needed before flows work end-to-end:**
- Supabase dashboard → **Authentication → URL Configuration**:
  - Site URL: `http://localhost:3000`
  - Allowed redirect URLs: `http://localhost:3000/sign-up/verify`, `http://localhost:3000/reset-password`
- `.env.local`: add `NEXT_PUBLIC_SITE_URL=http://localhost:3000` (already done locally; future env files need it too).
- To test admin features, promote one profile via Supabase SQL editor:
  ```sql
  UPDATE profiles SET role='admin' WHERE email='your-email';
  ```
- Dashboards at `/me`, `/mentor`, `/admin` index routes don't exist yet — they 404 after sign-in until Task 6.5. `/me/profile` and `/admin/invitations` do work today.

### Phase 3a — Events public + registration (~1.5h)
**Plan:** tasks 3.1, 3.2, 3.3, 3.4.
**Deliverable:** `/events` and `/events/[slug]` DB-backed, registration form, server action creates registration with QR token, Resend confirmation email with embedded QR, `/me/events` shows my registrations.
**Verify:** Seed an event via SQL, register for it, confirmation email arrives with QR. Check `/me/events` shows it.
**Watch out for:** `lib/email/transactional.ts` will gain more helpers in later phases — design the file to grow cleanly. The QR encodes a URL pointing to `NEXT_PUBLIC_SITE_URL/api/scan?t=<token>` — that endpoint doesn't exist yet (built in 3c), so the QR is dead-ended until then.

### Phase 3b — Admin events CRUD + funnel (~1h)
**Plan:** tasks 3.5, 3.6. (Task 3.5 also defines `app/(admin)/layout.tsx` — the admin shell with sidebar.)
**Deliverable:** Admin events list, new/edit pages, funnel page with conversion stats + CSV export + "email registrants/no-shows" buttons that route to `/admin/broadcasts/new?segment=...`.
**Verify:** Sign in as admin → `/admin/events` → create event → publish → register as a different user → funnel page shows the registration.
**Watch out for:** If Phase 2b stubbed `(admin)/layout.tsx`, replace it with the full sidebar version from Task 3.5.

### Phase 3c — QR scan (~30min)
**Plan:** task 3.7.
**Deliverable:** `/api/scan?t=<token>` records check-in idempotently and returns a styled HTML confirmation page. `/admin/scan` opens the device camera (html5-qrcode) for staff to scan attendee QR codes.
**Verify:** Open the registration email's QR on phone → scan with another phone signed in as admin via `/admin/scan` → check-in recorded → refresh funnel page, conversion ticks up.
**Watch out for:** Mobile camera APIs need HTTPS in production. On localhost it works without TLS. For demo on Vercel preview, also works (HTTPS automatic).

### Phase 4 — Courses + weekly reflection (~2h)
**Plan:** "Phase 4", tasks 4.1 – 4.4.
**Deliverable:** Public course list/detail, enroll route handler, `/me/courses/[slug]` weekly answer form, admin course CRUD with per-week prompt editor (JSON in textarea).
**Verify:** Admin creates course with 3 weeks and one question per week → publishes → student enrolls → answers week 1 → admin or mentor sees answer.
**Watch out for:** Course `weeks` field is the count (int); when creating a course, the action auto-generates that many `course_weeks` rows. Don't accept arbitrary user input for week structure.

### Phase 5 — Mentorship 3-form flow (~2h)
**Plan:** "Phase 5", tasks 5.1 – 5.4.
**Deliverable:** Form defs in `lib/forms/{intake,session,hs-plan}.ts`, `/me/mentorship` for students (intake + HS plan), `(mentor)/layout.tsx` + `/mentor` dashboard + `/mentor/students/[id]` for mentors, `/admin/mentorship` pairing grid + `/admin/mentorship/students/[id]` read-only view.
**Verify:** As admin, pair student with mentor. As student, submit intake. As mentor, see intake. Add a session form. As admin, see all three.
**Watch out for:** `MentorshipForm` unique constraint `(student_id, kind, session_no)` — for intake/hs_plan with `sessionNo: null`, Postgres treats nulls as distinct, so you can't use simple `upsert`. The plan handles this with a `submitOnceOnlyForm` helper that does findFirst → update or create. Use that pattern.

### Phase 6a — Blog + contact + team (~1h)
**Plan:** tasks 6.1, 6.2, 6.3, 6.4.
**Deliverable:** TipTap rich-text editor component, blog CRUD with editor, contact form public + admin inbox + email notifications, team CRUD + DB-backed about page.
**Verify:** Create a blog post with bold/headings/list → publish → see it on public `/blog`. Submit contact form → autoreply arrives → Ivan gets notification. Add team member → about page shows them.
**Watch out for:** TipTap is a client component — wrap with `"use client"`. Output stored as HTML string in DB and rendered with `dangerouslySetInnerHTML` on public pages. The plan's TipTap setup uses `immediatelyRender: false` (required for SSR safety).

### Phase 6b — Role landing dashboards (~30min)
**Plan:** task 6.5.
**Deliverable:** `app/(student)/me/page.tsx`, `app/(mentor)/mentor/profile/page.tsx`, `app/(admin)/admin/page.tsx`.
**Verify:** Each role signs in and lands on a real dashboard with stats, links, sign-out button.

### Phase 7 — Broadcast email (~2h)
**Plan:** "Phase 7", tasks 7.1 – 7.3.
**Deliverable:** Tested segment resolver, broadcast composer with audience picker, send pipeline (insert recipients → process via Resend batch send → mark sent), Vercel cron `/api/cron/send-campaign`, Resend webhook `/api/webhooks/resend`, `/unsubscribe?t=<token>` page.
**Verify:** As admin, send broadcast to "All students" → recipients see email → click unsubscribe → `profiles.email_unsubscribed = true`.
**Watch out for:** Add `CRON_SECRET=<random>` to `.env.local`. Vercel cron auth — see plan's Step 7.7 note. Resend webhook signing is deferred (set comment, not TODO).

### Phase 8 — Deploy + demo seed (~1h)
**Plan:** "Phase 8", tasks 8.1 – 8.3.
**Deliverable:** Demo data seed gated by `SEED_DEMO=1`, Vercel project deployed, `vercel.json` cron config, Playwright smoke test.
**Verify:** Walk the full demo flow on the Vercel preview URL — home → register for event → email arrives → admin scans QR → funnel updates → send broadcast → mentor sees student.
**Watch out for:** Update Vercel env vars including `NEXT_PUBLIC_SITE_URL` to the assigned `*.vercel.app` URL. Update Supabase auth → URL Configuration to allow the Vercel domain.

---

## When something breaks

- **`npm run build` fails:** likely Prisma client import path. Should be `@/prisma/generated/client/client`, not `@prisma/client`.
- **`npm run test` fails on server-only:** the stub at `tests/__mocks__/server-only.ts` should already handle it; check `vitest.config.ts` alias.
- **Prisma migration fails:** check `.env.local` `DATABASE_URL` and `DIRECT_URL` — region should be `aws-1-us-east-2`. Password is URL-encoded (`@` → `%40`).
- **Supabase auth emails not arriving:** check Supabase dashboard → Authentication → URL Configuration. Site URL and allowed redirects must match what the app is using.
- **Resend emails not arriving:** sender is `onboarding@resend.dev` for now (the DNS records for `empowerteensunited.org` are at Connected Digital and not yet swapped). Check Resend dashboard for delivery logs.

## When the next agent has questions about scope

Send them to:
1. The spec (`docs/superpowers/specs/2026-05-26-etu-platform-design.md`) for *what to build*
2. The plan (`docs/superpowers/plans/2026-05-26-etu-platform.md`) for *how to build it*
3. Memory files in `~/.claude/projects/C--Dev-websites-empowerteensunited/memory/` for *why we made these choices*

If the plan and reality disagree (like Prisma 7 vs Prisma 6), reality wins — document the new gotcha in this file under "Critical gotchas".

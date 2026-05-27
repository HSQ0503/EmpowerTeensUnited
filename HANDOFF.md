# ETU Platform — Handoff

**Goal:** Replace the WordPress site for Empower Teens United with a custom Next.js platform. Friday demo: **2026-05-29 at 1pm with Ivan at Starbucks**.

**Current state:** Phases 0–8 DONE on `master`. **All implementation work is complete.** Next step is the Vercel deploy + Friday demo dry-run — see Phase 8 manual setup checklist below. Run `git log --oneline` for the latest commits.

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
- After Phase 5: `/mentor` index exists (mentor's student list). `/me` and `/admin` index routes still 404 after sign-in until Task 6.5 builds the role landing dashboards.

### ✅ Phase 3a — Events public + registration (DONE)
Public `/events` list + `/events/[slug]` detail are DB-backed (Prisma `event.findMany` / `findUnique`, scoped to `publishedAt != null && archivedAt == null && startsAt >= now`). `lib/dates.ts` holds the date formatters. Registration: `/events/[slug]/register` form prefills from the signed-in profile, `actions.ts` creates the `EventRegistration` (auto-generates `qrToken` via Prisma default) and enforces capacity including guest count, then redirects to `/done`. `RegistrationConfirmation` react-email template sends through `lib/email/transactional.ts:sendRegistrationConfirmation` with an embedded PNG QR from `lib/qr.ts`. `/me/events` lists the student's registrations with per-row QR + check-in badge. 4 commits ending at `8a00c53`.

### ✅ Phase 3b — Admin events CRUD + funnel (DONE)
`app/(admin)/layout.tsx` rewritten from Phase 2 stub into the full 240px sidebar shell (11 sections, sticky aside, EtuLockup, sign-out at the bottom). Events CRUD at `/admin/events`, `/admin/events/new`, `/admin/events/[id]/edit` — new + edit share `_form.tsx`. `actions.ts` (`createEventAction`, `updateEventAction`, `archiveEventAction`) derives slug from title when blank and revalidates `/events`. Funnel at `/admin/events/[id]/registrations`: 4 stat cards (Registered / Guests / Checked-in / Conversion), action pills (CSV export, future broadcast targeting `/admin/broadcasts/new?segment=event_registrants:<id>`, "Open scanner"), and the registrations table. CSV streams via `/registrations/export/route.ts` using `lib/csv.ts`. 2 commits ending at `cd5a6f7`.

### ✅ Phase 3c — QR scan (DONE)
`/api/scan?t=<token>` looks up the registration, idempotently creates an `EventCheckin` (skips when one already exists), and returns a brand-styled HTML confirmation page (✓ checked in / ↻ already checked in / ? unknown QR / ! missing token / 403 wrong role). Unauthenticated callers redirect through `/sign-in?next=…` preserving the scan URL. `/admin/scan` dynamic-imports `html5-qrcode` (added to deps) and decodes via the rear camera, navigating to the decoded URL on hit. 1 commit at `43e8887`. **Reminder:** mobile camera APIs need HTTPS in production — works on localhost without TLS and on Vercel previews (HTTPS automatic).

### ✅ Phase 4 — Courses + weekly reflection (DONE)
Public `/courses` + `/courses/[slug]` DB-backed, weekly outline pulled from `course_weeks`. POST `/courses/[slug]/enroll` route handler (303 redirects) auth-gates, restricts to `role=student`, then upserts `Enrollment` on the `courseId_profileId` composite key — re-enrolls a previously-dropped student cleanly. Student surfaces: `/me/courses/[slug]` shows a progress bar + per-week checklist; `/me/courses/[slug]/week/[n]` renders the week body + dynamic short/long question form from the `CourseWeek.questions` JSON column. `submitWeekAnswersAction` upserts `LessonResponse` by `enrollmentId_weekId` and re-stamps `submittedAt` on every save, redirects back with `?saved=<weekNo>`. Admin `/admin/courses` list + `/new` + `/[id]/edit`: create action transactionally seeds N empty `courseWeek` rows; metadata form (shared via `_metadata-form.tsx`) hides the weeks input on edit to avoid orphaning rows; per-week prompt editor with pretty-printed questions JSON; archive in a danger zone. 4 commits ending at `3e6ba69`.

**Gotcha** for the next agent: Prisma 7 `Json` columns need `Prisma.InputJsonValue` casts (not `as any`). The `CourseLanguage` enum is re-exported from `@/prisma/generated/client/client`. The student layout still doesn't have a "Courses" nav link — students reach `/me/courses/[slug]` via the "Open my course" CTA on `/courses/[slug]` (added in 4.1). Phase 6b is the natural place to add a `/me` dashboard that lists active enrollments.

### ✅ Phase 5 — Mentorship 3-form flow (DONE)
Three form defs (`lib/forms/{types,intake,session,hs-plan}.ts`) drive every form on every surface; 5 vitest assertions pin shape (20-Q intake, unique ids, select options, slug-safe ids). Student `/me/mentorship` shows a pillar bar (mentor / intake / sessions), the 20-Q intake, read-only collapsible session notes, and the HS plan capstone. Mentor `/mentor` lists active assignments with status chips (intake done, sessions logged, last-session date) driven by one `groupBy` + one `distinct` query keyed by `studentId`. `/mentor/students/[id]` shows intake + session history + HS plan + course progress, and an inline "Log session N+1" form whose action enforces the mentor still owns the assignment then auto-increments `sessionNo`. Admin `/admin/mentorship` is the pairing grid (totals header, role-validated `assignMentorAction` upsert on `studentId` (which is `@unique`), workload-aware mentor dropdown labels, "End" column via `updateMany`). `/admin/mentorship/students/[id]` mirrors the mentor view read-only.

Shared infra introduced: `app/components/FormRenderer.tsx` + `app/components/FormAnswers.tsx` so any future form (broadcast composer, mentor profile, etc) can drop in. `(mentor)/layout.tsx` is the first mentor shell — top-nav with gold under-stripe to differentiate role. 4 commits ending at `8e04243`.

**Critical gotcha kept**: `MentorshipForm` has `@@unique([studentId, kind, sessionNo])`. Postgres treats NULL as distinct, so an `upsert` on that key with `sessionNo: null` would always insert. `submitOnceOnlyForm` in `app/(student)/me/mentorship/actions.ts` does `findFirst({ where: { sessionNo: null } })` → `update` or `create`. Mirror that pattern for any future once-only form.

### ✅ Phase 6a — Blog + contact + team (DONE)
`components/RichTextEditor.tsx` is a TipTap client editor (`immediatelyRender:false`, bold/italic/H2/H3/lists/blockquote/link/image) that emits HTML through a hidden `<input name={name}>` so it composes with existing server-action forms. Public `/blog` + `/blog/[slug]` are Prisma-backed server components retaining the `PageHero` brand chrome; `/admin/blog` mirrors the events table (status pill, danger-zone archive) and `_form.tsx` shares the editor between new/edit. `/contact` is a brand-styled server-action form that writes `ContactMessage` and fans out `sendContactAdminNotice` + `sendContactAutoreply` (both new react-email templates sharing `emails/_components/Brand.tsx`). `ETU_TEAM_INBOX` overrides the default `info@empowerteensunited.org`. Admin inbox at `/admin/contact` lists messages with status pills; `/admin/contact/[id]` is the per-message detail with `Mark replied / Archive / Re-open` form actions and a `mailto:` reply button. `/admin/team` is a single-page CRUD (add form + inline edit/delete per row). `/about` was split into a server `page.tsx` (Prisma `teamMember.findMany({ published, orderBy: sortOrder })`) and `_AboutClient.tsx` (keeps all motion + i18n chrome, renders the team grid from props with a brand-gradient placeholder when `photoUrl` is null). 4 commits ending at `51a7fae`.

**Gotcha kept:** modern Resend SDK uses camelCase `replyTo` — the plan's `reply_to` would type-error. About is split into `page.tsx` (server) + `_AboutClient.tsx` (client) because the existing motion/`useLang` shell can't call Prisma directly; same pattern applies to any "use client" public page that needs DB data — wrap, don't rewrite.

### ✅ Phase 6b — Role landing dashboards (DONE)
Student `/me` is a 2-column dashboard: navy gradient hero with time-of-day greeting + 4 summary pills (mentor / intake / active-courses / upcoming-events), then **Continue learning** (per-enrollment progress bars driven by `responses.submittedAt vs course.weeks`), **Upcoming events** (date block + check-in pill), **Mentorship** (mentor contact + intake/HS plan status rows), **Profile snapshot**, and a **Quick links** rail. All five user-facing CTAs route to existing pages. Student layout nav now includes Courses (pointing at the public catalog so they can enroll).

Mentor `/mentor/profile` is the editor for firstName/lastName/phone/title/bio that mirrors the student profile editor's brand chrome; revalidates both `/mentor/profile` and `/mentor` so the layout's display name and "currently mentoring N students" chip stay fresh. The Profile link is restored in `(mentor)/layout.tsx` nav now that the page exists.

Admin `/admin` is hero + 4-card KPI row (today's check-ins, week registrations, active enrollments, pending invites — backed by `Promise.all` across 11 counts), Action Items (unanswered messages, unpaired students, draft broadcasts, sending campaigns — each tone-coded based on count), Quick Actions (create event, send broadcast, invite mentor, open scanner), and a 3-column activity feed (upcoming events, recent registrations, recent messages) — each row deep-links into the relevant admin surface. 3 commits ending at `54c0d78`.

### ✅ Phase 7 — Broadcast email (DONE)
`lib/broadcasts/{types,resolve-segment}.ts` + `tests/lib/broadcasts/resolve-segment.test.ts` (10 vitest assertions) ship the segment resolver: all_students/mentors/parents, course_enrollees, event_registrants/attendees/no_shows, and explicit (mix of registrationIds + profileIds). Case-insensitive dedupe; honors `bannedAt` + `emailUnsubscribed`. `emails/BroadcastShell.tsx` wraps the body HTML with the brand header/footer and a per-recipient unsubscribe link.

Admin `/admin/broadcasts` list (status pills mapped over `CampaignStatus`), `/admin/broadcasts/new` (TipTap body, audience picker that prefills via `?segment=event_registrants:<id>` etc. — the link the events funnel already emits), `/admin/broadcasts/[id]` (per-status tally via `groupBy`, last-100 recipients, manual "send next batch" form for unblocking a stuck queue). `createAndSendCampaignAction` resolves recipients, snapshots `EmailRecipient` rows in one nested write, sets the campaign to `sending`, and synchronously drains the first 100-recipient batch so the admin sees immediate progress before redirecting.

`lib/broadcasts/send-batch.ts` renders `BroadcastShell` per recipient with `unsubscribeUrl = ${SITE_URL}/unsubscribe?t=${recipient.id}`, stamps `resendMessageId` on success, and marks sends that throw as `bounced` (the `RecipientStatus` enum has no `failed` — bounced stops the retry loop). When the queue drains to zero, the campaign flips to `sent`. `/api/cron/send-campaign` accepts GET or POST authenticated by `Authorization: Bearer ${CRON_SECRET}` or `?secret=${CRON_SECRET}` (Vercel Cron uses the query form); `proxy.ts` already excludes `/api/cron` and `/api/webhooks` from auth gating.

`/api/webhooks/resend` maps Resend's `email.{delivered,opened,clicked,bounced,complained}` events onto `EmailRecipient.status` by `resendMessageId`. On bounce/complaint it sets `Profile.emailUnsubscribed = true` and adds the address to `UnsubscribedEmail`. **Signature verification is deferred** — a comment marks the wrap point for when `RESEND_WEBHOOK_SECRET` lands on the dashboard. `/unsubscribe?t=<recipientId>` flips the same two columns and renders brand-styled success / unknown-link / missing-token states. 3 commits ending at `ec648fd`.

**Manual setup before sending broadcasts:**
- Add `CRON_SECRET=<random>` to `.env.local`.
- Phase 8 will wire `vercel.json` with `{ crons: [{ path: "/api/cron/send-campaign?secret=${CRON_SECRET}", schedule: "* * * * *" }] }` so the queue drains every minute.

### ✅ Phase 8 — Deploy + demo seed (DONE)
`prisma/seed.ts` extended with a `seedDemo()` block gated on `SEED_DEMO=1` that idempotently upserts 3 events (Rollins / Breaking Thru / Miles To Go), 2 courses with 3 weeks of typed reflection questions each, 3 blog posts, and 3 team members. Skips cleanly when there is no admin profile yet. `next.config.ts` allows `images.unsplash.com` and the project's `*.supabase.co` host for `next/image`. `vercel.json` schedules `/api/cron/send-campaign` every 5 minutes — the cron route already accepts Vercel's auto-injected `Authorization: Bearer $CRON_SECRET`, so no secret in the JSON. `playwright.config.ts` + `tests/e2e/smoke.spec.ts` cover home chrome, sign-in, anon-admin redirect, events list, and the contact form. 3 commits ending at `f1a7dd2`.

**Manual setup to ship for Friday:**
1. **Seed demo data** (after promoting your profile to `role=admin`):
   ```powershell
   $env:SEED_DEMO="1"; npx prisma db seed; Remove-Item Env:SEED_DEMO
   ```
2. **Install Playwright chromium** once, then run the smoke spec:
   ```bash
   npx playwright install chromium
   npm run test:e2e
   ```
3. **Deploy to Vercel.** Import the GitHub repo, framework preset = Next.js. Add env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `DATABASE_URL`, `DIRECT_URL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NEXT_PUBLIC_SITE_URL=https://<your>.vercel.app`, `CRON_SECRET=<long random>`, optional `ETU_TEAM_INBOX`. Deploy.
4. **Update Supabase auth → URL Configuration** to include the Vercel domain as both Site URL and allowed redirect for `/sign-up/verify` and `/reset-password`.
5. **Update `NEXT_PUBLIC_SITE_URL`** to the live Vercel URL and redeploy so Supabase email links and QR scan URLs resolve.
6. **Add the Resend webhook** in the Resend dashboard pointing at `https://<your>.vercel.app/api/webhooks/resend`. Signing remains deferred — comment marks the wrap point inside the route.

**Demo dry-run** (per the plan):
home → register for an event → email lands with QR → admin scans → funnel updates → send a broadcast to "All students" → recipient sees it → click unsubscribe.

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

# ETU Platform — Zero to Hero Guide

Everything you need to understand, run, and operate the Empower Teens United platform. For the build history and phase-by-phase gotchas, see [HANDOFF.md](../HANDOFF.md).

---

## 1. What this is

A custom Next.js platform that replaces ETU's WordPress site. One codebase serves four audiences:

| Audience | Entry | What they get |
|---|---|---|
| Public | `/` | Home, events, courses, blog, about, contact |
| Students | `/me` | Dashboard, event QR tickets, course reflections, mentorship forms |
| Mentors | `/mentor` | Assigned students, session logging, QR scanner |
| Admins | `/admin` | Full console: events, courses, mentorship pairing, blog, contact inbox, broadcasts, users, invitations, team, scanner |

## 2. Tech stack

- **Next.js 16** (App Router) — note: `proxy.ts` at the root replaces `middleware.ts`, and `cookies()`, `headers()`, `params`, `searchParams` are all **async**. Project-local docs live in `node_modules/next/dist/docs/`.
- **React 19 + TypeScript**, Tailwind v4 (tokens in `app/globals.css` under `@theme` — there is no `tailwind.config.ts`)
- **Prisma 7** → **Supabase Postgres**, via the `PrismaPg` driver adapter
- **Supabase Auth** for identity (email/password + email verification)
- **Resend + react-email** for all outgoing mail
- **TipTap** rich-text editor (blog posts, broadcast bodies)
- `html5-qrcode` (camera scanning) + `qrcode` (PNG generation for tickets)
- **Vitest** (unit) + **Playwright** (e2e smoke)

Package manager is **npm** only.

## 3. Running locally

```bash
npm install            # postinstall runs `prisma generate`
npm run dev            # http://localhost:3000
```

Other commands:

```bash
npm run lint           # eslint
npm run build          # production build (also the TypeScript check)
npm run test           # vitest unit tests
npm run test:e2e       # playwright smoke tests (needs `npx playwright install chromium` once)
npx prisma migrate dev # apply schema changes
npx prisma db seed     # seed site settings; SEED_DEMO=1 adds demo events/courses/posts/team
```

Env vars live in `.env` (gitignored). Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `DATABASE_URL` (pooled, port 6543), `DIRECT_URL` (direct, port 5432), `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NEXT_PUBLIC_SITE_URL`, `CRON_SECRET`. Optional: `ETU_TEAM_INBOX`, `BLOB_READ_WRITE_TOKEN`.

## 4. Directory map

```
proxy.ts                  Auth gate: /admin, /mentor, /me require a session
prisma/
  schema.prisma           18 models, all @@map'd to snake_case tables
  generated/client/       Generated Prisma client — import from @/prisma/generated/client/client
  migrations/             init + handle_new_user trigger
  seed.ts                 Site settings + optional demo data
prisma.config.ts          Prisma 7 config (datasource URL, seed command)
app/
  (public)/               Marketing site; layout has the Nav + Footer
  (auth)/                 Sign-in/up/verify, forgot/reset password, invite/[token]
  (student)/me/           Student portal
  (mentor)/mentor/        Mentor portal (top-nav layout)
  (admin)/admin/          Admin console (240px sidebar layout)
  api/
    scan/                 QR check-in endpoint (GET ?t=<qrToken>)
    cron/send-campaign/   Drains the broadcast queue (Vercel cron, every 5 min)
    webhooks/resend/      Delivery/open/click/bounce events → EmailRecipient status
    upload/               Image upload (Vercel Blob)
  components/             Shared UI (FormRenderer, QrScanner, Logo, tokens, motion)
lib/
  prisma.ts               Singleton PrismaClient with PrismaPg adapter
  auth.ts                 getOptionalUser / requireRole / requireRoleOrRedirect
  email/transactional.ts  All one-off email sends (invite, registration, contact…)
  broadcasts/             Segment resolver + batch sender
  forms/                  Mentorship form definitions (intake, session, hs-plan)
  csv.ts / qr.ts / dates.ts
utils/supabase/           Supabase clients (server, client, admin, proxy)
emails/                   react-email templates; _components/Brand.tsx = shared chrome
components/               RichTextEditor (TipTap) + shadcn ui/
tests/                    vitest unit + e2e/smoke.spec.ts
```

## 5. Auth & roles — how access control works

1. **Sign-up** creates a Supabase auth user; the `handle_new_user` Postgres trigger auto-inserts a `profiles` row with `role = 'student'`.
2. **`proxy.ts`** redirects unauthenticated visitors of `/admin`, `/mentor`, `/me` to `/sign-in?next=…`. It does *not* check roles.
3. **Layouts** enforce roles: each portal layout calls `requireRoleOrRedirect(role)` — wrong-role users get bounced to their own home.
4. **Server actions and route handlers** each re-check with `requireRole(...)`, so mutations are safe even if a layout is bypassed.

Roles: `student` (default), `mentor`, `admin`. Mentors and admins are created by **invitation** (`/admin/invitations` → email with `/invite/[token]` link), or by editing a role at `/admin/users`. To bootstrap the first admin, run in the Supabase SQL editor:

```sql
UPDATE profiles SET role='admin' WHERE email='you@example.com';
```

## 6. Feature guides

### Events (the flagship flow)

1. **Create** — `/admin/events/new`. Leave slug blank to derive it from the title. Set `publishedAt` to make it public; capacity is optional.
2. **Public** — published, non-archived, future events appear at `/events`; detail page shows a seats-left bar.
3. **Register** — `/events/<slug>/register`. Prefills from the signed-in profile (anonymous registration also works). The action re-checks capacity (guests count), creates an `EventRegistration` with an auto-generated `qrToken`, and emails a confirmation with an embedded QR code.
4. **The QR** encodes `<SITE_URL>/api/scan?t=<qrToken>`. Students can also re-see their QRs at `/me/events`.
5. **Check-in at the door** — admin opens `/admin/scan` (mentors: `/mentor/scan`), points the camera at the attendee's QR. The scan endpoint creates the `EventCheckin` idempotently — double scans show "Already checked in", never a duplicate. Camera requires HTTPS in production (fine on Vercel; fine on localhost).
6. **Funnel** — `/admin/events/<id>/registrations`: Registered / Guests / Checked-in / Conversion cards, the full table, **Export CSV**, and one-click broadcast prefills for "Email registrants" and "Email no-shows".

### Courses & weekly reflections

- Admin: `/admin/courses/new` creates the course **and** N empty weeks in one transaction. Each week has a rich-text lesson body and a visual question builder (add / remove / reorder, short-answer or paragraph). Weeks can be **added** any time; the **last** week can be deleted as long as no student has submitted answers for it. Courses can be **duplicated as a draft** (handy for new cohorts) and archived courses can be **restored** from the bottom of the course list.
- Students enroll via the button on `/courses/<slug>` (POST to `/courses/<slug>/enroll`; re-enrolling after dropping works).
- Student experience: `/me/courses/<slug>` shows progress; `/me/courses/<slug>/week/<n>` renders the week body plus the question form. Answers upsert — saving again overwrites and re-stamps `submittedAt`.

### Mentorship

Three form types drive everything (`lib/forms/`): a 20-question **intake**, repeatable **session notes**, and an **HS plan** capstone.

- Admin pairs students ↔ mentors at `/admin/mentorship` (one active mentor per student, enforced by a unique constraint). Workload shows in the mentor dropdown.
- Student fills intake + HS plan at `/me/mentorship` (each once-only), and reads session notes there.
- Mentor sees their roster at `/mentor`, opens a student, and logs "Session N+1" inline — session numbers auto-increment.
- Admin can read any student's full history at `/admin/mentorship/students/<id>`.

### Blog

`/admin/blog` — TipTap editor, same publish/archive model as events. Public at `/blog` and `/blog/<slug>`.

### Contact

Public form at `/contact` writes a `ContactMessage` and sends two emails: a notice to the team inbox and an auto-reply to the sender. Bot spam is filtered by a hidden honeypot field plus a minimum-fill-time check — filtered submissions are silently dropped. Admin triages at `/admin/contact` (new → replied → archived) with per-row quick-archive and an "Archive all new" bulk action; the sidebar shows a badge with the new-message count.

### Broadcasts (bulk email)

1. `/admin/broadcasts/new` — pick an audience segment (all students / mentors / parents, course enrollees, event registrants / attendees / no-shows), write the body in TipTap, send.
2. Sending **snapshots** recipients into `EmailRecipient` rows (case-insensitive dedupe; skips banned + unsubscribed), drains the first 100 immediately, then the Vercel cron (`/api/cron/send-campaign`, every 5 min) drains the rest.
3. Every email gets a per-recipient unsubscribe link (`/unsubscribe?t=<recipientId>`).
4. The Resend webhook (`/api/webhooks/resend`) updates per-recipient status (delivered/opened/clicked/bounced/complained); bounces and complaints auto-unsubscribe the profile.
5. Campaign detail page shows per-status tallies and a manual "send next batch" button for unblocking a stuck queue.
6. **Test mode**: while `RESEND_FROM_EMAIL` is the sandbox `onboarding@resend.dev`, Resend only delivers to the account owner's inbox — the broadcast pages show a red banner until `empowerteensunited.org` is verified in Resend and the sender is switched.

### Users, invitations, team

- `/admin/users` — change anyone's role.
- `/admin/invitations` — invite mentors/admins by email; they redeem via the emailed `/invite/<token>` link.
- `/admin/team` — CRUD for the About-page team grid.

## 7. Email — who sends what, from where

All mail goes through Resend (`lib/email/transactional.ts` and `lib/broadcasts/send-batch.ts`).

- **Sender**: `RESEND_FROM_EMAIL` — currently `onboarding@resend.dev` (the ETU domain's DNS isn't verified in Resend yet; swap once it is).
- **Team inbox** (receives contact-form notices): `ETU_TEAM_INBOX`, defaulting to `info@empowerteensunited.org`.
- **Supabase auth emails** (verify, password reset) are sent by Supabase itself, configured in the Supabase dashboard.

Templates live in `emails/` and share `emails/_components/Brand.tsx`. Preview any of them with `npx react-email dev` if needed.

## 8. Database

Supabase Postgres. Prisma is the only data layer — Supabase is used for auth, not for queries.

- **Connections**: runtime uses `DATABASE_URL` (pgbouncer pooler, port 6543); migrations and seeds use `DIRECT_URL` (port 5432).
- **Import path**: always `import { prisma } from "@/lib/prisma"`; types/enums from `@/prisma/generated/client`. Never `@prisma/client`.
- **Key models**: `Profile` (hub, mirrors Supabase auth users), `Event` → `EventRegistration` → `EventCheckin` (1:1), `Course` → `CourseWeek` → `Enrollment` → `LessonResponse`, `MentorAssignment` (unique per student), `MentorshipForm` (unique `[studentId, kind, sessionNo]`), `BlogPost`, `ContactMessage`, `TeamMember`, `EmailCampaign` → `EmailRecipient`, `UnsubscribedEmail`, `SiteSetting`, `Invitation`.
- **Gotcha**: Postgres treats NULLs as distinct in unique constraints, so once-only forms (`sessionNo: null`) use find-then-update instead of upsert — mirror that pattern for any future once-only form.
- Schema change workflow: edit `schema.prisma` → `npx prisma migrate dev --name <what_changed>` → client regenerates automatically.

## 9. Deploy (Vercel)

Already scripted in `vercel.json` (cron) and `next.config.ts` (image hosts). The checklist:

1. Import the GitHub repo into Vercel (framework: Next.js) and add every env var from §3, with `NEXT_PUBLIC_SITE_URL` set to the live URL.
2. In Supabase → Authentication → URL Configuration, add the Vercel domain as Site URL and allow `/sign-up/verify` and `/reset-password` redirects.
3. Add the Resend webhook pointing at `https://<domain>/api/webhooks/resend`.
4. Seed demo data if wanted: `SEED_DEMO=1 npx prisma db seed` (requires an admin profile to exist first).

## 10. Conventions for future work

- Server components by default; `"use client"` only for interactivity, wrapped as `_Client.tsx` next to a server `page.tsx` when the page also needs DB data.
- One `actions.ts` per route folder; every action starts with a `requireRole` check and ends with `revalidatePath` for each affected page.
- Shared `_form.tsx` between `new` and `[id]/edit` pages.
- Prisma `Json` columns take `Prisma.InputJsonValue` casts, not `as any`.
- Brand styling comes from `app/components/tokens.ts` (`A.*`) and, for auth-style forms, `app/(auth)/_styles.ts`.
- Before committing: `npm run lint` and `npm run build`.

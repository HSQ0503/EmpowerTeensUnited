# Empower Teens United — Platform Design Spec

**Date**: 2026-05-26
**Author**: Han (with Ivan as product stakeholder)
**Status**: Approved through brainstorming; ready for implementation planning
**Demo deadline**: 2026-05-29 (Fri) 1:00 PM, Starbucks

## 1. Context

Empower Teens United (ETU) is a nonprofit running mentorship, leadership, and emotional-wellness programs for teens. Their existing WordPress site cannot handle the workflows they actually need: course enrollment and weekly engagement, event registration with check-in tracking, the three-form 1-on-1 mentorship process, and broadcast email with audience segmentation. This spec replaces that site with a custom Next.js 16 + Supabase + Prisma + Resend platform.

**Guiding principle quoted from Ivan**: "The technology should work for us, not the other way around." Every admin surface must be self-explanatory, every destructive action reversible, and every list exportable to CSV as a fallback.

## 2. Stakeholders

- **Ivan** — Executive Director. Primary admin user. Will train a UCF IT intern to assist.
- **Han (Shouqi Han)** — Founding builder. Maintains through May 2027, then hands off to a high-school successor or makes the platform self-sustaining.
- **Mentors** — Adult volunteers paired 1-on-1 with students.
- **Students** — Teens 14–18 enrolling in programs and attending events.
- **Connected Digital** (Patricia, Diego) — Current WordPress vendor. Holds the domain until handover after Ivan approves the new site.

## 3. Locked decisions

| Topic | Decision |
|---|---|
| Stack | Next.js 16.2 App Router, React 19, TypeScript 5, Tailwind v4 |
| Auth + DB | Supabase Auth + Postgres |
| ORM | Prisma (Han's preference) |
| Email | Resend + React Email |
| File storage | Supabase Storage |
| WordPress migration | None — start fresh |
| Course structure | Weekly reflection prompts authored by admin; students answer in-platform |
| Event check-in | Unique QR per registrant, emailed in confirmation, scanned by mentor/admin |
| Donations | External link in nav (no in-platform Stripe) |
| Brand assets | Real logo provided by Ivan; Unsplash placeholders for everything else |
| Mentor + admin accounts | Invite-only via email magic link |
| Student accounts | Open signup + email verification |
| Broadcast model | DB-driven segments, not Resend Audiences |
| Blog editor | TipTap rich text |
| Architecture | Monolithic Next.js with route groups: `(public)`, `(student)`, `(mentor)`, `(admin)` |

## 4. Data model

13 Prisma tables.

### 4.1 Identity

```
profiles                       joins to Supabase auth.users.id
  id              uuid pk
  role            enum(admin, mentor, student)
  first_name      text
  last_name       text
  email           text   (denormalized from auth for convenience)
  phone           text?
  avatar_url      text?
  grade           int?         student-only, 7..12
  school          text?        student-only
  parent_email    text?        student-only
  parent_phone    text?        student-only
  title           text?        mentor-only ("Volunteer Mentor — Engineering")
  bio             text?        mentor-only
  email_unsubscribed bool default false
  banned_at       timestamptz?
  created_at      timestamptz default now()
  updated_at      timestamptz

invitations                    pending mentor/admin invites
  id              uuid pk
  email           text
  role            enum(admin, mentor)
  token           uuid unique
  invited_by_id   uuid fk -> profiles.id
  invited_at      timestamptz default now()
  expires_at      timestamptz default (now() + interval '14 days')
  accepted_at     timestamptz?
  revoked_at      timestamptz?
```

A Supabase Postgres trigger `handle_new_user()` runs on insert into `auth.users` and creates a default `profiles` row (`role = 'student'`). Mentor/admin invites override the role via service-role insert during invite acceptance.

### 4.2 Events funnel

```
events
  id              uuid pk
  slug            text unique
  title           text
  body            text          rich html
  cover_image_url text?
  location        text
  starts_at       timestamptz
  ends_at         timestamptz
  capacity        int?
  published_at    timestamptz?
  archived_at     timestamptz?  soft delete
  created_by_id   uuid fk -> profiles.id

event_registrations            funnel step 1
  id              uuid pk
  event_id        uuid fk
  profile_id      uuid fk?      nullable if registrant has no account
  name            text
  grade           int?
  guest_count     int default 0
  guest_names     text[]?
  email           text
  phone           text?
  qr_token        uuid unique
  status          enum(registered, cancelled) default registered
  registered_at   timestamptz default now()

event_checkins                 funnel step 2
  id              uuid pk
  registration_id uuid fk unique
  checked_in_at   timestamptz default now()
  checked_in_by_id uuid fk -> profiles.id
```

Conversion = `count(checkins) / count(registrations where status = registered)`.

### 4.3 Courses + weekly reflection

```
courses
  id              uuid pk
  slug            text unique
  title           text
  body            text          rich html (marketing description)
  cover_image_url text?
  starts_on       date
  weeks           int
  location        text
  age_min         int default 14
  age_max         int default 18
  language        enum(en, es, both) default en
  cohort_cap      int?
  certificate     bool default true
  published_at    timestamptz?
  archived_at     timestamptz?
  created_by_id   uuid fk -> profiles.id

course_weeks
  id              uuid pk
  course_id       uuid fk
  week_no         int          unique (course_id, week_no)
  title           text
  body            text          rich html (this week's content)
  questions       jsonb         [{id: "q1", prompt: "...", type: "short"|"long"}]

enrollments
  id              uuid pk
  course_id       uuid fk
  profile_id      uuid fk
  status          enum(active, completed, dropped) default active
  enrolled_at     timestamptz default now()
  unique (course_id, profile_id)

lesson_responses
  id              uuid pk
  enrollment_id   uuid fk
  week_id         uuid fk
  answers         jsonb         { "q1": "answer text", "q2": "..." }
  submitted_at    timestamptz?
  updated_at      timestamptz
  unique (enrollment_id, week_id)
```

### 4.4 Mentorship

```
mentor_assignments
  id              uuid pk
  mentor_id       uuid fk -> profiles.id (role=mentor)
  student_id      uuid fk -> profiles.id (role=student)
  started_at      timestamptz default now()
  ended_at        timestamptz?
  notes           text?

mentorship_forms               the three forms
  id              uuid pk
  student_id      uuid fk
  mentor_id       uuid fk?     null on kind=intake before pairing
  kind            enum(intake, session, hs_plan)
  session_no      int?         only on kind=session
  answers         jsonb        { question_id: response_text }
  submitted_by_id uuid fk -> profiles.id
  submitted_at    timestamptz?
  updated_at      timestamptz
  unique (student_id, kind, session_no)  -- enforces 1 intake, 1 hs_plan, N sessions per student
```

**Form definitions live in code, not DB** (`lib/forms/intake.ts`, `session.ts`, `hs_plan.ts`) — each exports a typed `FormDefinition = { version: number, questions: Question[] }` constant. Answers are jsonb keyed by question id. This lets Ivan/Han evolve question wording via PR without DB migrations. Answers also store the `form_version` they were submitted against so we can render historical responses correctly even after questions change.

**`session_no` assignment**: server sets it at submit time as `max(session_no) + 1` for the (student, kind=session) tuple, inside a transaction. Mentor doesn't pick the number.

### 4.5 Content + ops

```
blog_posts
  id, slug unique, title, excerpt, body (rich), cover_image_url
  author_id fk profiles.id
  published_at?, archived_at?, created_at, updated_at

contact_messages
  id, name, email, phone?, subject, message
  status enum(new, replied, archived) default new
  submitted_at, replied_at?, replied_by_id fk profiles.id?

team_members
  id, full_name, role_title, bio, photo_url
  sort_order int, published bool default true

email_campaigns                broadcast emails
  id, subject, body_html, body_text, sender
  segment_filter jsonb         { role: "student" } or { event_id: "...", attended: true }
  status enum(draft, scheduled, sending, sent, failed)
  scheduled_at?, sent_at?, recipient_count int
  created_by_id fk profiles.id

email_recipients               per-recipient delivery tracking
  id, campaign_id fk, profile_id fk?, email, name?
  status enum(queued, sent, delivered, bounced, opened, clicked, complained)
  resend_message_id?, sent_at?, last_event_at?

unsubscribed_emails            for non-account recipients
  email pk, unsubscribed_at

site_settings                  misc key-value
  key text pk, value jsonb     org socials, footer copy, hero copy
```

### 4.6 Authorization model

- **Authorization lives in server code, not RLS.** Prisma queries connect with the postgres superuser and bypass RLS by design. All access checks happen in server actions and route handlers via `lib/auth.ts`. RLS is *not* a primary security boundary.
- **No client-component DB queries.** Every read or write in the authenticated surfaces goes through a server action or route handler. The Supabase JS client in the browser is used only for `signIn` / `signOut` / `getSession` — never for `from('table').select()`.
- **Defense-in-depth RLS**: every table starts with a deny-all policy. We then add narrow grants for the `authenticated` role: read-own-row on `profiles`, read-own on `lesson_responses` / `mentorship_forms` (where `student_id = auth.uid()`), public read on `published_at IS NOT NULL` for blog/events/courses/team. This is a safety net for the "publishable key leaked and someone tries to query directly" case; it does not replace server-side auth checks.

## 5. Auth flows

### Student signup (`/sign-up`)
1. Form: first/last name, email, password, grade, school, parent email/phone (optional)
2. Server action: `supabase.auth.signUp(email, password, { emailRedirectTo: '/sign-up/verify' })`
3. Supabase sends verification email (HTML customized in Supabase dashboard)
4. Student clicks link → `/sign-up/verify` → trigger has already created `profiles` row with `role='student'`
5. Auto-signed-in, redirected to `/me`

### Mentor/admin invite (`/admin/invitations` → `/invite/[token]`)
1. Admin enters email + role, server action inserts `invitations` row with random token + 14-day expiry
2. Invite email sent via Resend with `https://empowerteensunited.org/invite/<token>` link
3. Recipient lands, enters first/last name + password
4. Server action (using `SUPABASE_SECRET_KEY`):
   - `supabase.auth.admin.createUser({ email, password, email_confirm: true })`
   - The `handle_new_user` trigger fires and creates a default `profiles` row with `role='student'`
   - Server action then **updates** that row: `prisma.profile.update({ where: { id }, data: { role: invitedRole, first_name, last_name } })`
   - Marks `invitations.accepted_at`
5. Auto-signed-in → `/mentor` or `/admin`

### Sign-in (`/sign-in`)
Email + password via `supabase.auth.signInWithPassword()`. On success, server reads `profiles.role` and redirects: admin→`/admin`, mentor→`/mentor`, student→`/me`.

### Forgot/reset password
Standard Supabase magic-link reset flow on `/forgot-password` and `/reset-password`.

### Middleware (`app/middleware.ts`)
Runs on `/(admin|mentor|me)/:path*`. Refreshes Supabase session, fetches `profiles.role`, gates:
- No user → redirect `/sign-in?next=<path>`
- `banned_at` set → sign out + show "account suspended"
- Wrong role → 404 (not 403; don't leak existence of admin routes)

### Auth helpers (`lib/auth.ts`)
```ts
export async function requireUser(): Promise<{ user, profile }>
export async function requireRole(role: 'admin'|'mentor'|'student'): Promise<{ user, profile }>
export async function getOptionalUser(): Promise<{ user, profile } | null>
```

Every server action and route handler that mutates data starts with one of these.

## 6. Route map

```
PUBLIC
/                              Home (CMS-driven hero, news strip, programs grid, stats, partners)
/about                         About + team (admin-managed)
/courses                       Course list (filter by status/age/language)
/courses/[slug]                Course detail w/ Enroll CTA
/events                        Upcoming events (list + calendar toggle)
/events/[slug]                 Event detail w/ Register CTA
/blog                          Blog index (paginated)
/blog/[slug]                   Blog post
/contact                       Contact form
/unsubscribe                   Resolves token → marks email_unsubscribed

AUTH
/sign-in, /sign-up, /sign-up/verify
/invite/[token]
/forgot-password, /reset-password
/sign-out (POST)

STUDENT  (role=student)
/me                            Dashboard
/me/courses/[slug]             Week list + this-week answer form
/me/courses/[slug]/week/[n]    Answer this week's questions
/me/events                     My registrations w/ QR codes
/me/mentorship                 Intake form (fill once), session history, HS plan
/me/profile                    Edit profile + change password

MENTOR  (role=mentor)
/mentor                        My assigned students
/mentor/students/[id]          Profile, intake (read), sessions (fill), HS plan, course answers (read)
/mentor/profile

ADMIN  (role=admin)
/admin                         Dashboard w/ KPI strip + activity + tasks
/admin/users                   All users, role, ban, search
/admin/invitations             Pending invites + send new
/admin/events                  Events list
/admin/events/new
/admin/events/[id]/edit
/admin/events/[id]/registrations   Funnel + CSV + bulk email
/admin/scan                    QR scanner (mentors also have access)
/admin/courses
/admin/courses/new
/admin/courses/[id]/edit       Metadata + per-week prompts
/admin/courses/[id]/enrollments
/admin/mentorship              Pairing grid mentor ↔ student (drag to reassign)
/admin/mentorship/students/[id]   Full read of all 3 forms + course answers
/admin/blog
/admin/blog/new
/admin/blog/[id]/edit
/admin/contact                 Inbox
/admin/broadcasts
/admin/broadcasts/new          Composer
/admin/broadcasts/[id]         Sent campaign report
/admin/team                    Team CRUD
/admin/settings                Socials, footer, hero copy

API
/api/scan                      POST { qr_token } → check-in (role: admin|mentor)
/api/uploads                   POST file → Supabase Storage → public URL (role: admin)
/api/webhooks/resend           POST → updates email_recipients on Resend events
/api/cron/send-campaign        POST (CRON_SECRET) → batch send queued recipients
/api/cron/event-reminders      POST (CRON_SECRET) → T-24h reminders
```

## 7. Admin panel UX

- Single shared layout: left sidebar nav, top bar with name + sign-out, content area
- Tailwind tokens reflecting the navy/gold palette already in `tokens.ts`
- shadcn/ui as the primitive layer: Button, Input, Label, Select, Table, Dialog, Toast, Form, DataTable
- Every list page = filter + paginated table + bulk actions + CSV export
- Every create/edit page = single-column form, sticky save bar at bottom
- Inline toggles for "published" / "archived"
- Confirmation modal only for destructive actions
- Rich text: TipTap (headless, TS-first, outputs clean HTML)

### Admin dashboard (`/admin`)
KPI strip across top: today's check-ins · this-week registrations · active enrollments · pending invites. Below: two columns — recent activity feed (left), pending tasks (right; students with no mentor, unanswered contact messages, scheduled broadcasts going today).

### Event funnel (`/admin/events/[id]/registrations`) — Ivan's hero feature
```
Event: Rollins College Private Tour · Feb 15
+-----------------------------------------+
|  47 registered  ->  31 checked in       |
|         Conversion: 66%                 |
+-----------------------------------------+
Tabs: [ All 47 ]  [ Checked in 31 ]  [ No-show 16 ]
Table: Name | Grade | Guests | Email | Phone | QR | Checked-in at | Send email
Bottom: [ Export CSV ]  [ Email selected ]  [ Email no-shows ]
```
"Email selected" / "Email no-shows" packs the chosen registration IDs into a query param (`?segment=event_attendees:<id>&include=...`) and routes to `/admin/broadcasts/new`. The composer parses that and renders the audience picker pre-filled and locked to that explicit list, but lets admin edit subject/body before sending.

### Mentor student view (`/mentor/students/[id]`)
Accordion sections — Profile, 20-Q Intake (read-only), Session Forms (list + add), HS Plan, Course Answers (read-only across all enrolled courses).

## 8. Email pipeline

### Transactional templates (`emails/*.tsx`, React Email)

| Template | Trigger |
|---|---|
| `InviteEmail` | Admin sends mentor/admin invite |
| `RegistrationConfirmation` | Student registers for event; embeds inline QR code |
| `EventReminder` | Daily cron T-24h |
| `ContactReceived` | Auto-reply to contact form submitter |
| `ContactNotification` | Notify Ivan of new contact message |
| `BroadcastShell` | Wraps admin's body HTML in branded shell + unsubscribe footer |

Supabase's built-in emails (email verification, password reset) are styled in the Supabase dashboard.

### QR codes
On registration: server generates `qr_token = randomUUID()`, stores on `event_registrations`, embeds inline base64 PNG in the confirmation email via the `qrcode` npm package. QR encodes `https://empowerteensunited.org/api/scan?t=<token>`. Mentor scans on phone → browser hits that URL → server validates → records check-in (idempotent) → shows "✓ Checked in: Jane Doe (Grade 11) + 2 guests".

### Broadcast flow (Mailchimp replacement)

```
1. Admin composes in /admin/broadcasts/new:
   - Subject, body (TipTap)
   - Audience picker — DSL options:
       all students | all mentors | all parents (parent_email) |
       course enrollees (pick course) | event registrants (pick event) |
       event no-shows | event attendees | custom combination
   - Save draft / Schedule / Send now

2. Server action on Send:
   - Resolve segment to { email, name, profile_id? }[]
   - Insert email_campaigns row + N email_recipients (status=queued)
   - Push to send-campaign cron queue

3. /api/cron/send-campaign (every 5 min):
   - Pick next batch (up to 100; Resend's batch limit)
   - POST to Resend /emails/batch with React Email rendered HTML
   - Update each recipient status=sent + resend_message_id

4. /api/webhooks/resend (delivery events):
   - Verify signature with RESEND_WEBHOOK_SECRET
   - delivered / opened / clicked / bounced / complained
   - On complained → set profiles.email_unsubscribed = true
```

### Unsubscribe
Every broadcast footer has `/unsubscribe?t=<token>`. Click marks the profile (or `unsubscribed_emails` for non-account recipients). All future broadcast sends filter out unsubscribed addresses. Transactional emails ignore unsubscribe. CAN-SPAM compliant.

## 9. File storage

Single Supabase Storage bucket `etu-public`, publicly readable, admin-writable. Folders: `events/`, `blog/`, `courses/`, `team/`, `avatars/`. Upload via `/api/uploads` — server checks role, uploads with `SUPABASE_SECRET_KEY`, returns public URL. Max 5 MB per file. Next 16 `<Image>` handles responsive sizing on the public site.

## 10. Deployment

### Vercel
- Free tier
- Auto-deploy from `main`
- Preview deploys per PR
- Env vars set in Vercel UI mirroring `.env.local`
- `next.config.ts` images domains: `images.unsplash.com`, `<project>.supabase.co`

### Cron (Vercel Cron)
- `/api/cron/send-campaign` every 5 min — process queued broadcast batches
- `/api/cron/event-reminders` daily 09:00 — T-24h reminders

### Domain (`empowerteensunited.org`)
- **Friday demo**: Vercel preview URL (e.g., `empower-teens-united.vercel.app`)
- **Post-approval**: Han meets Patricia/Diego → transfer registrar or point DNS at Vercel → add `empowerteensunited.org` + `www` to Vercel project → TLS auto-issued → Resend DNS records (SPF/DKIM/DMARC) added in same change → WordPress kept live until cutover completes (zero downtime)

### Resend domain (deferred)
For Friday demo: `onboarding@resend.dev` sender (already in `.env.local`).
After domain handover, add SPF/DKIM/DMARC to DNS, verify in Resend, swap to `noreply@empowerteensunited.org`.

### Environments
Single shared Supabase project for v1 (covers local + preview + prod). Splitting prod/staging DBs is post-MVP. Local dev connects to the same Supabase project via `.env.local`; we use a `dev_` prefix on seeded data so it's easy to filter out.

### Backups
Supabase free tier daily auto-backups, 7-day retention. Upgrade to Pro when real student data accumulates.

### Monitoring
Vercel logs + Supabase + Resend dashboards. Sentry deferred.

## 11. Build sequence (handed to writing-plans)

Phase 0 — Foundation (~2h): Supabase helpers, Prisma init + first migration, auth helpers, middleware, `handle_new_user` trigger, Tailwind tokens, shadcn/ui base.

Phase 1 — Public site polish (~2h): reorganize `/app/(public)/`, wire pages to DB-driven data, swap inline styles to Tailwind, drop in real logo.

Phase 2 — Auth (~2h): sign-up/sign-in/verify/forgot/reset/invite + profile edit + sign-out.

Phase 3 — Events end-to-end (~3h): public events pages, registration form, server action with QR + confirmation email, student `/me/events`, admin events CRUD, funnel page with CSV, `/admin/scan` QR scanner.

Phase 4 — Courses + reflection (~2h): public course pages, enrollment, student weekly answer form, admin course CRUD with per-week prompt editor.

Phase 5 — Mentorship 3-form flow (~2h): form definitions in code, student `/me/mentorship`, `/mentor/students/[id]`, admin pairing grid + admin student view.

Phase 6 — Blog + contact + team (~1.5h): TipTap editor, blog CRUD, contact form + inbox, team CRUD.

Phase 7 — Email broadcast (~2h): broadcasts list + composer + send-campaign cron + Resend webhook + unsubscribe.

Phase 8 — Polish & deploy: seed demo data, Vercel deploy, smoke test, connect Resend webhook.

**Estimated total**: 16–17 hours of focused work. Friday demo target = Phases 0–8 with Phase 7 possibly partial. Phases past Friday: domain handover, event reminders, soft-delete archive pages, Sentry, per-env Supabase split, search.

## 12. Friday demo strategy

1. Deploy to Vercel under temp URL by Wednesday night
2. Seed dummy data: 3 events at different funnel stages, 2 courses with weekly prompts, 3 blog posts, sample admin/mentor/student accounts
3. Walk Ivan through:
   - Home → blog → register for event → see confirmation email + QR
   - Admin: see registration appear → scan QR → funnel update
   - Admin: send broadcast to event no-shows → see delivery
   - Mentor: open student profile → see intake answers + fill session form
4. End with: "Domain transfer is the next thing — meeting with Patricia next week."

## 13. Out of scope (explicit YAGNI)

- WordPress data migration (locked: start fresh)
- In-platform donations / Stripe (external link only)
- Cohort instances vs course templates (1 course = 1 cohort run; duplicate to re-run)
- Social login (Google, Apple) — email+password only
- In-app notification inbox — email-only
- Full LMS features (video lessons, quizzes with grading, assignment uploads)
- Multi-tenant / multi-org support
- Mobile native app
- Per-environment Supabase project split (single shared project for v1)
- Sentry / advanced observability
- Comments on blog posts
- Site search

## 14. Risks

| Risk | Mitigation |
|---|---|
| 16–17h budget slips, Friday demo not ready | De-scope Phase 7 (broadcast) to draft-only; demo it as "coming next week" |
| Resend domain not verified by demo | Use `onboarding@resend.dev` sender; visible but works |
| Connected Digital uncooperative on domain | Demo on Vercel preview URL; domain becomes a follow-up after Ivan's buy-in |
| Supabase free tier limits hit | Project this size won't approach them; monitor in dashboard |
| Han hit by bus before May 2027 | Spec + handoff doc in repo; high-school successor lined up before Han graduates |

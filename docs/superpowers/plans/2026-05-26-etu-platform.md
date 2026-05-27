# ETU Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the WordPress site for Empower Teens United with a custom Next.js 16 platform supporting public marketing pages, three-role auth (admin / mentor / student), event registration + QR check-in, courses with weekly reflection prompts, the 1-on-1 mentorship three-form workflow, blog/contact/team, and Mailchimp-style broadcast email. Target Friday 2026-05-29 demo.

**Architecture:** Monolithic Next.js 16 App Router with route groups (`(public)`, `(auth)`, `(student)`, `(mentor)`, `(admin)`). Supabase for auth + Postgres + Storage. Prisma for ORM + migrations. Resend + React Email for transactional and broadcast email. Tailwind v4 + shadcn/ui for admin chrome. Server actions for all mutations; no client-side DB access.

**Tech Stack:** Next.js 16.2.6, React 19.2.4, TypeScript 5, Tailwind v4, Supabase (auth + Postgres + Storage), Prisma 5+, Resend, React Email, TipTap, Vitest (focused unit tests), Playwright (one smoke test).

**Reference spec:** `docs/superpowers/specs/2026-05-26-etu-platform-design.md`. When in doubt, that document wins.

**Next.js 16 notes:** Middleware is renamed to **proxy** (file: `proxy.ts` at project root). `cookies()` is async. Use `await cookies()` everywhere.

---

## File Structure

### New top-level files
```
proxy.ts                         Session refresh + role gating (was middleware.ts)
vitest.config.ts                 Vitest setup
playwright.config.ts             Playwright smoke test config
prisma/schema.prisma             Full ORM schema
prisma/migrations/               Generated migration SQL
prisma/seed.ts                   Demo seed data
```

### `app/` reorganization
```
app/
  layout.tsx                     (unchanged — wraps everything)
  globals.css                    (unchanged)
  (public)/
    layout.tsx                   Public nav + footer wrapper
    page.tsx                     Home (moved from app/page.tsx)
    about/page.tsx               (moved)
    blog/
      page.tsx                   Index
      [slug]/page.tsx            Post
    courses/
      page.tsx                   List
      [slug]/page.tsx            Detail
    events/
      page.tsx                   List
      [slug]/page.tsx            Detail
    contact/page.tsx             Form
    unsubscribe/page.tsx         Resolves token
  (auth)/
    layout.tsx                   Centered card wrapper
    sign-in/page.tsx
    sign-up/page.tsx
    sign-up/verify/page.tsx
    forgot-password/page.tsx
    reset-password/page.tsx
    invite/[token]/page.tsx
  (student)/
    layout.tsx                   Student shell (role-gated to student)
    me/
      page.tsx                   Dashboard
      profile/page.tsx
      events/page.tsx
      courses/[slug]/page.tsx
      courses/[slug]/week/[n]/page.tsx
      mentorship/page.tsx
  (mentor)/
    layout.tsx                   Mentor shell (role-gated to mentor)
    mentor/
      page.tsx                   Dashboard
      profile/page.tsx
      students/[id]/page.tsx
  (admin)/
    layout.tsx                   Admin shell with sidebar (role-gated to admin)
    admin/
      page.tsx                   Dashboard
      users/page.tsx
      invitations/page.tsx
      events/page.tsx
      events/new/page.tsx
      events/[id]/edit/page.tsx
      events/[id]/registrations/page.tsx
      scan/page.tsx
      courses/page.tsx
      courses/new/page.tsx
      courses/[id]/edit/page.tsx
      courses/[id]/enrollments/page.tsx
      mentorship/page.tsx
      mentorship/students/[id]/page.tsx
      blog/page.tsx
      blog/new/page.tsx
      blog/[id]/edit/page.tsx
      contact/page.tsx
      broadcasts/page.tsx
      broadcasts/new/page.tsx
      broadcasts/[id]/page.tsx
      team/page.tsx
      settings/page.tsx
  api/
    scan/route.ts
    uploads/route.ts
    webhooks/resend/route.ts
    cron/send-campaign/route.ts
    cron/event-reminders/route.ts
  sign-out/route.ts              POST → sign out → redirect
```

### `lib/` new files
```
lib/prisma.ts                    Prisma singleton w/ hot-reload guard
lib/auth.ts                      requireUser, requireRole, getOptionalUser
lib/forms/intake.ts              20-question intake form definition
lib/forms/session.ts             Mentor session form definition
lib/forms/hs-plan.ts             HS plan form definition
lib/forms/types.ts               Shared FormDefinition/Question types
lib/qr.ts                        QR generation + scan-URL builder
lib/broadcasts/resolve-segment.ts  Resolves segment_filter jsonb → recipient list
lib/broadcasts/send-batch.ts     Resend batch send + recipient status updates
lib/email/render.ts              React Email render helpers
lib/email/transactional.ts       sendInvite, sendRegistrationConfirmation, etc.
lib/csv.ts                       CSV export utility
lib/dates.ts                     Date formatters (event time displays)
```

### `utils/supabase/` per Supabase guide
```
utils/supabase/server.ts         createServerClient
utils/supabase/client.ts         createBrowserClient
utils/supabase/proxy.ts          Used by root proxy.ts to refresh session
utils/supabase/admin.ts          Service-role client (server-only, secret-key)
```

### `emails/` React Email templates
```
emails/InviteEmail.tsx
emails/RegistrationConfirmation.tsx
emails/EventReminder.tsx
emails/ContactReceived.tsx
emails/ContactNotification.tsx
emails/BroadcastShell.tsx
emails/_components/Footer.tsx
emails/_components/Brand.tsx
```

### Tests (focused subset; not full coverage)
```
tests/lib/auth.test.ts           requireUser, requireRole, getOptionalUser
tests/lib/broadcasts/resolve-segment.test.ts
tests/lib/qr.test.ts             Token round-trip, scan-URL parsing
tests/lib/forms.test.ts          Versioning + answer storage shape
tests/e2e/smoke.spec.ts          Playwright happy path
```

---

## Testing Strategy

**Unit tests (Vitest)** for genuinely tricky logic only:
- Auth helpers
- Broadcast segment resolution
- QR token generation + URL parsing
- Form versioning

**Manual verification** for UI/CRUD work — we keep `npm run dev` running and check the browser. Each phase ends with a "Verify in browser" step.

**One Playwright E2E smoke test** at the end of Phase 8 covering the demo path (visit home → register for event → see admin funnel update → scan QR → check-in count increments).

**`npm run lint` + `npm run build` before every commit** per `CLAUDE.md`. Treat type errors as blockers.

---

## Phase 0 — Foundation (~2h)

### Task 0.1: Install dev dependencies (Vitest, Playwright, qrcode, csv libs)

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Install runtime + dev deps**

Run:
```bash
npm install qrcode papaparse react-hook-form zod @hookform/resolvers
npm install --save-dev vitest @vitejs/plugin-react jsdom @types/qrcode @types/papaparse @playwright/test
```

Expected: `package.json` updated, no errors. `npm warn deprecated` lines for transient deps are fine.

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    setupFiles: [],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./") },
  },
});
```

- [ ] **Step 3: Add test scripts to `package.json`**

Modify the `"scripts"` block to:
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test"
}
```

- [ ] **Step 4: Verify scripts**

Run: `npm run test`
Expected: "No test files found" — exit 0. (No tests yet — confirms Vitest is wired.)

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "Install test runner and form/csv/qr dependencies"
```

---

### Task 0.2: Supabase client helpers

**Files:**
- Create: `utils/supabase/server.ts`
- Create: `utils/supabase/client.ts`
- Create: `utils/supabase/proxy.ts`
- Create: `utils/supabase/admin.ts`

- [ ] **Step 1: `utils/supabase/server.ts`**

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component — proxy refreshes the session instead.
        }
      },
    },
  });
}
```

- [ ] **Step 2: `utils/supabase/client.ts`**

```ts
"use client";
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
```

- [ ] **Step 3: `utils/supabase/proxy.ts`** (used by root `proxy.ts`)

```ts
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
```

- [ ] **Step 4: `utils/supabase/admin.ts`** (server-only, secret-key)

```ts
import "server-only";
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);
```

- [ ] **Step 5: Verify with `npm run build`**

Run: `npm run build`
Expected: Build succeeds. (Files compile; they aren't imported anywhere yet so unused-import isn't triggered until next phase.)

- [ ] **Step 6: Commit**

```bash
git add utils/supabase/
git commit -m "Add Supabase client helpers (server, client, proxy, admin)"
```

---

### Task 0.3: Prisma init + schema + first migration

**Files:**
- Create: `prisma/schema.prisma`
- Create: `lib/prisma.ts`
- Modify: `.gitignore` (ensure `node_modules/.prisma` is fine — default already covers)

- [ ] **Step 1: Create `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum Role {
  admin
  mentor
  student
}

enum InviteRole {
  admin
  mentor
}

enum RegistrationStatus {
  registered
  cancelled
}

enum EnrollmentStatus {
  active
  completed
  dropped
}

enum MentorshipFormKind {
  intake
  session
  hs_plan
}

enum CourseLanguage {
  en
  es
  both
}

enum CampaignStatus {
  draft
  scheduled
  sending
  sent
  failed
}

enum RecipientStatus {
  queued
  sent
  delivered
  bounced
  opened
  clicked
  complained
}

enum ContactStatus {
  new
  replied
  archived
}

model Profile {
  id                 String   @id @db.Uuid
  role               Role     @default(student)
  firstName          String   @map("first_name")
  lastName           String   @map("last_name")
  email              String   @unique
  phone              String?
  avatarUrl          String?  @map("avatar_url")
  grade              Int?
  school             String?
  parentEmail        String?  @map("parent_email")
  parentPhone        String?  @map("parent_phone")
  title              String?
  bio                String?
  emailUnsubscribed  Boolean  @default(false) @map("email_unsubscribed")
  bannedAt           DateTime? @map("banned_at")
  createdAt          DateTime @default(now()) @map("created_at")
  updatedAt          DateTime @updatedAt @map("updated_at")

  registrations         EventRegistration[]
  checkInsRecorded      EventCheckin[]      @relation("CheckedInBy")
  enrollments           Enrollment[]
  mentorAssignments     MentorAssignment[]  @relation("MentorOf")
  studentAssignment     MentorAssignment?   @relation("StudentOf")
  intakeForms           MentorshipForm[]    @relation("StudentForms")
  formsAsMentor         MentorshipForm[]    @relation("MentorForms")
  formsSubmitted        MentorshipForm[]    @relation("SubmittedBy")
  blogPosts             BlogPost[]
  campaignsCreated      EmailCampaign[]
  contactsReplied       ContactMessage[]
  recipientRows         EmailRecipient[]
  eventsCreated         Event[]
  coursesCreated        Course[]
  invitationsSent       Invitation[]

  @@map("profiles")
}

model Invitation {
  id            String    @id @default(uuid()) @db.Uuid
  email         String
  role          InviteRole
  token         String    @unique @default(uuid()) @db.Uuid
  invitedById   String    @map("invited_by_id") @db.Uuid
  invitedAt     DateTime  @default(now()) @map("invited_at")
  expiresAt     DateTime  @map("expires_at")
  acceptedAt    DateTime? @map("accepted_at")
  revokedAt     DateTime? @map("revoked_at")

  invitedBy     Profile   @relation(fields: [invitedById], references: [id])

  @@index([email])
  @@map("invitations")
}

model Event {
  id            String    @id @default(uuid()) @db.Uuid
  slug          String    @unique
  title         String
  body          String
  coverImageUrl String?   @map("cover_image_url")
  location      String
  startsAt      DateTime  @map("starts_at")
  endsAt        DateTime  @map("ends_at")
  capacity      Int?
  publishedAt   DateTime? @map("published_at")
  archivedAt    DateTime? @map("archived_at")
  createdById   String    @map("created_by_id") @db.Uuid
  createdAt     DateTime  @default(now()) @map("created_at")

  createdBy     Profile   @relation(fields: [createdById], references: [id])
  registrations EventRegistration[]

  @@map("events")
}

model EventRegistration {
  id           String             @id @default(uuid()) @db.Uuid
  eventId      String             @map("event_id") @db.Uuid
  profileId    String?            @map("profile_id") @db.Uuid
  name         String
  grade        Int?
  guestCount   Int                @default(0) @map("guest_count")
  guestNames   String[]           @map("guest_names")
  email        String
  phone        String?
  qrToken      String             @unique @default(uuid()) @map("qr_token") @db.Uuid
  status       RegistrationStatus @default(registered)
  registeredAt DateTime           @default(now()) @map("registered_at")

  event        Event              @relation(fields: [eventId], references: [id])
  profile      Profile?           @relation(fields: [profileId], references: [id])
  checkin      EventCheckin?

  @@index([eventId])
  @@index([profileId])
  @@map("event_registrations")
}

model EventCheckin {
  id              String  @id @default(uuid()) @db.Uuid
  registrationId  String  @unique @map("registration_id") @db.Uuid
  checkedInAt     DateTime @default(now()) @map("checked_in_at")
  checkedInById   String  @map("checked_in_by_id") @db.Uuid

  registration    EventRegistration @relation(fields: [registrationId], references: [id])
  checkedInBy     Profile @relation("CheckedInBy", fields: [checkedInById], references: [id])

  @@map("event_checkins")
}

model Course {
  id            String         @id @default(uuid()) @db.Uuid
  slug          String         @unique
  title         String
  body          String
  coverImageUrl String?        @map("cover_image_url")
  startsOn      DateTime       @map("starts_on") @db.Date
  weeks         Int
  location      String
  ageMin        Int            @default(14) @map("age_min")
  ageMax        Int            @default(18) @map("age_max")
  language      CourseLanguage @default(en)
  cohortCap     Int?           @map("cohort_cap")
  certificate   Boolean        @default(true)
  publishedAt   DateTime?      @map("published_at")
  archivedAt    DateTime?      @map("archived_at")
  createdById   String         @map("created_by_id") @db.Uuid
  createdAt     DateTime       @default(now()) @map("created_at")

  createdBy     Profile        @relation(fields: [createdById], references: [id])
  courseWeeks   CourseWeek[]
  enrollments   Enrollment[]

  @@map("courses")
}

model CourseWeek {
  id        String @id @default(uuid()) @db.Uuid
  courseId  String @map("course_id") @db.Uuid
  weekNo    Int    @map("week_no")
  title     String
  body      String
  questions Json   @default("[]")

  course    Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
  responses LessonResponse[]

  @@unique([courseId, weekNo])
  @@map("course_weeks")
}

model Enrollment {
  id           String           @id @default(uuid()) @db.Uuid
  courseId     String           @map("course_id") @db.Uuid
  profileId    String           @map("profile_id") @db.Uuid
  status       EnrollmentStatus @default(active)
  enrolledAt   DateTime         @default(now()) @map("enrolled_at")

  course       Course           @relation(fields: [courseId], references: [id])
  profile      Profile          @relation(fields: [profileId], references: [id])
  responses    LessonResponse[]

  @@unique([courseId, profileId])
  @@map("enrollments")
}

model LessonResponse {
  id            String   @id @default(uuid()) @db.Uuid
  enrollmentId  String   @map("enrollment_id") @db.Uuid
  weekId        String   @map("week_id") @db.Uuid
  answers       Json     @default("{}")
  submittedAt   DateTime? @map("submitted_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  enrollment    Enrollment @relation(fields: [enrollmentId], references: [id])
  week          CourseWeek @relation(fields: [weekId], references: [id])

  @@unique([enrollmentId, weekId])
  @@map("lesson_responses")
}

model MentorAssignment {
  id         String    @id @default(uuid()) @db.Uuid
  mentorId   String    @map("mentor_id") @db.Uuid
  studentId  String    @unique @map("student_id") @db.Uuid
  startedAt  DateTime  @default(now()) @map("started_at")
  endedAt    DateTime? @map("ended_at")
  notes      String?

  mentor     Profile   @relation("MentorOf", fields: [mentorId], references: [id])
  student    Profile   @relation("StudentOf", fields: [studentId], references: [id])

  @@map("mentor_assignments")
}

model MentorshipForm {
  id              String              @id @default(uuid()) @db.Uuid
  studentId       String              @map("student_id") @db.Uuid
  mentorId        String?             @map("mentor_id") @db.Uuid
  kind            MentorshipFormKind
  sessionNo       Int?                @map("session_no")
  formVersion     Int                 @default(1) @map("form_version")
  answers         Json                @default("{}")
  submittedById   String              @map("submitted_by_id") @db.Uuid
  submittedAt     DateTime?           @map("submitted_at")
  updatedAt       DateTime            @updatedAt @map("updated_at")

  student         Profile             @relation("StudentForms", fields: [studentId], references: [id])
  mentor          Profile?            @relation("MentorForms", fields: [mentorId], references: [id])
  submittedBy     Profile             @relation("SubmittedBy", fields: [submittedById], references: [id])

  @@unique([studentId, kind, sessionNo])
  @@map("mentorship_forms")
}

model BlogPost {
  id            String    @id @default(uuid()) @db.Uuid
  slug          String    @unique
  title         String
  excerpt       String?
  body          String
  coverImageUrl String?   @map("cover_image_url")
  authorId      String    @map("author_id") @db.Uuid
  publishedAt   DateTime? @map("published_at")
  archivedAt    DateTime? @map("archived_at")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  author        Profile   @relation(fields: [authorId], references: [id])

  @@map("blog_posts")
}

model ContactMessage {
  id           String        @id @default(uuid()) @db.Uuid
  name         String
  email        String
  phone        String?
  subject      String
  message      String
  status       ContactStatus @default(new)
  submittedAt  DateTime      @default(now()) @map("submitted_at")
  repliedAt    DateTime?     @map("replied_at")
  repliedById  String?       @map("replied_by_id") @db.Uuid

  repliedBy    Profile?      @relation(fields: [repliedById], references: [id])

  @@map("contact_messages")
}

model TeamMember {
  id         String  @id @default(uuid()) @db.Uuid
  fullName   String  @map("full_name")
  roleTitle  String  @map("role_title")
  bio        String?
  photoUrl   String? @map("photo_url")
  sortOrder  Int     @default(0) @map("sort_order")
  published  Boolean @default(true)

  @@map("team_members")
}

model EmailCampaign {
  id              String         @id @default(uuid()) @db.Uuid
  subject         String
  bodyHtml        String         @map("body_html")
  bodyText        String         @map("body_text")
  sender          String
  segmentFilter   Json           @map("segment_filter")
  status          CampaignStatus @default(draft)
  scheduledAt     DateTime?      @map("scheduled_at")
  sentAt          DateTime?      @map("sent_at")
  recipientCount  Int            @default(0) @map("recipient_count")
  createdById     String         @map("created_by_id") @db.Uuid
  createdAt       DateTime       @default(now()) @map("created_at")

  createdBy       Profile        @relation(fields: [createdById], references: [id])
  recipients      EmailRecipient[]

  @@map("email_campaigns")
}

model EmailRecipient {
  id                String          @id @default(uuid()) @db.Uuid
  campaignId        String          @map("campaign_id") @db.Uuid
  profileId         String?         @map("profile_id") @db.Uuid
  email             String
  name              String?
  status            RecipientStatus @default(queued)
  resendMessageId   String?         @map("resend_message_id")
  sentAt            DateTime?       @map("sent_at")
  lastEventAt       DateTime?       @map("last_event_at")

  campaign          EmailCampaign   @relation(fields: [campaignId], references: [id])
  profile           Profile?        @relation(fields: [profileId], references: [id])

  @@index([campaignId])
  @@index([resendMessageId])
  @@map("email_recipients")
}

model UnsubscribedEmail {
  email          String   @id
  unsubscribedAt DateTime @default(now()) @map("unsubscribed_at")

  @@map("unsubscribed_emails")
}

model SiteSetting {
  key   String @id
  value Json

  @@map("site_settings")
}
```

- [ ] **Step 2: Run the initial migration**

Run:
```bash
npx prisma migrate dev --name init
```
Expected: New migration file `prisma/migrations/<timestamp>_init/migration.sql` is created and applied. `@prisma/client` is regenerated. If the region or password is wrong, this fails fast — fix `.env.local` and retry.

- [ ] **Step 3: Create `lib/prisma.ts`**

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 4: Verify build still works**

Run: `npm run build`
Expected: Build succeeds. Prisma client compiles into the bundle.

- [ ] **Step 5: Commit**

```bash
git add prisma/ lib/prisma.ts
git commit -m "Initialize Prisma with full ETU schema and first migration"
```

---

### Task 0.4: `handle_new_user` trigger

**Files:**
- Create: `prisma/migrations/<next-timestamp>_handle_new_user/migration.sql` (manually, then mark applied)

Prisma doesn't manage the `auth.users` table — it's Supabase's. We add a database trigger via raw SQL.

- [ ] **Step 1: Create an empty migration**

Run:
```bash
npx prisma migrate dev --create-only --name handle_new_user
```
Expected: A new migration folder is created with an empty `migration.sql`. Note the folder name printed.

- [ ] **Step 2: Write the trigger SQL**

Open the new `migration.sql` and replace its contents with:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, role, first_name, last_name, email, created_at, updated_at
  )
  VALUES (
    NEW.id,
    'student',
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email,
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

- [ ] **Step 3: Apply the migration**

Run: `npx prisma migrate dev`
Expected: Migration is applied. Test it in Step 4.

- [ ] **Step 4: Verify the trigger works**

Open the Supabase dashboard → Authentication → Users → Add user → email `test@example.com`, autoconfirm. Then in Supabase SQL editor:
```sql
SELECT id, email, role FROM public.profiles WHERE email = 'test@example.com';
```
Expected: One row with `role='student'`. Then delete the test user from Auth → Users.

- [ ] **Step 5: Commit**

```bash
git add prisma/migrations/
git commit -m "Add handle_new_user trigger to create profile rows on signup"
```

---

### Task 0.5: Auth helpers with tests

**Files:**
- Create: `lib/auth.ts`
- Test: `tests/lib/auth.test.ts`

- [ ] **Step 1: Write the failing test `tests/lib/auth.test.ts`**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    profile: {
      findUnique: vi.fn(),
    },
  },
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
  notFound: vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
}));

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { getOptionalUser, requireUser, requireRole } from "@/lib/auth";

const mockSupabase = (user: any) => ({
  auth: { getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }) },
});

describe("getOptionalUser", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns null when no user", async () => {
    (createClient as any).mockResolvedValue(mockSupabase(null));
    const result = await getOptionalUser();
    expect(result).toBeNull();
  });

  it("returns user + profile when authenticated", async () => {
    (createClient as any).mockResolvedValue(mockSupabase({ id: "u1", email: "a@b.com" }));
    (prisma.profile.findUnique as any).mockResolvedValue({
      id: "u1",
      role: "student",
      bannedAt: null,
    });
    const result = await getOptionalUser();
    expect(result?.profile.role).toBe("student");
  });
});

describe("requireUser", () => {
  beforeEach(() => vi.clearAllMocks());

  it("redirects to /sign-in when anonymous", async () => {
    (createClient as any).mockResolvedValue(mockSupabase(null));
    await expect(requireUser()).rejects.toThrow("REDIRECT:/sign-in");
  });

  it("returns user + profile when authenticated", async () => {
    (createClient as any).mockResolvedValue(mockSupabase({ id: "u1" }));
    (prisma.profile.findUnique as any).mockResolvedValue({
      id: "u1",
      role: "admin",
      bannedAt: null,
    });
    const result = await requireUser();
    expect(result.profile.role).toBe("admin");
  });
});

describe("requireRole", () => {
  beforeEach(() => vi.clearAllMocks());

  it("404s when role does not match", async () => {
    (createClient as any).mockResolvedValue(mockSupabase({ id: "u1" }));
    (prisma.profile.findUnique as any).mockResolvedValue({
      id: "u1",
      role: "student",
      bannedAt: null,
    });
    await expect(requireRole("admin")).rejects.toThrow("NOT_FOUND");
  });

  it("returns when role matches", async () => {
    (createClient as any).mockResolvedValue(mockSupabase({ id: "u1" }));
    (prisma.profile.findUnique as any).mockResolvedValue({
      id: "u1",
      role: "mentor",
      bannedAt: null,
    });
    const r = await requireRole("mentor");
    expect(r.profile.role).toBe("mentor");
  });

  it("redirects to /sign-in when banned", async () => {
    (createClient as any).mockResolvedValue(mockSupabase({ id: "u1" }));
    (prisma.profile.findUnique as any).mockResolvedValue({
      id: "u1",
      role: "admin",
      bannedAt: new Date(),
    });
    await expect(requireRole("admin")).rejects.toThrow("REDIRECT:/sign-in?banned=1");
  });
});
```

- [ ] **Step 2: Run test, confirm fail**

Run: `npm run test`
Expected: All tests fail with "Cannot find module '@/lib/auth'".

- [ ] **Step 3: Implement `lib/auth.ts`**

```ts
import "server-only";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import type { Profile, Role } from "@prisma/client";

export type AuthContext = {
  user: { id: string; email: string };
  profile: Profile;
};

export async function getOptionalUser(): Promise<AuthContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!profile) return null;
  return { user: { id: user.id, email: user.email ?? "" }, profile };
}

export async function requireUser(): Promise<AuthContext> {
  const auth = await getOptionalUser();
  if (!auth) redirect("/sign-in");
  if (auth.profile.bannedAt) redirect("/sign-in?banned=1");
  return auth;
}

export async function requireRole(role: Role): Promise<AuthContext> {
  const auth = await requireUser();
  if (auth.profile.role !== role) notFound();
  return auth;
}
```

- [ ] **Step 4: Run tests, confirm pass**

Run: `npm run test`
Expected: All 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/auth.ts tests/lib/auth.test.ts
git commit -m "Add lib/auth.ts (requireUser, requireRole, getOptionalUser) with tests"
```

---

### Task 0.6: Root `proxy.ts` (session refresh + role gating)

**Files:**
- Create: `proxy.ts` (project root)

- [ ] **Step 1: Implement `proxy.ts`**

```ts
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/proxy";

const ROLE_GATES: Array<{ prefix: string; role: "admin" | "mentor" | "student" }> = [
  { prefix: "/admin", role: "admin" },
  { prefix: "/mentor", role: "mentor" },
  { prefix: "/me", role: "student" },
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { response, user } = await updateSession(request);

  const gate = ROLE_GATES.find((g) => pathname.startsWith(g.prefix));
  if (!gate) return response;

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Role check happens in each route via requireRole() — proxy enforces signed-in
  // here and lets the page do the role assertion (which 404s, not 403s).
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks|api/cron|.*\\..*).*)",
  ],
};
```

- [ ] **Step 2: Run dev server and verify gating**

Run: `npm run dev`
In browser: visit `http://localhost:3000/admin`. Expected: redirect to `/sign-in?next=/admin` (the page itself will 404 once we add it since you aren't signed in as admin — for now the redirect is what we want to see).

Kill dev server.

- [ ] **Step 3: Commit**

```bash
git add proxy.ts
git commit -m "Add root proxy.ts for session refresh and signed-in gate"
```

---

### Task 0.7: Tailwind tokens + shadcn/ui

**Files:**
- Modify: `app/globals.css` (add design tokens as CSS variables)
- Create: `components.json` (shadcn config)
- Modify: `tsconfig.json` (add @/* path alias if not present)
- Create: `lib/utils.ts` (cn helper for shadcn)

- [ ] **Step 1: Add path alias to `tsconfig.json`**

Open `tsconfig.json`. Inside `compilerOptions`, add (or merge with existing):
```json
"baseUrl": ".",
"paths": { "@/*": ["./*"] }
```

- [ ] **Step 2: Update `app/globals.css` with design tokens**

Replace the entire file with:
```css
@import "tailwindcss";

@theme {
  --color-navy: #0F4566;
  --color-navy-dark: #0a3349;
  --color-navy-light: #1d5d83;
  --color-gold: #FCCC00;
  --color-gold-deep: #e0b300;
  --color-ink: #101820;
  --color-body: #3a4754;
  --color-muted: #6b7785;
  --color-cream: #FBF7EB;
  --color-paper: #FAF8F3;
  --color-off: #F4F1E8;
  --font-sans: var(--font-manrope), system-ui, sans-serif;
  --font-serif: var(--font-source-serif), Georgia, serif;
}

html, body {
  margin: 0;
  padding: 0;
  background: var(--color-paper);
  font-family: var(--font-sans);
  color: var(--color-ink);
}

* { box-sizing: border-box; }
a { color: inherit; }
```

- [ ] **Step 3: Create `lib/utils.ts`**

Run: `npm install clsx tailwind-merge`

Then create:
```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 4: Create `components.json`**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components/ui",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

- [ ] **Step 5: Add base shadcn components**

Run:
```bash
npx shadcn@latest add button input label select dialog toast form table dropdown-menu textarea checkbox
```
Expected: Components are scaffolded under `components/ui/`. If shadcn prompts for confirmation, accept defaults.

If it asks about React 19 + npm peer warnings, pass `--force-legacy` or just answer "yes" to the legacy-peer-deps prompt.

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: Build succeeds. No type errors.

- [ ] **Step 7: Commit**

```bash
git add components.json lib/utils.ts components/ui/ app/globals.css tsconfig.json package.json package-lock.json
git commit -m "Wire Tailwind v4 tokens and install shadcn/ui base components"
```

---

### Phase 0 verification

- [ ] **Run all checks**

```bash
npm run lint
npm run build
npm run test
```

All three must pass. If anything red, fix before moving on — the foundation must be solid.

---

## Phase 1 — Public site polish (~2h)

### Task 1.1: Reorganize existing pages into `(public)` route group

**Files:**
- Create: `app/(public)/layout.tsx`
- Move: `app/page.tsx` → `app/(public)/page.tsx`
- Move: `app/about/page.tsx` → `app/(public)/about/page.tsx`
- Move: `app/blog/page.tsx` → `app/(public)/blog/page.tsx`
- Move: `app/contact/page.tsx` → `app/(public)/contact/page.tsx`
- Move: `app/courses/page.tsx` → `app/(public)/courses/page.tsx`
- Move: `app/courses/[slug]/page.tsx` → `app/(public)/courses/[slug]/page.tsx`
- Move: `app/events/page.tsx` → `app/(public)/events/page.tsx`
- Move: `app/events/[slug]/page.tsx` → `app/(public)/events/[slug]/page.tsx`
- Delete: `app/profile/page.tsx` (will be re-created at `app/(student)/me/profile/page.tsx` in Phase 2)

- [ ] **Step 1: Create the `(public)` route group and move files**

Run these in PowerShell:
```powershell
New-Item -ItemType Directory -Path "app/(public)" -Force
Move-Item "app/page.tsx" "app/(public)/page.tsx"
Move-Item "app/about" "app/(public)/about"
Move-Item "app/blog" "app/(public)/blog"
Move-Item "app/contact" "app/(public)/contact"
Move-Item "app/courses" "app/(public)/courses"
Move-Item "app/events" "app/(public)/events"
Remove-Item -Recurse -Force "app/profile"
```

- [ ] **Step 2: Update import paths in each moved page**

In every moved file, change relative imports for `tokens.ts`, `photos.ts`, and components from `"./components/..."` or `"../components/..."` to `"@/app/components/..."`. Use Edit tool per file. For `app/(public)/page.tsx`, also change `import Link from "next/link"` → no change (works the same).

Example for `app/(public)/page.tsx`:
- Before: `import { A, aBase } from "./components/tokens";`
- After: `import { A, aBase } from "@/app/components/tokens";`

Apply the same pattern to all 8 moved page files.

- [ ] **Step 3: Create `app/(public)/layout.tsx`**

```tsx
import type { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
```

(Nav and Footer are already rendered inside each page — we'll consolidate into the layout in Task 1.3.)

- [ ] **Step 4: Verify the site still renders**

Run: `npm run dev`
Visit: `http://localhost:3000/`, `/about`, `/blog`, `/courses`, `/events`, `/contact`. All should render without errors. Kill dev server.

- [ ] **Step 5: Commit**

```bash
git add app/
git commit -m "Move public pages into (public) route group"
```

---

### Task 1.2: Move Nav + Footer into the public layout

**Files:**
- Modify: `app/(public)/layout.tsx`
- Modify: every `app/(public)/**/page.tsx` (remove the `<Nav>` and `<Footer>` JSX from each page body)

- [ ] **Step 1: Update `app/(public)/layout.tsx` to render Nav + Footer**

```tsx
import type { ReactNode } from "react";
import { Nav } from "@/app/components/Nav";
import { Footer } from "@/app/components/Footer";
import { aBase } from "@/app/components/tokens";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div style={aBase}>
      <Nav />
      {children}
      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Strip `<Nav>`, `<Footer>`, and the outer wrapper `<div style={aBase}>` from each page in `(public)/`**

For each of:
`page.tsx`, `about/page.tsx`, `blog/page.tsx`, `contact/page.tsx`,
`courses/page.tsx`, `courses/[slug]/page.tsx`, `events/page.tsx`, `events/[slug]/page.tsx`:

- Remove `import { Nav } from ...`
- Remove `import { Footer } from ...`
- Remove the top-level `<div style={aBase}>` wrapper and its closing tag
- Remove `<Nav .../>` and `<Footer />` from the JSX

The returned JSX should now start with a fragment `<>` or a content `<main>`.

Concrete example diff for `app/(public)/page.tsx`:
- Before: `<div style={aBase}><Nav /> ...content... <Footer /></div>`
- After: `<>...content...</>`

To pass the `active` prop to `<Nav>` per route, we'll handle that in Task 1.4 — leave the default for now.

- [ ] **Step 3: Verify build + dev**

Run: `npm run build && npm run dev`
Visit each public page. Nav + Footer render once per page via the layout. Kill dev server.

- [ ] **Step 4: Commit**

```bash
git add app/(public)/
git commit -m "Hoist Nav + Footer into public layout, drop per-page duplicates"
```

---

### Task 1.3: Drop in the real logo

**Files:**
- Create: `public/logo.svg` (Han provides; if not received before this task runs, use the existing `EtuLockup` component unchanged and skip this task)
- Modify: `app/components/Logo.tsx`

- [ ] **Step 1: Place the logo file**

Save the logo provided by Ivan to `public/logo.svg`. Aim for SVG; if PNG, use `public/logo.png` and adapt below.

- [ ] **Step 2: Update `app/components/Logo.tsx` to render the file**

Replace the existing `EtuLockup` function with:
```tsx
import Image from "next/image";

export function EtuLockup({ height = 56 }: { height?: number; color?: string }) {
  return (
    <Image
      src="/logo.svg"
      alt="Empower Teens United"
      height={height}
      width={height * 4}
      priority
      style={{ height, width: "auto" }}
    />
  );
}
```

(Width estimate `height * 4` is replaced by the actual aspect ratio of the logo file — adjust after dropping it in.)

- [ ] **Step 3: Verify in browser**

Run: `npm run dev` → visit `/`. Logo renders in nav. Kill dev server.

- [ ] **Step 4: Commit**

```bash
git add public/logo.svg app/components/Logo.tsx
git commit -m "Drop in real ETU logo"
```

---

### Task 1.4: Active-nav per route (using `usePathname` in a client component)

**Files:**
- Modify: `app/components/Nav.tsx`

- [ ] **Step 1: Convert Nav into a client component that reads pathname**

Replace `app/components/Nav.tsx` with:
```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { A } from "./tokens";
import { EtuLockup } from "./Logo";
import { LangToggle } from "./LangToggle";

const items: Array<{ label: string; href: string }> = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Courses", href: "/courses" },
  { label: "Events", href: "/events" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Nav() {
  const pathname = usePathname();
  const fg = A.ink;
  const bg = "#fff";

  return (
    <header style={{ background: bg, borderBottom: `1px solid ${A.rule}` }}>
      <div
        style={{
          background: A.navyDark,
          color: "#fff",
          padding: "8px 56px",
          fontSize: 12,
          fontFamily: A.fontBody,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 24,
        }}
      >
        <div style={{ display: "flex", gap: 24, opacity: 0.85 }}>
          <span>+1 (407) 413-7384</span>
          <span>info@empowerteensunited.org</span>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center", opacity: 0.9 }}>
          <span>Mon–Fri 9:00–18:00</span>
          <LangToggle dark />
        </div>
      </div>
      <div
        style={{
          padding: "20px 56px",
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          alignItems: "center",
          gap: 32,
          background: bg,
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <EtuLockup height={56} />
        </Link>
        <nav
          style={{
            display: "flex",
            gap: 36,
            justifyContent: "center",
            fontFamily: A.fontBody,
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  color: active ? A.navy : fg,
                  textDecoration: "none",
                  paddingBottom: 6,
                  borderBottom: active
                    ? `2px solid ${A.gold}`
                    : "2px solid transparent",
                  letterSpacing: 0.2,
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link
            href="https://example.com/donate"
            target="_blank"
            rel="noopener"
            style={{
              background: A.gold,
              color: A.navy,
              padding: "12px 22px",
              borderRadius: 4,
              fontFamily: A.fontBody,
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: 0.4,
              textDecoration: "none",
            }}
          >
            Donate
          </Link>
          <Link
            href="/sign-in"
            style={{
              background: "transparent",
              color: fg,
              border: `1.5px solid ${A.rule}`,
              padding: "11px 18px",
              borderRadius: 4,
              fontFamily: A.fontBody,
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </header>
  );
}
```

> The Donate URL is a placeholder — Ivan should provide the real one (Givebutter / PayPal / etc) and you'll update this in a future change.

- [ ] **Step 2: Verify**

Run: `npm run dev` → click between pages. Active nav underline follows the route. Sign-in link visible top-right. Kill dev server.

- [ ] **Step 3: Commit**

```bash
git add app/components/Nav.tsx
git commit -m "Make Nav a client component with route-aware active state"
```

---

### Task 1.5: `site_settings` seed

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json` (add prisma seed config)

- [ ] **Step 1: Create `prisma/seed.ts`**

```ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const settings: Array<{ key: string; value: any }> = [
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
```

- [ ] **Step 2: Wire the seed into Prisma**

Open `package.json`, append at the top level (sibling of `"scripts"`):
```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

Then install `tsx`:
```bash
npm install --save-dev tsx
```

- [ ] **Step 3: Run the seed**

```bash
npx prisma db seed
```
Expected: "Seeded 9 site settings". Verify in Supabase SQL editor:
```sql
SELECT key, value FROM site_settings;
```

- [ ] **Step 4: Commit**

```bash
git add prisma/seed.ts package.json package-lock.json
git commit -m "Add prisma seed for site_settings defaults"
```

---

### Phase 1 verification

- [ ] **Verify in browser**

```bash
npm run dev
```

Visit `/`, `/about`, `/blog`, `/courses`, `/events`, `/contact` — all render with consistent Nav + Footer + active-link state. Logo present.

```bash
npm run lint && npm run build && npm run test
```

All pass. Commit any cleanup.

---

## Phase 2 — Auth (~2h)

### Task 2.1: Sign-in page

**Files:**
- Create: `app/(auth)/layout.tsx`
- Create: `app/(auth)/sign-in/page.tsx`
- Create: `app/(auth)/sign-in/actions.ts`

- [ ] **Step 1: `app/(auth)/layout.tsx`**

```tsx
import type { ReactNode } from "react";
import Link from "next/link";
import { EtuLockup } from "@/app/components/Logo";
import { A } from "@/app/components/tokens";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: A.paper,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        gap: 32,
      }}
    >
      <Link href="/"><EtuLockup height={48} /></Link>
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          borderRadius: 8,
          padding: 32,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: `app/(auth)/sign-in/actions.ts`**

```ts
"use server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    redirect(`/sign-in?error=${encodeURIComponent(error?.message ?? "Sign-in failed")}`);
  }

  const profile = await prisma.profile.findUnique({ where: { id: data.user.id } });
  if (profile?.bannedAt) {
    await supabase.auth.signOut();
    redirect("/sign-in?banned=1");
  }

  if (next && next.startsWith("/")) redirect(next);
  switch (profile?.role) {
    case "admin":
      redirect("/admin");
    case "mentor":
      redirect("/mentor");
    default:
      redirect("/me");
  }
}
```

- [ ] **Step 3: `app/(auth)/sign-in/page.tsx`**

```tsx
import Link from "next/link";
import { signInAction } from "./actions";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; banned?: string; next?: string }>;
}) {
  const { error, banned, next } = await searchParams;
  return (
    <form action={signInAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Sign in</h1>
      {banned && (
        <p style={{ color: "#b22234" }}>
          Your account has been suspended. Contact info@empowerteensunited.org.
        </p>
      )}
      {error && <p style={{ color: "#b22234" }}>{error}</p>}
      <input type="hidden" name="next" value={next ?? ""} />
      <label>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          style={{
            display: "block",
            width: "100%",
            padding: "10px 12px",
            border: "1px solid #ddd",
            borderRadius: 4,
            marginTop: 4,
          }}
        />
      </label>
      <label>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          style={{
            display: "block",
            width: "100%",
            padding: "10px 12px",
            border: "1px solid #ddd",
            borderRadius: 4,
            marginTop: 4,
          }}
        />
      </label>
      <button
        type="submit"
        style={{
          background: "#0F4566",
          color: "#fff",
          padding: "12px 16px",
          borderRadius: 4,
          fontWeight: 700,
          border: "none",
          cursor: "pointer",
        }}
      >
        Sign in
      </button>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
        <Link href="/forgot-password">Forgot password?</Link>
        <Link href="/sign-up">Create student account</Link>
      </div>
    </form>
  );
}
```

- [ ] **Step 4: Manual verify**

Run: `npm run dev`. Visit `/sign-in`. Form renders. Submit with bogus credentials — error string shows.

- [ ] **Step 5: Commit**

```bash
git add app/(auth)/
git commit -m "Add /sign-in page with server action and error handling"
```

---

### Task 2.2: Student sign-up + email verification landing

**Files:**
- Create: `app/(auth)/sign-up/page.tsx`
- Create: `app/(auth)/sign-up/actions.ts`
- Create: `app/(auth)/sign-up/verify/page.tsx`

- [ ] **Step 1: `app/(auth)/sign-up/actions.ts`**

```ts
"use server";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const firstName = String(formData.get("first_name") ?? "");
  const lastName = String(formData.get("last_name") ?? "");
  const grade = formData.get("grade") ? Number(formData.get("grade")) : null;
  const school = String(formData.get("school") ?? "");
  const parentEmail = String(formData.get("parent_email") ?? "") || null;
  const parentPhone = String(formData.get("parent_phone") ?? "") || null;

  if (!firstName || !lastName) redirect("/sign-up?error=Name+is+required");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/sign-up/verify`,
    },
  });

  if (error) redirect(`/sign-up?error=${encodeURIComponent(error.message)}`);
  if (!data.user) redirect("/sign-up?error=Signup+failed");

  // Trigger creates the profile row. Patch the extra student fields.
  await prisma.profile.update({
    where: { id: data.user.id },
    data: { grade, school, parentEmail, parentPhone },
  });

  redirect("/sign-up/verify?email=" + encodeURIComponent(email));
}
```

- [ ] **Step 2: `app/(auth)/sign-up/page.tsx`**

```tsx
import { signUpAction } from "./actions";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const inputStyle = {
    display: "block",
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: 4,
    marginTop: 4,
  } as const;
  return (
    <form action={signUpAction} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Create student account</h1>
      {error && <p style={{ color: "#b22234" }}>{error}</p>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <label>First name <input name="first_name" required style={inputStyle} /></label>
        <label>Last name <input name="last_name" required style={inputStyle} /></label>
      </div>
      <label>Email <input name="email" type="email" required style={inputStyle} /></label>
      <label>Password <input name="password" type="password" required minLength={8} style={inputStyle} /></label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
        <label>Grade
          <select name="grade" style={inputStyle} defaultValue="">
            <option value="" disabled>—</option>
            {[7,8,9,10,11,12].map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </label>
        <label>School <input name="school" style={inputStyle} /></label>
      </div>
      <label>Parent/guardian email (optional) <input name="parent_email" type="email" style={inputStyle} /></label>
      <label>Parent/guardian phone (optional) <input name="parent_phone" style={inputStyle} /></label>
      <button type="submit" style={{ background: "#0F4566", color: "#fff", padding: "12px 16px", border: "none", borderRadius: 4, fontWeight: 700, cursor: "pointer" }}>
        Create account
      </button>
    </form>
  );
}
```

- [ ] **Step 3: `app/(auth)/sign-up/verify/page.tsx`**

```tsx
export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Check your email</h1>
      <p>
        We sent a verification link to <strong>{email ?? "your email"}</strong>. Click the link to
        finish setting up your account.
      </p>
      <p style={{ fontSize: 13, color: "#6b7785" }}>
        After verifying, you can sign in.
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Add `NEXT_PUBLIC_SITE_URL` to `.env.local`**

Append to `.env.local`:
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Also configure Supabase: dashboard → Authentication → URL Configuration → set Site URL to `http://localhost:3000` for dev. Add redirect allow-list entries for `/sign-up/verify` and `/reset-password`.

- [ ] **Step 5: Manual verify**

Run: `npm run dev`. Visit `/sign-up`, fill the form. Submit. Should redirect to `/sign-up/verify` showing your email. Check the Supabase auth → users table: a new pending user appears. Check `public.profiles`: row created via trigger with role=student.

- [ ] **Step 6: Commit**

```bash
git add app/(auth)/sign-up/ .env.local
git commit -m "Add student /sign-up flow with verification landing"
```

---

### Task 2.3: Forgot + reset password

**Files:**
- Create: `app/(auth)/forgot-password/page.tsx`
- Create: `app/(auth)/forgot-password/actions.ts`
- Create: `app/(auth)/reset-password/page.tsx`
- Create: `app/(auth)/reset-password/actions.ts`

- [ ] **Step 1: `app/(auth)/forgot-password/actions.ts`**

```ts
"use server";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function forgotPasswordAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/reset-password`,
  });
  redirect("/forgot-password?sent=1");
}
```

- [ ] **Step 2: `app/(auth)/forgot-password/page.tsx`**

```tsx
import { forgotPasswordAction } from "./actions";

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;
  if (sent) {
    return (
      <div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Check your email</h1>
        <p>If that email is on file, we sent a reset link.</p>
      </div>
    );
  }
  return (
    <form action={forgotPasswordAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Forgot password</h1>
      <label>Email
        <input name="email" type="email" required
          style={{ display: "block", width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 4, marginTop: 4 }} />
      </label>
      <button type="submit" style={{ background: "#0F4566", color: "#fff", padding: "12px 16px", border: "none", borderRadius: 4, fontWeight: 700, cursor: "pointer" }}>
        Send reset link
      </button>
    </form>
  );
}
```

- [ ] **Step 3: `app/(auth)/reset-password/actions.ts`**

```ts
"use server";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function resetPasswordAction(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect(`/reset-password?error=${encodeURIComponent(error.message)}`);
  redirect("/sign-in?reset=1");
}
```

- [ ] **Step 4: `app/(auth)/reset-password/page.tsx`**

```tsx
import { resetPasswordAction } from "./actions";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <form action={resetPasswordAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Set new password</h1>
      {error && <p style={{ color: "#b22234" }}>{error}</p>}
      <label>New password
        <input name="password" type="password" required minLength={8}
          style={{ display: "block", width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 4, marginTop: 4 }} />
      </label>
      <button type="submit" style={{ background: "#0F4566", color: "#fff", padding: "12px 16px", border: "none", borderRadius: 4, fontWeight: 700, cursor: "pointer" }}>
        Update password
      </button>
    </form>
  );
}
```

- [ ] **Step 5: Manual verify** — request reset, click email link, set new password, sign in.

- [ ] **Step 6: Commit**

```bash
git add app/(auth)/forgot-password/ app/(auth)/reset-password/
git commit -m "Add forgot-password and reset-password flows"
```

---

### Task 2.4: Sign-out

**Files:**
- Create: `app/sign-out/route.ts`
- Modify: `app/components/Nav.tsx` (we'll wire sign-out for authed users in a later phase via a separate `<UserMenu>` — for now Nav stays public-facing)

- [ ] **Step 1: `app/sign-out/route.ts`**

```ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"));
}
```

- [ ] **Step 2: Commit**

```bash
git add app/sign-out/
git commit -m "Add /sign-out POST route handler"
```

---

### Task 2.5: Invite acceptance flow

**Files:**
- Create: `app/(auth)/invite/[token]/page.tsx`
- Create: `app/(auth)/invite/[token]/actions.ts`

- [ ] **Step 1: `app/(auth)/invite/[token]/actions.ts`**

```ts
"use server";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function acceptInviteAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const firstName = String(formData.get("first_name") ?? "");
  const lastName = String(formData.get("last_name") ?? "");
  const password = String(formData.get("password") ?? "");

  const invite = await prisma.invitation.findUnique({ where: { token } });
  if (!invite || invite.acceptedAt || invite.revokedAt || invite.expiresAt < new Date()) {
    redirect(`/invite/${token}?error=Invite+invalid+or+expired`);
  }

  // Create the auth user with email pre-confirmed.
  const created = await supabaseAdmin.auth.admin.createUser({
    email: invite.email,
    password,
    email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName },
  });
  if (created.error || !created.data.user) {
    redirect(`/invite/${token}?error=${encodeURIComponent(created.error?.message ?? "Failed")}`);
  }

  // Trigger created profile with role=student; bump to the invited role.
  await prisma.profile.update({
    where: { id: created.data.user.id },
    data: { role: invite.role, firstName, lastName },
  });
  await prisma.invitation.update({
    where: { id: invite.id },
    data: { acceptedAt: new Date() },
  });

  const supabase = await createClient();
  await supabase.auth.signInWithPassword({ email: invite.email, password });

  redirect(invite.role === "admin" ? "/admin" : "/mentor");
}
```

- [ ] **Step 2: `app/(auth)/invite/[token]/page.tsx`**

```tsx
import { prisma } from "@/lib/prisma";
import { acceptInviteAction } from "./actions";

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;
  const invite = await prisma.invitation.findUnique({ where: { token } });
  if (!invite) return <p>Invite not found.</p>;
  if (invite.acceptedAt) return <p>This invite was already accepted.</p>;
  if (invite.revokedAt) return <p>This invite has been revoked.</p>;
  if (invite.expiresAt < new Date()) return <p>This invite has expired. Ask an admin to send a new one.</p>;

  const inputStyle = { display: "block", width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 4, marginTop: 4 } as const;

  return (
    <form action={acceptInviteAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>Accept invite</h1>
      <p>You've been invited to ETU as a <strong>{invite.role}</strong>. Email: <strong>{invite.email}</strong></p>
      {error && <p style={{ color: "#b22234" }}>{error}</p>}
      <input type="hidden" name="token" value={token} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <label>First name <input name="first_name" required style={inputStyle} /></label>
        <label>Last name <input name="last_name" required style={inputStyle} /></label>
      </div>
      <label>Password <input name="password" type="password" required minLength={8} style={inputStyle} /></label>
      <button type="submit" style={{ background: "#0F4566", color: "#fff", padding: "12px 16px", border: "none", borderRadius: 4, fontWeight: 700, cursor: "pointer" }}>
        Accept and sign in
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Manual verify**

Insert a test invitation via Supabase SQL editor:
```sql
INSERT INTO invitations (email, role, invited_by_id, expires_at, token)
VALUES ('test-mentor@example.com', 'mentor', '<existing admin profile id>', now() + interval '14 days', gen_random_uuid())
RETURNING token;
```
Visit `/invite/<token>`. Accept. Confirm `auth.users` has the new user, `profiles.role = 'mentor'`, and invitation `accepted_at` is set.

- [ ] **Step 4: Commit**

```bash
git add app/(auth)/invite/
git commit -m "Add invite acceptance flow for mentor/admin onboarding"
```

---

### Task 2.6: Profile edit page

**Files:**
- Create: `app/(student)/layout.tsx` (gate for student role)
- Create: `app/(student)/me/profile/page.tsx`
- Create: `app/(student)/me/profile/actions.ts`

> Mentor and admin profile editors mirror this; we'll add them in their respective phases. For now, students get the canonical pattern.

- [ ] **Step 1: `app/(student)/layout.tsx`**

```tsx
import type { ReactNode } from "react";
import { requireRole } from "@/lib/auth";

export default async function StudentLayout({ children }: { children: ReactNode }) {
  await requireRole("student");
  return <>{children}</>;
}
```

- [ ] **Step 2: `app/(student)/me/profile/actions.ts`**

```ts
"use server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(formData: FormData) {
  const { profile } = await requireRole("student");
  await prisma.profile.update({
    where: { id: profile.id },
    data: {
      firstName: String(formData.get("first_name") ?? profile.firstName),
      lastName: String(formData.get("last_name") ?? profile.lastName),
      phone: String(formData.get("phone") ?? "") || null,
      school: String(formData.get("school") ?? "") || null,
      grade: formData.get("grade") ? Number(formData.get("grade")) : null,
      parentEmail: String(formData.get("parent_email") ?? "") || null,
      parentPhone: String(formData.get("parent_phone") ?? "") || null,
    },
  });
  revalidatePath("/me/profile");
}
```

- [ ] **Step 3: `app/(student)/me/profile/page.tsx`**

```tsx
import { requireRole } from "@/lib/auth";
import { updateProfileAction } from "./actions";

export default async function StudentProfilePage() {
  const { profile } = await requireRole("student");
  const inputStyle = { display: "block", width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 4, marginTop: 4 } as const;
  return (
    <main style={{ maxWidth: 640, margin: "48px auto", padding: "0 24px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>My profile</h1>
      <form action={updateProfileAction} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label>First name <input name="first_name" defaultValue={profile.firstName} required style={inputStyle} /></label>
          <label>Last name <input name="last_name" defaultValue={profile.lastName} required style={inputStyle} /></label>
        </div>
        <label>Email <input value={profile.email} disabled style={{ ...inputStyle, background: "#f5f5f5" }} /></label>
        <label>Phone <input name="phone" defaultValue={profile.phone ?? ""} style={inputStyle} /></label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
          <label>Grade
            <select name="grade" defaultValue={profile.grade ?? ""} style={inputStyle}>
              <option value="">—</option>
              {[7,8,9,10,11,12].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
          <label>School <input name="school" defaultValue={profile.school ?? ""} style={inputStyle} /></label>
        </div>
        <label>Parent email <input name="parent_email" type="email" defaultValue={profile.parentEmail ?? ""} style={inputStyle} /></label>
        <label>Parent phone <input name="parent_phone" defaultValue={profile.parentPhone ?? ""} style={inputStyle} /></label>
        <button type="submit" style={{ background: "#0F4566", color: "#fff", padding: "12px 16px", border: "none", borderRadius: 4, fontWeight: 700, cursor: "pointer" }}>
          Save changes
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 4: Manual verify** — sign in as a student, visit `/me/profile`, edit, save. Verify in DB.

- [ ] **Step 5: Commit**

```bash
git add app/(student)/
git commit -m "Add student profile edit page with role-gated layout"
```

---

### Task 2.7: Admin sends mentor/admin invites

**Files:**
- Create: `app/(admin)/admin/invitations/page.tsx`
- Create: `app/(admin)/admin/invitations/actions.ts`
- Create: `emails/InviteEmail.tsx`
- Modify: `lib/email/transactional.ts` (add `sendInviteEmail`)

> The admin shell `app/(admin)/layout.tsx` is created in Task 3.5. If you're running this task before Task 3.5, create a temporary layout with just `requireRole("admin")` and a fragment.

- [ ] **Step 1: `emails/InviteEmail.tsx`**

```tsx
import * as React from "react";
import { Html, Head, Body, Container, Section, Heading, Text, Button } from "@react-email/components";
import { BrandHeader, BrandFooter, BRAND } from "./_components/Brand";

export default function InviteEmail(props: {
  inviteUrl: string;
  role: string;
  invitedByName: string;
}) {
  return (
    <Html>
      <Head />
      <Body style={{ background: "#fff", fontFamily: "Manrope, Helvetica, Arial, sans-serif" }}>
        <Container style={{ maxWidth: 600, margin: "0 auto" }}>
          <BrandHeader />
          <Section style={{ padding: "32px 24px" }}>
            <Heading as="h1" style={{ color: BRAND.ink, fontSize: 22, margin: 0 }}>
              You're invited
            </Heading>
            <Text style={{ color: BRAND.body, fontSize: 15 }}>
              {props.invitedByName} invited you to join Empower Teens United as a <strong>{props.role}</strong>.
            </Text>
            <Section style={{ textAlign: "center", padding: 24 }}>
              <Button href={props.inviteUrl} style={{ background: BRAND.navy, color: "#fff", padding: "12px 22px", borderRadius: 4, textDecoration: "none", fontWeight: 700 }}>
                Accept invite
              </Button>
            </Section>
            <Text style={{ color: BRAND.body, fontSize: 13 }}>
              This link expires in 14 days. If the button doesn't work, paste this URL into your browser:
              <br />{props.inviteUrl}
            </Text>
          </Section>
          <BrandFooter />
        </Container>
      </Body>
    </Html>
  );
}
```

- [ ] **Step 2: Append `sendInviteEmail` to `lib/email/transactional.ts`**

```ts
import InviteEmail from "@/emails/InviteEmail";

export async function sendInviteEmail(params: {
  toEmail: string; role: string; invitedByName: string; token: string;
}) {
  const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/invite/${params.token}`;
  const html = await render(InviteEmail({ inviteUrl, role: params.role, invitedByName: params.invitedByName }));
  await resend.emails.send({
    from: `Empower Teens United <${FROM}>`,
    to: params.toEmail,
    subject: `You're invited to ETU (${params.role})`,
    html,
    text: `${params.invitedByName} invited you to ETU as a ${params.role}. Accept: ${inviteUrl}`,
  });
}
```

- [ ] **Step 3: `app/(admin)/admin/invitations/actions.ts`**

```ts
"use server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendInviteEmail } from "@/lib/email/transactional";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { InviteRole } from "@prisma/client";

export async function createInviteAction(formData: FormData) {
  const { profile } = await requireRole("admin");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role")) as InviteRole;
  if (!email || (role !== "admin" && role !== "mentor")) redirect("/admin/invitations?error=Invalid");

  const existing = await prisma.profile.findUnique({ where: { email } });
  if (existing) redirect("/admin/invitations?error=User+already+exists");

  const expiresAt = new Date(Date.now() + 14 * 86400000);
  const invite = await prisma.invitation.create({
    data: { email, role, invitedById: profile.id, expiresAt },
  });

  await sendInviteEmail({
    toEmail: email,
    role,
    invitedByName: `${profile.firstName} ${profile.lastName}`,
    token: invite.token,
  });

  revalidatePath("/admin/invitations");
  redirect("/admin/invitations?sent=1");
}

export async function revokeInviteAction(formData: FormData) {
  await requireRole("admin");
  await prisma.invitation.update({
    where: { id: String(formData.get("id")) },
    data: { revokedAt: new Date() },
  });
  revalidatePath("/admin/invitations");
}
```

- [ ] **Step 4: `app/(admin)/admin/invitations/page.tsx`**

```tsx
import { prisma } from "@/lib/prisma";
import { createInviteAction, revokeInviteAction } from "./actions";

export default async function InvitationsPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;
  const invites = await prisma.invitation.findMany({
    orderBy: { invitedAt: "desc" },
    include: { invitedBy: true },
  });
  const inputStyle = { display: "block", width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 4, marginTop: 4 } as const;
  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: 28, margin: 0 }}>Invitations</h1>
      {sent && <p style={{ color: "#0F4566" }}>Invite sent.</p>}
      {error && <p style={{ color: "#b22234" }}>{error}</p>}

      <form action={createInviteAction} style={{ marginTop: 24, background: "#fff", border: "1px solid #eee", padding: 16, borderRadius: 6, display: "flex", flexDirection: "column", gap: 8 }}>
        <h2 style={{ fontSize: 18, margin: 0 }}>Send new invite</h2>
        <label>Email <input name="email" type="email" required style={inputStyle} /></label>
        <label>Role
          <select name="role" required style={inputStyle} defaultValue="mentor">
            <option value="mentor">Mentor</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <button type="submit" style={{ alignSelf: "flex-start", background: "#0F4566", color: "#fff", padding: "8px 14px", border: "none", borderRadius: 4, fontWeight: 700, cursor: "pointer" }}>Send invite</button>
      </form>

      <h2 style={{ marginTop: 32 }}>All invites</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12, background: "#fff" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
            <th style={{ padding: 12 }}>Email</th>
            <th style={{ padding: 12 }}>Role</th>
            <th style={{ padding: 12 }}>Invited</th>
            <th style={{ padding: 12 }}>Status</th>
            <th style={{ padding: 12 }}></th>
          </tr>
        </thead>
        <tbody>
          {invites.map((i) => {
            const status =
              i.acceptedAt ? "Accepted" :
              i.revokedAt ? "Revoked" :
              i.expiresAt < new Date() ? "Expired" : "Pending";
            return (
              <tr key={i.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 12 }}>{i.email}</td>
                <td style={{ padding: 12 }}>{i.role}</td>
                <td style={{ padding: 12 }}>{i.invitedAt.toLocaleDateString()}</td>
                <td style={{ padding: 12 }}>{status}</td>
                <td style={{ padding: 12 }}>
                  {status === "Pending" && (
                    <form action={revokeInviteAction}>
                      <input type="hidden" name="id" value={i.id} />
                      <button type="submit" style={{ background: "transparent", border: "none", color: "#b22234", cursor: "pointer" }}>Revoke</button>
                    </form>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add app/(admin)/admin/invitations/ emails/InviteEmail.tsx lib/email/
git commit -m "Add admin invitations page with send + revoke + email template"
```

---

### Phase 2 verification

- [ ] **Run all checks + manual smoke**

```bash
npm run lint && npm run build && npm run test
```

Manual: sign up → verify → sign in → land on `/me`. Sign out. Try `/admin` → redirected to `/sign-in?next=/admin`. Send invite as admin → accept as new mentor → sign in → land on `/mentor`.

> `/me`, `/mentor`, and `/admin` dashboard page bodies are created in Task 6.5 below. For now, those routes will 404 even when signed in with the right role; that's expected until 6.5 ships.

---

## Phase 3 — Events end-to-end (~3h)

### Task 3.1: Public events list + detail (DB-backed)

**Files:**
- Modify: `app/(public)/events/page.tsx` (replace static data with DB read)
- Modify: `app/(public)/events/[slug]/page.tsx`
- Create: `lib/dates.ts`

- [ ] **Step 1: `lib/dates.ts`**

```ts
const tzLong = new Intl.DateTimeFormat("en-US", {
  weekday: "short", month: "short", day: "numeric",
  hour: "numeric", minute: "2-digit",
});
const dateOnly = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const monthAbbr = new Intl.DateTimeFormat("en-US", { month: "short" });

export function formatEventDateTime(d: Date) { return tzLong.format(d); }
export function formatShortDate(d: Date) { return dateOnly.format(d); }
export function dayNum(d: Date) { return d.getDate(); }
export function monthAbbreviation(d: Date) { return monthAbbr.format(d); }
```

- [ ] **Step 2: Replace `app/(public)/events/page.tsx`**

```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { A } from "@/app/components/tokens";
import { dayNum, monthAbbreviation, formatEventDateTime } from "@/lib/dates";

export default async function EventsListPage() {
  const events = await prisma.event.findMany({
    where: { publishedAt: { not: null }, archivedAt: null, startsAt: { gte: new Date() } },
    orderBy: { startsAt: "asc" },
  });

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 24px" }}>
      <h1 style={{ fontSize: 40, fontFamily: A.fontHead, margin: 0 }}>Upcoming events</h1>
      <p style={{ color: A.muted, marginTop: 8 }}>Workshops, panels, college tours, and community service.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 16, marginTop: 32 }}>
        {events.map((e) => (
          <Link key={e.id} href={`/events/${e.slug}`} style={{ background: "#fff", border: `1px solid ${A.rule}`, padding: 20, borderRadius: 6, textDecoration: "none", color: "inherit" }}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ background: A.gold, padding: "8px 12px", borderRadius: 4, textAlign: "center", minWidth: 56 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: A.navy }}>{dayNum(e.startsAt)}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: A.navy }}>{monthAbbreviation(e.startsAt).toUpperCase()}</div>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{e.title}</h3>
                <p style={{ margin: "6px 0 0", fontSize: 13, color: A.muted }}>{e.location} · {formatEventDateTime(e.startsAt)}</p>
              </div>
            </div>
          </Link>
        ))}
        {events.length === 0 && <p style={{ color: A.muted }}>No upcoming events. Check back soon.</p>}
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Replace `app/(public)/events/[slug]/page.tsx`**

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { A } from "@/app/components/tokens";
import { formatEventDateTime } from "@/lib/dates";
import { getOptionalUser } from "@/lib/auth";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event || !event.publishedAt || event.archivedAt) notFound();

  const auth = await getOptionalUser();
  const alreadyRegistered = auth
    ? await prisma.eventRegistration.findFirst({
        where: { eventId: event.id, profileId: auth.profile.id, status: "registered" },
      })
    : null;

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "64px 24px" }}>
      <p style={{ color: A.muted, fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>Event</p>
      <h1 style={{ fontSize: 40, fontFamily: A.fontHead, margin: "8px 0 0" }}>{event.title}</h1>
      <p style={{ color: A.body, marginTop: 12 }}>
        {formatEventDateTime(event.startsAt)} · {event.location}
      </p>
      <div style={{ marginTop: 24, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: event.body }} />
      <div style={{ marginTop: 32 }}>
        {alreadyRegistered ? (
          <p style={{ color: A.navy, fontWeight: 600 }}>You're registered. Confirmation + QR code in your email.</p>
        ) : (
          <Link href={`/events/${event.slug}/register`} style={{ display: "inline-block", background: A.navy, color: "#fff", padding: "12px 22px", borderRadius: 4, textDecoration: "none", fontWeight: 700 }}>
            Register
          </Link>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Insert one seed event for testing**

In Supabase SQL editor:
```sql
INSERT INTO events (slug, title, body, location, starts_at, ends_at, published_at, created_by_id)
SELECT 'rollins-tour', 'Rollins College Private Tour',
       '<p>Walk the campus with admissions staff and current ETU alumni.</p>',
       'Rollins Campus', now() + interval '7 days', now() + interval '7 days 3 hours',
       now(), id
FROM profiles WHERE role = 'admin' LIMIT 1;
```

If no admin profile exists yet, manually update an existing profile to `role='admin'` first:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'hsq0503@gmail.com';
```

- [ ] **Step 5: Manual verify**

Run `npm run dev`. Visit `/events` → see the seeded event. Click → see detail page with Register link.

- [ ] **Step 6: Commit**

```bash
git add app/(public)/events/ lib/dates.ts
git commit -m "Wire public events list + detail to Prisma"
```

---

### Task 3.2: Registration page + server action + QR

**Files:**
- Create: `lib/qr.ts`
- Test: `tests/lib/qr.test.ts`
- Create: `app/(public)/events/[slug]/register/page.tsx`
- Create: `app/(public)/events/[slug]/register/actions.ts`

- [ ] **Step 1: Write failing test `tests/lib/qr.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { buildScanUrl, generateQrDataUrl } from "@/lib/qr";

describe("buildScanUrl", () => {
  it("encodes the token into the scan URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
    const url = buildScanUrl("abc-123");
    expect(url).toBe("https://example.com/api/scan?t=abc-123");
  });
});

describe("generateQrDataUrl", () => {
  it("produces a data URL", async () => {
    const dataUrl = await generateQrDataUrl("hello");
    expect(dataUrl.startsWith("data:image/png;base64,")).toBe(true);
  });
});
```

- [ ] **Step 2: Run test, confirm fail**

Run: `npm run test`
Expected: Failures referencing `@/lib/qr`.

- [ ] **Step 3: Implement `lib/qr.ts`**

```ts
import QRCode from "qrcode";

export function buildScanUrl(token: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${base}/api/scan?t=${token}`;
}

export async function generateQrDataUrl(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, { errorCorrectionLevel: "M", margin: 1, width: 320 });
}
```

- [ ] **Step 4: Tests pass**

Run: `npm run test`
Expected: All passing.

- [ ] **Step 5: `app/(public)/events/[slug]/register/actions.ts`**

```ts
"use server";
import { prisma } from "@/lib/prisma";
import { getOptionalUser } from "@/lib/auth";
import { sendRegistrationConfirmation } from "@/lib/email/transactional";
import { redirect } from "next/navigation";

export async function registerForEventAction(formData: FormData) {
  const eventId = String(formData.get("event_id"));
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || !event.publishedAt || event.archivedAt) redirect("/events");

  const auth = await getOptionalUser();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "") || null;
  const grade = formData.get("grade") ? Number(formData.get("grade")) : null;
  const guestCount = Number(formData.get("guest_count") ?? 0);
  const guestNamesRaw = String(formData.get("guest_names") ?? "");
  const guestNames = guestNamesRaw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (!name || !email) redirect(`/events/${event.slug}/register?error=Name+and+email+required`);

  if (event.capacity != null) {
    const used = await prisma.eventRegistration.count({
      where: { eventId: event.id, status: "registered" },
    });
    if (used >= event.capacity) {
      redirect(`/events/${event.slug}/register?error=Event+full`);
    }
  }

  const registration = await prisma.eventRegistration.create({
    data: {
      eventId: event.id,
      profileId: auth?.profile.id ?? null,
      name, email, phone, grade,
      guestCount, guestNames,
    },
  });

  await sendRegistrationConfirmation({
    toEmail: email,
    toName: name,
    event,
    registration,
  });

  redirect(`/events/${event.slug}/register/done`);
}
```

- [ ] **Step 6: `app/(public)/events/[slug]/register/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOptionalUser } from "@/lib/auth";
import { registerForEventAction } from "./actions";

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { slug } = await params;
  const { error } = await searchParams;
  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event || !event.publishedAt) notFound();

  const auth = await getOptionalUser();
  const inputStyle = { display: "block", width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 4, marginTop: 4 } as const;

  return (
    <main style={{ maxWidth: 640, margin: "48px auto", padding: "0 24px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Register · {event.title}</h1>
      <form action={registerForEventAction} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
        {error && <p style={{ color: "#b22234" }}>{error}</p>}
        <input type="hidden" name="event_id" value={event.id} />
        <label>Full name <input name="name" required defaultValue={auth ? `${auth.profile.firstName} ${auth.profile.lastName}` : ""} style={inputStyle} /></label>
        <label>Email <input name="email" type="email" required defaultValue={auth?.profile.email ?? ""} style={inputStyle} /></label>
        <label>Phone (optional) <input name="phone" defaultValue={auth?.profile.phone ?? ""} style={inputStyle} /></label>
        <label>Grade
          <select name="grade" defaultValue={auth?.profile.grade ?? ""} style={inputStyle}>
            <option value="">—</option>
            {[7,8,9,10,11,12].map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </label>
        <label>How many guests are you bringing? <input name="guest_count" type="number" min={0} defaultValue={0} style={inputStyle} /></label>
        <label>Guest names (optional, one per line) <textarea name="guest_names" rows={3} style={inputStyle} /></label>
        <button type="submit" style={{ background: "#0F4566", color: "#fff", padding: "12px 16px", border: "none", borderRadius: 4, fontWeight: 700, cursor: "pointer" }}>
          Register
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 7: `app/(public)/events/[slug]/register/done/page.tsx`**

```tsx
export default async function RegisterDonePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <main style={{ maxWidth: 640, margin: "96px auto", padding: "0 24px", textAlign: "center" }}>
      <h1 style={{ fontSize: 32, fontWeight: 700 }}>You're registered ✓</h1>
      <p style={{ marginTop: 12 }}>We sent a confirmation with your QR code to your email. Show it at the door to check in.</p>
      <p style={{ marginTop: 24 }}><a href={`/events/${slug}`} style={{ color: "#0F4566" }}>Back to event</a></p>
    </main>
  );
}
```

- [ ] **Step 8: Commit (pre email-template work)**

```bash
git add lib/qr.ts tests/lib/qr.test.ts app/(public)/events/
git commit -m "Add QR helpers and event registration form/action"
```

---

### Task 3.3: Registration confirmation email template + send helper

**Files:**
- Create: `lib/email/transactional.ts`
- Create: `emails/RegistrationConfirmation.tsx`
- Create: `emails/_components/Brand.tsx`

- [ ] **Step 1: `emails/_components/Brand.tsx`**

```tsx
import * as React from "react";

export const BRAND = {
  navy: "#0F4566",
  gold: "#FCCC00",
  ink: "#101820",
  body: "#3a4754",
  paper: "#FAF8F3",
};

export function BrandHeader() {
  return (
    <table width="100%" cellPadding={0} cellSpacing={0} style={{ background: BRAND.navy, padding: "20px 24px" }}>
      <tr>
        <td style={{ color: "#fff", fontFamily: "Manrope, Helvetica, Arial, sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: 0.5 }}>
          EMPOWER TEENS UNITED
        </td>
      </tr>
    </table>
  );
}

export function BrandFooter() {
  return (
    <table width="100%" cellPadding={0} cellSpacing={0} style={{ background: BRAND.paper, padding: "20px 24px", marginTop: 24 }}>
      <tr>
        <td style={{ color: BRAND.body, fontFamily: "Manrope, Helvetica, Arial, sans-serif", fontSize: 12 }}>
          Empower Teens United · empowerteensunited.org · +1 (407) 413-7384
        </td>
      </tr>
    </table>
  );
}
```

- [ ] **Step 2: `emails/RegistrationConfirmation.tsx`**

```tsx
import * as React from "react";
import { Html, Head, Body, Container, Section, Heading, Text, Img } from "@react-email/components";
import { BrandHeader, BrandFooter, BRAND } from "./_components/Brand";

type Props = {
  attendeeName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  qrDataUrl: string;
};

export default function RegistrationConfirmation(props: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ background: "#fff", fontFamily: "Manrope, Helvetica, Arial, sans-serif" }}>
        <Container style={{ maxWidth: 600, margin: "0 auto" }}>
          <BrandHeader />
          <Section style={{ padding: "32px 24px" }}>
            <Heading as="h1" style={{ color: BRAND.ink, fontSize: 24, margin: 0 }}>You're registered!</Heading>
            <Text style={{ color: BRAND.body, fontSize: 15 }}>
              Hi {props.attendeeName}, you're confirmed for <strong>{props.eventTitle}</strong>.
            </Text>
            <Text style={{ color: BRAND.body, fontSize: 15 }}>
              <strong>When:</strong> {props.eventDate}<br />
              <strong>Where:</strong> {props.eventLocation}
            </Text>
            <Text style={{ color: BRAND.body, fontSize: 15, marginTop: 24 }}>
              Show this QR at the door to check in:
            </Text>
            <Section style={{ textAlign: "center", padding: 24 }}>
              <Img src={props.qrDataUrl} alt="Check-in QR code" width={240} height={240} />
            </Section>
          </Section>
          <BrandFooter />
        </Container>
      </Body>
    </Html>
  );
}
```

- [ ] **Step 3: `lib/email/transactional.ts`**

```ts
import "server-only";
import { Resend } from "resend";
import { render } from "@react-email/render";
import RegistrationConfirmation from "@/emails/RegistrationConfirmation";
import { buildScanUrl, generateQrDataUrl } from "@/lib/qr";
import { formatEventDateTime } from "@/lib/dates";
import type { Event, EventRegistration } from "@prisma/client";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

export async function sendRegistrationConfirmation(params: {
  toEmail: string;
  toName: string;
  event: Event;
  registration: EventRegistration;
}) {
  const qrDataUrl = await generateQrDataUrl(buildScanUrl(params.registration.qrToken));
  const html = await render(
    RegistrationConfirmation({
      attendeeName: params.toName,
      eventTitle: params.event.title,
      eventDate: formatEventDateTime(params.event.startsAt),
      eventLocation: params.event.location,
      qrDataUrl,
    }),
  );
  const text = `You're registered for ${params.event.title}. When: ${formatEventDateTime(params.event.startsAt)}. Where: ${params.event.location}. Open the email to view your check-in QR.`;

  await resend.emails.send({
    from: `Empower Teens United <${FROM}>`,
    to: params.toEmail,
    subject: `You're registered for ${params.event.title}`,
    html,
    text,
  });
}
```

- [ ] **Step 4: Verify by registering yourself**

Run: `npm run dev`. Go to your seeded event. Register with your real email. Check your inbox — confirmation arrives with QR. Scan the QR with your phone — for now the URL won't resolve (no `/api/scan` yet), that's expected.

- [ ] **Step 5: Commit**

```bash
git add lib/email/ emails/
git commit -m "Add registration confirmation email with QR code"
```

---

### Task 3.4: `/me/events` — student's registrations + QR

**Files:**
- Create: `app/(student)/me/events/page.tsx`

- [ ] **Step 1: `app/(student)/me/events/page.tsx`**

```tsx
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQrDataUrl } from "@/lib/qr";
import { buildScanUrl } from "@/lib/qr";
import { formatEventDateTime } from "@/lib/dates";

export default async function MyEventsPage() {
  const { profile } = await requireRole("student");

  const regs = await prisma.eventRegistration.findMany({
    where: { profileId: profile.id, status: "registered" },
    include: { event: true, checkin: true },
    orderBy: { event: { startsAt: "asc" } },
  });

  const withQr = await Promise.all(
    regs.map(async (r) => ({
      reg: r,
      qrDataUrl: await generateQrDataUrl(buildScanUrl(r.qrToken)),
    })),
  );

  return (
    <main style={{ maxWidth: 800, margin: "48px auto", padding: "0 24px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>My events</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }}>
        {withQr.map(({ reg, qrDataUrl }) => (
          <div key={reg.id} style={{ background: "#fff", border: "1px solid #eee", padding: 20, borderRadius: 6, display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "center" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18 }}>{reg.event.title}</h2>
              <p style={{ color: "#6b7785", marginTop: 4 }}>
                {formatEventDateTime(reg.event.startsAt)} · {reg.event.location}
              </p>
              {reg.checkin && <p style={{ color: "#0F4566", marginTop: 4, fontWeight: 600 }}>✓ Checked in</p>}
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="QR" width={120} height={120} />
          </div>
        ))}
        {withQr.length === 0 && <p style={{ color: "#6b7785" }}>You haven't registered for any events.</p>}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/(student)/me/events/
git commit -m "Add /me/events with QR codes per registration"
```

---

### Task 3.5: Admin events CRUD

**Files:**
- Create: `app/(admin)/layout.tsx`
- Create: `app/(admin)/admin/events/page.tsx`
- Create: `app/(admin)/admin/events/new/page.tsx`
- Create: `app/(admin)/admin/events/[id]/edit/page.tsx`
- Create: `app/(admin)/admin/events/actions.ts`

- [ ] **Step 1: `app/(admin)/layout.tsx` (admin shell with sidebar)**

```tsx
import type { ReactNode } from "react";
import Link from "next/link";
import { requireRole } from "@/lib/auth";

const NAV: Array<[string, string]> = [
  ["Dashboard", "/admin"],
  ["Events", "/admin/events"],
  ["Courses", "/admin/courses"],
  ["Mentorship", "/admin/mentorship"],
  ["Blog", "/admin/blog"],
  ["Contact", "/admin/contact"],
  ["Broadcasts", "/admin/broadcasts"],
  ["Users", "/admin/users"],
  ["Invitations", "/admin/invitations"],
  ["Team", "/admin/team"],
  ["Settings", "/admin/settings"],
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireRole("admin");
  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh", background: "#FAF8F3" }}>
      <aside style={{ background: "#0a3349", color: "#fff", padding: "24px 0" }}>
        <div style={{ padding: "0 24px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <strong>Admin</strong>
          <div style={{ fontSize: 12, opacity: 0.7 }}>{profile.firstName} {profile.lastName}</div>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", marginTop: 12 }}>
          {NAV.map(([label, href]) => (
            <Link key={href} href={href} style={{ padding: "10px 24px", color: "#fff", textDecoration: "none", fontSize: 14 }}>{label}</Link>
          ))}
          <form action="/sign-out" method="post" style={{ marginTop: "auto", padding: "16px 24px" }}>
            <button type="submit" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", padding: "8px 12px", borderRadius: 4, cursor: "pointer", width: "100%" }}>
              Sign out
            </button>
          </form>
        </nav>
      </aside>
      <main style={{ padding: 32 }}>{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: `app/(admin)/admin/events/actions.ts`**

```ts
"use server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createEventAction(formData: FormData) {
  const { profile } = await requireRole("admin");
  const slug = String(formData.get("slug") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "");
  const location = String(formData.get("location") ?? "");
  const startsAt = new Date(String(formData.get("starts_at")));
  const endsAt = new Date(String(formData.get("ends_at")));
  const capacityRaw = formData.get("capacity");
  const capacity = capacityRaw ? Number(capacityRaw) : null;
  const publish = formData.get("publish") === "on";

  const event = await prisma.event.create({
    data: {
      slug, title, body, location, startsAt, endsAt, capacity,
      publishedAt: publish ? new Date() : null,
      createdById: profile.id,
    },
  });
  revalidatePath("/admin/events");
  redirect(`/admin/events/${event.id}/edit`);
}

export async function updateEventAction(eventId: string, formData: FormData) {
  await requireRole("admin");
  const publish = formData.get("publish") === "on";
  await prisma.event.update({
    where: { id: eventId },
    data: {
      slug: String(formData.get("slug") ?? "").trim(),
      title: String(formData.get("title") ?? "").trim(),
      body: String(formData.get("body") ?? ""),
      location: String(formData.get("location") ?? ""),
      startsAt: new Date(String(formData.get("starts_at"))),
      endsAt: new Date(String(formData.get("ends_at"))),
      capacity: formData.get("capacity") ? Number(formData.get("capacity")) : null,
      publishedAt: publish ? new Date() : null,
    },
  });
  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${eventId}/edit`);
}

export async function archiveEventAction(eventId: string) {
  await requireRole("admin");
  await prisma.event.update({ where: { id: eventId }, data: { archivedAt: new Date() } });
  revalidatePath("/admin/events");
}
```

- [ ] **Step 3: `app/(admin)/admin/events/page.tsx`**

```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatEventDateTime } from "@/lib/dates";

export default async function AdminEventsListPage() {
  const events = await prisma.event.findMany({
    where: { archivedAt: null },
    orderBy: { startsAt: "desc" },
    include: { _count: { select: { registrations: true } } },
  });
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>Events</h1>
        <Link href="/admin/events/new" style={{ background: "#0F4566", color: "#fff", padding: "10px 16px", borderRadius: 4, textDecoration: "none", fontWeight: 700 }}>New event</Link>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 24, background: "#fff" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
            <th style={{ padding: 12 }}>Title</th>
            <th style={{ padding: 12 }}>Date</th>
            <th style={{ padding: 12 }}>Location</th>
            <th style={{ padding: 12 }}>Registrations</th>
            <th style={{ padding: 12 }}>Status</th>
            <th style={{ padding: 12 }}></th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 12 }}>{e.title}</td>
              <td style={{ padding: 12 }}>{formatEventDateTime(e.startsAt)}</td>
              <td style={{ padding: 12 }}>{e.location}</td>
              <td style={{ padding: 12 }}>{e._count.registrations}</td>
              <td style={{ padding: 12 }}>{e.publishedAt ? "Published" : "Draft"}</td>
              <td style={{ padding: 12, display: "flex", gap: 8 }}>
                <Link href={`/admin/events/${e.id}/edit`}>Edit</Link>
                <Link href={`/admin/events/${e.id}/registrations`}>Funnel</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: `app/(admin)/admin/events/new/page.tsx`**

```tsx
import { createEventAction } from "../actions";

export default function NewEventPage() {
  const inputStyle = { display: "block", width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 4, marginTop: 4 } as const;
  return (
    <div>
      <h1 style={{ fontSize: 28, margin: 0 }}>New event</h1>
      <form action={createEventAction} style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 640, marginTop: 24 }}>
        <label>Title <input name="title" required style={inputStyle} /></label>
        <label>Slug (URL) <input name="slug" required style={inputStyle} placeholder="rollins-tour" /></label>
        <label>Body (HTML allowed) <textarea name="body" rows={6} style={inputStyle} /></label>
        <label>Location <input name="location" required style={inputStyle} /></label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label>Starts at <input name="starts_at" type="datetime-local" required style={inputStyle} /></label>
          <label>Ends at <input name="ends_at" type="datetime-local" required style={inputStyle} /></label>
        </div>
        <label>Capacity (blank = unlimited) <input name="capacity" type="number" min={1} style={inputStyle} /></label>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" name="publish" /> Publish immediately
        </label>
        <button type="submit" style={{ background: "#0F4566", color: "#fff", padding: "12px 16px", border: "none", borderRadius: 4, fontWeight: 700, cursor: "pointer" }}>Create event</button>
      </form>
    </div>
  );
}
```

- [ ] **Step 5: `app/(admin)/admin/events/[id]/edit/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateEventAction, archiveEventAction } from "../../actions";

function toDateTimeLocal(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) notFound();
  const update = updateEventAction.bind(null, id);
  const archive = archiveEventAction.bind(null, id);
  const inputStyle = { display: "block", width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 4, marginTop: 4 } as const;

  return (
    <div>
      <h1 style={{ fontSize: 28, margin: 0 }}>Edit event</h1>
      <form action={update} style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 640, marginTop: 24 }}>
        <label>Title <input name="title" defaultValue={event.title} required style={inputStyle} /></label>
        <label>Slug <input name="slug" defaultValue={event.slug} required style={inputStyle} /></label>
        <label>Body <textarea name="body" defaultValue={event.body} rows={6} style={inputStyle} /></label>
        <label>Location <input name="location" defaultValue={event.location} required style={inputStyle} /></label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label>Starts at <input name="starts_at" type="datetime-local" defaultValue={toDateTimeLocal(event.startsAt)} required style={inputStyle} /></label>
          <label>Ends at <input name="ends_at" type="datetime-local" defaultValue={toDateTimeLocal(event.endsAt)} required style={inputStyle} /></label>
        </div>
        <label>Capacity <input name="capacity" type="number" min={1} defaultValue={event.capacity ?? ""} style={inputStyle} /></label>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" name="publish" defaultChecked={!!event.publishedAt} /> Published
        </label>
        <button type="submit" style={{ background: "#0F4566", color: "#fff", padding: "12px 16px", border: "none", borderRadius: 4, fontWeight: 700, cursor: "pointer" }}>Save changes</button>
      </form>
      <form action={archive} style={{ marginTop: 32 }}>
        <button type="submit" style={{ background: "#b22234", color: "#fff", padding: "8px 14px", border: "none", borderRadius: 4, fontWeight: 600, cursor: "pointer" }}>Archive event</button>
      </form>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add app/(admin)/
git commit -m "Add admin events CRUD with shell layout"
```

---

### Task 3.6: Event funnel + CSV export

**Files:**
- Create: `lib/csv.ts`
- Create: `app/(admin)/admin/events/[id]/registrations/page.tsx`
- Create: `app/(admin)/admin/events/[id]/registrations/export/route.ts`

- [ ] **Step 1: `lib/csv.ts`**

```ts
export function toCsv<T extends Record<string, unknown>>(rows: T[], headers: Array<keyof T>): string {
  const escape = (v: unknown) => {
    if (v == null) return "";
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const headerLine = headers.join(",");
  const body = rows.map((r) => headers.map((h) => escape(r[h])).join(",")).join("\n");
  return headerLine + "\n" + body + "\n";
}
```

- [ ] **Step 2: `app/(admin)/admin/events/[id]/registrations/page.tsx`**

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatEventDateTime } from "@/lib/dates";

export default async function EventFunnelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) notFound();

  const regs = await prisma.eventRegistration.findMany({
    where: { eventId: id, status: "registered" },
    include: { checkin: true },
    orderBy: { registeredAt: "asc" },
  });

  const totalReg = regs.length;
  const checkedIn = regs.filter((r) => r.checkin).length;
  const conversion = totalReg ? Math.round((checkedIn / totalReg) * 100) : 0;

  return (
    <div>
      <h1 style={{ fontSize: 24, margin: 0 }}>{event.title}</h1>
      <p style={{ color: "#6b7785", marginTop: 4 }}>{formatEventDateTime(event.startsAt)} · {event.location}</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginTop: 24 }}>
        <Stat label="Registered" value={totalReg} />
        <Stat label="Checked in" value={checkedIn} />
        <Stat label="Conversion" value={`${conversion}%`} />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
        <Link href={`/admin/events/${id}/registrations/export`} style={{ background: "#fff", border: "1px solid #ddd", padding: "8px 14px", borderRadius: 4, textDecoration: "none" }}>Export CSV</Link>
        <Link href={`/admin/broadcasts/new?segment=event_registrants:${id}`} style={{ background: "#fff", border: "1px solid #ddd", padding: "8px 14px", borderRadius: 4, textDecoration: "none" }}>Email registrants</Link>
        <Link href={`/admin/broadcasts/new?segment=event_no_shows:${id}`} style={{ background: "#fff", border: "1px solid #ddd", padding: "8px 14px", borderRadius: 4, textDecoration: "none" }}>Email no-shows</Link>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16, background: "#fff" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
            <th style={{ padding: 12 }}>Name</th>
            <th style={{ padding: 12 }}>Grade</th>
            <th style={{ padding: 12 }}>Guests</th>
            <th style={{ padding: 12 }}>Email</th>
            <th style={{ padding: 12 }}>Phone</th>
            <th style={{ padding: 12 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {regs.map((r) => (
            <tr key={r.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 12 }}>{r.name}</td>
              <td style={{ padding: 12 }}>{r.grade ?? "—"}</td>
              <td style={{ padding: 12 }}>{r.guestCount}</td>
              <td style={{ padding: 12 }}>{r.email}</td>
              <td style={{ padding: 12 }}>{r.phone ?? "—"}</td>
              <td style={{ padding: 12 }}>{r.checkin ? "✓ Checked in" : "Registered"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #eee", padding: 20, borderRadius: 6 }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#0F4566" }}>{value}</div>
      <div style={{ color: "#6b7785", fontSize: 13, marginTop: 4 }}>{label}</div>
    </div>
  );
}
```

- [ ] **Step 3: `app/(admin)/admin/events/[id]/registrations/export/route.ts`**

```ts
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toCsv } from "@/lib/csv";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireRole("admin");
  const { id } = await params;
  const regs = await prisma.eventRegistration.findMany({
    where: { eventId: id, status: "registered" },
    include: { checkin: true, event: true },
    orderBy: { registeredAt: "asc" },
  });
  const rows = regs.map((r) => ({
    name: r.name,
    grade: r.grade ?? "",
    guests: r.guestCount,
    email: r.email,
    phone: r.phone ?? "",
    registered_at: r.registeredAt.toISOString(),
    checked_in_at: r.checkin?.checkedInAt.toISOString() ?? "",
  }));
  const csv = toCsv(rows, ["name", "grade", "guests", "email", "phone", "registered_at", "checked_in_at"]);
  const eventTitle = regs[0]?.event.title ?? "event";
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${eventTitle.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-registrations.csv"`,
    },
  });
}
```

- [ ] **Step 4: Commit**

```bash
git add lib/csv.ts app/(admin)/admin/events/[id]/registrations/
git commit -m "Add event funnel page with CSV export"
```

---

### Task 3.7: QR scan endpoint + admin scan page

**Files:**
- Create: `app/api/scan/route.ts`
- Create: `app/(admin)/admin/scan/page.tsx`

> The scan endpoint accepts GET (from the QR redirect when scanned with a phone's camera, which opens the URL in a browser) and is idempotent.

- [ ] **Step 1: `app/api/scan/route.ts`**

```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOptionalUser } from "@/lib/auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("t");
  if (!token) return NextResponse.redirect(new URL("/sign-in", req.url));

  const auth = await getOptionalUser();
  if (!auth || (auth.profile.role !== "admin" && auth.profile.role !== "mentor")) {
    return NextResponse.redirect(new URL(`/sign-in?next=/api/scan?t=${token}`, req.url));
  }

  const reg = await prisma.eventRegistration.findUnique({
    where: { qrToken: token },
    include: { event: true, checkin: true },
  });

  if (!reg) {
    return new NextResponse(`<h1>Unknown QR</h1>`, { headers: { "Content-Type": "text/html" } });
  }

  if (!reg.checkin) {
    await prisma.eventCheckin.create({
      data: { registrationId: reg.id, checkedInById: auth.profile.id },
    });
  }

  return new NextResponse(
    `<!doctype html><html><body style="font-family:system-ui;padding:24px;max-width:480px;margin:0 auto;text-align:center;">
       <h1 style="color:#0F4566;">✓ Checked in</h1>
       <p style="font-size:18px;margin-top:8px;"><strong>${reg.name}</strong>${reg.grade ? ` (Grade ${reg.grade})` : ""}</p>
       ${reg.guestCount ? `<p>+ ${reg.guestCount} guest${reg.guestCount === 1 ? "" : "s"}</p>` : ""}
       <p style="color:#6b7785;">${reg.event.title}</p>
       <p style="margin-top:32px;"><a href="/admin/scan" style="color:#0F4566;">Scan another</a></p>
     </body></html>`,
    { headers: { "Content-Type": "text/html" } },
  );
}
```

- [ ] **Step 2: `app/(admin)/admin/scan/page.tsx`** (client component using html5-qrcode)

Run: `npm install html5-qrcode`

Then create:
```tsx
"use client";
import { useEffect, useRef, useState } from "react";

export default function ScanPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "scanning" | "stopped">("idle");

  useEffect(() => {
    if (!containerRef.current) return;
    let scanner: any;
    (async () => {
      const { Html5Qrcode } = await import("html5-qrcode");
      scanner = new Html5Qrcode("qr-reader");
      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 240 },
          (decoded: string) => {
            window.location.href = decoded;
          },
          () => {},
        );
        setStatus("scanning");
      } catch (e) {
        console.error(e);
        setStatus("stopped");
      }
    })();
    return () => {
      if (scanner) scanner.stop().catch(() => {});
    };
  }, []);

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Scan attendee QR</h1>
      <div id="qr-reader" ref={containerRef} style={{ width: "100%", background: "#000", borderRadius: 6, overflow: "hidden", aspectRatio: "1/1" }} />
      <p style={{ marginTop: 16, color: "#6b7785" }}>Status: {status}</p>
    </div>
  );
}
```

- [ ] **Step 3: Manual verify**

Run dev server, sign in as admin, go to `/admin/scan`. Allow camera. Scan the QR from your earlier registration email — phone redirects to `/api/scan?t=...` → check-in page. Refresh the admin funnel page; checked-in count incremented.

- [ ] **Step 4: Commit**

```bash
git add app/api/scan/ app/(admin)/admin/scan/ package.json package-lock.json
git commit -m "Add /api/scan endpoint and /admin/scan camera page"
```

---

### Phase 3 verification

- [ ] **Run all checks + walk the funnel**

```bash
npm run lint && npm run build && npm run test
```

Manual: Create an event in admin → publish → register as a public visitor → confirmation email arrives with QR → admin scans → funnel shows 1 registered, 1 checked in.

---

## Phase 4 — Courses + weekly reflection (~2h)

### Task 4.1: Public courses list + detail (DB-backed)

**Files:**
- Modify: `app/(public)/courses/page.tsx`
- Modify: `app/(public)/courses/[slug]/page.tsx`

- [ ] **Step 1: Replace `app/(public)/courses/page.tsx`**

```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { A } from "@/app/components/tokens";
import { formatShortDate } from "@/lib/dates";

export default async function CoursesListPage() {
  const courses = await prisma.course.findMany({
    where: { publishedAt: { not: null }, archivedAt: null },
    orderBy: { startsOn: "asc" },
  });
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "64px 24px" }}>
      <h1 style={{ fontSize: 40, fontFamily: A.fontHead, margin: 0 }}>Programs</h1>
      <p style={{ color: A.muted, marginTop: 8 }}>Cohort-based programs combining mentorship, leadership, and personal growth.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16, marginTop: 32 }}>
        {courses.map((c) => (
          <Link key={c.id} href={`/courses/${c.slug}`} style={{ background: "#fff", border: `1px solid ${A.rule}`, padding: 24, borderRadius: 6, textDecoration: "none", color: "inherit" }}>
            <h3 style={{ margin: 0, fontFamily: A.fontHead, fontSize: 20 }}>{c.title}</h3>
            <p style={{ color: A.muted, fontSize: 13, marginTop: 6 }}>{c.weeks} weeks · starts {formatShortDate(c.startsOn)} · ages {c.ageMin}-{c.ageMax}</p>
          </Link>
        ))}
        {courses.length === 0 && <p style={{ color: A.muted }}>No active programs.</p>}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Replace `app/(public)/courses/[slug]/page.tsx`**

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOptionalUser } from "@/lib/auth";
import { A } from "@/app/components/tokens";
import { formatShortDate } from "@/lib/dates";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await prisma.course.findUnique({
    where: { slug },
    include: { courseWeeks: { orderBy: { weekNo: "asc" } } },
  });
  if (!course || !course.publishedAt || course.archivedAt) notFound();

  const auth = await getOptionalUser();
  const enrolled = auth
    ? await prisma.enrollment.findFirst({ where: { courseId: course.id, profileId: auth.profile.id, status: "active" } })
    : null;

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "64px 24px" }}>
      <p style={{ color: A.muted, fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>Program</p>
      <h1 style={{ fontSize: 40, fontFamily: A.fontHead, margin: "8px 0 0" }}>{course.title}</h1>
      <p style={{ color: A.body, marginTop: 12 }}>
        {course.weeks} weeks · starts {formatShortDate(course.startsOn)} · {course.location}
      </p>
      <div style={{ marginTop: 24, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: course.body }} />
      <div style={{ marginTop: 32 }}>
        {enrolled ? (
          <Link href={`/me/courses/${course.slug}`} style={{ display: "inline-block", background: A.navy, color: "#fff", padding: "12px 22px", borderRadius: 4, textDecoration: "none", fontWeight: 700 }}>
            Open my course
          </Link>
        ) : (
          <form action={`/courses/${course.slug}/enroll`} method="post" style={{ display: "inline" }}>
            <button type="submit" style={{ background: A.navy, color: "#fff", padding: "12px 22px", borderRadius: 4, border: "none", fontWeight: 700, cursor: "pointer" }}>Enroll</button>
          </form>
        )}
      </div>
      <section style={{ marginTop: 48 }}>
        <h2 style={{ fontSize: 22, fontFamily: A.fontHead }}>Weekly outline</h2>
        <ol style={{ paddingLeft: 20 }}>
          {course.courseWeeks.map((w) => (
            <li key={w.id} style={{ marginTop: 8 }}>
              <strong>Week {w.weekNo}:</strong> {w.title}
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/(public)/courses/
git commit -m "Wire public courses list + detail to Prisma"
```

---

### Task 4.2: Enrollment action

**Files:**
- Create: `app/(public)/courses/[slug]/enroll/route.ts`

- [ ] **Step 1: `app/(public)/courses/[slug]/enroll/route.ts`**

```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOptionalUser } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const auth = await getOptionalUser();
  if (!auth) {
    return NextResponse.redirect(new URL(`/sign-in?next=/courses/${slug}`, req.url));
  }
  if (auth.profile.role !== "student") {
    return NextResponse.redirect(new URL(`/courses/${slug}?error=Only+students+can+enroll`, req.url));
  }
  const course = await prisma.course.findUnique({ where: { slug } });
  if (!course || !course.publishedAt) return NextResponse.redirect(new URL("/courses", req.url));

  await prisma.enrollment.upsert({
    where: { courseId_profileId: { courseId: course.id, profileId: auth.profile.id } },
    create: { courseId: course.id, profileId: auth.profile.id },
    update: { status: "active" },
  });
  return NextResponse.redirect(new URL(`/me/courses/${slug}`, req.url));
}
```

- [ ] **Step 2: Commit**

```bash
git add app/(public)/courses/[slug]/enroll/
git commit -m "Add course enrollment route handler"
```

---

### Task 4.3: Student course view + weekly answers

**Files:**
- Create: `app/(student)/me/courses/[slug]/page.tsx`
- Create: `app/(student)/me/courses/[slug]/week/[n]/page.tsx`
- Create: `app/(student)/me/courses/[slug]/week/[n]/actions.ts`

- [ ] **Step 1: `app/(student)/me/courses/[slug]/page.tsx`**

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MyCourseHomePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { profile } = await requireRole("student");
  const { slug } = await params;

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      courseWeeks: { orderBy: { weekNo: "asc" } },
      enrollments: { where: { profileId: profile.id }, include: { responses: true } },
    },
  });
  const enrollment = course?.enrollments[0];
  if (!course || !enrollment) notFound();

  return (
    <main style={{ maxWidth: 800, margin: "48px auto", padding: "0 24px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>{course.title}</h1>
      <p style={{ color: "#6b7785", marginTop: 4 }}>Your weekly progress</p>
      <ol style={{ paddingLeft: 0, listStyle: "none", marginTop: 24 }}>
        {course.courseWeeks.map((w) => {
          const r = enrollment.responses.find((x) => x.weekId === w.id);
          const done = !!r?.submittedAt;
          return (
            <li key={w.id} style={{ background: "#fff", border: "1px solid #eee", padding: 16, borderRadius: 6, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, color: "#6b7785" }}>Week {w.weekNo}</div>
                <div style={{ fontWeight: 600 }}>{w.title}</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {done && <span style={{ color: "#0F4566", fontSize: 13 }}>✓ Submitted</span>}
                <Link href={`/me/courses/${slug}/week/${w.weekNo}`} style={{ color: "#0F4566", fontWeight: 600 }}>{done ? "Edit" : "Start"}</Link>
              </div>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
```

- [ ] **Step 2: `app/(student)/me/courses/[slug]/week/[n]/actions.ts`**

```ts
"use server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

type QuestionDef = { id: string; prompt: string; type: "short" | "long" };

export async function submitWeekAnswersAction(
  slug: string,
  weekNo: number,
  formData: FormData,
) {
  const { profile } = await requireRole("student");
  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      courseWeeks: { where: { weekNo } },
      enrollments: { where: { profileId: profile.id } },
    },
  });
  const week = course?.courseWeeks[0];
  const enrollment = course?.enrollments[0];
  if (!week || !enrollment) redirect("/me");

  const questions = (week.questions as unknown as QuestionDef[]) ?? [];
  const answers: Record<string, string> = {};
  for (const q of questions) {
    answers[q.id] = String(formData.get(`q_${q.id}`) ?? "");
  }

  await prisma.lessonResponse.upsert({
    where: { enrollmentId_weekId: { enrollmentId: enrollment.id, weekId: week.id } },
    create: {
      enrollmentId: enrollment.id,
      weekId: week.id,
      answers,
      submittedAt: new Date(),
    },
    update: { answers, submittedAt: new Date() },
  });

  redirect(`/me/courses/${slug}`);
}
```

- [ ] **Step 3: `app/(student)/me/courses/[slug]/week/[n]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { submitWeekAnswersAction } from "./actions";

type QuestionDef = { id: string; prompt: string; type: "short" | "long" };

export default async function WeekAnswerPage({
  params,
}: {
  params: Promise<{ slug: string; n: string }>;
}) {
  const { slug, n } = await params;
  const weekNo = Number(n);
  const { profile } = await requireRole("student");

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      courseWeeks: { where: { weekNo } },
      enrollments: {
        where: { profileId: profile.id },
        include: { responses: true },
      },
    },
  });
  const week = course?.courseWeeks[0];
  const enrollment = course?.enrollments[0];
  if (!course || !week || !enrollment) notFound();

  const response = enrollment.responses.find((r) => r.weekId === week.id);
  const existing = (response?.answers as Record<string, string>) ?? {};
  const questions = (week.questions as unknown as QuestionDef[]) ?? [];
  const submit = submitWeekAnswersAction.bind(null, slug, weekNo);
  const inputStyle = { display: "block", width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 4, marginTop: 4 } as const;

  return (
    <main style={{ maxWidth: 720, margin: "48px auto", padding: "0 24px" }}>
      <p style={{ color: "#6b7785" }}>Week {week.weekNo} of {course.weeks}</p>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>{week.title}</h1>
      <div style={{ marginTop: 16, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: week.body }} />
      <form action={submit} style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 16 }}>
        {questions.map((q) => (
          <label key={q.id}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{q.prompt}</span>
            {q.type === "long" ? (
              <textarea name={`q_${q.id}`} rows={4} defaultValue={existing[q.id] ?? ""} style={inputStyle} />
            ) : (
              <input name={`q_${q.id}`} defaultValue={existing[q.id] ?? ""} style={inputStyle} />
            )}
          </label>
        ))}
        <button type="submit" style={{ background: "#0F4566", color: "#fff", padding: "12px 16px", border: "none", borderRadius: 4, fontWeight: 700, cursor: "pointer" }}>
          {response?.submittedAt ? "Update answers" : "Submit answers"}
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/(student)/me/courses/
git commit -m "Add student course view and weekly answer form"
```

---

### Task 4.4: Admin course CRUD + per-week prompt editor

**Files:**
- Create: `app/(admin)/admin/courses/page.tsx`
- Create: `app/(admin)/admin/courses/new/page.tsx`
- Create: `app/(admin)/admin/courses/[id]/edit/page.tsx`
- Create: `app/(admin)/admin/courses/actions.ts`

- [ ] **Step 1: `app/(admin)/admin/courses/actions.ts`**

```ts
"use server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createCourseAction(formData: FormData) {
  const { profile } = await requireRole("admin");
  const weeks = Number(formData.get("weeks") ?? 10);
  const course = await prisma.course.create({
    data: {
      slug: String(formData.get("slug") ?? "").trim(),
      title: String(formData.get("title") ?? "").trim(),
      body: String(formData.get("body") ?? ""),
      location: String(formData.get("location") ?? ""),
      startsOn: new Date(String(formData.get("starts_on"))),
      weeks,
      ageMin: Number(formData.get("age_min") ?? 14),
      ageMax: Number(formData.get("age_max") ?? 18),
      cohortCap: formData.get("cohort_cap") ? Number(formData.get("cohort_cap")) : null,
      certificate: formData.get("certificate") === "on",
      publishedAt: formData.get("publish") === "on" ? new Date() : null,
      createdById: profile.id,
      courseWeeks: {
        create: Array.from({ length: weeks }, (_, i) => ({
          weekNo: i + 1,
          title: `Week ${i + 1}`,
          body: "",
          questions: [],
        })),
      },
    },
  });
  revalidatePath("/admin/courses");
  redirect(`/admin/courses/${course.id}/edit`);
}

export async function updateCourseMetadataAction(courseId: string, formData: FormData) {
  await requireRole("admin");
  await prisma.course.update({
    where: { id: courseId },
    data: {
      slug: String(formData.get("slug") ?? "").trim(),
      title: String(formData.get("title") ?? "").trim(),
      body: String(formData.get("body") ?? ""),
      location: String(formData.get("location") ?? ""),
      startsOn: new Date(String(formData.get("starts_on"))),
      ageMin: Number(formData.get("age_min") ?? 14),
      ageMax: Number(formData.get("age_max") ?? 18),
      cohortCap: formData.get("cohort_cap") ? Number(formData.get("cohort_cap")) : null,
      certificate: formData.get("certificate") === "on",
      publishedAt: formData.get("publish") === "on" ? new Date() : null,
    },
  });
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}/edit`);
}

export async function updateWeekAction(weekId: string, formData: FormData) {
  await requireRole("admin");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "");
  const questionsRaw = String(formData.get("questions") ?? "[]");
  let questions: unknown;
  try {
    questions = JSON.parse(questionsRaw);
  } catch {
    questions = [];
  }
  await prisma.courseWeek.update({
    where: { id: weekId },
    data: { title, body, questions: questions as any },
  });
}
```

- [ ] **Step 2: `app/(admin)/admin/courses/page.tsx`**

```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatShortDate } from "@/lib/dates";

export default async function AdminCoursesListPage() {
  const courses = await prisma.course.findMany({
    where: { archivedAt: null },
    orderBy: { startsOn: "desc" },
    include: { _count: { select: { enrollments: true } } },
  });
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>Courses</h1>
        <Link href="/admin/courses/new" style={{ background: "#0F4566", color: "#fff", padding: "10px 16px", borderRadius: 4, textDecoration: "none", fontWeight: 700 }}>New course</Link>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 24, background: "#fff" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
            <th style={{ padding: 12 }}>Title</th>
            <th style={{ padding: 12 }}>Starts</th>
            <th style={{ padding: 12 }}>Weeks</th>
            <th style={{ padding: 12 }}>Enrollments</th>
            <th style={{ padding: 12 }}>Status</th>
            <th style={{ padding: 12 }}></th>
          </tr>
        </thead>
        <tbody>
          {courses.map((c) => (
            <tr key={c.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 12 }}>{c.title}</td>
              <td style={{ padding: 12 }}>{formatShortDate(c.startsOn)}</td>
              <td style={{ padding: 12 }}>{c.weeks}</td>
              <td style={{ padding: 12 }}>{c._count.enrollments}</td>
              <td style={{ padding: 12 }}>{c.publishedAt ? "Published" : "Draft"}</td>
              <td style={{ padding: 12 }}><Link href={`/admin/courses/${c.id}/edit`}>Edit</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 3: `app/(admin)/admin/courses/new/page.tsx`**

```tsx
import { createCourseAction } from "../actions";

export default function NewCoursePage() {
  const inputStyle = { display: "block", width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 4, marginTop: 4 } as const;
  return (
    <div>
      <h1 style={{ fontSize: 28, margin: 0 }}>New course</h1>
      <form action={createCourseAction} style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 640, marginTop: 24 }}>
        <label>Title <input name="title" required style={inputStyle} /></label>
        <label>Slug <input name="slug" required style={inputStyle} /></label>
        <label>Body <textarea name="body" rows={6} style={inputStyle} /></label>
        <label>Location <input name="location" required style={inputStyle} /></label>
        <label>Starts on <input name="starts_on" type="date" required style={inputStyle} /></label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <label>Weeks <input name="weeks" type="number" min={1} max={52} defaultValue={10} required style={inputStyle} /></label>
          <label>Min age <input name="age_min" type="number" defaultValue={14} required style={inputStyle} /></label>
          <label>Max age <input name="age_max" type="number" defaultValue={18} required style={inputStyle} /></label>
        </div>
        <label>Cohort cap <input name="cohort_cap" type="number" min={1} style={inputStyle} /></label>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="checkbox" name="certificate" defaultChecked /> Issues certificate</label>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="checkbox" name="publish" /> Publish immediately</label>
        <button type="submit" style={{ background: "#0F4566", color: "#fff", padding: "12px 16px", border: "none", borderRadius: 4, fontWeight: 700, cursor: "pointer" }}>Create course (empty weeks)</button>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: `app/(admin)/admin/courses/[id]/edit/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateCourseMetadataAction, updateWeekAction } from "../../actions";

function toDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await prisma.course.findUnique({
    where: { id },
    include: { courseWeeks: { orderBy: { weekNo: "asc" } } },
  });
  if (!course) notFound();
  const updateMeta = updateCourseMetadataAction.bind(null, id);
  const inputStyle = { display: "block", width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 4, marginTop: 4 } as const;

  return (
    <div>
      <h1 style={{ fontSize: 28, margin: 0 }}>Edit course</h1>
      <form action={updateMeta} style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 640, marginTop: 24 }}>
        <label>Title <input name="title" defaultValue={course.title} required style={inputStyle} /></label>
        <label>Slug <input name="slug" defaultValue={course.slug} required style={inputStyle} /></label>
        <label>Body <textarea name="body" defaultValue={course.body} rows={6} style={inputStyle} /></label>
        <label>Location <input name="location" defaultValue={course.location} required style={inputStyle} /></label>
        <label>Starts on <input name="starts_on" type="date" defaultValue={toDate(course.startsOn)} required style={inputStyle} /></label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label>Min age <input name="age_min" type="number" defaultValue={course.ageMin} required style={inputStyle} /></label>
          <label>Max age <input name="age_max" type="number" defaultValue={course.ageMax} required style={inputStyle} /></label>
        </div>
        <label>Cohort cap <input name="cohort_cap" type="number" min={1} defaultValue={course.cohortCap ?? ""} style={inputStyle} /></label>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="checkbox" name="certificate" defaultChecked={course.certificate} /> Issues certificate</label>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="checkbox" name="publish" defaultChecked={!!course.publishedAt} /> Published</label>
        <button type="submit" style={{ background: "#0F4566", color: "#fff", padding: "12px 16px", border: "none", borderRadius: 4, fontWeight: 700, cursor: "pointer" }}>Save metadata</button>
      </form>

      <h2 style={{ fontSize: 22, marginTop: 48 }}>Weekly prompts</h2>
      <p style={{ color: "#6b7785", fontSize: 13 }}>
        Each week has a title, body (HTML), and a JSON array of questions students will answer.
        Question format: <code>[{`{"id":"q1","prompt":"What did you learn?","type":"long"}`}]</code>. Type is <code>short</code> or <code>long</code>.
      </p>
      {course.courseWeeks.map((w) => {
        const updateWeek = updateWeekAction.bind(null, w.id);
        return (
          <form key={w.id} action={updateWeek} style={{ background: "#fff", border: "1px solid #eee", padding: 16, borderRadius: 6, marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            <strong>Week {w.weekNo}</strong>
            <input name="title" defaultValue={w.title} style={inputStyle} />
            <textarea name="body" defaultValue={w.body} rows={4} style={inputStyle} placeholder="HTML body for this week's content" />
            <textarea name="questions" defaultValue={JSON.stringify(w.questions, null, 2)} rows={6} style={{ ...inputStyle, fontFamily: "monospace", fontSize: 13 }} />
            <button type="submit" style={{ alignSelf: "flex-start", background: "#0F4566", color: "#fff", padding: "8px 14px", border: "none", borderRadius: 4, fontWeight: 600, cursor: "pointer" }}>Save week</button>
          </form>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add app/(admin)/admin/courses/
git commit -m "Add admin course CRUD with per-week prompt editor"
```

---

### Phase 4 verification

Sign in as admin → create a course with 3 weeks and one short-type question per week → publish. Sign out, sign in as a student → enroll → answer Week 1 → see "✓ Submitted" on the course home.

```bash
npm run lint && npm run build && npm run test
```

---

## Phase 5 — Mentorship 3-form flow (~2h)

### Task 5.1: Form definitions in code

**Files:**
- Create: `lib/forms/types.ts`
- Create: `lib/forms/intake.ts`
- Create: `lib/forms/session.ts`
- Create: `lib/forms/hs-plan.ts`
- Test: `tests/lib/forms.test.ts`

- [ ] **Step 1: `lib/forms/types.ts`**

```ts
export type FormQuestion = {
  id: string;
  prompt: string;
  type: "short" | "long" | "select";
  options?: string[];
  required?: boolean;
};

export type FormDefinition = {
  version: number;
  title: string;
  description?: string;
  questions: FormQuestion[];
};

export type FormAnswers = Record<string, string>;
```

- [ ] **Step 2: `lib/forms/intake.ts`** (20-question intake)

```ts
import type { FormDefinition } from "./types";

export const INTAKE_FORM: FormDefinition = {
  version: 1,
  title: "Student intake",
  description: "Filled by the student before their first mentorship session. Mentors and admins see all answers.",
  questions: [
    { id: "name_pref", prompt: "What name do you go by?", type: "short", required: true },
    { id: "grade", prompt: "What grade are you in?", type: "short", required: true },
    { id: "school", prompt: "What school do you attend?", type: "short", required: true },
    { id: "strengths", prompt: "What are three of your biggest strengths?", type: "long", required: true },
    { id: "challenges", prompt: "What are three things you find challenging right now?", type: "long", required: true },
    { id: "passions", prompt: "What activities make you lose track of time?", type: "long" },
    { id: "career_idea", prompt: "If you had to pick a career today, what would it be and why?", type: "long" },
    { id: "college", prompt: "Are you thinking about college? If yes, which ones?", type: "long" },
    { id: "support_system", prompt: "Who do you turn to when things get hard?", type: "long" },
    { id: "stress", prompt: "How do you typically handle stress?", type: "long" },
    { id: "goal_1yr", prompt: "What's one goal you have for the next year?", type: "long", required: true },
    { id: "goal_5yr", prompt: "Where do you see yourself in 5 years?", type: "long" },
    { id: "mentor_help", prompt: "What's one thing you hope a mentor can help you with?", type: "long", required: true },
    { id: "scared_of", prompt: "What's something you're afraid of about the future?", type: "long" },
    { id: "proud_of", prompt: "What's something you're proud of?", type: "long" },
    { id: "family", prompt: "How would you describe your family?", type: "long" },
    { id: "free_time", prompt: "What do you do in your free time?", type: "long" },
    { id: "role_model", prompt: "Who's a role model for you and why?", type: "long" },
    { id: "describe_self_3", prompt: "Describe yourself in three words.", type: "short" },
    { id: "anything_else", prompt: "Anything else you want your mentor to know before meeting?", type: "long" },
  ],
};
```

- [ ] **Step 3: `lib/forms/session.ts`** (mentor session form)

```ts
import type { FormDefinition } from "./types";

export const SESSION_FORM: FormDefinition = {
  version: 1,
  title: "Session notes",
  description: "Filled by the mentor during or right after each meeting.",
  questions: [
    { id: "date", prompt: "Date of session", type: "short", required: true },
    { id: "duration", prompt: "Approximate length (minutes)", type: "short" },
    { id: "format", prompt: "Format", type: "select", options: ["In person", "Video", "Phone"], required: true },
    { id: "topics", prompt: "What did you cover?", type: "long", required: true },
    { id: "wins", prompt: "Wins or progress since last time", type: "long" },
    { id: "concerns", prompt: "Concerns or red flags", type: "long" },
    { id: "action_items", prompt: "Action items for the student before next session", type: "long" },
    { id: "next_session", prompt: "Tentative next session date", type: "short" },
    { id: "mentor_notes", prompt: "Anything else for your records or admin", type: "long" },
  ],
};
```

- [ ] **Step 4: `lib/forms/hs-plan.ts`**

```ts
import type { FormDefinition } from "./types";

export const HS_PLAN_FORM: FormDefinition = {
  version: 1,
  title: "My high-school plan",
  description: "Filled by the student near the end of the mentorship. Capstone document.",
  questions: [
    { id: "north_star", prompt: "What's your north-star goal (life or career) for the next 5 years?", type: "long", required: true },
    { id: "this_year", prompt: "What are 3 things you'll accomplish this academic year?", type: "long", required: true },
    { id: "courses", prompt: "What courses are you planning to take next year?", type: "long" },
    { id: "activities", prompt: "What activities, clubs, or service work will you do?", type: "long" },
    { id: "summer", prompt: "What's your plan for next summer?", type: "long" },
    { id: "college_path", prompt: "What's your college / post-HS plan?", type: "long" },
    { id: "people", prompt: "Who will you ask for help along the way?", type: "long" },
    { id: "biggest_risk", prompt: "What's the biggest risk to this plan and how will you handle it?", type: "long" },
    { id: "thank_you", prompt: "Anything you want to tell your mentor or the ETU team?", type: "long" },
  ],
};
```

- [ ] **Step 5: `tests/lib/forms.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { INTAKE_FORM } from "@/lib/forms/intake";
import { SESSION_FORM } from "@/lib/forms/session";
import { HS_PLAN_FORM } from "@/lib/forms/hs-plan";

describe("form definitions", () => {
  it("intake has exactly 20 questions", () => {
    expect(INTAKE_FORM.questions).toHaveLength(20);
  });
  it("every question has a unique id within each form", () => {
    for (const form of [INTAKE_FORM, SESSION_FORM, HS_PLAN_FORM]) {
      const ids = form.questions.map((q) => q.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
  it("every form has version >= 1", () => {
    expect(INTAKE_FORM.version).toBeGreaterThanOrEqual(1);
    expect(SESSION_FORM.version).toBeGreaterThanOrEqual(1);
    expect(HS_PLAN_FORM.version).toBeGreaterThanOrEqual(1);
  });
});
```

- [ ] **Step 6: Run tests**

```bash
npm run test
```
Expected: All pass.

- [ ] **Step 7: Commit**

```bash
git add lib/forms/ tests/lib/forms.test.ts
git commit -m "Add intake (20-Q), session, and HS plan form definitions"
```

---

### Task 5.2: Student mentorship page

**Files:**
- Create: `app/(student)/me/mentorship/page.tsx`
- Create: `app/(student)/me/mentorship/actions.ts`

- [ ] **Step 1: `app/(student)/me/mentorship/actions.ts`**

```ts
"use server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { INTAKE_FORM } from "@/lib/forms/intake";
import { HS_PLAN_FORM } from "@/lib/forms/hs-plan";
import type { FormDefinition } from "@/lib/forms/types";

function readAnswers(formData: FormData, def: FormDefinition) {
  const answers: Record<string, string> = {};
  for (const q of def.questions) answers[q.id] = String(formData.get(q.id) ?? "");
  return answers;
}

export async function submitIntakeAction(formData: FormData) {
  const { profile } = await requireRole("student");
  const answers = readAnswers(formData, INTAKE_FORM);
  await prisma.mentorshipForm.upsert({
    where: { studentId_kind_sessionNo: { studentId: profile.id, kind: "intake", sessionNo: null as any } },
    create: {
      studentId: profile.id,
      kind: "intake",
      answers,
      formVersion: INTAKE_FORM.version,
      submittedById: profile.id,
      submittedAt: new Date(),
    },
    update: { answers, submittedAt: new Date(), formVersion: INTAKE_FORM.version },
  });
  redirect("/me/mentorship");
}

export async function submitHsPlanAction(formData: FormData) {
  const { profile } = await requireRole("student");
  const answers = readAnswers(formData, HS_PLAN_FORM);
  await prisma.mentorshipForm.upsert({
    where: { studentId_kind_sessionNo: { studentId: profile.id, kind: "hs_plan", sessionNo: null as any } },
    create: {
      studentId: profile.id,
      kind: "hs_plan",
      answers,
      formVersion: HS_PLAN_FORM.version,
      submittedById: profile.id,
      submittedAt: new Date(),
    },
    update: { answers, submittedAt: new Date(), formVersion: HS_PLAN_FORM.version },
  });
  redirect("/me/mentorship");
}
```

> Note: Prisma's `unique` index with a nullable column treats nulls as distinct. For the intake/hs_plan case where `session_no` is null, the upsert key with `null as any` won't actually match. Workaround: query first, then create-or-update conditionally. Refactor to:

Re-create the file with the safer pattern:

```ts
"use server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { INTAKE_FORM } from "@/lib/forms/intake";
import { HS_PLAN_FORM } from "@/lib/forms/hs-plan";
import type { FormDefinition } from "@/lib/forms/types";
import type { MentorshipFormKind } from "@prisma/client";

function readAnswers(formData: FormData, def: FormDefinition) {
  const answers: Record<string, string> = {};
  for (const q of def.questions) answers[q.id] = String(formData.get(q.id) ?? "");
  return answers;
}

async function submitOnceOnlyForm(params: {
  studentId: string;
  kind: MentorshipFormKind;
  def: FormDefinition;
  answers: Record<string, string>;
}) {
  const existing = await prisma.mentorshipForm.findFirst({
    where: { studentId: params.studentId, kind: params.kind, sessionNo: null },
  });
  if (existing) {
    await prisma.mentorshipForm.update({
      where: { id: existing.id },
      data: { answers: params.answers, submittedAt: new Date(), formVersion: params.def.version },
    });
  } else {
    await prisma.mentorshipForm.create({
      data: {
        studentId: params.studentId,
        kind: params.kind,
        answers: params.answers,
        formVersion: params.def.version,
        submittedById: params.studentId,
        submittedAt: new Date(),
      },
    });
  }
}

export async function submitIntakeAction(formData: FormData) {
  const { profile } = await requireRole("student");
  await submitOnceOnlyForm({
    studentId: profile.id,
    kind: "intake",
    def: INTAKE_FORM,
    answers: readAnswers(formData, INTAKE_FORM),
  });
  redirect("/me/mentorship");
}

export async function submitHsPlanAction(formData: FormData) {
  const { profile } = await requireRole("student");
  await submitOnceOnlyForm({
    studentId: profile.id,
    kind: "hs_plan",
    def: HS_PLAN_FORM,
    answers: readAnswers(formData, HS_PLAN_FORM),
  });
  redirect("/me/mentorship");
}
```

- [ ] **Step 2: `app/(student)/me/mentorship/page.tsx`**

```tsx
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { INTAKE_FORM } from "@/lib/forms/intake";
import { HS_PLAN_FORM } from "@/lib/forms/hs-plan";
import { submitIntakeAction, submitHsPlanAction } from "./actions";
import type { FormDefinition } from "@/lib/forms/types";

function FormBlock({
  def, existing, action, submitLabel,
}: {
  def: FormDefinition;
  existing: Record<string, string> | null;
  action: (fd: FormData) => Promise<void>;
  submitLabel: string;
}) {
  const inputStyle = { display: "block", width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 4, marginTop: 4 } as const;
  return (
    <form action={action} style={{ background: "#fff", border: "1px solid #eee", padding: 20, borderRadius: 6, display: "flex", flexDirection: "column", gap: 12 }}>
      <h2 style={{ fontSize: 22, margin: 0 }}>{def.title}</h2>
      {def.description && <p style={{ color: "#6b7785", margin: 0 }}>{def.description}</p>}
      {def.questions.map((q) => (
        <label key={q.id}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{q.prompt}{q.required && " *"}</span>
          {q.type === "long" ? (
            <textarea name={q.id} rows={3} defaultValue={existing?.[q.id] ?? ""} required={!!q.required} style={inputStyle} />
          ) : q.type === "select" ? (
            <select name={q.id} defaultValue={existing?.[q.id] ?? ""} required={!!q.required} style={inputStyle}>
              <option value="">—</option>
              {q.options?.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : (
            <input name={q.id} defaultValue={existing?.[q.id] ?? ""} required={!!q.required} style={inputStyle} />
          )}
        </label>
      ))}
      <button type="submit" style={{ alignSelf: "flex-start", background: "#0F4566", color: "#fff", padding: "10px 16px", border: "none", borderRadius: 4, fontWeight: 700, cursor: "pointer" }}>
        {submitLabel}
      </button>
    </form>
  );
}

export default async function MentorshipPage() {
  const { profile } = await requireRole("student");
  const [intake, hsPlan, sessions] = await Promise.all([
    prisma.mentorshipForm.findFirst({ where: { studentId: profile.id, kind: "intake" } }),
    prisma.mentorshipForm.findFirst({ where: { studentId: profile.id, kind: "hs_plan" } }),
    prisma.mentorshipForm.findMany({
      where: { studentId: profile.id, kind: "session" },
      orderBy: { sessionNo: "asc" },
      include: { mentor: true },
    }),
  ]);

  return (
    <main style={{ maxWidth: 800, margin: "48px auto", padding: "0 24px", display: "flex", flexDirection: "column", gap: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Mentorship</h1>

      <FormBlock
        def={INTAKE_FORM}
        existing={(intake?.answers as Record<string, string>) ?? null}
        action={submitIntakeAction}
        submitLabel={intake ? "Update intake answers" : "Submit intake"}
      />

      <section>
        <h2 style={{ fontSize: 22 }}>Session notes</h2>
        {sessions.length === 0 && <p style={{ color: "#6b7785" }}>No session notes yet. After each meeting, your mentor will record one.</p>}
        {sessions.map((s) => (
          <details key={s.id} style={{ background: "#fff", border: "1px solid #eee", padding: 16, borderRadius: 6, marginBottom: 8 }}>
            <summary><strong>Session {s.sessionNo}</strong> · {s.mentor?.firstName} {s.mentor?.lastName}</summary>
            <ul>
              {Object.entries(s.answers as Record<string, string>).map(([k, v]) => (
                <li key={k}><strong>{k}:</strong> {v}</li>
              ))}
            </ul>
          </details>
        ))}
      </section>

      <FormBlock
        def={HS_PLAN_FORM}
        existing={(hsPlan?.answers as Record<string, string>) ?? null}
        action={submitHsPlanAction}
        submitLabel={hsPlan ? "Update plan" : "Submit plan"}
      />
    </main>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/(student)/me/mentorship/
git commit -m "Add student mentorship page with intake and HS plan forms"
```

---

### Task 5.3: Mentor dashboard + student detail

**Files:**
- Create: `app/(mentor)/layout.tsx`
- Create: `app/(mentor)/mentor/page.tsx`
- Create: `app/(mentor)/mentor/students/[id]/page.tsx`
- Create: `app/(mentor)/mentor/students/[id]/actions.ts`

- [ ] **Step 1: `app/(mentor)/layout.tsx`**

```tsx
import type { ReactNode } from "react";
import Link from "next/link";
import { requireRole } from "@/lib/auth";

export default async function MentorLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireRole("mentor");
  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F3" }}>
      <header style={{ background: "#0F4566", color: "#fff", padding: "16px 32px", display: "flex", justifyContent: "space-between" }}>
        <Link href="/mentor" style={{ color: "#fff", textDecoration: "none", fontWeight: 700 }}>Mentor portal</Link>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <span style={{ fontSize: 14 }}>{profile.firstName} {profile.lastName}</span>
          <form action="/sign-out" method="post"><button type="submit" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", padding: "6px 10px", borderRadius: 4, cursor: "pointer" }}>Sign out</button></form>
        </div>
      </header>
      <main style={{ padding: 32 }}>{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: `app/(mentor)/mentor/page.tsx`**

```tsx
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function MentorDashboardPage() {
  const { profile } = await requireRole("mentor");
  const assignments = await prisma.mentorAssignment.findMany({
    where: { mentorId: profile.id, endedAt: null },
    include: { student: true },
  });
  return (
    <div>
      <h1 style={{ fontSize: 28 }}>My students</h1>
      <ul style={{ listStyle: "none", padding: 0, marginTop: 24 }}>
        {assignments.map((a) => (
          <li key={a.id} style={{ background: "#fff", border: "1px solid #eee", padding: 16, borderRadius: 6, marginBottom: 8 }}>
            <Link href={`/mentor/students/${a.student.id}`} style={{ fontWeight: 600, color: "#0F4566", textDecoration: "none" }}>
              {a.student.firstName} {a.student.lastName}
            </Link>
            <span style={{ color: "#6b7785", marginLeft: 12, fontSize: 13 }}>Grade {a.student.grade ?? "—"} · {a.student.school ?? ""}</span>
          </li>
        ))}
        {assignments.length === 0 && <p style={{ color: "#6b7785" }}>You haven't been paired with any students yet.</p>}
      </ul>
    </div>
  );
}
```

- [ ] **Step 3: `app/(mentor)/mentor/students/[id]/actions.ts`**

```ts
"use server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { SESSION_FORM } from "@/lib/forms/session";

export async function submitSessionFormAction(studentId: string, formData: FormData) {
  const { profile } = await requireRole("mentor");
  const assignment = await prisma.mentorAssignment.findFirst({
    where: { mentorId: profile.id, studentId, endedAt: null },
  });
  if (!assignment) notFound();

  const answers: Record<string, string> = {};
  for (const q of SESSION_FORM.questions) answers[q.id] = String(formData.get(q.id) ?? "");

  const last = await prisma.mentorshipForm.findFirst({
    where: { studentId, kind: "session" },
    orderBy: { sessionNo: "desc" },
  });
  const nextNo = (last?.sessionNo ?? 0) + 1;

  await prisma.mentorshipForm.create({
    data: {
      studentId,
      mentorId: profile.id,
      kind: "session",
      sessionNo: nextNo,
      answers,
      formVersion: SESSION_FORM.version,
      submittedById: profile.id,
      submittedAt: new Date(),
    },
  });

  redirect(`/mentor/students/${studentId}`);
}
```

- [ ] **Step 4: `app/(mentor)/mentor/students/[id]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { INTAKE_FORM } from "@/lib/forms/intake";
import { SESSION_FORM } from "@/lib/forms/session";
import { HS_PLAN_FORM } from "@/lib/forms/hs-plan";
import { submitSessionFormAction } from "./actions";

export default async function MentorStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { profile } = await requireRole("mentor");
  const { id } = await params;
  const assignment = await prisma.mentorAssignment.findFirst({
    where: { mentorId: profile.id, studentId: id, endedAt: null },
    include: {
      student: {
        include: {
          intakeForms: { where: { kind: "intake" }, take: 1 },
          enrollments: { include: { course: true, responses: { include: { week: true } } } },
        },
      },
    },
  });
  if (!assignment) notFound();
  const student = assignment.student;

  const [sessions, hsPlan] = await Promise.all([
    prisma.mentorshipForm.findMany({
      where: { studentId: id, kind: "session" },
      orderBy: { sessionNo: "asc" },
    }),
    prisma.mentorshipForm.findFirst({ where: { studentId: id, kind: "hs_plan" } }),
  ]);
  const intake = student.intakeForms[0];

  const submitSession = submitSessionFormAction.bind(null, id);
  const inputStyle = { display: "block", width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 4, marginTop: 4 } as const;

  return (
    <div style={{ maxWidth: 800 }}>
      <h1 style={{ fontSize: 28 }}>{student.firstName} {student.lastName}</h1>
      <p style={{ color: "#6b7785" }}>{student.email} · Grade {student.grade ?? "—"} · {student.school ?? ""}</p>

      <details open style={{ marginTop: 24, background: "#fff", border: "1px solid #eee", padding: 16, borderRadius: 6 }}>
        <summary><strong>20-question intake</strong></summary>
        {intake ? (
          <ul>
            {INTAKE_FORM.questions.map((q) => (
              <li key={q.id} style={{ marginTop: 8 }}>
                <strong>{q.prompt}</strong>
                <div>{(intake.answers as Record<string, string>)[q.id] || <em>—</em>}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "#6b7785" }}>Student hasn't completed intake yet.</p>
        )}
      </details>

      <details open style={{ marginTop: 16, background: "#fff", border: "1px solid #eee", padding: 16, borderRadius: 6 }}>
        <summary><strong>Session notes ({sessions.length})</strong></summary>
        {sessions.map((s) => (
          <details key={s.id} style={{ marginTop: 8 }}>
            <summary>Session {s.sessionNo} — {s.submittedAt?.toLocaleDateString()}</summary>
            <ul>
              {SESSION_FORM.questions.map((q) => (
                <li key={q.id}><strong>{q.prompt}:</strong> {(s.answers as Record<string, string>)[q.id] || <em>—</em>}</li>
              ))}
            </ul>
          </details>
        ))}
        <form action={submitSession} style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          <h3 style={{ margin: 0 }}>Add session form</h3>
          {SESSION_FORM.questions.map((q) => (
            <label key={q.id}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{q.prompt}{q.required && " *"}</span>
              {q.type === "long" ? (
                <textarea name={q.id} rows={2} required={!!q.required} style={inputStyle} />
              ) : q.type === "select" ? (
                <select name={q.id} required={!!q.required} style={inputStyle}>
                  <option value="">—</option>
                  {q.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input name={q.id} required={!!q.required} style={inputStyle} />
              )}
            </label>
          ))}
          <button type="submit" style={{ alignSelf: "flex-start", background: "#0F4566", color: "#fff", padding: "8px 14px", border: "none", borderRadius: 4, fontWeight: 700, cursor: "pointer" }}>Save session</button>
        </form>
      </details>

      <details style={{ marginTop: 16, background: "#fff", border: "1px solid #eee", padding: 16, borderRadius: 6 }}>
        <summary><strong>HS plan</strong></summary>
        {hsPlan ? (
          <ul>
            {HS_PLAN_FORM.questions.map((q) => (
              <li key={q.id}><strong>{q.prompt}:</strong> {(hsPlan.answers as Record<string, string>)[q.id] || <em>—</em>}</li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "#6b7785" }}>Student hasn't submitted a plan yet.</p>
        )}
      </details>

      <details style={{ marginTop: 16, background: "#fff", border: "1px solid #eee", padding: 16, borderRadius: 6 }}>
        <summary><strong>Course answers</strong></summary>
        {student.enrollments.map((e) => (
          <div key={e.id} style={{ marginTop: 12 }}>
            <strong>{e.course.title}</strong>
            <ul>
              {e.responses.map((r) => (
                <li key={r.id}>Week {r.week.weekNo}: {r.submittedAt ? "submitted" : "in progress"}</li>
              ))}
            </ul>
          </div>
        ))}
      </details>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add app/(mentor)/
git commit -m "Add mentor dashboard and per-student detail with session form"
```

---

### Task 5.4: Admin mentor pairing grid + admin student view

**Files:**
- Create: `app/(admin)/admin/mentorship/page.tsx`
- Create: `app/(admin)/admin/mentorship/actions.ts`
- Create: `app/(admin)/admin/mentorship/students/[id]/page.tsx`

- [ ] **Step 1: `app/(admin)/admin/mentorship/actions.ts`**

```ts
"use server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function assignMentorAction(formData: FormData) {
  await requireRole("admin");
  const studentId = String(formData.get("student_id"));
  const mentorId = String(formData.get("mentor_id"));
  await prisma.mentorAssignment.upsert({
    where: { studentId },
    create: { studentId, mentorId },
    update: { mentorId, endedAt: null },
  });
  revalidatePath("/admin/mentorship");
}

export async function endAssignmentAction(formData: FormData) {
  await requireRole("admin");
  const studentId = String(formData.get("student_id"));
  await prisma.mentorAssignment.updateMany({
    where: { studentId, endedAt: null },
    data: { endedAt: new Date() },
  });
  revalidatePath("/admin/mentorship");
}
```

- [ ] **Step 2: `app/(admin)/admin/mentorship/page.tsx`**

```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { assignMentorAction, endAssignmentAction } from "./actions";

export default async function AdminMentorshipPage() {
  const [students, mentors] = await Promise.all([
    prisma.profile.findMany({
      where: { role: "student", bannedAt: null },
      include: { studentAssignment: { include: { mentor: true } } },
      orderBy: [{ firstName: "asc" }],
    }),
    prisma.profile.findMany({
      where: { role: "mentor", bannedAt: null },
      orderBy: [{ firstName: "asc" }],
    }),
  ]);
  const selectStyle = { padding: "6px 10px", border: "1px solid #ddd", borderRadius: 4 } as const;

  return (
    <div>
      <h1 style={{ fontSize: 28, margin: 0 }}>Mentor assignments</h1>
      <p style={{ color: "#6b7785", marginTop: 4 }}>Pair each student with a mentor. Re-assigning replaces the previous mentor.</p>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 24, background: "#fff" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
            <th style={{ padding: 12 }}>Student</th>
            <th style={{ padding: 12 }}>Current mentor</th>
            <th style={{ padding: 12 }}>Assign / change</th>
            <th style={{ padding: 12 }}></th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 12 }}>
                <Link href={`/admin/mentorship/students/${s.id}`} style={{ fontWeight: 600, color: "#0F4566" }}>
                  {s.firstName} {s.lastName}
                </Link>
                <div style={{ fontSize: 12, color: "#6b7785" }}>Grade {s.grade ?? "—"}</div>
              </td>
              <td style={{ padding: 12 }}>
                {s.studentAssignment?.mentor ? `${s.studentAssignment.mentor.firstName} ${s.studentAssignment.mentor.lastName}` : <em>None</em>}
              </td>
              <td style={{ padding: 12 }}>
                <form action={assignMentorAction} style={{ display: "flex", gap: 8 }}>
                  <input type="hidden" name="student_id" value={s.id} />
                  <select name="mentor_id" defaultValue={s.studentAssignment?.mentorId ?? ""} required style={selectStyle}>
                    <option value="" disabled>—</option>
                    {mentors.map((m) => (
                      <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                    ))}
                  </select>
                  <button type="submit" style={{ background: "#0F4566", color: "#fff", padding: "6px 12px", border: "none", borderRadius: 4, cursor: "pointer" }}>Save</button>
                </form>
              </td>
              <td style={{ padding: 12 }}>
                {s.studentAssignment && (
                  <form action={endAssignmentAction}>
                    <input type="hidden" name="student_id" value={s.id} />
                    <button type="submit" style={{ background: "transparent", border: "none", color: "#b22234", cursor: "pointer" }}>End</button>
                  </form>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 3: `app/(admin)/admin/mentorship/students/[id]/page.tsx`**

Reuse the mentor view's read-only sections. Copy the bulk of `app/(mentor)/mentor/students/[id]/page.tsx` but drop the "Add session form" form (admins don't fill them; only mentors do):

```tsx
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { INTAKE_FORM } from "@/lib/forms/intake";
import { SESSION_FORM } from "@/lib/forms/session";
import { HS_PLAN_FORM } from "@/lib/forms/hs-plan";

export default async function AdminStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;
  const student = await prisma.profile.findUnique({
    where: { id },
    include: {
      studentAssignment: { include: { mentor: true } },
      intakeForms: { where: { kind: "intake" }, take: 1 },
      enrollments: { include: { course: true, responses: { include: { week: true } } } },
    },
  });
  if (!student || student.role !== "student") notFound();

  const [sessions, hsPlan] = await Promise.all([
    prisma.mentorshipForm.findMany({
      where: { studentId: id, kind: "session" },
      orderBy: { sessionNo: "asc" },
    }),
    prisma.mentorshipForm.findFirst({ where: { studentId: id, kind: "hs_plan" } }),
  ]);
  const intake = student.intakeForms[0];

  return (
    <div style={{ maxWidth: 800 }}>
      <h1 style={{ fontSize: 28 }}>{student.firstName} {student.lastName}</h1>
      <p style={{ color: "#6b7785" }}>
        {student.email} · Grade {student.grade ?? "—"} · {student.school ?? ""}
        {student.studentAssignment?.mentor && ` · Mentor: ${student.studentAssignment.mentor.firstName} ${student.studentAssignment.mentor.lastName}`}
      </p>

      <details open style={{ marginTop: 24, background: "#fff", border: "1px solid #eee", padding: 16, borderRadius: 6 }}>
        <summary><strong>20-question intake</strong></summary>
        {intake ? (
          <ul>{INTAKE_FORM.questions.map((q) => (
            <li key={q.id} style={{ marginTop: 8 }}><strong>{q.prompt}</strong><div>{(intake.answers as Record<string, string>)[q.id] || <em>—</em>}</div></li>
          ))}</ul>
        ) : <p style={{ color: "#6b7785" }}>Not completed.</p>}
      </details>

      <details style={{ marginTop: 16, background: "#fff", border: "1px solid #eee", padding: 16, borderRadius: 6 }}>
        <summary><strong>Session notes ({sessions.length})</strong></summary>
        {sessions.map((s) => (
          <details key={s.id} style={{ marginTop: 8 }}>
            <summary>Session {s.sessionNo} — {s.submittedAt?.toLocaleDateString()}</summary>
            <ul>{SESSION_FORM.questions.map((q) => (
              <li key={q.id}><strong>{q.prompt}:</strong> {(s.answers as Record<string, string>)[q.id] || <em>—</em>}</li>
            ))}</ul>
          </details>
        ))}
      </details>

      <details style={{ marginTop: 16, background: "#fff", border: "1px solid #eee", padding: 16, borderRadius: 6 }}>
        <summary><strong>HS plan</strong></summary>
        {hsPlan ? (
          <ul>{HS_PLAN_FORM.questions.map((q) => (
            <li key={q.id}><strong>{q.prompt}:</strong> {(hsPlan.answers as Record<string, string>)[q.id] || <em>—</em>}</li>
          ))}</ul>
        ) : <p style={{ color: "#6b7785" }}>Not submitted.</p>}
      </details>

      <details style={{ marginTop: 16, background: "#fff", border: "1px solid #eee", padding: 16, borderRadius: 6 }}>
        <summary><strong>Course progress</strong></summary>
        {student.enrollments.map((e) => (
          <div key={e.id} style={{ marginTop: 12 }}>
            <strong>{e.course.title}</strong>
            <ul>{e.responses.map((r) => (
              <li key={r.id}>Week {r.week.weekNo}: {r.submittedAt ? "submitted" : "in progress"}</li>
            ))}</ul>
          </div>
        ))}
      </details>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/(admin)/admin/mentorship/
git commit -m "Add admin pairing grid and read-only student detail page"
```

---

### Phase 5 verification

```bash
npm run lint && npm run build && npm run test
```

Manual: As admin, pair a student with a mentor. Sign in as mentor → see student → fill a session form. Sign in as student → see the session note. Submit intake → mentor sees answers in their view.

---

## Phase 6 — Blog + contact + team + admin chrome (~1.5h)

### Task 6.1: Rich-text editor component (TipTap)

**Files:**
- Create: `components/RichTextEditor.tsx`
- Modify: `package.json` (install TipTap)

- [ ] **Step 1: Install TipTap**

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image
```

- [ ] **Step 2: `components/RichTextEditor.tsx`**

```tsx
"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useState } from "react";

type Props = {
  name: string;
  defaultValue?: string;
  placeholder?: string;
};

export function RichTextEditor({ name, defaultValue = "", placeholder }: Props) {
  const [html, setHtml] = useState(defaultValue);
  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false }), Image],
    content: defaultValue,
    immediatelyRender: false,
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  });

  if (!editor) return null;

  const btn = (active: boolean) => ({
    background: active ? "#0F4566" : "#fff",
    color: active ? "#fff" : "#0F4566",
    border: "1px solid #ddd",
    padding: "4px 8px",
    borderRadius: 4,
    cursor: "pointer",
    fontSize: 13,
  });

  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 4 }}>
      <div style={{ display: "flex", gap: 4, padding: 8, borderBottom: "1px solid #eee", flexWrap: "wrap" }}>
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} style={btn(editor.isActive("bold"))}>B</button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} style={btn(editor.isActive("italic"))}><em>I</em></button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} style={btn(editor.isActive("heading", { level: 2 }))}>H2</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} style={btn(editor.isActive("heading", { level: 3 }))}>H3</button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} style={btn(editor.isActive("bulletList"))}>• List</button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} style={btn(editor.isActive("orderedList"))}>1. List</button>
        <button type="button" onClick={() => {
          const url = window.prompt("URL");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }} style={btn(editor.isActive("link"))}>Link</button>
      </div>
      <div style={{ padding: 12, minHeight: 200 }}>
        <EditorContent editor={editor} />
      </div>
      <input type="hidden" name={name} value={html} />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/RichTextEditor.tsx package.json package-lock.json
git commit -m "Add TipTap rich text editor component"
```

---

### Task 6.2: Admin blog CRUD + public blog pages

**Files:**
- Modify: `app/(public)/blog/page.tsx`
- Modify: `app/(public)/blog/[slug]/page.tsx`
- Create: `app/(admin)/admin/blog/page.tsx`
- Create: `app/(admin)/admin/blog/new/page.tsx`
- Create: `app/(admin)/admin/blog/[id]/edit/page.tsx`
- Create: `app/(admin)/admin/blog/actions.ts`

- [ ] **Step 1: Replace `app/(public)/blog/page.tsx`**

```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { A } from "@/app/components/tokens";
import { formatShortDate } from "@/lib/dates";

export default async function BlogIndex() {
  const posts = await prisma.blogPost.findMany({
    where: { publishedAt: { not: null }, archivedAt: null },
    orderBy: { publishedAt: "desc" },
    include: { author: true },
  });
  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: "64px 24px" }}>
      <h1 style={{ fontSize: 40, fontFamily: A.fontHead, margin: 0 }}>Stories from ETU</h1>
      <div style={{ display: "grid", gap: 24, marginTop: 32 }}>
        {posts.map((p) => (
          <Link key={p.id} href={`/blog/${p.slug}`} style={{ background: "#fff", border: `1px solid ${A.rule}`, padding: 24, borderRadius: 6, textDecoration: "none", color: "inherit" }}>
            <p style={{ color: A.muted, fontSize: 13, margin: 0 }}>{p.publishedAt && formatShortDate(p.publishedAt)} · {p.author.firstName} {p.author.lastName}</p>
            <h2 style={{ fontFamily: A.fontHead, fontSize: 22, marginTop: 8 }}>{p.title}</h2>
            {p.excerpt && <p style={{ color: A.body, marginTop: 8 }}>{p.excerpt}</p>}
          </Link>
        ))}
        {posts.length === 0 && <p style={{ color: A.muted }}>No posts yet.</p>}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Replace `app/(public)/blog/[slug]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { A } from "@/app/components/tokens";
import { formatShortDate } from "@/lib/dates";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: { author: true },
  });
  if (!post || !post.publishedAt || post.archivedAt) notFound();
  return (
    <article style={{ maxWidth: 720, margin: "0 auto", padding: "64px 24px" }}>
      <p style={{ color: A.muted, fontSize: 13 }}>
        {formatShortDate(post.publishedAt)} · {post.author.firstName} {post.author.lastName}
      </p>
      <h1 style={{ fontSize: 40, fontFamily: A.fontHead, margin: "8px 0 24px" }}>{post.title}</h1>
      <div style={{ lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: post.body }} />
    </article>
  );
}
```

- [ ] **Step 3: `app/(admin)/admin/blog/actions.ts`**

```ts
"use server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createPostAction(formData: FormData) {
  const { profile } = await requireRole("admin");
  const post = await prisma.blogPost.create({
    data: {
      slug: String(formData.get("slug") ?? "").trim(),
      title: String(formData.get("title") ?? "").trim(),
      excerpt: String(formData.get("excerpt") ?? "") || null,
      body: String(formData.get("body") ?? ""),
      authorId: profile.id,
      publishedAt: formData.get("publish") === "on" ? new Date() : null,
    },
  });
  revalidatePath("/admin/blog");
  redirect(`/admin/blog/${post.id}/edit`);
}

export async function updatePostAction(postId: string, formData: FormData) {
  await requireRole("admin");
  await prisma.blogPost.update({
    where: { id: postId },
    data: {
      slug: String(formData.get("slug") ?? "").trim(),
      title: String(formData.get("title") ?? "").trim(),
      excerpt: String(formData.get("excerpt") ?? "") || null,
      body: String(formData.get("body") ?? ""),
      publishedAt: formData.get("publish") === "on" ? new Date() : null,
    },
  });
  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${postId}/edit`);
}

export async function archivePostAction(postId: string) {
  await requireRole("admin");
  await prisma.blogPost.update({
    where: { id: postId },
    data: { archivedAt: new Date() },
  });
  revalidatePath("/admin/blog");
}
```

- [ ] **Step 4: `app/(admin)/admin/blog/page.tsx`**

```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatShortDate } from "@/lib/dates";

export default async function AdminBlogList() {
  const posts = await prisma.blogPost.findMany({
    where: { archivedAt: null },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>Blog</h1>
        <Link href="/admin/blog/new" style={{ background: "#0F4566", color: "#fff", padding: "10px 16px", borderRadius: 4, textDecoration: "none", fontWeight: 700 }}>New post</Link>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 24, background: "#fff" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
            <th style={{ padding: 12 }}>Title</th>
            <th style={{ padding: 12 }}>Status</th>
            <th style={{ padding: 12 }}>Created</th>
            <th style={{ padding: 12 }}></th>
          </tr>
        </thead>
        <tbody>
          {posts.map((p) => (
            <tr key={p.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 12 }}>{p.title}</td>
              <td style={{ padding: 12 }}>{p.publishedAt ? "Published" : "Draft"}</td>
              <td style={{ padding: 12 }}>{formatShortDate(p.createdAt)}</td>
              <td style={{ padding: 12 }}><Link href={`/admin/blog/${p.id}/edit`}>Edit</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 5: `app/(admin)/admin/blog/new/page.tsx`**

```tsx
import { RichTextEditor } from "@/components/RichTextEditor";
import { createPostAction } from "../actions";

export default function NewPostPage() {
  const inputStyle = { display: "block", width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 4, marginTop: 4 } as const;
  return (
    <div>
      <h1 style={{ fontSize: 28, margin: 0 }}>New blog post</h1>
      <form action={createPostAction} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24, maxWidth: 800 }}>
        <label>Title <input name="title" required style={inputStyle} /></label>
        <label>Slug <input name="slug" required style={inputStyle} /></label>
        <label>Excerpt <input name="excerpt" style={inputStyle} /></label>
        <label>Body <RichTextEditor name="body" /></label>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="checkbox" name="publish" /> Publish immediately</label>
        <button type="submit" style={{ background: "#0F4566", color: "#fff", padding: "12px 16px", border: "none", borderRadius: 4, fontWeight: 700, cursor: "pointer" }}>Create post</button>
      </form>
    </div>
  );
}
```

- [ ] **Step 6: `app/(admin)/admin/blog/[id]/edit/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RichTextEditor } from "@/components/RichTextEditor";
import { updatePostAction, archivePostAction } from "../../actions";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();
  const update = updatePostAction.bind(null, id);
  const archive = archivePostAction.bind(null, id);
  const inputStyle = { display: "block", width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 4, marginTop: 4 } as const;
  return (
    <div>
      <h1 style={{ fontSize: 28, margin: 0 }}>Edit blog post</h1>
      <form action={update} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24, maxWidth: 800 }}>
        <label>Title <input name="title" defaultValue={post.title} required style={inputStyle} /></label>
        <label>Slug <input name="slug" defaultValue={post.slug} required style={inputStyle} /></label>
        <label>Excerpt <input name="excerpt" defaultValue={post.excerpt ?? ""} style={inputStyle} /></label>
        <label>Body <RichTextEditor name="body" defaultValue={post.body} /></label>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" name="publish" defaultChecked={!!post.publishedAt} /> Published
        </label>
        <button type="submit" style={{ background: "#0F4566", color: "#fff", padding: "12px 16px", border: "none", borderRadius: 4, fontWeight: 700, cursor: "pointer" }}>Save</button>
      </form>
      <form action={archive} style={{ marginTop: 24 }}>
        <button type="submit" style={{ background: "#b22234", color: "#fff", padding: "8px 14px", border: "none", borderRadius: 4, cursor: "pointer" }}>Archive post</button>
      </form>
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add app/(public)/blog/ app/(admin)/admin/blog/
git commit -m "Add admin blog CRUD with TipTap editor and DB-backed public blog"
```

---

### Task 6.3: Contact form + admin inbox

**Files:**
- Modify: `app/(public)/contact/page.tsx`
- Create: `app/(public)/contact/actions.ts`
- Create: `emails/ContactNotification.tsx`
- Create: `emails/ContactReceived.tsx`
- Modify: `lib/email/transactional.ts` (add `sendContactNotification` / `sendContactAutoreply`)
- Create: `app/(admin)/admin/contact/page.tsx`
- Create: `app/(admin)/admin/contact/actions.ts`

- [ ] **Step 1: `emails/ContactNotification.tsx`**

```tsx
import * as React from "react";
import { Html, Head, Body, Container, Section, Heading, Text } from "@react-email/components";
import { BrandHeader, BrandFooter, BRAND } from "./_components/Brand";

export default function ContactNotification(props: {
  name: string; email: string; phone?: string | null; subject: string; message: string;
}) {
  return (
    <Html>
      <Head />
      <Body style={{ background: "#fff", fontFamily: "Manrope, Helvetica, Arial, sans-serif" }}>
        <Container style={{ maxWidth: 600, margin: "0 auto" }}>
          <BrandHeader />
          <Section style={{ padding: "24px" }}>
            <Heading as="h1" style={{ color: BRAND.ink, fontSize: 20, margin: 0 }}>New contact message</Heading>
            <Text style={{ color: BRAND.body, fontSize: 14 }}>
              <strong>From:</strong> {props.name} &lt;{props.email}&gt;<br />
              {props.phone && <><strong>Phone:</strong> {props.phone}<br /></>}
              <strong>Subject:</strong> {props.subject}
            </Text>
            <Text style={{ color: BRAND.ink, fontSize: 14, whiteSpace: "pre-wrap" }}>{props.message}</Text>
          </Section>
          <BrandFooter />
        </Container>
      </Body>
    </Html>
  );
}
```

- [ ] **Step 2: `emails/ContactReceived.tsx`**

```tsx
import * as React from "react";
import { Html, Head, Body, Container, Section, Heading, Text } from "@react-email/components";
import { BrandHeader, BrandFooter, BRAND } from "./_components/Brand";

export default function ContactReceived(props: { name: string }) {
  return (
    <Html>
      <Head />
      <Body style={{ background: "#fff", fontFamily: "Manrope, Helvetica, Arial, sans-serif" }}>
        <Container style={{ maxWidth: 600, margin: "0 auto" }}>
          <BrandHeader />
          <Section style={{ padding: "24px" }}>
            <Heading as="h1" style={{ color: BRAND.ink, fontSize: 22, margin: 0 }}>Thanks for reaching out!</Heading>
            <Text style={{ color: BRAND.body, fontSize: 15 }}>
              Hi {props.name}, we received your message and someone from the ETU team will be in
              touch within 2 business days.
            </Text>
          </Section>
          <BrandFooter />
        </Container>
      </Body>
    </Html>
  );
}
```

- [ ] **Step 3: Append to `lib/email/transactional.ts`**

Add to the existing file:
```ts
import ContactNotification from "@/emails/ContactNotification";
import ContactReceived from "@/emails/ContactReceived";

const TEAM_INBOX = "info@empowerteensunited.org";

export async function sendContactNotification(params: {
  name: string; email: string; phone?: string | null; subject: string; message: string;
}) {
  const html = await render(ContactNotification(params));
  await resend.emails.send({
    from: `Empower Teens United <${FROM}>`,
    to: TEAM_INBOX,
    reply_to: params.email,
    subject: `[ETU contact] ${params.subject}`,
    html,
    text: `${params.name} <${params.email}>\n\n${params.message}`,
  });
}

export async function sendContactAutoreply(params: { name: string; toEmail: string }) {
  const html = await render(ContactReceived({ name: params.name }));
  await resend.emails.send({
    from: `Empower Teens United <${FROM}>`,
    to: params.toEmail,
    subject: "We got your message",
    html,
    text: `Hi ${params.name}, we received your message and someone will be in touch within 2 business days.`,
  });
}
```

- [ ] **Step 4: `app/(public)/contact/actions.ts`**

```ts
"use server";
import { prisma } from "@/lib/prisma";
import { sendContactNotification, sendContactAutoreply } from "@/lib/email/transactional";
import { redirect } from "next/navigation";

export async function submitContactAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "") || null;
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  if (!name || !email || !subject || !message) {
    redirect("/contact?error=All+fields+required");
  }

  await prisma.contactMessage.create({
    data: { name, email, phone, subject, message },
  });

  // Fire-and-forget but await to surface errors during dev.
  await Promise.all([
    sendContactNotification({ name, email, phone, subject, message }),
    sendContactAutoreply({ name, toEmail: email }),
  ]);

  redirect("/contact?sent=1");
}
```

- [ ] **Step 5: Replace `app/(public)/contact/page.tsx`**

```tsx
import { submitContactAction } from "./actions";
import { A } from "@/app/components/tokens";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;
  const inputStyle = { display: "block", width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 4, marginTop: 4 } as const;
  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "64px 24px" }}>
      <h1 style={{ fontSize: 40, fontFamily: A.fontHead, margin: 0 }}>Contact us</h1>
      <p style={{ color: A.muted, marginTop: 8 }}>info@empowerteensunited.org · +1 (407) 413-7384</p>
      {sent ? (
        <p style={{ marginTop: 32, color: A.navy, fontWeight: 600 }}>Thanks! We'll be in touch.</p>
      ) : (
        <form action={submitContactAction} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 32 }}>
          {error && <p style={{ color: "#b22234" }}>{error}</p>}
          <label>Name <input name="name" required style={inputStyle} /></label>
          <label>Email <input name="email" type="email" required style={inputStyle} /></label>
          <label>Phone (optional) <input name="phone" style={inputStyle} /></label>
          <label>Subject <input name="subject" required style={inputStyle} /></label>
          <label>Message <textarea name="message" required rows={5} style={inputStyle} /></label>
          <button type="submit" style={{ background: A.navy, color: "#fff", padding: "12px 18px", border: "none", borderRadius: 4, fontWeight: 700, cursor: "pointer", alignSelf: "flex-start" }}>Send message</button>
        </form>
      )}
    </main>
  );
}
```

- [ ] **Step 6: `app/(admin)/admin/contact/actions.ts`**

```ts
"use server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function setContactStatusAction(formData: FormData) {
  const { profile } = await requireRole("admin");
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  await prisma.contactMessage.update({
    where: { id },
    data: {
      status: status as any,
      repliedAt: status === "replied" ? new Date() : null,
      repliedById: status === "replied" ? profile.id : null,
    },
  });
  revalidatePath("/admin/contact");
}
```

- [ ] **Step 7: `app/(admin)/admin/contact/page.tsx`**

```tsx
import { prisma } from "@/lib/prisma";
import { setContactStatusAction } from "./actions";

export default async function AdminContactInbox() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { submittedAt: "desc" },
  });
  return (
    <div>
      <h1 style={{ fontSize: 28, margin: 0 }}>Contact inbox</h1>
      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map((m) => (
          <details key={m.id} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 6, padding: 16 }}>
            <summary>
              <strong>{m.subject}</strong> · {m.name} &lt;{m.email}&gt; · {m.status}
              <span style={{ color: "#6b7785", marginLeft: 8 }}>{m.submittedAt.toLocaleDateString()}</span>
            </summary>
            <p style={{ whiteSpace: "pre-wrap", marginTop: 12 }}>{m.message}</p>
            {m.phone && <p style={{ color: "#6b7785" }}>Phone: {m.phone}</p>}
            <form action={setContactStatusAction} style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input type="hidden" name="id" value={m.id} />
              <select name="status" defaultValue={m.status} style={{ padding: "6px 10px", border: "1px solid #ddd", borderRadius: 4 }}>
                <option value="new">New</option>
                <option value="replied">Replied</option>
                <option value="archived">Archived</option>
              </select>
              <button type="submit" style={{ background: "#0F4566", color: "#fff", padding: "6px 12px", border: "none", borderRadius: 4, cursor: "pointer" }}>Update</button>
              <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`} style={{ marginLeft: "auto", color: "#0F4566" }}>Reply by email</a>
            </form>
          </details>
        ))}
        {messages.length === 0 && <p style={{ color: "#6b7785" }}>No messages.</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Commit**

```bash
git add emails/Contact* lib/email/ app/(public)/contact/ app/(admin)/admin/contact/
git commit -m "Add contact form, email notifications, and admin inbox"
```

---

### Task 6.4: Team CRUD + DB-backed about page

**Files:**
- Modify: `app/(public)/about/page.tsx` (mostly retain hard-coded copy but pull team from DB)
- Create: `app/(admin)/admin/team/page.tsx`
- Create: `app/(admin)/admin/team/actions.ts`

- [ ] **Step 1: `app/(admin)/admin/team/actions.ts`**

```ts
"use server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTeamMemberAction(formData: FormData) {
  await requireRole("admin");
  await prisma.teamMember.create({
    data: {
      fullName: String(formData.get("full_name") ?? "").trim(),
      roleTitle: String(formData.get("role_title") ?? "").trim(),
      bio: String(formData.get("bio") ?? "") || null,
      photoUrl: String(formData.get("photo_url") ?? "") || null,
      sortOrder: Number(formData.get("sort_order") ?? 0),
      published: formData.get("published") === "on",
    },
  });
  revalidatePath("/admin/team");
  revalidatePath("/about");
}

export async function updateTeamMemberAction(formData: FormData) {
  await requireRole("admin");
  const id = String(formData.get("id"));
  await prisma.teamMember.update({
    where: { id },
    data: {
      fullName: String(formData.get("full_name") ?? "").trim(),
      roleTitle: String(formData.get("role_title") ?? "").trim(),
      bio: String(formData.get("bio") ?? "") || null,
      photoUrl: String(formData.get("photo_url") ?? "") || null,
      sortOrder: Number(formData.get("sort_order") ?? 0),
      published: formData.get("published") === "on",
    },
  });
  revalidatePath("/admin/team");
  revalidatePath("/about");
}

export async function deleteTeamMemberAction(formData: FormData) {
  await requireRole("admin");
  await prisma.teamMember.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/admin/team");
  revalidatePath("/about");
}
```

- [ ] **Step 2: `app/(admin)/admin/team/page.tsx`**

```tsx
import { prisma } from "@/lib/prisma";
import { createTeamMemberAction, updateTeamMemberAction, deleteTeamMemberAction } from "./actions";

export default async function AdminTeamPage() {
  const members = await prisma.teamMember.findMany({ orderBy: { sortOrder: "asc" } });
  const inputStyle = { display: "block", width: "100%", padding: "8px 10px", border: "1px solid #ddd", borderRadius: 4, marginTop: 4 } as const;
  return (
    <div style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: 28, margin: 0 }}>Team members</h1>

      <form action={createTeamMemberAction} style={{ marginTop: 24, background: "#fff", border: "1px solid #eee", padding: 16, borderRadius: 6, display: "flex", flexDirection: "column", gap: 8 }}>
        <h2 style={{ fontSize: 18, margin: 0 }}>Add member</h2>
        <label>Full name <input name="full_name" required style={inputStyle} /></label>
        <label>Role / title <input name="role_title" required style={inputStyle} /></label>
        <label>Photo URL <input name="photo_url" style={inputStyle} /></label>
        <label>Bio <textarea name="bio" rows={3} style={inputStyle} /></label>
        <label>Sort order <input name="sort_order" type="number" defaultValue={members.length} style={inputStyle} /></label>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="checkbox" name="published" defaultChecked /> Published</label>
        <button type="submit" style={{ alignSelf: "flex-start", background: "#0F4566", color: "#fff", padding: "8px 14px", border: "none", borderRadius: 4, fontWeight: 700, cursor: "pointer" }}>Add</button>
      </form>

      <h2 style={{ marginTop: 32 }}>Current team</h2>
      {members.map((m) => (
        <form key={m.id} action={updateTeamMemberAction} style={{ marginTop: 12, background: "#fff", border: "1px solid #eee", padding: 16, borderRadius: 6, display: "flex", flexDirection: "column", gap: 8 }}>
          <input type="hidden" name="id" value={m.id} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label>Full name <input name="full_name" defaultValue={m.fullName} required style={inputStyle} /></label>
            <label>Role <input name="role_title" defaultValue={m.roleTitle} required style={inputStyle} /></label>
          </div>
          <label>Photo URL <input name="photo_url" defaultValue={m.photoUrl ?? ""} style={inputStyle} /></label>
          <label>Bio <textarea name="bio" defaultValue={m.bio ?? ""} rows={3} style={inputStyle} /></label>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <label>Sort <input name="sort_order" type="number" defaultValue={m.sortOrder} style={{ ...inputStyle, width: 80 }} /></label>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="checkbox" name="published" defaultChecked={m.published} /> Published</label>
            <button type="submit" style={{ background: "#0F4566", color: "#fff", padding: "6px 12px", border: "none", borderRadius: 4, cursor: "pointer" }}>Save</button>
            <button type="submit" formAction={deleteTeamMemberAction} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#b22234", cursor: "pointer" }}>Delete</button>
          </div>
        </form>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Update `app/(public)/about/page.tsx` to pull team from DB**

Open the existing about page and add at the top of the page function (before the existing JSX) — or insert this section in the appropriate place in the body:

```tsx
import { prisma } from "@/lib/prisma";
// ...existing imports
export default async function AboutPage() {
  const team = await prisma.teamMember.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
  // ...existing JSX up through "Our Team" section, then replace the static team grid with:
  // (snippet to insert where the team grid was)
}
```

Replace the static team section in `about/page.tsx` with this JSX block (use Edit tool to locate the existing static team grid and swap):
```tsx
<section style={{ padding: "64px 24px" }}>
  <div style={{ maxWidth: 1100, margin: "0 auto" }}>
    <h2 style={{ fontSize: 32, fontFamily: A.fontHead, margin: 0 }}>Our team</h2>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 24, marginTop: 32 }}>
      {team.map((m) => (
        <div key={m.id} style={{ background: "#fff", border: `1px solid ${A.rule}`, padding: 20, borderRadius: 6 }}>
          {m.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={m.photoUrl} alt={m.fullName} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: 4 }} />
          )}
          <h3 style={{ fontSize: 16, fontWeight: 700, marginTop: 12 }}>{m.fullName}</h3>
          <p style={{ fontSize: 13, color: A.muted, marginTop: 4 }}>{m.roleTitle}</p>
          {m.bio && <p style={{ fontSize: 13, marginTop: 8 }}>{m.bio}</p>}
        </div>
      ))}
    </div>
  </div>
</section>
```

- [ ] **Step 4: Commit**

```bash
git add app/(admin)/admin/team/ app/(public)/about/
git commit -m "Add admin team CRUD and wire about page to DB"
```

---

### Task 6.5: Role landing dashboards (`/me`, `/mentor`, `/admin`)

**Files:**
- Create: `app/(student)/me/page.tsx`
- Create: `app/(mentor)/mentor/profile/page.tsx` (mentor profile editor — mirrors student version)
- Create: `app/(admin)/admin/page.tsx`

> `/mentor` already exists from Task 5.3 as the assigned-students list. We add the missing mentor profile editor here and the student + admin dashboards.

- [ ] **Step 1: `app/(student)/me/page.tsx`**

```tsx
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatEventDateTime } from "@/lib/dates";

export default async function StudentDashboardPage() {
  const { profile } = await requireRole("student");

  const [enrollments, upcomingRegs, hasIntake, assignment] = await Promise.all([
    prisma.enrollment.findMany({
      where: { profileId: profile.id, status: "active" },
      include: { course: true },
    }),
    prisma.eventRegistration.findMany({
      where: { profileId: profile.id, status: "registered", event: { startsAt: { gte: new Date() } } },
      include: { event: true },
      orderBy: { event: { startsAt: "asc" } },
      take: 3,
    }),
    prisma.mentorshipForm.findFirst({ where: { studentId: profile.id, kind: "intake" } }),
    prisma.mentorAssignment.findFirst({ where: { studentId: profile.id, endedAt: null }, include: { mentor: true } }),
  ]);

  const cardStyle = { background: "#fff", border: "1px solid #eee", borderRadius: 6, padding: 20 } as const;

  return (
    <main style={{ maxWidth: 960, margin: "48px auto", padding: "0 24px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Welcome, {profile.firstName}.</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 24 }}>
        <div style={cardStyle}>
          <h2 style={{ fontSize: 18, margin: 0 }}>My courses</h2>
          <ul style={{ paddingLeft: 18, marginTop: 12 }}>
            {enrollments.map((e) => (
              <li key={e.id}><Link href={`/me/courses/${e.course.slug}`}>{e.course.title}</Link></li>
            ))}
            {enrollments.length === 0 && <li style={{ color: "#6b7785", listStyle: "none", marginLeft: -18 }}>Not enrolled yet. <Link href="/courses">Browse programs.</Link></li>}
          </ul>
        </div>

        <div style={cardStyle}>
          <h2 style={{ fontSize: 18, margin: 0 }}>Upcoming events</h2>
          <ul style={{ paddingLeft: 18, marginTop: 12 }}>
            {upcomingRegs.map((r) => (
              <li key={r.id}>{r.event.title} — {formatEventDateTime(r.event.startsAt)}</li>
            ))}
            {upcomingRegs.length === 0 && <li style={{ color: "#6b7785", listStyle: "none", marginLeft: -18 }}>No upcoming registrations. <Link href="/events">See events.</Link></li>}
          </ul>
          {upcomingRegs.length > 0 && <p style={{ marginTop: 8 }}><Link href="/me/events">All my events →</Link></p>}
        </div>

        <div style={cardStyle}>
          <h2 style={{ fontSize: 18, margin: 0 }}>Mentorship</h2>
          <p style={{ color: "#6b7785", marginTop: 8 }}>
            {assignment?.mentor ? `Your mentor: ${assignment.mentor.firstName} ${assignment.mentor.lastName}` : "Not yet paired."}
          </p>
          <p style={{ marginTop: 8 }}>
            {hasIntake ? <Link href="/me/mentorship">View my forms →</Link> : <Link href="/me/mentorship">Fill the intake (20 Qs) →</Link>}
          </p>
        </div>

        <div style={cardStyle}>
          <h2 style={{ fontSize: 18, margin: 0 }}>Account</h2>
          <p style={{ marginTop: 8 }}><Link href="/me/profile">Edit profile →</Link></p>
          <form action="/sign-out" method="post" style={{ marginTop: 8 }}>
            <button type="submit" style={{ background: "transparent", border: "none", color: "#0F4566", cursor: "pointer", padding: 0 }}>Sign out</button>
          </form>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: `app/(mentor)/mentor/profile/page.tsx`** (mirrors student profile editor with mentor-only fields)

```tsx
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function updateMentorProfile(formData: FormData) {
  "use server";
  const { profile } = await requireRole("mentor");
  await prisma.profile.update({
    where: { id: profile.id },
    data: {
      firstName: String(formData.get("first_name") ?? profile.firstName),
      lastName: String(formData.get("last_name") ?? profile.lastName),
      phone: String(formData.get("phone") ?? "") || null,
      title: String(formData.get("title") ?? "") || null,
      bio: String(formData.get("bio") ?? "") || null,
    },
  });
  revalidatePath("/mentor/profile");
}

export default async function MentorProfilePage() {
  const { profile } = await requireRole("mentor");
  const inputStyle = { display: "block", width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 4, marginTop: 4 } as const;
  return (
    <main style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>My profile</h1>
      <form action={updateMentorProfile} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label>First name <input name="first_name" defaultValue={profile.firstName} required style={inputStyle} /></label>
          <label>Last name <input name="last_name" defaultValue={profile.lastName} required style={inputStyle} /></label>
        </div>
        <label>Email <input value={profile.email} disabled style={{ ...inputStyle, background: "#f5f5f5" }} /></label>
        <label>Phone <input name="phone" defaultValue={profile.phone ?? ""} style={inputStyle} /></label>
        <label>Title / role <input name="title" defaultValue={profile.title ?? ""} placeholder="Volunteer Mentor — Engineering" style={inputStyle} /></label>
        <label>Bio <textarea name="bio" rows={4} defaultValue={profile.bio ?? ""} style={inputStyle} /></label>
        <button type="submit" style={{ alignSelf: "flex-start", background: "#0F4566", color: "#fff", padding: "10px 16px", border: "none", borderRadius: 4, fontWeight: 700, cursor: "pointer" }}>Save</button>
      </form>
    </main>
  );
}
```

- [ ] **Step 3: `app/(admin)/admin/page.tsx`**

```tsx
import { prisma } from "@/lib/prisma";

function startOfDay(d = new Date()) {
  const s = new Date(d);
  s.setHours(0, 0, 0, 0);
  return s;
}
function startOfWeek(d = new Date()) {
  const s = startOfDay(d);
  s.setDate(s.getDate() - s.getDay());
  return s;
}

export default async function AdminDashboardPage() {
  const [todayCheckins, weekRegs, activeEnrollments, pendingInvites, pendingMessages, unpairedStudents] = await Promise.all([
    prisma.eventCheckin.count({ where: { checkedInAt: { gte: startOfDay() } } }),
    prisma.eventRegistration.count({ where: { registeredAt: { gte: startOfWeek() } } }),
    prisma.enrollment.count({ where: { status: "active" } }),
    prisma.invitation.count({ where: { acceptedAt: null, revokedAt: null, expiresAt: { gte: new Date() } } }),
    prisma.contactMessage.count({ where: { status: "new" } }),
    prisma.profile.count({
      where: { role: "student", bannedAt: null, studentAssignment: null },
    }),
  ]);

  const card = (label: string, value: number | string) => (
    <div style={{ background: "#fff", border: "1px solid #eee", padding: 20, borderRadius: 6 }}>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#0F4566" }}>{value}</div>
      <div style={{ color: "#6b7785", fontSize: 13, marginTop: 4 }}>{label}</div>
    </div>
  );

  return (
    <div>
      <h1 style={{ fontSize: 28, margin: 0 }}>Dashboard</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 24 }}>
        {card("Today's check-ins", todayCheckins)}
        {card("This-week registrations", weekRegs)}
        {card("Active enrollments", activeEnrollments)}
        {card("Pending invites", pendingInvites)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 32 }}>
        <div style={{ background: "#fff", border: "1px solid #eee", padding: 20, borderRadius: 6 }}>
          <h2 style={{ fontSize: 18, margin: 0 }}>Tasks</h2>
          <ul style={{ marginTop: 12 }}>
            <li>{pendingMessages} unanswered contact message{pendingMessages === 1 ? "" : "s"}</li>
            <li>{unpairedStudents} student{unpairedStudents === 1 ? "" : "s"} without a mentor</li>
          </ul>
        </div>
        <div style={{ background: "#fff", border: "1px solid #eee", padding: 20, borderRadius: 6 }}>
          <h2 style={{ fontSize: 18, margin: 0 }}>Quick links</h2>
          <ul style={{ marginTop: 12 }}>
            <li><a href="/admin/events/new">Create event</a></li>
            <li><a href="/admin/broadcasts/new">Send broadcast</a></li>
            <li><a href="/admin/invitations">Invite a mentor</a></li>
            <li><a href="/admin/scan">Scan QR for check-in</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/(student)/me/page.tsx app/(mentor)/mentor/profile/ app/(admin)/admin/page.tsx
git commit -m "Add role landing dashboards for student/mentor/admin"
```

---

### Phase 6 verification

Sign in as admin → create 1 team member, 1 blog post (publish), submit a contact message anonymously → verify autoreply + Ivan's notification (check Resend dashboard or inbox). Visit `/admin`, `/mentor`, `/me` — each renders its dashboard.

```bash
npm run lint && npm run build && npm run test
```

---

## Phase 7 — Email broadcast (~2h)

### Task 7.1: Segment resolver with tests

**Files:**
- Create: `lib/broadcasts/types.ts`
- Create: `lib/broadcasts/resolve-segment.ts`
- Test: `tests/lib/broadcasts/resolve-segment.test.ts`

> Tested first because this is the heart of the broadcast feature and easy to get wrong.

- [ ] **Step 1: `lib/broadcasts/types.ts`**

```ts
export type SegmentFilter =
  | { kind: "all_students" }
  | { kind: "all_mentors" }
  | { kind: "all_parents" }
  | { kind: "course_enrollees"; courseId: string }
  | { kind: "event_registrants"; eventId: string }
  | { kind: "event_attendees"; eventId: string }
  | { kind: "event_no_shows"; eventId: string }
  | { kind: "explicit"; registrationIds?: string[]; profileIds?: string[] };

export type ResolvedRecipient = {
  email: string;
  name: string | null;
  profileId: string | null;
};
```

- [ ] **Step 2: Write failing tests `tests/lib/broadcasts/resolve-segment.test.ts`**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    profile: { findMany: vi.fn() },
    eventRegistration: { findMany: vi.fn() },
    enrollment: { findMany: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { resolveSegment } from "@/lib/broadcasts/resolve-segment";

describe("resolveSegment", () => {
  beforeEach(() => vi.clearAllMocks());

  it("all_students returns student profiles, filters out unsubscribed", async () => {
    (prisma.profile.findMany as any).mockResolvedValue([
      { id: "s1", email: "a@b.com", firstName: "A", lastName: "B", emailUnsubscribed: false },
    ]);
    const r = await resolveSegment({ kind: "all_students" });
    expect(r).toEqual([{ email: "a@b.com", name: "A B", profileId: "s1" }]);
    expect(prisma.profile.findMany).toHaveBeenCalledWith({
      where: { role: "student", bannedAt: null, emailUnsubscribed: false },
    });
  });

  it("event_no_shows excludes checked-in registrants", async () => {
    (prisma.eventRegistration.findMany as any).mockResolvedValue([
      { id: "r1", name: "X", email: "x@y.com", profileId: null, checkin: null },
      { id: "r2", name: "Y", email: "y@y.com", profileId: null, checkin: { id: "c1" } },
    ]);
    const r = await resolveSegment({ kind: "event_no_shows", eventId: "e1" });
    expect(r).toEqual([{ email: "x@y.com", name: "X", profileId: null }]);
  });

  it("dedupes by email", async () => {
    (prisma.profile.findMany as any).mockResolvedValue([
      { id: "s1", email: "a@b.com", firstName: "A", lastName: "B", emailUnsubscribed: false },
      { id: "s2", email: "a@b.com", firstName: "A2", lastName: "B2", emailUnsubscribed: false },
    ]);
    const r = await resolveSegment({ kind: "all_students" });
    expect(r).toHaveLength(1);
  });
});
```

- [ ] **Step 3: Run tests, confirm fail**

```bash
npm run test
```
Expected: Failures referencing `resolve-segment`.

- [ ] **Step 4: Implement `lib/broadcasts/resolve-segment.ts`**

```ts
import { prisma } from "@/lib/prisma";
import type { SegmentFilter, ResolvedRecipient } from "./types";

function dedupe(rs: ResolvedRecipient[]): ResolvedRecipient[] {
  const seen = new Set<string>();
  const out: ResolvedRecipient[] = [];
  for (const r of rs) {
    if (!r.email) continue;
    const key = r.email.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

export async function resolveSegment(filter: SegmentFilter): Promise<ResolvedRecipient[]> {
  switch (filter.kind) {
    case "all_students":
    case "all_mentors": {
      const role = filter.kind === "all_students" ? "student" : "mentor";
      const profiles = await prisma.profile.findMany({
        where: { role, bannedAt: null, emailUnsubscribed: false },
      });
      return dedupe(profiles.map((p) => ({
        email: p.email, name: `${p.firstName} ${p.lastName}`.trim(), profileId: p.id,
      })));
    }
    case "all_parents": {
      const students = await prisma.profile.findMany({
        where: { role: "student", bannedAt: null, parentEmail: { not: null } },
      });
      return dedupe(students.map((s) => ({
        email: s.parentEmail!, name: null, profileId: s.id,
      })));
    }
    case "course_enrollees": {
      const enrollments = await prisma.enrollment.findMany({
        where: { courseId: filter.courseId, status: "active", profile: { emailUnsubscribed: false } },
        include: { profile: true },
      });
      return dedupe(enrollments.map((e) => ({
        email: e.profile.email,
        name: `${e.profile.firstName} ${e.profile.lastName}`.trim(),
        profileId: e.profile.id,
      })));
    }
    case "event_registrants":
    case "event_attendees":
    case "event_no_shows": {
      const regs = await prisma.eventRegistration.findMany({
        where: { eventId: filter.eventId, status: "registered" },
        include: { checkin: true },
      });
      const filtered = regs.filter((r) => {
        if (filter.kind === "event_attendees") return !!r.checkin;
        if (filter.kind === "event_no_shows") return !r.checkin;
        return true;
      });
      return dedupe(filtered.map((r) => ({
        email: r.email, name: r.name, profileId: r.profileId,
      })));
    }
    case "explicit": {
      const out: ResolvedRecipient[] = [];
      if (filter.registrationIds?.length) {
        const regs = await prisma.eventRegistration.findMany({
          where: { id: { in: filter.registrationIds } },
        });
        out.push(...regs.map((r) => ({ email: r.email, name: r.name, profileId: r.profileId })));
      }
      if (filter.profileIds?.length) {
        const profiles = await prisma.profile.findMany({
          where: { id: { in: filter.profileIds }, emailUnsubscribed: false },
        });
        out.push(...profiles.map((p) => ({
          email: p.email, name: `${p.firstName} ${p.lastName}`.trim(), profileId: p.id,
        })));
      }
      return dedupe(out);
    }
  }
}
```

- [ ] **Step 5: Run tests, confirm pass**

```bash
npm run test
```

- [ ] **Step 6: Commit**

```bash
git add lib/broadcasts/ tests/lib/broadcasts/
git commit -m "Add segment resolver with deduping and tests"
```

---

### Task 7.2: Composer + send queue + cron sender

**Files:**
- Create: `emails/BroadcastShell.tsx`
- Create: `app/(admin)/admin/broadcasts/page.tsx`
- Create: `app/(admin)/admin/broadcasts/new/page.tsx`
- Create: `app/(admin)/admin/broadcasts/[id]/page.tsx`
- Create: `app/(admin)/admin/broadcasts/actions.ts`
- Create: `app/api/cron/send-campaign/route.ts`
- Create: `lib/broadcasts/send-batch.ts`

- [ ] **Step 1: `emails/BroadcastShell.tsx`**

```tsx
import * as React from "react";
import { Html, Head, Body, Container, Section, Text } from "@react-email/components";
import { BrandHeader, BrandFooter, BRAND } from "./_components/Brand";

export default function BroadcastShell(props: {
  bodyHtml: string;
  unsubscribeUrl: string;
}) {
  return (
    <Html>
      <Head />
      <Body style={{ background: "#fff", fontFamily: "Manrope, Helvetica, Arial, sans-serif" }}>
        <Container style={{ maxWidth: 600, margin: "0 auto" }}>
          <BrandHeader />
          <Section style={{ padding: "32px 24px", color: BRAND.ink, fontSize: 15, lineHeight: 1.6 }}>
            <div dangerouslySetInnerHTML={{ __html: props.bodyHtml }} />
          </Section>
          <BrandFooter />
          <Section style={{ padding: "8px 24px", fontSize: 11, color: BRAND.body }}>
            <Text>
              You're receiving this because you're part of Empower Teens United.{" "}
              <a href={props.unsubscribeUrl}>Unsubscribe</a>.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

- [ ] **Step 2: `lib/broadcasts/send-batch.ts`**

```ts
import "server-only";
import { Resend } from "resend";
import { render } from "@react-email/render";
import BroadcastShell from "@/emails/BroadcastShell";
import { prisma } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const BATCH_SIZE = 100;

export async function processCampaignBatch(campaignId: string) {
  const campaign = await prisma.emailCampaign.findUnique({ where: { id: campaignId } });
  if (!campaign || (campaign.status !== "sending" && campaign.status !== "scheduled")) return;

  if (campaign.status === "scheduled") {
    await prisma.emailCampaign.update({ where: { id: campaignId }, data: { status: "sending" } });
  }

  const queued = await prisma.emailRecipient.findMany({
    where: { campaignId, status: "queued" },
    take: BATCH_SIZE,
  });

  if (queued.length === 0) {
    const remaining = await prisma.emailRecipient.count({
      where: { campaignId, status: "queued" },
    });
    if (remaining === 0) {
      await prisma.emailCampaign.update({
        where: { id: campaignId },
        data: { status: "sent", sentAt: new Date() },
      });
    }
    return;
  }

  for (const recipient of queued) {
    const unsubscribeUrl = `${SITE}/unsubscribe?t=${recipient.id}`;
    const html = await render(BroadcastShell({ bodyHtml: campaign.bodyHtml, unsubscribeUrl }));
    try {
      const res = await resend.emails.send({
        from: campaign.sender || `Empower Teens United <${FROM}>`,
        to: recipient.email,
        subject: campaign.subject,
        html,
        text: campaign.bodyText,
      });
      await prisma.emailRecipient.update({
        where: { id: recipient.id },
        data: { status: "sent", sentAt: new Date(), resendMessageId: res.data?.id ?? null },
      });
    } catch (e) {
      console.error("send failed", recipient.email, e);
      await prisma.emailRecipient.update({
        where: { id: recipient.id },
        data: { status: "failed" as any, lastEventAt: new Date() },
      });
    }
  }
}
```

- [ ] **Step 3: `app/(admin)/admin/broadcasts/actions.ts`**

```ts
"use server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { resolveSegment } from "@/lib/broadcasts/resolve-segment";
import { processCampaignBatch } from "@/lib/broadcasts/send-batch";
import type { SegmentFilter } from "@/lib/broadcasts/types";

function parseFilter(formData: FormData): SegmentFilter {
  const kind = String(formData.get("segment_kind"));
  switch (kind) {
    case "all_students":
    case "all_mentors":
    case "all_parents":
      return { kind } as SegmentFilter;
    case "course_enrollees":
      return { kind, courseId: String(formData.get("course_id")) };
    case "event_registrants":
    case "event_attendees":
    case "event_no_shows":
      return { kind, eventId: String(formData.get("event_id")) } as SegmentFilter;
    default:
      throw new Error("Unknown segment kind");
  }
}

function htmlToText(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export async function createAndSendCampaignAction(formData: FormData) {
  const { profile } = await requireRole("admin");
  const subject = String(formData.get("subject") ?? "").trim();
  const bodyHtml = String(formData.get("body") ?? "");
  const bodyText = htmlToText(bodyHtml);
  const filter = parseFilter(formData);
  const sendNow = formData.get("action") === "send";

  const recipients = await resolveSegment(filter);

  const campaign = await prisma.emailCampaign.create({
    data: {
      subject,
      bodyHtml,
      bodyText,
      sender: "",
      segmentFilter: filter as any,
      status: sendNow ? "sending" : "draft",
      recipientCount: recipients.length,
      createdById: profile.id,
      recipients: {
        create: recipients.map((r) => ({
          email: r.email,
          name: r.name,
          profileId: r.profileId,
        })),
      },
    },
  });

  if (sendNow) {
    // Process the first batch synchronously so the admin sees immediate progress; cron picks up the rest.
    await processCampaignBatch(campaign.id);
  }

  redirect(`/admin/broadcasts/${campaign.id}`);
}
```

- [ ] **Step 4: `app/(admin)/admin/broadcasts/new/page.tsx`**

```tsx
import { prisma } from "@/lib/prisma";
import { RichTextEditor } from "@/components/RichTextEditor";
import { createAndSendCampaignAction } from "../actions";

export default async function NewBroadcastPage({
  searchParams,
}: {
  searchParams: Promise<{ segment?: string }>;
}) {
  const { segment } = await searchParams;
  let prefilledKind = "";
  let prefilledEvent = "";
  if (segment) {
    const [k, id] = segment.split(":");
    if (["event_registrants", "event_no_shows", "event_attendees"].includes(k)) {
      prefilledKind = k;
      prefilledEvent = id;
    }
  }
  const [events, courses] = await Promise.all([
    prisma.event.findMany({ where: { archivedAt: null }, orderBy: { startsAt: "desc" }, take: 50 }),
    prisma.course.findMany({ where: { archivedAt: null }, orderBy: { startsOn: "desc" }, take: 50 }),
  ]);
  const inputStyle = { display: "block", width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 4, marginTop: 4 } as const;
  return (
    <div style={{ maxWidth: 800 }}>
      <h1 style={{ fontSize: 28, margin: 0 }}>New broadcast</h1>
      <form action={createAndSendCampaignAction} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 24 }}>
        <label>Subject <input name="subject" required style={inputStyle} /></label>
        <label>Audience
          <select name="segment_kind" defaultValue={prefilledKind} required style={inputStyle}>
            <option value="" disabled>Choose audience</option>
            <option value="all_students">All students</option>
            <option value="all_mentors">All mentors</option>
            <option value="all_parents">All parents</option>
            <option value="course_enrollees">Course enrollees…</option>
            <option value="event_registrants">Event registrants…</option>
            <option value="event_attendees">Event attendees…</option>
            <option value="event_no_shows">Event no-shows…</option>
          </select>
        </label>
        <label>Course (if course-based) <select name="course_id" defaultValue="" style={inputStyle}>
          <option value="">—</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select></label>
        <label>Event (if event-based) <select name="event_id" defaultValue={prefilledEvent} style={inputStyle}>
          <option value="">—</option>
          {events.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select></label>
        <label>Message <RichTextEditor name="body" placeholder="Write your email here." /></label>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" name="action" value="draft" style={{ background: "#fff", border: "1px solid #ddd", padding: "10px 14px", borderRadius: 4, cursor: "pointer" }}>Save draft</button>
          <button type="submit" name="action" value="send" style={{ background: "#0F4566", color: "#fff", padding: "10px 14px", border: "none", borderRadius: 4, fontWeight: 700, cursor: "pointer" }}>Send now</button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 5: `app/(admin)/admin/broadcasts/page.tsx`**

```tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function BroadcastsListPage() {
  const campaigns = await prisma.emailCampaign.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>Broadcasts</h1>
        <Link href="/admin/broadcasts/new" style={{ background: "#0F4566", color: "#fff", padding: "10px 16px", borderRadius: 4, textDecoration: "none", fontWeight: 700 }}>New</Link>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 24, background: "#fff" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
            <th style={{ padding: 12 }}>Subject</th>
            <th style={{ padding: 12 }}>Status</th>
            <th style={{ padding: 12 }}>Recipients</th>
            <th style={{ padding: 12 }}>Created</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c) => (
            <tr key={c.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 12 }}><Link href={`/admin/broadcasts/${c.id}`} style={{ color: "#0F4566", fontWeight: 600 }}>{c.subject}</Link></td>
              <td style={{ padding: 12 }}>{c.status}</td>
              <td style={{ padding: 12 }}>{c.recipientCount}</td>
              <td style={{ padding: 12 }}>{c.createdAt.toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 6: `app/(admin)/admin/broadcasts/[id]/page.tsx`** (sent-campaign report)

```tsx
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function CampaignReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = await prisma.emailCampaign.findUnique({
    where: { id },
    include: { recipients: true },
  });
  if (!campaign) notFound();

  const tally = (status: string) => campaign.recipients.filter((r) => r.status === status).length;
  return (
    <div>
      <h1 style={{ fontSize: 28, margin: 0 }}>{campaign.subject}</h1>
      <p style={{ color: "#6b7785", marginTop: 4 }}>Status: {campaign.status} · {campaign.recipientCount} recipients</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginTop: 24 }}>
        {(["queued", "sent", "delivered", "opened", "clicked", "bounced"] as const).map((s) => (
          <div key={s} style={{ background: "#fff", border: "1px solid #eee", padding: 16, borderRadius: 6 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#0F4566" }}>{tally(s)}</div>
            <div style={{ fontSize: 12, color: "#6b7785", textTransform: "capitalize" }}>{s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 7: `app/api/cron/send-campaign/route.ts`**

```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processCampaignBatch } from "@/lib/broadcasts/send-batch";

export async function POST(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("forbidden", { status: 403 });
  }
  const sending = await prisma.emailCampaign.findMany({
    where: { status: { in: ["sending", "scheduled"] } },
    select: { id: true },
  });
  for (const c of sending) {
    await processCampaignBatch(c.id);
  }
  return NextResponse.json({ processed: sending.length });
}
```

Add `CRON_SECRET=<long-random-string>` to `.env.local`.

- [ ] **Step 8: Commit**

```bash
git add emails/BroadcastShell.tsx lib/broadcasts/send-batch.ts app/(admin)/admin/broadcasts/ app/api/cron/ .env.local
git commit -m "Add broadcast composer, send pipeline, and cron sender"
```

---

### Task 7.3: Resend webhook + unsubscribe

**Files:**
- Create: `app/api/webhooks/resend/route.ts`
- Create: `app/(public)/unsubscribe/page.tsx`

- [ ] **Step 1: `app/api/webhooks/resend/route.ts`**

```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ResendEvent = {
  type: string;
  data: { email_id?: string; to?: string[] };
};

const STATUS_MAP: Record<string, "delivered" | "opened" | "clicked" | "bounced" | "complained"> = {
  "email.delivered": "delivered",
  "email.opened": "opened",
  "email.clicked": "clicked",
  "email.bounced": "bounced",
  "email.complained": "complained",
};

export async function POST(req: Request) {
  // Signature validation is added in a follow-up task once RESEND_WEBHOOK_SECRET
  // is configured in Resend's dashboard (deferred per the spec).
  const event = (await req.json()) as ResendEvent;
  const status = STATUS_MAP[event.type];
  if (!status || !event.data?.email_id) return NextResponse.json({ ok: true });

  await prisma.emailRecipient.updateMany({
    where: { resendMessageId: event.data.email_id },
    data: { status, lastEventAt: new Date() },
  });

  if (status === "complained" && event.data.to?.[0]) {
    await prisma.profile.updateMany({
      where: { email: event.data.to[0] },
      data: { emailUnsubscribed: true },
    });
    await prisma.unsubscribedEmail.upsert({
      where: { email: event.data.to[0] },
      create: { email: event.data.to[0] },
      update: {},
    });
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: `app/(public)/unsubscribe/page.tsx`**

```tsx
import { prisma } from "@/lib/prisma";

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  if (!t) return <p style={{ padding: 64 }}>Missing token.</p>;
  const recipient = await prisma.emailRecipient.findUnique({ where: { id: t } });
  if (!recipient) return <p style={{ padding: 64 }}>Unknown link.</p>;

  if (recipient.profileId) {
    await prisma.profile.update({
      where: { id: recipient.profileId },
      data: { emailUnsubscribed: true },
    });
  }
  await prisma.unsubscribedEmail.upsert({
    where: { email: recipient.email },
    create: { email: recipient.email },
    update: {},
  });

  return (
    <main style={{ maxWidth: 600, margin: "96px auto", padding: "0 24px", textAlign: "center" }}>
      <h1>You're unsubscribed.</h1>
      <p>You'll no longer receive broadcast emails. Important transactional emails (event confirmations, password resets) still work.</p>
    </main>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/webhooks/ app/(public)/unsubscribe/
git commit -m "Add Resend webhook and unsubscribe page"
```

---

### Phase 7 verification

```bash
npm run lint && npm run build && npm run test
```

Manual: As admin, create a broadcast targeting "All students" with your test student account. Click Send now. Check the recipient inbox. Click unsubscribe link. Verify `profiles.email_unsubscribed = true` in DB.

---

## Phase 8 — Polish, seed, and deploy

### Task 8.1: Demo seed data

**Files:**
- Modify: `prisma/seed.ts` (append demo data behind a flag)

- [ ] **Step 1: Append demo seed logic to `prisma/seed.ts`**

Replace the file with:
```ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedSettings() {
  const settings: Array<{ key: string; value: any }> = [
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
  for (const s of settings) {
    await prisma.siteSetting.upsert({ where: { key: s.key }, update: {}, create: s });
  }
}

async function seedDemo() {
  if (process.env.SEED_DEMO !== "1") return;
  const admin = await prisma.profile.findFirst({ where: { role: "admin" } });
  if (!admin) {
    console.log("No admin profile yet — skipping demo seed. Set role=admin on your profile first.");
    return;
  }

  // 3 events at different stages
  await prisma.event.createMany({
    data: [
      {
        slug: "rollins-tour-demo",
        title: "Rollins College Private Tour",
        body: "<p>Walk the campus with admissions staff.</p>",
        location: "Rollins Campus",
        startsAt: new Date(Date.now() + 7 * 86400000),
        endsAt: new Date(Date.now() + 7 * 86400000 + 3 * 3600000),
        publishedAt: new Date(),
        createdById: admin.id,
      },
      {
        slug: "breaking-thru-demo",
        title: "Breaking Thru — Mental Health Panel",
        body: "<p>Open conversation about mental health among teens.</p>",
        location: "Content Studio+",
        startsAt: new Date(Date.now() + 14 * 86400000),
        endsAt: new Date(Date.now() + 14 * 86400000 + 2 * 3600000),
        publishedAt: new Date(),
        createdById: admin.id,
      },
      {
        slug: "miles-to-go-demo",
        title: "Miles To Go · 8th Anniversary",
        body: "<p>Annual celebration and service drive.</p>",
        location: "Dr Phillips YMCA",
        startsAt: new Date(Date.now() + 21 * 86400000),
        endsAt: new Date(Date.now() + 21 * 86400000 + 3 * 3600000),
        publishedAt: new Date(),
        createdById: admin.id,
      },
    ],
    skipDuplicates: true,
  });

  // 2 courses with 3 weeks each
  for (const seed of [
    { slug: "purpose-leadership-demo", title: "Purpose & Leadership Development" },
    { slug: "academic-career-demo", title: "Academic & Career Pathways" },
  ]) {
    await prisma.course.upsert({
      where: { slug: seed.slug },
      update: {},
      create: {
        slug: seed.slug,
        title: seed.title,
        body: "<p>10-week cohort. Weekly reflection prompts inside.</p>",
        location: "Windermere",
        startsOn: new Date(),
        weeks: 3,
        publishedAt: new Date(),
        createdById: admin.id,
        courseWeeks: {
          create: [1, 2, 3].map((n) => ({
            weekNo: n,
            title: `Week ${n}: Reflection`,
            body: `<p>Week ${n} prompt.</p>`,
            questions: [
              { id: `q${n}a`, prompt: "What did you learn this week?", type: "long" },
              { id: `q${n}b`, prompt: "One word that describes how you feel today", type: "short" },
            ],
          })),
        },
      },
    });
  }

  // 3 blog posts
  await prisma.blogPost.createMany({
    data: [1, 2, 3].map((i) => ({
      slug: `welcome-${i}-demo`,
      title: `ETU update #${i}`,
      excerpt: `A short note about what we've been up to (${i}).`,
      body: `<p>Lorem ipsum placeholder body for post ${i}.</p>`,
      authorId: admin.id,
      publishedAt: new Date(),
    })),
    skipDuplicates: true,
  });

  // Team members
  await prisma.teamMember.createMany({
    data: [
      { fullName: "Ivan Reyes", roleTitle: "Executive Director", sortOrder: 1, published: true },
      { fullName: "Han Shouqi", roleTitle: "Technology Lead", sortOrder: 2, published: true },
    ],
    skipDuplicates: true,
  });

  console.log("Demo data seeded.");
}

async function main() {
  await seedSettings();
  await seedDemo();
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 2: Run with `SEED_DEMO=1`**

In PowerShell:
```powershell
$env:SEED_DEMO="1"; npx prisma db seed; Remove-Item Env:SEED_DEMO
```

Expected: "Demo data seeded." log.

- [ ] **Step 3: Commit**

```bash
git add prisma/seed.ts
git commit -m "Add demo data seed gated by SEED_DEMO flag"
```

---

### Task 8.2: Vercel deploy

**Files:**
- Modify: `next.config.ts` (allow image hosts)
- Create: `vercel.json` (cron schedule)

- [ ] **Step 1: Update `next.config.ts`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "okekmrbmxjaxqjzovovs.supabase.co" },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 2: `vercel.json`**

```json
{
  "crons": [
    { "path": "/api/cron/send-campaign", "schedule": "*/5 * * * *" }
  ]
}
```

> Vercel cron jobs hit the endpoint without our `Authorization` header. Either accept Vercel's signed header (`x-vercel-cron-signature`) or skip auth and check `request.headers.get("user-agent")?.includes("vercel-cron")`. For Friday demo, simplest path: comment out the auth check inside `app/api/cron/send-campaign/route.ts` for the first deploy, restore after. (Better: see Resend Best Practices for proper webhook signing post-demo.)

- [ ] **Step 3: Push to GitHub + connect Vercel**

```bash
git push origin master
```

In the Vercel dashboard:
1. Import the GitHub repo
2. Framework preset: Next.js
3. Add env vars from `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `DATABASE_URL`, `DIRECT_URL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NEXT_PUBLIC_SITE_URL=<your-vercel-url>`, `CRON_SECRET`)
4. Deploy

After deploy, update `NEXT_PUBLIC_SITE_URL` to the assigned `*.vercel.app` URL and redeploy so Supabase email links and QR scan URLs resolve correctly. Update Supabase auth → URL configuration to include the Vercel domain.

- [ ] **Step 4: Smoke test on the preview URL**

Walk: visit home → sign up as a new student → verify email → land on `/me` → register for a demo event → check Resend dashboard for the confirmation email → admin scans QR (open the registration email on your phone and tap the QR or copy the URL into a browser when signed in as admin) → funnel shows checked-in.

- [ ] **Step 5: Commit and push**

```bash
git add next.config.ts vercel.json
git commit -m "Vercel deploy config: image hosts and cron schedule"
git push
```

---

### Task 8.3: Playwright smoke test

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/smoke.spec.ts`

- [ ] **Step 1: `playwright.config.ts`**

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: process.env.SMOKE_BASE_URL ?? "http://localhost:3000",
    headless: true,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: devices["Desktop Chrome"] }],
  webServer: process.env.SMOKE_BASE_URL
    ? undefined
    : { command: "npm run dev", port: 3000, reuseExistingServer: true },
});
```

- [ ] **Step 2: Install browsers**

```bash
npx playwright install chromium
```

- [ ] **Step 3: `tests/e2e/smoke.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

test("home page renders nav + footer", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
  await expect(page.getByText("Empower Teens United").first()).toBeVisible();
});

test("sign-in page accessible", async ({ page }) => {
  await page.goto("/sign-in");
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});

test("admin route redirects to sign-in when anonymous", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/sign-in/);
});
```

- [ ] **Step 4: Run smoke**

```bash
npm run test:e2e
```

Expected: All three tests pass.

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts tests/e2e/ package.json package-lock.json
git commit -m "Add Playwright smoke test for demo path"
git push
```

---

### Phase 8 verification (Friday demo dry-run)

- [ ] **Walk through the demo flow on the Vercel preview URL**

1. Visit `/` → confirm hero + nav + footer
2. Visit `/events` → see 3 seeded events
3. As anon user, click into an event → register → check email arrives with QR
4. Sign in as admin → `/admin/events/<id>/registrations` → see the registration appear
5. Open the QR URL in a browser (or scan with phone) → check-in updates
6. Visit `/admin/broadcasts/new` → send a test broadcast to "All students" → check delivery
7. Sign in as a paired mentor → fill a session form → sign in as that student → see the note

If everything works, Friday is ready.

---

## Self-review checklist (after completing all phases)

- [ ] Run `npm run lint`, `npm run build`, `npm run test`, `npm run test:e2e` — all green
- [ ] Spec coverage: every section of `docs/superpowers/specs/2026-05-26-etu-platform-design.md` has at least one task above
- [ ] No `TBD`, `TODO`, "implement later" left in the codebase
- [ ] All env vars present in Vercel project settings
- [ ] Supabase auth → URL configuration matches the live Vercel domain
- [ ] Resend dashboard shows successful sends; webhook configured pointing at `/api/webhooks/resend`
- [ ] Demo data present and the funnel page on Vercel shows realistic conversion numbers

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-26-etu-platform.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration. Best for a long plan like this where context bloat is real.

2. **Inline Execution** — I execute tasks in this session using executing-plans, batch execution with checkpoints. Works but consumes context faster.

Which approach?


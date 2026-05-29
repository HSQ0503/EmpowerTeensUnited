import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { A } from "@/app/components/tokens";
import { authStyles as s } from "@/app/(auth)/_styles";
import { RichTextEditor } from "@/components/RichTextEditor";
import { createAndSendCampaignAction } from "../actions";

export const metadata = { title: "New broadcast · Admin" };

type SegmentKind =
  | "all_students"
  | "all_mentors"
  | "all_parents"
  | "course_enrollees"
  | "event_registrants"
  | "event_attendees"
  | "event_no_shows";

const ALL_KINDS: ReadonlyArray<SegmentKind> = [
  "all_students",
  "all_mentors",
  "all_parents",
  "course_enrollees",
  "event_registrants",
  "event_attendees",
  "event_no_shows",
];

function isKind(value: string): value is SegmentKind {
  return (ALL_KINDS as ReadonlyArray<string>).includes(value);
}

export default async function NewBroadcastPage({
  searchParams,
}: {
  searchParams: Promise<{ segment?: string }>;
}) {
  await requireRole("admin");
  const { segment } = await searchParams;

  let prefilledKind: SegmentKind | "" = "";
  let prefilledEvent = "";
  let prefilledCourse = "";
  if (segment) {
    const [k, id] = segment.split(":");
    if (isKind(k)) {
      prefilledKind = k;
      if (k === "course_enrollees") prefilledCourse = id ?? "";
      else if (k.startsWith("event_")) prefilledEvent = id ?? "";
    }
  }

  const [events, courses] = await Promise.all([
    prisma.event.findMany({
      where: { archivedAt: null },
      orderBy: { startsAt: "desc" },
      take: 50,
    }),
    prisma.course.findMany({
      where: { archivedAt: null },
      orderBy: { startsOn: "desc" },
      take: 50,
    }),
  ]);

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/admin/broadcasts"
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: A.muted,
            textDecoration: "none",
          }}
        >
          ← Broadcasts
        </Link>
        <h1
          className="etu-h2"
          style={{
            marginTop: 12,
            fontFamily: A.fontHead,
            fontSize: 32,
            fontWeight: 500,
            color: A.navy,
            letterSpacing: "-0.02em",
          }}
        >
          New broadcast
        </h1>
        <p style={{ marginTop: 8, color: A.muted, fontSize: 14 }}>
          Compose an email and pick the audience. Recipients are resolved when
          you click <strong>Send now</strong> — drafts don&apos;t pre-snapshot.
        </p>
      </div>

      <form
        action={createAndSendCampaignAction}
        style={{
          background: "#fff",
          border: `1px solid ${A.rule}`,
          borderRadius: 6,
          padding: 32,
          display: "flex",
          flexDirection: "column",
          gap: 18,
          boxShadow: "0 12px 32px -28px rgba(15, 69, 102, 0.2)",
        }}
      >
        <div>
          <label htmlFor="subject" style={s.fieldLabel}>
            Subject
          </label>
          <input
            id="subject"
            name="subject"
            required
            style={s.input}
            placeholder="Update from the ETU team"
          />
        </div>

        <div style={s.fieldRow}>
          <div>
            <label htmlFor="segment_kind" style={s.fieldLabel}>
              Audience
            </label>
            <select
              id="segment_kind"
              name="segment_kind"
              defaultValue={prefilledKind}
              required
              style={s.input}
            >
              <option value="" disabled>
                Choose audience…
              </option>
              <option value="all_students">All students</option>
              <option value="all_mentors">All mentors</option>
              <option value="all_parents">All parents</option>
              <option value="course_enrollees">Course enrollees…</option>
              <option value="event_registrants">Event registrants…</option>
              <option value="event_attendees">Event attendees…</option>
              <option value="event_no_shows">Event no-shows…</option>
            </select>
          </div>
          <div />
        </div>

        <div style={s.fieldRow}>
          <div>
            <label htmlFor="course_id" style={s.fieldLabel}>
              Course (if course-based)
            </label>
            <select
              id="course_id"
              name="course_id"
              defaultValue={prefilledCourse}
              style={s.input}
            >
              <option value="">—</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="event_id" style={s.fieldLabel}>
              Event (if event-based)
            </label>
            <select
              id="event_id"
              name="event_id"
              defaultValue={prefilledEvent}
              style={s.input}
            >
              <option value="">—</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <span style={s.fieldLabel}>Message</span>
          <RichTextEditor name="body" />
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 8,
            alignItems: "center",
          }}
        >
          <button
            type="submit"
            name="action"
            value="send"
            style={s.primaryButton}
          >
            Send now
          </button>
          <button
            type="submit"
            name="action"
            value="draft"
            style={s.ghostButton}
          >
            Save draft
          </button>
        </div>
      </form>
    </div>
  );
}

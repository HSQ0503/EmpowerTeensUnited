import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { A } from "@/app/components/tokens";
import { authStyles as s } from "@/app/(auth)/_styles";
import { EventForm } from "../../_form";
import { updateEventAction, archiveEventAction } from "../../actions";

export const metadata = { title: "Edit event · Admin" };

export default async function EditEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const { id } = await params;
  const { saved } = await searchParams;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) notFound();

  const update = updateEventAction.bind(null, id);
  const archive = archiveEventAction.bind(null, id);

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/admin/events"
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: A.muted,
            textDecoration: "none",
          }}
        >
          ← Events
        </Link>
        <h1
          style={{
            marginTop: 12,
            fontFamily: A.fontHead,
            fontSize: 32,
            fontWeight: 500,
            color: A.navy,
            letterSpacing: "-0.02em",
          }}
        >
          Edit event
        </h1>
        <p style={{ marginTop: 8, color: A.muted, fontSize: 14 }}>
          {event.publishedAt ? "Published" : "Draft"} · /events/{event.slug}
        </p>
      </div>

      {saved && (
        <div style={{ ...s.alertInfo, marginBottom: 20 }}>Event saved.</div>
      )}

      <EventForm action={update} event={event} submitLabel="Save changes" />

      <div
        style={{
          marginTop: 40,
          padding: 24,
          background: "#fff",
          border: `1px solid ${A.rule}`,
          borderRadius: 6,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 700,
            color: "#b22234",
            letterSpacing: 0.4,
            textTransform: "uppercase",
          }}
        >
          Danger zone
        </h2>
        <p style={{ color: A.muted, fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>
          Archiving hides the event from the public listing and registration
          form. Existing registrations are kept.
        </p>
        <form action={archive} style={{ marginTop: 16 }}>
          <button
            type="submit"
            style={{
              background: "#b22234",
              color: "#fff",
              padding: "10px 16px",
              border: "none",
              borderRadius: 4,
              fontFamily: A.fontBody,
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Archive event
          </button>
        </form>
      </div>
    </div>
  );
}

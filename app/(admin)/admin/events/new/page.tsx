import Link from "next/link";
import { A } from "@/app/components/tokens";
import { EventForm } from "../_form";
import { createEventAction } from "../actions";

export const metadata = { title: "New event · Admin" };

export default function NewEventPage() {
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
          New event
        </h1>
      </div>
      <EventForm action={createEventAction} submitLabel="Create event" />
    </div>
  );
}

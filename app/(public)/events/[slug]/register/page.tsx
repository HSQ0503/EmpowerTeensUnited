import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOptionalUser } from "@/lib/auth";
import { A } from "@/app/components/tokens";
import { authStyles as s } from "@/app/(auth)/_styles";
import { formatEventDateTime } from "@/lib/dates";
import { registerForEventAction } from "./actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug } });
  return {
    title: event ? `Register · ${event.title}` : "Register",
  };
}

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
  if (!event || !event.publishedAt || event.archivedAt) notFound();

  const auth = await getOptionalUser();

  return (
    <main
      style={{
        background: A.paper,
        minHeight: "calc(100vh - 80px)",
        padding: "64px 24px",
      }}
    >
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link
            href={`/events/${event.slug}`}
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              color: A.muted,
              textDecoration: "none",
            }}
          >
            ← Back to event
          </Link>
          <h1 style={{ ...s.heading, marginTop: 14 }}>Register</h1>
          <p style={s.subheading}>
            {event.title} · {formatEventDateTime(event.startsAt)} ·{" "}
            {event.location}
          </p>
        </div>

        {error && (
          <div style={{ ...s.alertError, marginBottom: 20 }}>{error}</div>
        )}

        <form
          action={registerForEventAction}
          style={{
            background: "#fff",
            border: `1px solid ${A.rule}`,
            borderRadius: 6,
            padding: 32,
            display: "flex",
            flexDirection: "column",
            gap: 18,
            boxShadow: "0 12px 32px -24px rgba(15, 69, 102, 0.2)",
          }}
        >
          <input type="hidden" name="event_id" value={event.id} />

          <div>
            <label htmlFor="name" style={s.fieldLabel}>
              Full name
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={
                auth ? `${auth.profile.firstName} ${auth.profile.lastName}` : ""
              }
              style={s.input}
            />
          </div>

          <div>
            <label htmlFor="email" style={s.fieldLabel}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              defaultValue={auth?.profile.email ?? ""}
              style={s.input}
            />
          </div>

          <div style={s.fieldRow}>
            <div>
              <label htmlFor="phone" style={s.fieldLabel}>
                Phone (optional)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={auth?.profile.phone ?? ""}
                style={s.input}
              />
            </div>
            <div>
              <label htmlFor="grade" style={s.fieldLabel}>
                Grade
              </label>
              <select
                id="grade"
                name="grade"
                defaultValue={auth?.profile.grade ?? ""}
                style={s.input}
              >
                <option value="">—</option>
                {[7, 8, 9, 10, 11, 12].map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="guest_count" style={s.fieldLabel}>
              Guests you&apos;re bringing
            </label>
            <input
              id="guest_count"
              name="guest_count"
              type="number"
              min={0}
              defaultValue={0}
              style={s.input}
            />
          </div>

          <div>
            <label htmlFor="guest_names" style={s.fieldLabel}>
              Guest names (optional · one per line)
            </label>
            <textarea
              id="guest_names"
              name="guest_names"
              rows={3}
              style={{ ...s.input, resize: "vertical", fontFamily: A.fontBody }}
            />
          </div>

          <div style={{ marginTop: 8 }}>
            <button type="submit" style={s.primaryButton}>
              Confirm registration
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

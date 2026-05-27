import { A } from "@/app/components/tokens";
import { authStyles as s } from "@/app/(auth)/_styles";

type EventLike = {
  title?: string;
  slug?: string;
  body?: string;
  location?: string;
  startsAt?: Date;
  endsAt?: Date;
  capacity?: number | null;
  coverImageUrl?: string | null;
  publishedAt?: Date | null;
};

function toDateTimeLocal(d: Date | undefined): string {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EventForm({
  action,
  event,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  event?: EventLike;
  submitLabel: string;
}) {
  return (
    <form
      action={action}
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
        <label htmlFor="title" style={s.fieldLabel}>
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={event?.title ?? ""}
          style={s.input}
        />
      </div>

      <div>
        <label htmlFor="slug" style={s.fieldLabel}>
          Slug (URL)
        </label>
        <input
          id="slug"
          name="slug"
          defaultValue={event?.slug ?? ""}
          placeholder="rollins-tour (leave blank to derive from title)"
          style={s.input}
        />
      </div>

      <div>
        <label htmlFor="body" style={s.fieldLabel}>
          Body (HTML allowed)
        </label>
        <textarea
          id="body"
          name="body"
          rows={8}
          defaultValue={event?.body ?? ""}
          style={{ ...s.input, fontFamily: "ui-monospace, monospace", fontSize: 13 }}
        />
      </div>

      <div>
        <label htmlFor="cover_image_url" style={s.fieldLabel}>
          Cover image URL (optional)
        </label>
        <input
          id="cover_image_url"
          name="cover_image_url"
          type="url"
          defaultValue={event?.coverImageUrl ?? ""}
          style={s.input}
        />
      </div>

      <div>
        <label htmlFor="location" style={s.fieldLabel}>
          Location
        </label>
        <input
          id="location"
          name="location"
          required
          defaultValue={event?.location ?? ""}
          style={s.input}
        />
      </div>

      <div style={s.fieldRow}>
        <div>
          <label htmlFor="starts_at" style={s.fieldLabel}>
            Starts at
          </label>
          <input
            id="starts_at"
            name="starts_at"
            type="datetime-local"
            required
            defaultValue={toDateTimeLocal(event?.startsAt)}
            style={s.input}
          />
        </div>
        <div>
          <label htmlFor="ends_at" style={s.fieldLabel}>
            Ends at
          </label>
          <input
            id="ends_at"
            name="ends_at"
            type="datetime-local"
            required
            defaultValue={toDateTimeLocal(event?.endsAt)}
            style={s.input}
          />
        </div>
      </div>

      <div>
        <label htmlFor="capacity" style={s.fieldLabel}>
          Capacity (blank = unlimited)
        </label>
        <input
          id="capacity"
          name="capacity"
          type="number"
          min={1}
          defaultValue={event?.capacity ?? ""}
          style={s.input}
        />
      </div>

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 14,
          color: A.ink,
          marginTop: 4,
        }}
      >
        <input
          type="checkbox"
          name="publish"
          defaultChecked={!!event?.publishedAt}
        />
        <span>Published (visible to the public)</span>
      </label>

      <div style={{ marginTop: 8 }}>
        <button type="submit" style={s.primaryButton}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

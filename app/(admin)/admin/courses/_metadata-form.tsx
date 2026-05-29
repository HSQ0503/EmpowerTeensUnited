import { A } from "@/app/components/tokens";
import { authStyles as s } from "@/app/(auth)/_styles";
import { RichTextEditor } from "@/components/RichTextEditor";

type CourseLike = {
  title?: string;
  slug?: string;
  body?: string;
  location?: string;
  startsOn?: Date;
  ageMin?: number;
  ageMax?: number;
  cohortCap?: number | null;
  coverImageUrl?: string | null;
  language?: "en" | "es" | "both";
  certificate?: boolean;
  weeks?: number;
  publishedAt?: Date | null;
};

function toDateInput(d: Date | undefined): string {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function CourseMetadataForm({
  action,
  course,
  submitLabel,
  showWeeksInput,
}: {
  action: (formData: FormData) => void | Promise<void>;
  course?: CourseLike;
  submitLabel: string;
  showWeeksInput: boolean;
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
          defaultValue={course?.title ?? ""}
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
          defaultValue={course?.slug ?? ""}
          placeholder="purpose-leadership (leave blank to derive from title)"
          style={s.input}
        />
      </div>

      <div>
        <label style={s.fieldLabel}>Description</label>
        <p
          style={{
            margin: "0 0 8px",
            fontSize: 13,
            color: A.muted,
            lineHeight: 1.5,
          }}
        >
          This appears on the public program page. Use the toolbar to add
          headings, bold text, and lists.
        </p>
        <RichTextEditor name="body" defaultValue={course?.body ?? ""} />
      </div>

      <div>
        <label htmlFor="cover_image_url" style={s.fieldLabel}>
          Cover image URL (optional)
        </label>
        <input
          id="cover_image_url"
          name="cover_image_url"
          type="url"
          defaultValue={course?.coverImageUrl ?? ""}
          style={s.input}
        />
      </div>

      <div style={s.fieldRow}>
        <div>
          <label htmlFor="location" style={s.fieldLabel}>
            Location
          </label>
          <input
            id="location"
            name="location"
            required
            defaultValue={course?.location ?? ""}
            style={s.input}
          />
        </div>
        <div>
          <label htmlFor="starts_on" style={s.fieldLabel}>
            Starts on
          </label>
          <input
            id="starts_on"
            name="starts_on"
            type="date"
            required
            defaultValue={toDateInput(course?.startsOn)}
            style={s.input}
          />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: showWeeksInput
            ? "1fr 1fr 1fr 1fr"
            : "1fr 1fr 1fr",
          gap: 12,
        }}
      >
        {showWeeksInput && (
          <div>
            <label htmlFor="weeks" style={s.fieldLabel}>
              Weeks
            </label>
            <input
              id="weeks"
              name="weeks"
              type="number"
              min={1}
              max={52}
              required
              defaultValue={course?.weeks ?? 10}
              style={s.input}
            />
          </div>
        )}
        <div>
          <label htmlFor="age_min" style={s.fieldLabel}>
            Min age
          </label>
          <input
            id="age_min"
            name="age_min"
            type="number"
            required
            defaultValue={course?.ageMin ?? 14}
            style={s.input}
          />
        </div>
        <div>
          <label htmlFor="age_max" style={s.fieldLabel}>
            Max age
          </label>
          <input
            id="age_max"
            name="age_max"
            type="number"
            required
            defaultValue={course?.ageMax ?? 18}
            style={s.input}
          />
        </div>
        <div>
          <label htmlFor="cohort_cap" style={s.fieldLabel}>
            Cohort cap
          </label>
          <input
            id="cohort_cap"
            name="cohort_cap"
            type="number"
            min={1}
            defaultValue={course?.cohortCap ?? ""}
            placeholder="—"
            style={s.input}
          />
        </div>
      </div>

      <div>
        <label htmlFor="language" style={s.fieldLabel}>
          Language
        </label>
        <select
          id="language"
          name="language"
          defaultValue={course?.language ?? "en"}
          style={s.input}
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="both">Both</option>
        </select>
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
          name="certificate"
          defaultChecked={course?.certificate ?? true}
        />
        <span>Issues a certificate of completion</span>
      </label>

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 14,
          color: A.ink,
        }}
      >
        <input
          type="checkbox"
          name="publish"
          defaultChecked={!!course?.publishedAt}
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

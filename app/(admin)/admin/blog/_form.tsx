import { A } from "@/app/components/tokens";
import { authStyles as s } from "@/app/(auth)/_styles";
import { RichTextEditor } from "@/components/RichTextEditor";

type PostLike = {
  title?: string;
  slug?: string;
  excerpt?: string | null;
  body?: string;
  coverImageUrl?: string | null;
  publishedAt?: Date | null;
};

export function BlogForm({
  action,
  post,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  post?: PostLike;
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
          defaultValue={post?.title ?? ""}
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
          defaultValue={post?.slug ?? ""}
          placeholder="purpose-before-resume (leave blank to derive from title)"
          style={s.input}
        />
      </div>

      <div>
        <label htmlFor="excerpt" style={s.fieldLabel}>
          Excerpt (short summary, optional)
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={2}
          defaultValue={post?.excerpt ?? ""}
          style={s.input}
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
          defaultValue={post?.coverImageUrl ?? ""}
          style={s.input}
        />
      </div>

      <div>
        <span style={s.fieldLabel}>Body</span>
        <RichTextEditor name="body" defaultValue={post?.body ?? ""} />
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
          defaultChecked={!!post?.publishedAt}
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

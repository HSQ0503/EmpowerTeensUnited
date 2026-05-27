import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { A } from "@/app/components/tokens";
import { BlogForm } from "../_form";
import { createPostAction } from "../actions";

export const metadata = { title: "New post · Admin" };

export default async function NewBlogPostPage() {
  await requireRole("admin");

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/admin/blog"
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: A.muted,
            textDecoration: "none",
          }}
        >
          ← Blog
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
          New blog post
        </h1>
      </div>

      <BlogForm action={createPostAction} submitLabel="Create post" />
    </div>
  );
}

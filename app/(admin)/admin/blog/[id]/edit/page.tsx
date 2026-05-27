import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { A } from "@/app/components/tokens";
import { authStyles as s } from "@/app/(auth)/_styles";
import { BlogForm } from "../../_form";
import { updatePostAction, archivePostAction } from "../../actions";

export const metadata = { title: "Edit post · Admin" };

export default async function EditBlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;
  const { saved } = await searchParams;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  const update = updatePostAction.bind(null, id);
  const archive = archivePostAction.bind(null, id);

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
          Edit blog post
        </h1>
        <p style={{ marginTop: 8, color: A.muted, fontSize: 14 }}>
          {post.publishedAt ? "Published" : "Draft"} · /blog/{post.slug}
        </p>
      </div>

      {saved && (
        <div style={{ ...s.alertInfo, marginBottom: 20 }}>Post saved.</div>
      )}

      <BlogForm action={update} post={post} submitLabel="Save changes" />

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
        <p
          style={{
            color: A.muted,
            fontSize: 13,
            marginTop: 8,
            lineHeight: 1.5,
          }}
        >
          Archiving hides the post from the public blog. The post is preserved
          and can be restored from the database.
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
            Archive post
          </button>
        </form>
      </div>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { A } from "@/app/components/tokens";
import { formatShortDate } from "@/lib/dates";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) return { title: "Post not found · Empower Teens United" };
  return {
    title: `${post.title} · Empower Teens United`,
    description: post.excerpt ?? undefined,
  };
}

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
    <main style={{ background: "#fff", padding: "72px 24px 96px" }}>
      <article style={{ maxWidth: 720, margin: "0 auto" }}>
        <Link
          href="/blog"
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1.4,
            textTransform: "uppercase",
            color: A.muted,
            textDecoration: "none",
          }}
        >
          ← All stories
        </Link>
        <p
          style={{
            color: A.muted,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            margin: "32px 0 12px",
          }}
        >
          {formatShortDate(post.publishedAt)} · {post.author.firstName}{" "}
          {post.author.lastName}
        </p>
        <h1
          style={{
            fontFamily: A.fontHead,
            fontSize: "clamp(36px, 4.4vw, 52px)",
            fontWeight: 400,
            color: A.navy,
            margin: 0,
            letterSpacing: "-0.025em",
            lineHeight: 1.1,
          }}
        >
          {post.title}
        </h1>
        {post.excerpt && (
          <p
            style={{
              marginTop: 20,
              fontSize: 19,
              color: A.muted,
              lineHeight: 1.55,
              fontFamily: A.fontBody,
            }}
          >
            {post.excerpt}
          </p>
        )}
        <div
          className="prose-blog"
          style={{
            marginTop: 32,
            fontSize: 17,
            color: A.body,
            lineHeight: 1.7,
            fontFamily: A.fontBody,
          }}
          dangerouslySetInnerHTML={{ __html: post.body }}
        />
      </article>
    </main>
  );
}

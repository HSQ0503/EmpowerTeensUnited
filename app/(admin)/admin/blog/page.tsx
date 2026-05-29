import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { A } from "@/app/components/tokens";
import { formatShortDate } from "@/lib/dates";

export const metadata = { title: "Blog · Admin" };

export default async function AdminBlogListPage() {
  await requireRole("admin");
  const posts = await prisma.blogPost.findMany({
    where: { archivedAt: null },
    orderBy: { createdAt: "desc" },
    include: { author: true },
  });

  return (
    <div>
      <div
        className="etu-stack"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 24,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.4,
              textTransform: "uppercase",
              color: A.muted,
              marginBottom: 6,
            }}
          >
            Stories
          </div>
          <h1
            className="etu-h2"
            style={{
              fontFamily: A.fontHead,
              fontSize: 32,
              fontWeight: 500,
              color: A.navy,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Blog
          </h1>
        </div>
        <Link
          href="/admin/blog/new"
          style={{
            background: A.navy,
            color: "#fff",
            padding: "12px 18px",
            borderRadius: 4,
            textDecoration: "none",
            fontFamily: A.fontBody,
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          New post
        </Link>
      </div>

      <div
        style={{
          background: "#fff",
          border: `1px solid ${A.rule}`,
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        <div className="etu-table-wrap">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                textAlign: "left",
                background: A.ruleSoft,
                borderBottom: `1px solid ${A.rule}`,
              }}
            >
              <th style={th}>Title</th>
              <th style={th}>Author</th>
              <th style={th}>Created</th>
              <th style={th}>Status</th>
              <th style={{ ...th, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    ...td,
                    color: A.muted,
                    textAlign: "center",
                    padding: 32,
                  }}
                >
                  No posts yet. Create one to get started.
                </td>
              </tr>
            ) : (
              posts.map((p) => (
                <tr key={p.id} style={{ borderBottom: `1px solid ${A.rule}` }}>
                  <td style={{ ...td, fontWeight: 600, color: A.navy }}>
                    {p.title}
                  </td>
                  <td style={{ ...td, color: A.body }}>
                    {p.author.firstName} {p.author.lastName}
                  </td>
                  <td style={{ ...td, color: A.body }}>
                    {formatShortDate(p.createdAt)}
                  </td>
                  <td style={td}>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: 0.6,
                        textTransform: "uppercase",
                        padding: "4px 10px",
                        borderRadius: 99,
                        background: p.publishedAt
                          ? "rgba(31, 138, 91, 0.12)"
                          : A.ruleSoft,
                        color: p.publishedAt ? "#1f8a5b" : A.muted,
                        border: p.publishedAt
                          ? "1px solid rgba(31, 138, 91, 0.3)"
                          : `1px solid ${A.rule}`,
                      }}
                    >
                      {p.publishedAt ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td style={{ ...td, textAlign: "right" }}>
                    <Link
                      href={`/admin/blog/${p.id}/edit`}
                      style={actionLink}
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

const th = {
  padding: "12px 16px",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 1.2,
  textTransform: "uppercase" as const,
  color: A.muted,
};

const td = {
  padding: "14px 16px",
  fontSize: 14,
  verticalAlign: "middle" as const,
};

const actionLink = {
  color: A.navy,
  fontSize: 13,
  fontWeight: 600,
  textDecoration: "none",
  borderBottom: `2px solid ${A.gold}`,
  paddingBottom: 2,
};

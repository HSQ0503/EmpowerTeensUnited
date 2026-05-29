import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { A } from "@/app/components/tokens";
import { formatShortDate } from "@/lib/dates";

export const metadata = { title: "Courses · Admin" };

export default async function AdminCoursesListPage() {
  await requireRole("admin");
  const courses = await prisma.course.findMany({
    where: { archivedAt: null },
    orderBy: { startsOn: "desc" },
    include: {
      _count: { select: { enrollments: true, courseWeeks: true } },
    },
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
            Programs
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
            Courses
          </h1>
        </div>
        <Link
          href="/admin/courses/new"
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
          New course
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
              <th style={th}>Starts</th>
              <th style={{ ...th, textAlign: "right" }}>Weeks</th>
              <th style={{ ...th, textAlign: "right" }}>Enrolled</th>
              <th style={th}>Status</th>
              <th style={{ ...th, textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{ ...td, color: A.muted, textAlign: "center", padding: 32 }}
                >
                  No courses yet. Create one to get started.
                </td>
              </tr>
            ) : (
              courses.map((c) => (
                <tr key={c.id} style={{ borderBottom: `1px solid ${A.rule}` }}>
                  <td style={{ ...td, fontWeight: 600, color: A.navy }}>
                    {c.title}
                  </td>
                  <td style={{ ...td, color: A.body }}>
                    {formatShortDate(c.startsOn)}
                  </td>
                  <td style={{ ...td, color: A.body, textAlign: "right" }}>
                    {c.weeks}
                  </td>
                  <td style={{ ...td, color: A.body, textAlign: "right" }}>
                    {c._count.enrollments}
                    {c.cohortCap ? ` / ${c.cohortCap}` : ""}
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
                        background: c.publishedAt
                          ? "rgba(31, 138, 91, 0.12)"
                          : A.ruleSoft,
                        color: c.publishedAt ? "#1f8a5b" : A.muted,
                        border: c.publishedAt
                          ? "1px solid rgba(31, 138, 91, 0.3)"
                          : `1px solid ${A.rule}`,
                      }}
                    >
                      {c.publishedAt ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td style={{ ...td, textAlign: "right" }}>
                    <Link
                      href={`/admin/courses/${c.id}/edit`}
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

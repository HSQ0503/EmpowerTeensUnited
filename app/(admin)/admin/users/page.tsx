import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { A } from "@/app/components/tokens";
import { RoleSelect } from "./RoleSelect";
import type { Prisma, Role } from "@/prisma/generated/client/client";

export const metadata = { title: "Users · Admin" };

const ROLES: Array<{ key: Role; label: string }> = [
  { key: "student", label: "Students" },
  { key: "mentor", label: "Mentors" },
  { key: "admin", label: "Admins" },
];

const joinedFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function isRole(value: string | undefined): value is Role {
  return !!value && ROLES.some((r) => r.key === value);
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string }>;
}) {
  const { profile: me } = await requireRole("admin");
  const { role, q } = await searchParams;
  const query = (q ?? "").trim();

  const where: Prisma.ProfileWhereInput = {};
  if (isRole(role)) where.role = role;
  if (query) {
    where.OR = [
      { firstName: { contains: query, mode: "insensitive" } },
      { lastName: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
    ];
  }

  const [people, counts] = await Promise.all([
    prisma.profile.findMany({
      where,
      include: {
        studentAssignment: {
          where: { endedAt: null },
          include: { mentor: true },
        },
        _count: { select: { enrollments: true } },
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    }),
    prisma.profile.groupBy({ by: ["role"], _count: { _all: true } }),
  ]);

  const countByRole = new Map(counts.map((c) => [c.role, c._count._all]));
  const total = counts.reduce((sum, c) => sum + c._count._all, 0);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
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
          People
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
          Users
        </h1>
        <p style={{ color: A.muted, fontSize: 14, marginTop: 8, lineHeight: 1.5 }}>
          Everyone with an account. Click a student to open their full profile —
          intake, session notes, plan, and course progress.
        </p>
      </div>

      <div
        className="etu-collapse-2"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <Stat label="All" value={total} />
        {ROLES.map((r) => (
          <Stat key={r.key} label={r.label} value={countByRole.get(r.key) ?? 0} />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <FilterTab label="All" href={tabHref(undefined, query)} active={!isRole(role)} />
          {ROLES.map((r) => (
            <FilterTab
              key={r.key}
              label={r.label}
              href={tabHref(r.key, query)}
              active={role === r.key}
            />
          ))}
        </div>

        <form method="get" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {isRole(role) && <input type="hidden" name="role" value={role} />}
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search name or email…"
            aria-label="Search users"
            style={{
              padding: "9px 12px",
              border: `1px solid ${A.rule}`,
              borderRadius: 4,
              fontFamily: A.fontBody,
              fontSize: 13,
              background: "#fff",
              color: A.ink,
              minWidth: 220,
            }}
          />
          <button
            type="submit"
            style={{
              background: A.navy,
              color: "#fff",
              padding: "9px 16px",
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
            Search
          </button>
        </form>
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
              <th style={th}>Name</th>
              <th style={th}>Role</th>
              <th style={th}>Details</th>
              <th style={th}>Mentor</th>
              <th style={th}>Joined</th>
              <th style={{ ...th, textAlign: "right" }}>Manage role</th>
            </tr>
          </thead>
          <tbody>
            {people.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{ ...td, color: A.muted, textAlign: "center", padding: 32 }}
                >
                  {query ? "No users match your search." : "No users yet."}
                </td>
              </tr>
            ) : (
              people.map((p) => {
                const isStudent = p.role === "student";
                const mentor = p.studentAssignment?.mentor;
                return (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${A.rule}` }}>
                    <td style={td}>
                      {isStudent ? (
                        <Link
                          href={`/admin/mentorship/students/${p.id}`}
                          style={{
                            fontWeight: 600,
                            color: A.navy,
                            textDecoration: "none",
                            borderBottom: `2px solid ${A.gold}`,
                            paddingBottom: 2,
                          }}
                        >
                          {p.firstName} {p.lastName}
                        </Link>
                      ) : (
                        <span style={{ fontWeight: 600, color: A.ink }}>
                          {p.firstName} {p.lastName}
                        </span>
                      )}
                      {p.bannedAt && (
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: 0.5,
                            textTransform: "uppercase",
                            color: "#b22234",
                            background: "rgba(178, 34, 52, 0.1)",
                            border: "1px solid rgba(178, 34, 52, 0.3)",
                            padding: "2px 7px",
                            borderRadius: 99,
                          }}
                        >
                          Banned
                        </span>
                      )}
                      <div style={{ fontSize: 12, color: A.muted, marginTop: 4 }}>
                        {p.email}
                      </div>
                    </td>
                    <td style={td}>
                      <RoleBadge role={p.role} />
                    </td>
                    <td style={{ ...td, color: A.body, fontSize: 13 }}>
                      {isStudent ? (
                        <>
                          {p.grade ? `Grade ${p.grade}` : "—"}
                          {p.school ? ` · ${p.school}` : ""}
                          <div style={{ color: A.muted, marginTop: 2 }}>
                            {p._count.enrollments} course
                            {p._count.enrollments === 1 ? "" : "s"}
                          </div>
                        </>
                      ) : (
                        <span style={{ color: A.muted }}>
                          {p.title || "—"}
                        </span>
                      )}
                    </td>
                    <td style={{ ...td, color: A.body, fontSize: 13 }}>
                      {isStudent
                        ? mentor
                          ? `${mentor.firstName} ${mentor.lastName}`
                          : "—"
                        : ""}
                    </td>
                    <td style={{ ...td, color: A.muted, fontSize: 13 }}>
                      {joinedFmt.format(p.createdAt)}
                    </td>
                    <td style={{ ...td, textAlign: "right" }}>
                      <div
                        style={{
                          display: "inline-flex",
                          gap: 14,
                          alignItems: "center",
                          justifyContent: "flex-end",
                        }}
                      >
                        {isStudent && (
                          <Link
                            href={`/admin/mentorship/students/${p.id}`}
                            style={{
                              color: A.navy,
                              fontSize: 13,
                              fontWeight: 600,
                              textDecoration: "none",
                              borderBottom: `2px solid ${A.gold}`,
                              paddingBottom: 2,
                            }}
                          >
                            View
                          </Link>
                        )}
                        <RoleSelect
                          userId={p.id}
                          role={p.role}
                          disabled={p.id === me.id}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

function tabHref(role: Role | undefined, query: string): string {
  const params = new URLSearchParams();
  if (role) params.set("role", role);
  if (query) params.set("q", query);
  const qs = params.toString();
  return qs ? `/admin/users?${qs}` : "/admin/users";
}

function FilterTab({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        padding: "7px 14px",
        borderRadius: 99,
        fontSize: 13,
        fontWeight: 600,
        textDecoration: "none",
        border: `1px solid ${active ? A.navy : A.rule}`,
        background: active ? A.navy : "#fff",
        color: active ? "#fff" : A.body,
      }}
    >
      {label}
    </Link>
  );
}

function RoleBadge({ role }: { role: Role }) {
  const palette: Record<Role, { bg: string; border: string; fg: string }> = {
    student: { bg: "rgba(15, 69, 102, 0.1)", border: "rgba(15, 69, 102, 0.3)", fg: A.navy },
    mentor: { bg: "rgba(252, 204, 0, 0.18)", border: "rgba(252, 204, 0, 0.5)", fg: "#7a5a00" },
    admin: { bg: "rgba(178, 34, 52, 0.1)", border: "rgba(178, 34, 52, 0.3)", fg: "#b22234" },
  };
  const c = palette[role];
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 0.5,
        textTransform: "capitalize",
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.fg,
        padding: "4px 10px",
        borderRadius: 99,
      }}
    >
      {role}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${A.rule}`,
        borderRadius: 6,
        padding: 18,
      }}
    >
      <div
        style={{
          fontSize: 26,
          fontFamily: A.fontHead,
          fontWeight: 600,
          color: A.navy,
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          color: A.muted,
          fontSize: 11,
          marginTop: 8,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          fontWeight: 700,
        }}
      >
        {label}
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

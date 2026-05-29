import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { A } from "@/app/components/tokens";
import { authStyles as s } from "@/app/(auth)/_styles";
import {
  createTeamMemberAction,
  updateTeamMemberAction,
  deleteTeamMemberAction,
} from "./actions";

export const metadata = { title: "Team · Admin" };

export default async function AdminTeamPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  await requireRole("admin");
  const { saved, deleted } = await searchParams;
  const members = await prisma.teamMember.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div style={{ maxWidth: 820 }}>
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
          Team members
        </h1>
        <p style={{ marginTop: 8, color: A.muted, fontSize: 14 }}>
          Published members appear on the public /about page, ordered by sort
          order (low → high).
        </p>
      </div>

      {saved && (
        <div style={{ ...s.alertInfo, marginBottom: 20 }}>
          Team member saved.
        </div>
      )}
      {deleted && (
        <div style={{ ...s.alertInfo, marginBottom: 20 }}>
          Team member deleted.
        </div>
      )}

      <section
        style={{
          background: "#fff",
          border: `1px solid ${A.rule}`,
          borderRadius: 6,
          padding: 28,
          marginBottom: 32,
          boxShadow: "0 12px 32px -28px rgba(15, 69, 102, 0.2)",
        }}
      >
        <h2
          style={{
            fontFamily: A.fontHead,
            fontSize: 20,
            fontWeight: 500,
            color: A.navy,
            margin: 0,
            marginBottom: 18,
            letterSpacing: "-0.01em",
          }}
        >
          Add a new member
        </h2>
        <form
          action={createTeamMemberAction}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <div style={s.fieldRow}>
            <div>
              <label htmlFor="new_full_name" style={s.fieldLabel}>
                Full name
              </label>
              <input
                id="new_full_name"
                name="full_name"
                required
                style={s.input}
              />
            </div>
            <div>
              <label htmlFor="new_role_title" style={s.fieldLabel}>
                Role / title
              </label>
              <input
                id="new_role_title"
                name="role_title"
                required
                style={s.input}
              />
            </div>
          </div>
          <div>
            <label htmlFor="new_photo_url" style={s.fieldLabel}>
              Photo URL (optional)
            </label>
            <input
              id="new_photo_url"
              name="photo_url"
              type="url"
              style={s.input}
            />
          </div>
          <div>
            <label htmlFor="new_bio" style={s.fieldLabel}>
              Bio (optional)
            </label>
            <textarea id="new_bio" name="bio" rows={3} style={s.input} />
          </div>
          <div style={s.fieldRow}>
            <div>
              <label htmlFor="new_sort_order" style={s.fieldLabel}>
                Sort order
              </label>
              <input
                id="new_sort_order"
                name="sort_order"
                type="number"
                defaultValue={members.length}
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
                alignSelf: "flex-end",
                marginBottom: 12,
              }}
            >
              <input
                type="checkbox"
                name="published"
                defaultChecked
              />
              <span>Published on /about</span>
            </label>
          </div>
          <div>
            <button type="submit" style={s.primaryButton}>
              Add member
            </button>
          </div>
        </form>
      </section>

      <h2
        style={{
          fontFamily: A.fontHead,
          fontSize: 22,
          fontWeight: 500,
          color: A.navy,
          margin: "0 0 16px",
          letterSpacing: "-0.01em",
        }}
      >
        Current team ({members.length})
      </h2>

      {members.length === 0 ? (
        <p style={{ color: A.muted }}>No team members yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {members.map((m) => {
            const update = updateTeamMemberAction.bind(null, m.id);
            const remove = deleteTeamMemberAction.bind(null, m.id);
            return (
              <div
                key={m.id}
                style={{
                  background: "#fff",
                  border: `1px solid ${A.rule}`,
                  borderRadius: 6,
                  padding: 24,
                }}
              >
                <form
                  action={update}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <div style={s.fieldRow}>
                    <div>
                      <label style={s.fieldLabel}>Full name</label>
                      <input
                        name="full_name"
                        defaultValue={m.fullName}
                        required
                        style={s.input}
                      />
                    </div>
                    <div>
                      <label style={s.fieldLabel}>Role / title</label>
                      <input
                        name="role_title"
                        defaultValue={m.roleTitle}
                        required
                        style={s.input}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={s.fieldLabel}>Photo URL</label>
                    <input
                      name="photo_url"
                      type="url"
                      defaultValue={m.photoUrl ?? ""}
                      style={s.input}
                    />
                  </div>
                  <div>
                    <label style={s.fieldLabel}>Bio</label>
                    <textarea
                      name="bio"
                      rows={3}
                      defaultValue={m.bio ?? ""}
                      style={s.input}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ width: 120 }}>
                      <label style={s.fieldLabel}>Sort</label>
                      <input
                        name="sort_order"
                        type="number"
                        defaultValue={m.sortOrder}
                        style={s.input}
                      />
                    </div>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 14,
                        color: A.ink,
                      }}
                    >
                      <input
                        type="checkbox"
                        name="published"
                        defaultChecked={m.published}
                      />
                      <span>Published</span>
                    </label>
                    <div
                      style={{
                        marginLeft: "auto",
                        display: "flex",
                        gap: 12,
                      }}
                    >
                      <button type="submit" style={s.primaryButton}>
                        Save
                      </button>
                    </div>
                  </div>
                </form>
                <form
                  action={remove}
                  style={{
                    marginTop: 14,
                    paddingTop: 14,
                    borderTop: `1px solid ${A.rule}`,
                  }}
                >
                  <button
                    type="submit"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#b22234",
                      fontFamily: A.fontBody,
                      fontWeight: 700,
                      fontSize: 12,
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    Delete {m.fullName}
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

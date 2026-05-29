"use client";

import { useRef } from "react";
import { A } from "@/app/components/tokens";
import type { Role } from "@/prisma/generated/client/client";
import { updateUserRoleAction } from "./actions";

const ROLES: Role[] = ["student", "mentor", "admin"];

function label(role: Role) {
  return role[0].toUpperCase() + role.slice(1);
}

export function RoleSelect({
  userId,
  role,
  disabled,
}: {
  userId: string;
  role: Role;
  disabled?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  if (disabled) {
    return <span style={{ fontSize: 12, color: A.muted }}>You</span>;
  }

  return (
    <form ref={formRef} action={updateUserRoleAction} style={{ display: "inline-flex" }}>
      <input type="hidden" name="userId" value={userId} />
      <select
        name="role"
        defaultValue={role}
        aria-label="Change role"
        onChange={(e) => {
          const next = e.target.value as Role;
          if (next === role) return;
          if (confirm(`Change this user's role to ${label(next)}?`)) {
            formRef.current?.requestSubmit();
          } else {
            e.target.value = role;
          }
        }}
        style={{
          padding: "6px 10px",
          border: `1px solid ${A.rule}`,
          borderRadius: 4,
          fontFamily: A.fontBody,
          fontSize: 13,
          fontWeight: 600,
          background: "#fff",
          color: A.navy,
          cursor: "pointer",
        }}
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {label(r)}
          </option>
        ))}
      </select>
    </form>
  );
}

import "server-only";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import type { Profile, Role } from "@/prisma/generated/client/client";

export type AuthContext = {
  user: { id: string; email: string };
  profile: Profile;
};

const ROLE_HOME: Record<Role, string> = {
  admin: "/admin",
  mentor: "/mentor",
  student: "/me",
};

export function homeForRole(role: Role): string {
  return ROLE_HOME[role];
}

export async function getOptionalUser(): Promise<AuthContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!profile) return null;
  return { user: { id: user.id, email: user.email ?? "" }, profile };
}

export async function requireUser(): Promise<AuthContext> {
  const auth = await getOptionalUser();
  if (!auth) redirect("/sign-in");
  if (auth.profile.bannedAt) redirect("/sign-in?banned=1");
  return auth;
}

export async function requireRole(role: Role): Promise<AuthContext> {
  const auth = await requireUser();
  if (auth.profile.role !== role) notFound();
  return auth;
}

/**
 * Same gate as requireRole, but on role mismatch redirects the user to the
 * dashboard for their actual role instead of 404ing. Use in role-area
 * **layouts** so a signed-in user with the wrong role lands somewhere useful;
 * keep `requireRole` on actions and inner pages where a hard 404 is correct.
 */
export async function requireRoleOrRedirect(role: Role): Promise<AuthContext> {
  const auth = await requireUser();
  if (auth.profile.role !== role) redirect(ROLE_HOME[auth.profile.role]);
  return auth;
}

import "server-only";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import type { Profile } from "@/prisma/generated/client/models";
import type { Role } from "@/prisma/generated/client/enums";

export type AuthContext = {
  user: { id: string; email: string };
  profile: Profile;
};

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

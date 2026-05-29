"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/prisma/generated/client/client";

const VALID_ROLES: Role[] = ["student", "mentor", "admin"];

export async function updateUserRoleAction(formData: FormData) {
  const { profile } = await requireRole("admin");

  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "") as Role;

  if (!userId || !VALID_ROLES.includes(role)) return;
  // An admin can't change their own role — prevents accidentally locking
  // themselves out of the admin area.
  if (userId === profile.id) return;

  await prisma.profile.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
}

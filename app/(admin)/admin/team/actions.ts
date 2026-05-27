"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function parseForm(formData: FormData) {
  return {
    fullName: String(formData.get("full_name") ?? "").trim(),
    roleTitle: String(formData.get("role_title") ?? "").trim(),
    bio: String(formData.get("bio") ?? "").trim() || null,
    photoUrl: String(formData.get("photo_url") ?? "").trim() || null,
    sortOrder: Number(formData.get("sort_order") ?? 0) || 0,
    published: formData.get("published") === "on",
  };
}

function revalidate() {
  revalidatePath("/admin/team");
  revalidatePath("/about");
}

export async function createTeamMemberAction(formData: FormData) {
  await requireRole("admin");
  await prisma.teamMember.create({ data: parseForm(formData) });
  revalidate();
  redirect("/admin/team?saved=1");
}

export async function updateTeamMemberAction(
  memberId: string,
  formData: FormData,
) {
  await requireRole("admin");
  await prisma.teamMember.update({
    where: { id: memberId },
    data: parseForm(formData),
  });
  revalidate();
  redirect("/admin/team?saved=1");
}

export async function deleteTeamMemberAction(memberId: string) {
  await requireRole("admin");
  await prisma.teamMember.delete({ where: { id: memberId } });
  revalidate();
  redirect("/admin/team?deleted=1");
}

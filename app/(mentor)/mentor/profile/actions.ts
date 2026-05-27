"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateMentorProfileAction(formData: FormData) {
  const { profile } = await requireRole("mentor");

  const firstName =
    String(formData.get("first_name") ?? profile.firstName).trim() ||
    profile.firstName;
  const lastName =
    String(formData.get("last_name") ?? profile.lastName).trim() ||
    profile.lastName;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const title = String(formData.get("title") ?? "").trim() || null;
  const bio = String(formData.get("bio") ?? "").trim() || null;

  await prisma.profile.update({
    where: { id: profile.id },
    data: { firstName, lastName, phone, title, bio },
  });

  revalidatePath("/mentor/profile");
  revalidatePath("/mentor");
  redirect("/mentor/profile?saved=1");
}

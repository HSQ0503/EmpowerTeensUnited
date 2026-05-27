"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function updateProfileAction(formData: FormData) {
  const { profile } = await requireRole("student");

  const firstName = String(formData.get("first_name") ?? profile.firstName).trim() || profile.firstName;
  const lastName = String(formData.get("last_name") ?? profile.lastName).trim() || profile.lastName;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const school = String(formData.get("school") ?? "").trim() || null;
  const gradeRaw = formData.get("grade");
  const grade = gradeRaw ? Number(gradeRaw) : null;
  const parentEmail = String(formData.get("parent_email") ?? "").trim() || null;
  const parentPhone = String(formData.get("parent_phone") ?? "").trim() || null;

  await prisma.profile.update({
    where: { id: profile.id },
    data: { firstName, lastName, phone, school, grade, parentEmail, parentPhone },
  });

  revalidatePath("/me/profile");
  redirect("/me/profile?saved=1");
}

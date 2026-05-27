"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function assignMentorAction(formData: FormData) {
  await requireRole("admin");
  const studentId = String(formData.get("student_id") ?? "");
  const mentorId = String(formData.get("mentor_id") ?? "");

  if (!studentId || !mentorId) {
    revalidatePath("/admin/mentorship");
    return;
  }

  // Ensure both roles match before pairing. Avoid pairing a non-mentor or
  // non-student profile.
  const [student, mentor] = await Promise.all([
    prisma.profile.findUnique({
      where: { id: studentId },
      select: { id: true, role: true },
    }),
    prisma.profile.findUnique({
      where: { id: mentorId },
      select: { id: true, role: true },
    }),
  ]);

  if (
    !student ||
    student.role !== "student" ||
    !mentor ||
    mentor.role !== "mentor"
  ) {
    revalidatePath("/admin/mentorship");
    return;
  }

  await prisma.mentorAssignment.upsert({
    where: { studentId },
    create: { studentId, mentorId },
    update: { mentorId, endedAt: null },
  });

  revalidatePath("/admin/mentorship");
}

export async function endAssignmentAction(formData: FormData) {
  await requireRole("admin");
  const studentId = String(formData.get("student_id") ?? "");
  if (!studentId) return;

  await prisma.mentorAssignment.updateMany({
    where: { studentId, endedAt: null },
    data: { endedAt: new Date() },
  });

  revalidatePath("/admin/mentorship");
}

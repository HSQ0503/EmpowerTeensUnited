"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendMentorAssignedEmail } from "@/lib/email/transactional";

export async function assignMentorAction(formData: FormData) {
  await requireRole("admin");
  const studentId = String(formData.get("student_id") ?? "");
  const mentorId = String(formData.get("mentor_id") ?? "");

  if (!studentId || !mentorId) {
    redirect("/admin/mentorship?error=missing");
  }

  // Ensure both roles match before pairing. Avoid pairing a non-mentor or
  // non-student profile.
  const [student, mentor, existing] = await Promise.all([
    prisma.profile.findUnique({
      where: { id: studentId },
      select: { id: true, role: true, email: true, firstName: true },
    }),
    prisma.profile.findUnique({
      where: { id: mentorId },
      select: { id: true, role: true, firstName: true, lastName: true },
    }),
    prisma.mentorAssignment.findUnique({
      where: { studentId },
      select: { mentorId: true, endedAt: true },
    }),
  ]);

  if (
    !student ||
    student.role !== "student" ||
    !mentor ||
    mentor.role !== "mentor"
  ) {
    redirect("/admin/mentorship?error=invalid");
  }

  await prisma.mentorAssignment.upsert({
    where: { studentId },
    create: { studentId, mentorId },
    update: { mentorId, endedAt: null },
  });

  // Only notify when the pairing actually changes (new mentor, or re-activating
  // an ended assignment) — re-saving the same active mentor shouldn't email.
  const isNewPairing =
    !existing || existing.mentorId !== mentorId || existing.endedAt !== null;
  if (isNewPairing) {
    try {
      await sendMentorAssignedEmail({
        toEmail: student.email,
        studentName: student.firstName,
        mentorName: `${mentor.firstName} ${mentor.lastName}`,
      });
    } catch (error) {
      console.error("Failed to send mentor-assigned email", error);
    }
  }

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

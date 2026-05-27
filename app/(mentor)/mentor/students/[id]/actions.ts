"use server";

import { redirect, notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SESSION_FORM } from "@/lib/forms/session";
import type { FormAnswers } from "@/lib/forms/types";
import type { Prisma } from "@/prisma/generated/client/client";

export async function submitSessionFormAction(
  studentId: string,
  formData: FormData,
) {
  const { profile } = await requireRole("mentor");

  const assignment = await prisma.mentorAssignment.findFirst({
    where: { mentorId: profile.id, studentId, endedAt: null },
  });
  if (!assignment) notFound();

  const answers: FormAnswers = {};
  for (const q of SESSION_FORM.questions) {
    answers[q.id] = String(formData.get(q.id) ?? "").trim();
  }

  const last = await prisma.mentorshipForm.findFirst({
    where: { studentId, kind: "session" },
    orderBy: { sessionNo: "desc" },
    select: { sessionNo: true },
  });
  const nextNo = (last?.sessionNo ?? 0) + 1;

  await prisma.mentorshipForm.create({
    data: {
      studentId,
      mentorId: profile.id,
      kind: "session",
      sessionNo: nextNo,
      answers: answers as Prisma.InputJsonValue,
      formVersion: SESSION_FORM.version,
      submittedById: profile.id,
      submittedAt: new Date(),
    },
  });

  redirect(`/mentor/students/${studentId}?saved=session`);
}

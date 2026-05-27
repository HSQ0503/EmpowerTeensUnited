"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/prisma/generated/client/client";

type QuestionDef = {
  id: string;
  prompt: string;
  type: "short" | "long";
};

export async function submitWeekAnswersAction(
  slug: string,
  weekNo: number,
  formData: FormData,
) {
  const { profile } = await requireRole("student");

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      courseWeeks: { where: { weekNo } },
      enrollments: {
        where: { profileId: profile.id, status: "active" },
      },
    },
  });

  const week = course?.courseWeeks[0];
  const enrollment = course?.enrollments[0];
  if (!course || !week || !enrollment) redirect("/courses");

  const questions = ((week.questions as unknown) as QuestionDef[]) ?? [];
  const answers: Record<string, string> = {};
  for (const q of questions) {
    answers[q.id] = String(formData.get(`q_${q.id}`) ?? "").trim();
  }

  await prisma.lessonResponse.upsert({
    where: {
      enrollmentId_weekId: {
        enrollmentId: enrollment.id,
        weekId: week.id,
      },
    },
    create: {
      enrollmentId: enrollment.id,
      weekId: week.id,
      answers: answers as Prisma.InputJsonValue,
      submittedAt: new Date(),
    },
    update: {
      answers: answers as Prisma.InputJsonValue,
      submittedAt: new Date(),
    },
  });

  redirect(`/me/courses/${slug}?saved=${weekNo}`);
}

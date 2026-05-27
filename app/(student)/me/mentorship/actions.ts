"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { INTAKE_FORM } from "@/lib/forms/intake";
import { HS_PLAN_FORM } from "@/lib/forms/hs-plan";
import type { FormDefinition, FormAnswers } from "@/lib/forms/types";
import type {
  MentorshipFormKind,
  Prisma,
} from "@/prisma/generated/client/client";

function readAnswers(formData: FormData, def: FormDefinition): FormAnswers {
  const answers: FormAnswers = {};
  for (const q of def.questions) {
    answers[q.id] = String(formData.get(q.id) ?? "").trim();
  }
  return answers;
}

// Postgres treats NULL as distinct in unique indexes, so the
// (student_id, kind, session_no) unique constraint can't be hit by an
// upsert when session_no is NULL. Use findFirst → update/create instead.
async function submitOnceOnlyForm(params: {
  studentId: string;
  kind: MentorshipFormKind;
  def: FormDefinition;
  answers: FormAnswers;
}) {
  const existing = await prisma.mentorshipForm.findFirst({
    where: {
      studentId: params.studentId,
      kind: params.kind,
      sessionNo: null,
    },
  });

  const answers = params.answers as Prisma.InputJsonValue;

  if (existing) {
    await prisma.mentorshipForm.update({
      where: { id: existing.id },
      data: {
        answers,
        submittedAt: new Date(),
        formVersion: params.def.version,
      },
    });
  } else {
    await prisma.mentorshipForm.create({
      data: {
        studentId: params.studentId,
        kind: params.kind,
        answers,
        formVersion: params.def.version,
        submittedById: params.studentId,
        submittedAt: new Date(),
      },
    });
  }
}

export async function submitIntakeAction(formData: FormData) {
  const { profile } = await requireRole("student");
  await submitOnceOnlyForm({
    studentId: profile.id,
    kind: "intake",
    def: INTAKE_FORM,
    answers: readAnswers(formData, INTAKE_FORM),
  });
  redirect("/me/mentorship?saved=intake");
}

export async function submitHsPlanAction(formData: FormData) {
  const { profile } = await requireRole("student");
  await submitOnceOnlyForm({
    studentId: profile.id,
    kind: "hs_plan",
    def: HS_PLAN_FORM,
    answers: readAnswers(formData, HS_PLAN_FORM),
  });
  redirect("/me/mentorship?saved=hs_plan");
}

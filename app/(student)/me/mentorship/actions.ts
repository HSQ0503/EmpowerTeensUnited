"use server";

import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/retry";
import { readAnswers, hasMissingRequired } from "@/lib/forms/server";
import { INTAKE_FORM } from "@/lib/forms/intake";
import { HS_PLAN_FORM } from "@/lib/forms/hs-plan";
import type { FormDefinition, FormAnswers } from "@/lib/forms/types";
import { Prisma } from "@/prisma/generated/client/client";
import type { MentorshipFormKind } from "@/prisma/generated/client/client";

// Postgres treats NULL as distinct in unique indexes, so the
// (student_id, kind, session_no) unique constraint can't catch a concurrent
// double-submit of a once-only form (session_no is NULL). A Serializable
// transaction makes the find-then-write atomic; withRetry re-runs the rare
// loser of a write conflict, which then finds the now-committed row and updates.
async function submitOnceOnlyForm(params: {
  studentId: string;
  kind: MentorshipFormKind;
  def: FormDefinition;
  answers: FormAnswers;
}) {
  const answers = params.answers as Prisma.InputJsonValue;

  await withRetry(() =>
    prisma.$transaction(
      async (tx) => {
        const existing = await tx.mentorshipForm.findFirst({
          where: {
            studentId: params.studentId,
            kind: params.kind,
            sessionNo: null,
          },
        });

        if (existing) {
          await tx.mentorshipForm.update({
            where: { id: existing.id },
            data: {
              answers,
              submittedAt: new Date(),
              formVersion: params.def.version,
            },
          });
        } else {
          await tx.mentorshipForm.create({
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
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    ),
  );
}

export async function submitIntakeAction(formData: FormData) {
  const { profile } = await requireRole("student");
  const answers = readAnswers(formData, INTAKE_FORM);
  if (hasMissingRequired(INTAKE_FORM, answers)) {
    redirect("/me/mentorship?error=intake");
  }
  await submitOnceOnlyForm({
    studentId: profile.id,
    kind: "intake",
    def: INTAKE_FORM,
    answers,
  });
  redirect("/me/mentorship?saved=intake");
}

export async function submitHsPlanAction(formData: FormData) {
  const { profile } = await requireRole("student");
  const answers = readAnswers(formData, HS_PLAN_FORM);
  if (hasMissingRequired(HS_PLAN_FORM, answers)) {
    redirect("/me/mentorship?error=hs_plan");
  }
  await submitOnceOnlyForm({
    studentId: profile.id,
    kind: "hs_plan",
    def: HS_PLAN_FORM,
    answers,
  });
  redirect("/me/mentorship?saved=hs_plan");
}

"use server";

import { redirect, notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRetry } from "@/lib/retry";
import { readAnswers, hasMissingRequired } from "@/lib/forms/server";
import { sendSessionLoggedEmail } from "@/lib/email/transactional";
import { SESSION_FORM } from "@/lib/forms/session";
import { Prisma } from "@/prisma/generated/client/client";

async function requireOwnedAssignment(mentorId: string, studentId: string) {
  const assignment = await prisma.mentorAssignment.findFirst({
    where: { mentorId, studentId, endedAt: null },
  });
  if (!assignment) notFound();
  return assignment;
}

export async function submitSessionFormAction(
  studentId: string,
  formData: FormData,
) {
  const { profile } = await requireRole("mentor");
  await requireOwnedAssignment(profile.id, studentId);

  const answers = readAnswers(formData, SESSION_FORM);
  if (hasMissingRequired(SESSION_FORM, answers)) {
    redirect(`/mentor/students/${studentId}?error=session`);
  }

  // Reading the current max and inserting max+1 is a race: two concurrent saves
  // would compute the same number and the (student, kind, session_no) unique
  // index rejects the second (P2002). A Serializable transaction + retry makes
  // the read-then-insert atomic and re-runs the loser with a fresh number.
  const created = await withRetry(() =>
    prisma.$transaction(
      async (tx) => {
        const last = await tx.mentorshipForm.findFirst({
          where: { studentId, kind: "session" },
          orderBy: { sessionNo: "desc" },
          select: { sessionNo: true },
        });
        const nextNo = (last?.sessionNo ?? 0) + 1;
        return tx.mentorshipForm.create({
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
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    ),
  );

  // Best-effort notification — never block the save on email delivery.
  try {
    const student = await prisma.profile.findUnique({
      where: { id: studentId },
      select: { email: true, firstName: true },
    });
    if (student) {
      await sendSessionLoggedEmail({
        toEmail: student.email,
        studentName: student.firstName,
        mentorName: `${profile.firstName} ${profile.lastName}`,
        sessionNo: created.sessionNo ?? 0,
      });
    }
  } catch (error) {
    console.error("Failed to send session-logged email", error);
  }

  redirect(`/mentor/students/${studentId}?saved=session`);
}

export async function updateSessionFormAction(
  sessionId: string,
  studentId: string,
  formData: FormData,
) {
  const { profile } = await requireRole("mentor");
  await requireOwnedAssignment(profile.id, studentId);

  const session = await prisma.mentorshipForm.findFirst({
    where: { id: sessionId, studentId, kind: "session" },
    select: { id: true },
  });
  if (!session) notFound();

  const answers = readAnswers(formData, SESSION_FORM);
  if (hasMissingRequired(SESSION_FORM, answers)) {
    redirect(`/mentor/students/${studentId}?error=session`);
  }

  await prisma.mentorshipForm.update({
    where: { id: session.id },
    data: {
      answers: answers as Prisma.InputJsonValue,
      formVersion: SESSION_FORM.version,
    },
  });

  redirect(`/mentor/students/${studentId}?saved=session_updated`);
}

export async function deleteSessionFormAction(
  sessionId: string,
  studentId: string,
) {
  const { profile } = await requireRole("mentor");
  await requireOwnedAssignment(profile.id, studentId);

  const session = await prisma.mentorshipForm.findFirst({
    where: { id: sessionId, studentId, kind: "session" },
    select: { id: true },
  });
  if (!session) notFound();

  await prisma.mentorshipForm.delete({ where: { id: session.id } });
  redirect(`/mentor/students/${studentId}?saved=session_deleted`);
}

"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ContactStatus } from "@/prisma/generated/client/client";

export async function setContactStatusAction(
  messageId: string,
  status: ContactStatus,
) {
  const { profile } = await requireRole("admin");
  await prisma.contactMessage.update({
    where: { id: messageId },
    data: {
      status,
      repliedAt: status === "replied" ? new Date() : null,
      repliedById: status === "replied" ? profile.id : null,
    },
  });
  revalidatePath("/admin/contact");
  revalidatePath(`/admin/contact/${messageId}`);
  redirect(`/admin/contact/${messageId}?updated=1`);
}

export async function markRepliedAction(messageId: string) {
  return setContactStatusAction(messageId, "replied");
}

export async function markArchivedAction(messageId: string) {
  return setContactStatusAction(messageId, "archived");
}

export async function markNewAction(messageId: string) {
  return setContactStatusAction(messageId, "new");
}

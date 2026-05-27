"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendInviteEmail } from "@/lib/email/transactional";
import type { InviteRole } from "@/prisma/generated/client/client";

export async function createInviteAction(formData: FormData) {
  const { profile } = await requireRole("admin");

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "") as InviteRole;

  if (!email || (role !== "admin" && role !== "mentor")) {
    redirect("/admin/invitations?error=" + encodeURIComponent("Email and role are required."));
  }

  const existing = await prisma.profile.findUnique({ where: { email } });
  if (existing) {
    redirect(
      "/admin/invitations?error=" +
        encodeURIComponent("A user with that email already exists."),
    );
  }

  const expiresAt = new Date(Date.now() + 14 * 86400_000);
  const invite = await prisma.invitation.create({
    data: { email, role, invitedById: profile.id, expiresAt },
  });

  await sendInviteEmail({
    toEmail: email,
    role,
    invitedByName: `${profile.firstName} ${profile.lastName}`.trim(),
    token: invite.token,
  });

  revalidatePath("/admin/invitations");
  redirect("/admin/invitations?sent=1");
}

export async function revokeInviteAction(formData: FormData) {
  await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.invitation.update({
    where: { id },
    data: { revokedAt: new Date() },
  });
  revalidatePath("/admin/invitations");
}

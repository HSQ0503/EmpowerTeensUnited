"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export async function acceptInviteAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const invite = await prisma.invitation.findUnique({ where: { token } });
  if (!invite || invite.acceptedAt || invite.revokedAt || invite.expiresAt < new Date()) {
    redirect(`/invite/${token}?error=` + encodeURIComponent("This invite is invalid or expired."));
  }
  if (!firstName || !lastName) {
    redirect(`/invite/${token}?error=` + encodeURIComponent("First and last name are required."));
  }

  const created = await supabaseAdmin.auth.admin.createUser({
    email: invite.email,
    password,
    email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName },
  });
  if (created.error || !created.data.user) {
    redirect(
      `/invite/${token}?error=` +
        encodeURIComponent(created.error?.message ?? "Could not create your account."),
    );
  }

  await prisma.profile.update({
    where: { id: created.data.user.id },
    data: { role: invite.role, firstName, lastName },
  });
  await prisma.invitation.update({
    where: { id: invite.id },
    data: { acceptedAt: new Date() },
  });

  const supabase = await createClient();
  await supabase.auth.signInWithPassword({ email: invite.email, password });

  redirect(invite.role === "admin" ? "/admin" : "/mentor");
}

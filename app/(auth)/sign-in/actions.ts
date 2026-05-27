"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    redirect(`/sign-in?error=${encodeURIComponent(error?.message ?? "Sign-in failed")}`);
  }

  const profile = await prisma.profile.findUnique({ where: { id: data.user.id } });
  if (profile?.bannedAt) {
    await supabase.auth.signOut();
    redirect("/sign-in?banned=1");
  }

  if (next && next.startsWith("/")) redirect(next);
  switch (profile?.role) {
    case "admin":
      redirect("/admin");
    case "mentor":
      redirect("/mentor");
    default:
      redirect("/me");
  }
}

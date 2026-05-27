"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";

export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const gradeRaw = formData.get("grade");
  const grade = gradeRaw ? Number(gradeRaw) : null;
  const school = String(formData.get("school") ?? "").trim() || null;
  const parentEmail = String(formData.get("parent_email") ?? "").trim() || null;
  const parentPhone = String(formData.get("parent_phone") ?? "").trim() || null;

  if (!firstName || !lastName) {
    redirect("/sign-up?error=" + encodeURIComponent("First and last name are required."));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/sign-up/verify`,
    },
  });

  if (error) redirect(`/sign-up?error=${encodeURIComponent(error.message)}`);
  if (!data.user) redirect("/sign-up?error=" + encodeURIComponent("Sign-up failed. Try again."));

  await prisma.profile.update({
    where: { id: data.user.id },
    data: { grade, school, parentEmail, parentPhone },
  });

  redirect("/sign-up/verify?email=" + encodeURIComponent(email));
}

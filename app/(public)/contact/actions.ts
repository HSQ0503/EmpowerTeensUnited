"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  sendContactAdminNotice,
  sendContactAutoreply,
} from "@/lib/email/transactional";

const MIN_FILL_MS = 3000;

function isLikelyBot(formData: FormData): boolean {
  // Honeypot: hidden field humans never see; bots auto-fill it.
  if (String(formData.get("website") ?? "").trim()) return true;
  // Time trap: humans take longer than 3s to fill four fields.
  const renderedAt = Number(formData.get("_t"));
  if (Number.isFinite(renderedAt) && Date.now() - renderedAt < MIN_FILL_MS) {
    return true;
  }
  return false;
}

export async function submitContactAction(formData: FormData) {
  // Pretend success so bots don't learn they were filtered.
  if (isLikelyBot(formData)) redirect("/contact?sent=1");

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const phone = phoneRaw || null;
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !subject || !message) {
    redirect("/contact?error=Please+fill+in+name%2C+email%2C+subject+and+message.");
  }

  await prisma.contactMessage.create({
    data: { name, email, phone, subject, message },
  });

  await Promise.all([
    sendContactAdminNotice({ name, email, phone, subject, message }),
    sendContactAutoreply({ name, toEmail: email }),
  ]);

  redirect("/contact?sent=1");
}

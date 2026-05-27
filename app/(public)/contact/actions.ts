"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  sendContactAdminNotice,
  sendContactAutoreply,
} from "@/lib/email/transactional";

export async function submitContactAction(formData: FormData) {
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

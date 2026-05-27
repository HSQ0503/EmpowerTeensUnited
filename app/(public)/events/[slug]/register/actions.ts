"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOptionalUser } from "@/lib/auth";
import { sendRegistrationConfirmation } from "@/lib/email/transactional";

export async function registerForEventAction(formData: FormData) {
  const eventId = String(formData.get("event_id") ?? "");
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || !event.publishedAt || event.archivedAt) {
    redirect("/events");
  }

  const auth = await getOptionalUser();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const phone = phoneRaw || null;
  const gradeRaw = formData.get("grade");
  const grade = gradeRaw ? Number(gradeRaw) : null;
  const guestCount = Math.max(0, Number(formData.get("guest_count") ?? 0));
  const guestNamesRaw = String(formData.get("guest_names") ?? "");
  const guestNames = guestNamesRaw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (!name || !email) {
    redirect(`/events/${event.slug}/register?error=Name+and+email+required`);
  }

  if (event.capacity != null) {
    const used = await prisma.eventRegistration.count({
      where: { eventId: event.id, status: "registered" },
    });
    if (used + 1 + guestCount > event.capacity) {
      redirect(`/events/${event.slug}/register?error=Not+enough+spots+for+you+and+your+guests`);
    }
  }

  const registration = await prisma.eventRegistration.create({
    data: {
      eventId: event.id,
      profileId: auth?.profile.id ?? null,
      name,
      email,
      phone,
      grade,
      guestCount,
      guestNames,
    },
  });

  await sendRegistrationConfirmation({
    toEmail: email,
    toName: name,
    event,
    registration,
  });

  redirect(`/events/${event.slug}/register/done`);
}

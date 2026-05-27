"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseForm(formData: FormData) {
  const titleRaw = String(formData.get("title") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const slug = slugify(slugRaw || titleRaw);
  return {
    title: titleRaw,
    slug,
    body: String(formData.get("body") ?? ""),
    location: String(formData.get("location") ?? "").trim(),
    startsAt: new Date(String(formData.get("starts_at"))),
    endsAt: new Date(String(formData.get("ends_at"))),
    capacity: formData.get("capacity")
      ? Number(formData.get("capacity"))
      : null,
    coverImageUrl:
      String(formData.get("cover_image_url") ?? "").trim() || null,
    publish: formData.get("publish") === "on",
  };
}

export async function createEventAction(formData: FormData) {
  const { profile } = await requireRole("admin");
  const data = parseForm(formData);

  const event = await prisma.event.create({
    data: {
      slug: data.slug,
      title: data.title,
      body: data.body,
      location: data.location,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
      capacity: data.capacity,
      coverImageUrl: data.coverImageUrl,
      publishedAt: data.publish ? new Date() : null,
      createdById: profile.id,
    },
  });

  revalidatePath("/admin/events");
  revalidatePath("/events");
  redirect(`/admin/events/${event.id}/edit?saved=1`);
}

export async function updateEventAction(eventId: string, formData: FormData) {
  await requireRole("admin");
  const data = parseForm(formData);

  await prisma.event.update({
    where: { id: eventId },
    data: {
      slug: data.slug,
      title: data.title,
      body: data.body,
      location: data.location,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
      capacity: data.capacity,
      coverImageUrl: data.coverImageUrl,
      publishedAt: data.publish ? new Date() : null,
    },
  });

  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${eventId}/edit`);
  revalidatePath("/events");
  redirect(`/admin/events/${eventId}/edit?saved=1`);
}

export async function archiveEventAction(eventId: string) {
  await requireRole("admin");
  await prisma.event.update({
    where: { id: eventId },
    data: { archivedAt: new Date() },
  });
  revalidatePath("/admin/events");
  revalidatePath("/events");
  redirect("/admin/events");
}

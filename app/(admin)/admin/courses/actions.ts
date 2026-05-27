"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { CourseLanguage, Prisma } from "@/prisma/generated/client/client";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(Math.round(n), min), max);
}

function parseMetadata(formData: FormData) {
  const titleRaw = String(formData.get("title") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const language = String(formData.get("language") ?? "en") as CourseLanguage;
  return {
    title: titleRaw,
    slug: slugify(slugRaw || titleRaw),
    body: String(formData.get("body") ?? ""),
    location: String(formData.get("location") ?? "").trim(),
    startsOn: new Date(String(formData.get("starts_on"))),
    ageMin: clampInt(formData.get("age_min"), 5, 25, 14),
    ageMax: clampInt(formData.get("age_max"), 5, 25, 18),
    cohortCap: formData.get("cohort_cap")
      ? clampInt(formData.get("cohort_cap"), 1, 999, 20)
      : null,
    coverImageUrl:
      String(formData.get("cover_image_url") ?? "").trim() || null,
    language: (["en", "es", "both"] as const).includes(language)
      ? language
      : ("en" as CourseLanguage),
    certificate: formData.get("certificate") === "on",
    publish: formData.get("publish") === "on",
  };
}

export async function createCourseAction(formData: FormData) {
  const { profile } = await requireRole("admin");
  const data = parseMetadata(formData);
  const weeks = clampInt(formData.get("weeks"), 1, 52, 10);

  const course = await prisma.course.create({
    data: {
      slug: data.slug,
      title: data.title,
      body: data.body,
      coverImageUrl: data.coverImageUrl,
      location: data.location,
      startsOn: data.startsOn,
      weeks,
      ageMin: data.ageMin,
      ageMax: data.ageMax,
      language: data.language,
      cohortCap: data.cohortCap,
      certificate: data.certificate,
      publishedAt: data.publish ? new Date() : null,
      createdById: profile.id,
      courseWeeks: {
        create: Array.from({ length: weeks }, (_, i) => ({
          weekNo: i + 1,
          title: `Week ${i + 1}`,
          body: "",
          questions: [] as unknown as Prisma.InputJsonValue,
        })),
      },
    },
  });

  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  redirect(`/admin/courses/${course.id}/edit?saved=1`);
}

export async function updateCourseMetadataAction(
  courseId: string,
  formData: FormData,
) {
  await requireRole("admin");
  const data = parseMetadata(formData);

  await prisma.course.update({
    where: { id: courseId },
    data: {
      slug: data.slug,
      title: data.title,
      body: data.body,
      coverImageUrl: data.coverImageUrl,
      location: data.location,
      startsOn: data.startsOn,
      ageMin: data.ageMin,
      ageMax: data.ageMax,
      language: data.language,
      cohortCap: data.cohortCap,
      certificate: data.certificate,
      publishedAt: data.publish ? new Date() : null,
    },
  });

  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}/edit`);
  revalidatePath("/courses");
  redirect(`/admin/courses/${courseId}/edit?saved=1`);
}

export async function updateWeekAction(weekId: string, formData: FormData) {
  await requireRole("admin");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "");
  const questionsRaw = String(formData.get("questions") ?? "[]");

  let questions: unknown;
  try {
    questions = JSON.parse(questionsRaw);
    if (!Array.isArray(questions)) questions = [];
  } catch {
    questions = [];
  }

  const week = await prisma.courseWeek.update({
    where: { id: weekId },
    data: {
      title: title || `Week`,
      body,
      questions: questions as Prisma.InputJsonValue,
    },
    include: { course: { select: { id: true, slug: true } } },
  });

  revalidatePath(`/admin/courses/${week.course.id}/edit`);
  revalidatePath(`/courses/${week.course.slug}`);
  revalidatePath(`/me/courses/${week.course.slug}`);
  revalidatePath(`/me/courses/${week.course.slug}/week/${week.weekNo}`);
}

export async function archiveCourseAction(courseId: string) {
  await requireRole("admin");
  await prisma.course.update({
    where: { id: courseId },
    data: { archivedAt: new Date() },
  });
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  redirect("/admin/courses");
}

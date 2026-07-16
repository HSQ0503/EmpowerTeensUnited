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
  redirect(
    `/admin/courses/${week.course.id}/edit?saved=w${week.weekNo}#week-${week.weekNo}`,
  );
}

export async function addWeekAction(courseId: string) {
  await requireRole("admin");

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { slug: true },
  });
  if (!course) redirect("/admin/courses");

  const agg = await prisma.courseWeek.aggregate({
    where: { courseId },
    _max: { weekNo: true },
  });
  const nextNo = (agg._max.weekNo ?? 0) + 1;

  await prisma.$transaction([
    prisma.courseWeek.create({
      data: {
        courseId,
        weekNo: nextNo,
        title: `Week ${nextNo}`,
        body: "",
        questions: [] as unknown as Prisma.InputJsonValue,
      },
    }),
    prisma.course.update({
      where: { id: courseId },
      data: { weeks: nextNo },
    }),
  ]);

  revalidatePath(`/admin/courses/${courseId}/edit`);
  revalidatePath(`/courses/${course.slug}`);
  revalidatePath(`/me/courses/${course.slug}`);
  redirect(`/admin/courses/${courseId}/edit?saved=w${nextNo}#week-${nextNo}`);
}

export async function deleteWeekAction(weekId: string) {
  await requireRole("admin");

  const week = await prisma.courseWeek.findUnique({
    where: { id: weekId },
    include: {
      course: { select: { id: true, slug: true, weeks: true } },
      _count: { select: { responses: true } },
    },
  });
  if (!week) redirect("/admin/courses");

  const agg = await prisma.courseWeek.aggregate({
    where: { courseId: week.course.id },
    _max: { weekNo: true },
  });

  // Only the last week can go, and never one students have answered —
  // deleting mid-sequence would break weekNo ordering and student progress.
  if (week.weekNo !== agg._max.weekNo || week._count.responses > 0) {
    redirect(`/admin/courses/${week.course.id}/edit?error=week-locked`);
  }

  await prisma.$transaction([
    prisma.courseWeek.delete({ where: { id: weekId } }),
    prisma.course.update({
      where: { id: week.course.id },
      data: { weeks: week.weekNo - 1 },
    }),
  ]);

  revalidatePath(`/admin/courses/${week.course.id}/edit`);
  revalidatePath(`/courses/${week.course.slug}`);
  revalidatePath(`/me/courses/${week.course.slug}`);
  redirect(`/admin/courses/${week.course.id}/edit?saved=1`);
}

export async function duplicateCourseAction(courseId: string) {
  const { profile } = await requireRole("admin");

  const source = await prisma.course.findUnique({
    where: { id: courseId },
    include: { courseWeeks: { orderBy: { weekNo: "asc" } } },
  });
  if (!source) redirect("/admin/courses");

  let slug = `${source.slug}-copy`;
  for (let i = 2; await prisma.course.findUnique({ where: { slug } }); i++) {
    slug = `${source.slug}-copy-${i}`;
  }

  const copy = await prisma.course.create({
    data: {
      slug,
      title: `${source.title} (copy)`,
      body: source.body,
      coverImageUrl: source.coverImageUrl,
      location: source.location,
      startsOn: source.startsOn,
      weeks: source.weeks,
      ageMin: source.ageMin,
      ageMax: source.ageMax,
      language: source.language,
      cohortCap: source.cohortCap,
      certificate: source.certificate,
      publishedAt: null,
      createdById: profile.id,
      courseWeeks: {
        create: source.courseWeeks.map((w) => ({
          weekNo: w.weekNo,
          title: w.title,
          body: w.body,
          questions: w.questions as Prisma.InputJsonValue,
        })),
      },
    },
  });

  revalidatePath("/admin/courses");
  redirect(`/admin/courses/${copy.id}/edit?saved=1`);
}

export async function restoreCourseAction(courseId: string) {
  await requireRole("admin");
  await prisma.course.update({
    where: { id: courseId },
    data: { archivedAt: null },
  });
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  redirect("/admin/courses");
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

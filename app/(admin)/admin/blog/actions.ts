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
  return {
    title: titleRaw,
    slug: slugify(slugRaw || titleRaw),
    excerpt: String(formData.get("excerpt") ?? "").trim() || null,
    body: String(formData.get("body") ?? ""),
    coverImageUrl: String(formData.get("cover_image_url") ?? "").trim() || null,
    publish: formData.get("publish") === "on",
  };
}

export async function createPostAction(formData: FormData) {
  const { profile } = await requireRole("admin");
  const data = parseForm(formData);

  const post = await prisma.blogPost.create({
    data: {
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      body: data.body,
      coverImageUrl: data.coverImageUrl,
      authorId: profile.id,
      publishedAt: data.publish ? new Date() : null,
    },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect(`/admin/blog/${post.id}/edit?saved=1`);
}

export async function updatePostAction(postId: string, formData: FormData) {
  await requireRole("admin");
  const data = parseForm(formData);

  await prisma.blogPost.update({
    where: { id: postId },
    data: {
      slug: data.slug,
      title: data.title,
      excerpt: data.excerpt,
      body: data.body,
      coverImageUrl: data.coverImageUrl,
      publishedAt: data.publish ? new Date() : null,
    },
  });

  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${postId}/edit`);
  revalidatePath("/blog");
  revalidatePath(`/blog/${data.slug}`);
  redirect(`/admin/blog/${postId}/edit?saved=1`);
}

export async function archivePostAction(postId: string) {
  await requireRole("admin");
  await prisma.blogPost.update({
    where: { id: postId },
    data: { archivedAt: new Date() },
  });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog");
}

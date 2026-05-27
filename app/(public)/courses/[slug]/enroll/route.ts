import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOptionalUser } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const auth = await getOptionalUser();
  if (!auth) {
    return NextResponse.redirect(
      new URL(
        `/sign-in?next=${encodeURIComponent(`/courses/${slug}`)}`,
        req.url,
      ),
      { status: 303 },
    );
  }

  if (auth.profile.role !== "student") {
    return NextResponse.redirect(
      new URL(
        `/courses/${slug}?error=${encodeURIComponent("Only students can enroll")}`,
        req.url,
      ),
      { status: 303 },
    );
  }

  const course = await prisma.course.findUnique({ where: { slug } });
  if (!course || !course.publishedAt || course.archivedAt) {
    return NextResponse.redirect(new URL("/courses", req.url), { status: 303 });
  }

  await prisma.enrollment.upsert({
    where: {
      courseId_profileId: {
        courseId: course.id,
        profileId: auth.profile.id,
      },
    },
    create: {
      courseId: course.id,
      profileId: auth.profile.id,
    },
    update: { status: "active" },
  });

  return NextResponse.redirect(new URL(`/me/courses/${slug}`, req.url), {
    status: 303,
  });
}

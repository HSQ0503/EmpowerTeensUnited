"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/client/client";
import { resolveSegment } from "@/lib/broadcasts/resolve-segment";
import { processCampaignBatch } from "@/lib/broadcasts/send-batch";
import type { SegmentFilter } from "@/lib/broadcasts/types";

function parseFilter(formData: FormData): SegmentFilter {
  const kind = String(formData.get("segment_kind"));
  switch (kind) {
    case "all_students":
    case "all_mentors":
    case "all_parents":
      return { kind } as SegmentFilter;
    case "course_enrollees": {
      const courseId = String(formData.get("course_id") ?? "").trim();
      if (!courseId) throw new Error("Course is required for this audience.");
      return { kind, courseId };
    }
    case "event_registrants":
    case "event_attendees":
    case "event_no_shows": {
      const eventId = String(formData.get("event_id") ?? "").trim();
      if (!eventId) throw new Error("Event is required for this audience.");
      return { kind, eventId } as SegmentFilter;
    }
    default:
      throw new Error("Unknown segment kind");
  }
}

function htmlToText(html: string): string {
  return html
    .replace(/<\/(p|div|h[1-6]|li|br)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n\s+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function createAndSendCampaignAction(formData: FormData) {
  const { profile } = await requireRole("admin");
  const subject = String(formData.get("subject") ?? "").trim();
  const bodyHtml = String(formData.get("body") ?? "");
  if (!subject || !bodyHtml) {
    throw new Error("Subject and body are required.");
  }
  const bodyText = htmlToText(bodyHtml);
  const filter = parseFilter(formData);
  const sendNow = formData.get("action") === "send";

  const recipients = await resolveSegment(filter);

  const campaign = await prisma.emailCampaign.create({
    data: {
      subject,
      bodyHtml,
      bodyText,
      sender: "",
      segmentFilter: filter as unknown as Prisma.InputJsonValue,
      status: sendNow ? "sending" : "draft",
      recipientCount: recipients.length,
      createdById: profile.id,
      recipients: {
        create: recipients.map((r) => ({
          email: r.email,
          name: r.name,
          profileId: r.profileId,
        })),
      },
    },
  });

  if (sendNow) {
    // First batch synchronously so the admin sees immediate progress; the
    // /api/cron/send-campaign cron drains the rest.
    await processCampaignBatch(campaign.id);
  }

  revalidatePath("/admin/broadcasts");
  redirect(`/admin/broadcasts/${campaign.id}`);
}

export async function processCampaignAction(campaignId: string) {
  await requireRole("admin");
  await processCampaignBatch(campaignId);
  revalidatePath(`/admin/broadcasts/${campaignId}`);
  redirect(`/admin/broadcasts/${campaignId}`);
}

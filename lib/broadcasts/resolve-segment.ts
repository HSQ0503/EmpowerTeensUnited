import { prisma } from "@/lib/prisma";
import type { SegmentFilter, ResolvedRecipient } from "./types";

function dedupe(rs: ResolvedRecipient[]): ResolvedRecipient[] {
  const seen = new Set<string>();
  const out: ResolvedRecipient[] = [];
  for (const r of rs) {
    if (!r.email) continue;
    const key = r.email.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

export async function resolveSegment(
  filter: SegmentFilter,
): Promise<ResolvedRecipient[]> {
  switch (filter.kind) {
    case "all_students":
    case "all_mentors": {
      const role = filter.kind === "all_students" ? "student" : "mentor";
      const profiles = await prisma.profile.findMany({
        where: { role, bannedAt: null, emailUnsubscribed: false },
      });
      return dedupe(
        profiles.map((p) => ({
          email: p.email,
          name: `${p.firstName} ${p.lastName}`.trim() || null,
          profileId: p.id,
        })),
      );
    }
    case "all_parents": {
      const students = await prisma.profile.findMany({
        where: {
          role: "student",
          bannedAt: null,
          parentEmail: { not: null },
        },
      });
      return dedupe(
        students.map((s) => ({
          email: s.parentEmail ?? "",
          name: null,
          profileId: s.id,
        })),
      );
    }
    case "course_enrollees": {
      const enrollments = await prisma.enrollment.findMany({
        where: {
          courseId: filter.courseId,
          status: "active",
          profile: { emailUnsubscribed: false },
        },
        include: { profile: true },
      });
      return dedupe(
        enrollments.map((e) => ({
          email: e.profile.email,
          name: `${e.profile.firstName} ${e.profile.lastName}`.trim() || null,
          profileId: e.profile.id,
        })),
      );
    }
    case "event_registrants":
    case "event_attendees":
    case "event_no_shows": {
      const regs = await prisma.eventRegistration.findMany({
        where: { eventId: filter.eventId, status: "registered" },
        include: { checkin: true },
      });
      const filtered = regs.filter((r) => {
        if (filter.kind === "event_attendees") return !!r.checkin;
        if (filter.kind === "event_no_shows") return !r.checkin;
        return true;
      });
      return dedupe(
        filtered.map((r) => ({
          email: r.email,
          name: r.name,
          profileId: r.profileId,
        })),
      );
    }
    case "explicit": {
      const out: ResolvedRecipient[] = [];
      if (filter.registrationIds?.length) {
        const regs = await prisma.eventRegistration.findMany({
          where: { id: { in: filter.registrationIds } },
        });
        out.push(
          ...regs.map((r) => ({
            email: r.email,
            name: r.name,
            profileId: r.profileId,
          })),
        );
      }
      if (filter.profileIds?.length) {
        const profiles = await prisma.profile.findMany({
          where: {
            id: { in: filter.profileIds },
            emailUnsubscribed: false,
          },
        });
        out.push(
          ...profiles.map((p) => ({
            email: p.email,
            name: `${p.firstName} ${p.lastName}`.trim() || null,
            profileId: p.id,
          })),
        );
      }
      return dedupe(out);
    }
  }
}

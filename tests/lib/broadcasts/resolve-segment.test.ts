import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    profile: { findMany: vi.fn() },
    eventRegistration: { findMany: vi.fn() },
    enrollment: { findMany: vi.fn() },
  },
}));

import { prisma } from "@/lib/prisma";
import { resolveSegment } from "@/lib/broadcasts/resolve-segment";

describe("resolveSegment", () => {
  beforeEach(() => vi.clearAllMocks());

  it("all_students returns student profiles, filters out unsubscribed", async () => {
    (prisma.profile.findMany as any).mockResolvedValue([
      {
        id: "s1",
        email: "a@b.com",
        firstName: "A",
        lastName: "B",
        emailUnsubscribed: false,
      },
    ]);
    const r = await resolveSegment({ kind: "all_students" });
    expect(r).toEqual([{ email: "a@b.com", name: "A B", profileId: "s1" }]);
    expect(prisma.profile.findMany).toHaveBeenCalledWith({
      where: { role: "student", bannedAt: null, emailUnsubscribed: false },
    });
  });

  it("all_mentors queries the mentor role", async () => {
    (prisma.profile.findMany as any).mockResolvedValue([]);
    await resolveSegment({ kind: "all_mentors" });
    expect(prisma.profile.findMany).toHaveBeenCalledWith({
      where: { role: "mentor", bannedAt: null, emailUnsubscribed: false },
    });
  });

  it("all_parents pulls parentEmail from students", async () => {
    (prisma.profile.findMany as any).mockResolvedValue([
      {
        id: "s1",
        firstName: "A",
        lastName: "B",
        parentEmail: "parent@example.com",
      },
    ]);
    const r = await resolveSegment({ kind: "all_parents" });
    expect(r).toEqual([
      { email: "parent@example.com", name: null, profileId: "s1" },
    ]);
  });

  it("event_no_shows excludes checked-in registrants", async () => {
    (prisma.eventRegistration.findMany as any).mockResolvedValue([
      {
        id: "r1",
        name: "X",
        email: "x@y.com",
        profileId: null,
        checkin: null,
      },
      {
        id: "r2",
        name: "Y",
        email: "y@y.com",
        profileId: null,
        checkin: { id: "c1" },
      },
    ]);
    const r = await resolveSegment({ kind: "event_no_shows", eventId: "e1" });
    expect(r).toEqual([{ email: "x@y.com", name: "X", profileId: null }]);
  });

  it("event_attendees keeps only checked-in registrants", async () => {
    (prisma.eventRegistration.findMany as any).mockResolvedValue([
      {
        id: "r1",
        name: "X",
        email: "x@y.com",
        profileId: null,
        checkin: null,
      },
      {
        id: "r2",
        name: "Y",
        email: "y@y.com",
        profileId: "p2",
        checkin: { id: "c1" },
      },
    ]);
    const r = await resolveSegment({ kind: "event_attendees", eventId: "e1" });
    expect(r).toEqual([{ email: "y@y.com", name: "Y", profileId: "p2" }]);
  });

  it("event_registrants keeps everyone with status registered", async () => {
    (prisma.eventRegistration.findMany as any).mockResolvedValue([
      {
        id: "r1",
        name: "X",
        email: "x@y.com",
        profileId: null,
        checkin: null,
      },
      {
        id: "r2",
        name: "Y",
        email: "y@y.com",
        profileId: null,
        checkin: { id: "c1" },
      },
    ]);
    const r = await resolveSegment({ kind: "event_registrants", eventId: "e1" });
    expect(r.map((x) => x.email).sort()).toEqual(["x@y.com", "y@y.com"]);
    expect(prisma.eventRegistration.findMany).toHaveBeenCalledWith({
      where: { eventId: "e1", status: "registered" },
      include: { checkin: true },
    });
  });

  it("course_enrollees pulls active enrollments and skips unsubscribed", async () => {
    (prisma.enrollment.findMany as any).mockResolvedValue([
      {
        profile: {
          id: "p1",
          email: "p1@x.com",
          firstName: "P",
          lastName: "One",
        },
      },
    ]);
    const r = await resolveSegment({
      kind: "course_enrollees",
      courseId: "c1",
    });
    expect(r).toEqual([{ email: "p1@x.com", name: "P One", profileId: "p1" }]);
    expect(prisma.enrollment.findMany).toHaveBeenCalledWith({
      where: {
        courseId: "c1",
        status: "active",
        profile: { emailUnsubscribed: false },
      },
      include: { profile: true },
    });
  });

  it("dedupes by case-insensitive email", async () => {
    (prisma.profile.findMany as any).mockResolvedValue([
      {
        id: "s1",
        email: "a@b.com",
        firstName: "A",
        lastName: "B",
        emailUnsubscribed: false,
      },
      {
        id: "s2",
        email: "A@B.com",
        firstName: "A2",
        lastName: "B2",
        emailUnsubscribed: false,
      },
    ]);
    const r = await resolveSegment({ kind: "all_students" });
    expect(r).toHaveLength(1);
    expect(r[0].profileId).toBe("s1");
  });

  it("skips rows with no email", async () => {
    (prisma.profile.findMany as any).mockResolvedValue([
      {
        id: "s1",
        firstName: "A",
        lastName: "B",
        parentEmail: null,
      },
    ]);
    const r = await resolveSegment({ kind: "all_parents" });
    expect(r).toEqual([]);
  });

  it("explicit segment merges registrationIds + profileIds and dedupes", async () => {
    (prisma.eventRegistration.findMany as any).mockResolvedValue([
      { id: "r1", email: "shared@x.com", name: "R Person", profileId: null },
    ]);
    (prisma.profile.findMany as any).mockResolvedValue([
      {
        id: "p1",
        email: "shared@x.com",
        firstName: "P",
        lastName: "Person",
      },
    ]);
    const r = await resolveSegment({
      kind: "explicit",
      registrationIds: ["r1"],
      profileIds: ["p1"],
    });
    expect(r).toHaveLength(1);
  });
});

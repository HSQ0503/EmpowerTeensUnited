import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    profile: {
      findUnique: vi.fn(),
    },
  },
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
  notFound: vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
}));

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import {
  getOptionalUser,
  requireUser,
  requireRole,
  requireRoleOrRedirect,
} from "@/lib/auth";

const mockSupabase = (user: any) => ({
  auth: { getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }) },
});

describe("getOptionalUser", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns null when no user", async () => {
    (createClient as any).mockResolvedValue(mockSupabase(null));
    const result = await getOptionalUser();
    expect(result).toBeNull();
  });

  it("returns user + profile when authenticated", async () => {
    (createClient as any).mockResolvedValue(mockSupabase({ id: "u1", email: "a@b.com" }));
    (prisma.profile.findUnique as any).mockResolvedValue({
      id: "u1",
      role: "student",
      bannedAt: null,
    });
    const result = await getOptionalUser();
    expect(result?.profile.role).toBe("student");
  });
});

describe("requireUser", () => {
  beforeEach(() => vi.clearAllMocks());

  it("redirects to /sign-in when anonymous", async () => {
    (createClient as any).mockResolvedValue(mockSupabase(null));
    await expect(requireUser()).rejects.toThrow("REDIRECT:/sign-in");
  });

  it("returns user + profile when authenticated", async () => {
    (createClient as any).mockResolvedValue(mockSupabase({ id: "u1" }));
    (prisma.profile.findUnique as any).mockResolvedValue({
      id: "u1",
      role: "admin",
      bannedAt: null,
    });
    const result = await requireUser();
    expect(result.profile.role).toBe("admin");
  });
});

describe("requireRole", () => {
  beforeEach(() => vi.clearAllMocks());

  it("404s when role does not match", async () => {
    (createClient as any).mockResolvedValue(mockSupabase({ id: "u1" }));
    (prisma.profile.findUnique as any).mockResolvedValue({
      id: "u1",
      role: "student",
      bannedAt: null,
    });
    await expect(requireRole("admin")).rejects.toThrow("NOT_FOUND");
  });

  it("returns when role matches", async () => {
    (createClient as any).mockResolvedValue(mockSupabase({ id: "u1" }));
    (prisma.profile.findUnique as any).mockResolvedValue({
      id: "u1",
      role: "mentor",
      bannedAt: null,
    });
    const r = await requireRole("mentor");
    expect(r.profile.role).toBe("mentor");
  });

  it("redirects to /sign-in when banned", async () => {
    (createClient as any).mockResolvedValue(mockSupabase({ id: "u1" }));
    (prisma.profile.findUnique as any).mockResolvedValue({
      id: "u1",
      role: "admin",
      bannedAt: new Date(),
    });
    await expect(requireRole("admin")).rejects.toThrow("REDIRECT:/sign-in?banned=1");
  });
});

describe("requireRoleOrRedirect", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns when role matches", async () => {
    (createClient as any).mockResolvedValue(mockSupabase({ id: "u1" }));
    (prisma.profile.findUnique as any).mockResolvedValue({
      id: "u1",
      role: "admin",
      bannedAt: null,
    });
    const r = await requireRoleOrRedirect("admin");
    expect(r.profile.role).toBe("admin");
  });

  it("redirects an admin away from /me to /admin", async () => {
    (createClient as any).mockResolvedValue(mockSupabase({ id: "u1" }));
    (prisma.profile.findUnique as any).mockResolvedValue({
      id: "u1",
      role: "admin",
      bannedAt: null,
    });
    await expect(requireRoleOrRedirect("student")).rejects.toThrow(
      "REDIRECT:/admin",
    );
  });

  it("redirects a student away from /admin to /me", async () => {
    (createClient as any).mockResolvedValue(mockSupabase({ id: "u1" }));
    (prisma.profile.findUnique as any).mockResolvedValue({
      id: "u1",
      role: "student",
      bannedAt: null,
    });
    await expect(requireRoleOrRedirect("admin")).rejects.toThrow("REDIRECT:/me");
  });

  it("redirects a mentor away from /admin to /mentor", async () => {
    (createClient as any).mockResolvedValue(mockSupabase({ id: "u1" }));
    (prisma.profile.findUnique as any).mockResolvedValue({
      id: "u1",
      role: "mentor",
      bannedAt: null,
    });
    await expect(requireRoleOrRedirect("admin")).rejects.toThrow(
      "REDIRECT:/mentor",
    );
  });

  it("falls through to sign-in redirect when anonymous", async () => {
    (createClient as any).mockResolvedValue(mockSupabase(null));
    await expect(requireRoleOrRedirect("admin")).rejects.toThrow(
      "REDIRECT:/sign-in",
    );
  });
});

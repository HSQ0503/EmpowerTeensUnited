import type { ReactNode } from "react";
import { requireRoleOrRedirect } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "./_AdminShell";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireRoleOrRedirect("admin");
  const newContactCount = await prisma.contactMessage.count({
    where: { status: "new" },
  });

  return (
    <AdminShell
      firstName={profile.firstName ?? ""}
      lastName={profile.lastName ?? ""}
      newContactCount={newContactCount}
    >
      {children}
    </AdminShell>
  );
}

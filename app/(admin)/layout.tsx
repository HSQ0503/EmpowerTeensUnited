import type { ReactNode } from "react";
import { requireRoleOrRedirect } from "@/lib/auth";
import { AdminShell } from "./_AdminShell";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireRoleOrRedirect("admin");

  return (
    <AdminShell firstName={profile.firstName ?? ""} lastName={profile.lastName ?? ""}>
      {children}
    </AdminShell>
  );
}

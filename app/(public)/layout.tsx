import type { ReactNode } from "react";
import { Nav } from "@/app/components/Nav";
import { Footer } from "@/app/components/Footer";
import { aBase } from "@/app/components/tokens";
import { getOptionalUser, homeForRole } from "@/lib/auth";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const auth = await getOptionalUser();
  const dashboardHref = auth ? homeForRole(auth.profile.role) : null;
  return (
    <div style={aBase}>
      <Nav dashboardHref={dashboardHref} />
      {children}
      <Footer />
    </div>
  );
}

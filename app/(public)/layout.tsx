import type { ReactNode } from "react";
import { Nav } from "@/app/components/Nav";
import { Footer } from "@/app/components/Footer";
import { aBase } from "@/app/components/tokens";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div style={aBase}>
      <Nav />
      {children}
      <Footer />
    </div>
  );
}

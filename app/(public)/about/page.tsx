import { prisma } from "@/lib/prisma";
import AboutClient from "./_AboutClient";

export const metadata = { title: "About · Empower Teens United" };

export default async function AboutPage() {
  const team = await prisma.teamMember.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      fullName: true,
      roleTitle: true,
      bio: true,
      photoUrl: true,
    },
  });

  return <AboutClient team={team} />;
}

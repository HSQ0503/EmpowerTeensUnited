import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toCsv } from "@/lib/csv";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await requireRole("admin");
  const { id } = await params;

  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) {
    return new NextResponse("Event not found", { status: 404 });
  }

  const regs = await prisma.eventRegistration.findMany({
    where: { eventId: id, status: "registered" },
    include: { checkin: true },
    orderBy: { registeredAt: "asc" },
  });

  const rows = regs.map((r) => ({
    name: r.name,
    grade: r.grade ?? "",
    guests: r.guestCount,
    guest_names: r.guestNames.join("; "),
    email: r.email,
    phone: r.phone ?? "",
    registered_at: r.registeredAt.toISOString(),
    checked_in_at: r.checkin?.checkedInAt.toISOString() ?? "",
  }));

  const csv = toCsv(rows, [
    "name",
    "grade",
    "guests",
    "guest_names",
    "email",
    "phone",
    "registered_at",
    "checked_in_at",
  ]);

  const safeSlug = event.slug.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeSlug}-registrations.csv"`,
    },
  });
}

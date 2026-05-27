import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processCampaignBatch } from "@/lib/broadcasts/send-batch";

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization");
  if (header === `Bearer ${secret}`) return true;
  // Vercel Cron passes the secret as a query param when bound via vercel.json.
  const url = new URL(req.url);
  if (url.searchParams.get("secret") === secret) return true;
  return false;
}

async function drain() {
  const sending = await prisma.emailCampaign.findMany({
    where: { status: { in: ["sending", "scheduled"] } },
    select: { id: true },
  });
  let totalProcessed = 0;
  for (const c of sending) {
    const result = await processCampaignBatch(c.id);
    totalProcessed += result.processed;
  }
  return { campaigns: sending.length, processed: totalProcessed };
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return new NextResponse("forbidden", { status: 403 });
  }
  return NextResponse.json(await drain());
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return new NextResponse("forbidden", { status: 403 });
  }
  return NextResponse.json(await drain());
}

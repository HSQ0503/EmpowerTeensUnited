import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOptionalUser } from "@/lib/auth";
import { A } from "@/app/components/tokens";

const PAGE_BASE = `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Check-in · ETU</title>
    <style>
      :root { color-scheme: light; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif;
        background: ${A.paper};
        color: ${A.ink};
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }
      .card {
        background: #fff;
        border: 1px solid ${A.rule};
        border-radius: 8px;
        padding: 36px 28px;
        max-width: 440px;
        width: 100%;
        text-align: center;
        box-shadow: 0 18px 40px -28px rgba(15,69,102,0.25);
      }
      .badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 56px;
        height: 56px;
        border-radius: 99px;
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 18px;
      }
      .ok { background: ${A.gold}; color: ${A.navy}; }
      .repeat { background: rgba(15,69,102,0.08); color: ${A.navy}; }
      .err { background: rgba(178,34,52,0.12); color: #b22234; }
      h1 { color: ${A.navy}; font-size: 22px; margin: 0 0 6px; letter-spacing: -0.01em; }
      .name { font-size: 20px; font-weight: 700; color: ${A.ink}; margin: 14px 0 4px; }
      .meta { color: ${A.muted}; font-size: 14px; margin: 0; line-height: 1.5; }
      .event { color: ${A.body}; font-size: 13px; margin-top: 18px; }
      a {
        display: inline-block;
        margin-top: 24px;
        background: ${A.navy};
        color: #fff;
        text-decoration: none;
        padding: 12px 18px;
        border-radius: 4px;
        font-weight: 700;
        font-size: 13px;
        letter-spacing: 0.6px;
        text-transform: uppercase;
      }
    </style>
  </head>
  <body>
    __BODY__
  </body>
</html>`;

function htmlResponse(body: string, status = 200) {
  return new NextResponse(PAGE_BASE.replace("__BODY__", body), {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("t");
  if (!token) {
    return htmlResponse(
      `<div class="card"><div class="badge err">!</div><h1>Missing QR token</h1><p class="meta">Scan a registration QR to check someone in.</p></div>`,
      400,
    );
  }

  const auth = await getOptionalUser();
  if (!auth) {
    return NextResponse.redirect(
      new URL(`/sign-in?next=${encodeURIComponent(`/api/scan?t=${token}`)}`, req.url),
    );
  }
  if (auth.profile.role !== "admin" && auth.profile.role !== "mentor") {
    return htmlResponse(
      `<div class="card"><div class="badge err">!</div><h1>Not authorized</h1><p class="meta">Only admins and mentors can check attendees in.</p></div>`,
      403,
    );
  }

  const reg = await prisma.eventRegistration.findUnique({
    where: { qrToken: token },
    include: { event: true, checkin: true },
  });

  if (!reg) {
    return htmlResponse(
      `<div class="card"><div class="badge err">?</div><h1>Unknown QR</h1><p class="meta">This code doesn't match any registration.</p></div>`,
      404,
    );
  }

  const alreadyCheckedIn = !!reg.checkin;
  if (!alreadyCheckedIn) {
    await prisma.eventCheckin.create({
      data: {
        registrationId: reg.id,
        checkedInById: auth.profile.id,
      },
    });
  }

  const guestLine = reg.guestCount
    ? `<p class="meta">+ ${reg.guestCount} guest${reg.guestCount === 1 ? "" : "s"}</p>`
    : "";

  const safeName = escapeHtml(reg.name);
  const safeEvent = escapeHtml(reg.event.title);
  const gradeLine = reg.grade ? ` · Grade ${reg.grade}` : "";

  const body = alreadyCheckedIn
    ? `<div class="card">
         <div class="badge repeat">↻</div>
         <h1>Already checked in</h1>
         <p class="name">${safeName}${gradeLine}</p>
         ${guestLine}
         <p class="event">${safeEvent}</p>
         <a href="/admin/scan">Scan another</a>
       </div>`
    : `<div class="card">
         <div class="badge ok">✓</div>
         <h1>Checked in</h1>
         <p class="name">${safeName}${gradeLine}</p>
         ${guestLine}
         <p class="event">${safeEvent}</p>
         <a href="/admin/scan">Scan another</a>
       </div>`;

  return htmlResponse(body);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

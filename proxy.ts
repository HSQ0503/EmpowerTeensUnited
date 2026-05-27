import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/proxy";

const ROLE_GATES: Array<{ prefix: string; role: "admin" | "mentor" | "student" }> = [
  { prefix: "/admin", role: "admin" },
  { prefix: "/mentor", role: "mentor" },
  { prefix: "/me", role: "student" },
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { response, user } = await updateSession(request);

  const gate = ROLE_GATES.find((g) => pathname.startsWith(g.prefix));
  if (!gate) return response;

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Role check happens in each route via requireRole() — proxy enforces signed-in
  // here and lets the page do the role assertion (which 404s, not 403s).
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks|api/cron|.*\\..*).*)",
  ],
};

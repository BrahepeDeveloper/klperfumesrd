import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/session";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always forward the pathname to server components via a custom header
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const token = req.cookies.get("klp-admin-session")?.value;
  const userId = token ? await verifySessionToken(token) : null;

  // Login page: pass through (redirect already-authenticated users to dashboard)
  if (pathname.startsWith("/admin/login")) {
    if (userId) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // All other /admin/* routes require authentication
  if (!userId) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Run on all routes except Next.js internals and static files
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

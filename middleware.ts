import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, AUTH_COOKIE_NAME } from "./lib/session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Immediately pass landing page, login page, and static assets with 0ms edge delay
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/phoenix-logo.png" ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|json)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. Handle API routes
  if (pathname.startsWith("/api")) {
    // Ensure /api/admin is protected with JSON 403
    if (pathname.startsWith("/api/admin")) {
      const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
      const session = token ? await verifySessionToken(token) : null;
      if (!session || session.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
      }
    }
    return NextResponse.next();
  }

  // 3. Read session token from cookie for protected internal pages
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  // 4. Handle unauthenticated visitors attempting to access any protected route directly
  if (!session) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 6. Restrict /admin to ADMIN role only
  if (pathname.startsWith("/admin")) {
    if (session.role !== "ADMIN") {
      const deniedUrl = req.nextUrl.clone();
      deniedUrl.pathname = "/feed";
      deniedUrl.searchParams.set("error", "access_denied_admin_only");
      return NextResponse.redirect(deniedUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths including root '/' except for static assets
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

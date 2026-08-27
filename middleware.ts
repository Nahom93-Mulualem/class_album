import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, AUTH_COOKIE_NAME } from "./lib/session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Allow public static assets
  if (
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

  // 2. Read session token from cookie
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  const isLoginPage = pathname === "/login";

  // 3. Handle unauthenticated visitors
  if (!session) {
    // If not logged in and trying to access protected route -> redirect to login
    if (!isLoginPage) {
      const loginUrl = new URL("/login", req.url);
      if (pathname !== "/") {
        loginUrl.searchParams.set("redirect", pathname);
      }
      return NextResponse.redirect(loginUrl);
    }
    // If already on login page -> allow access
    return NextResponse.next();
  }

  // 4. Handle authenticated users visiting /login
  if (isLoginPage) {
    // If already logged in, redirect to appropriate dashboard
    const destination = session.role === "ADMIN" ? "/admin" : "/";
    return NextResponse.redirect(new URL(destination, req.url));
  }

  // 5. Restrict /admin to ADMIN role only
  if (pathname.startsWith("/admin")) {
    if (session.role !== "ADMIN") {
      const deniedUrl = new URL("/", req.url);
      deniedUrl.searchParams.set("error", "access_denied_admin_only");
      return NextResponse.redirect(deniedUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

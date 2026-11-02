import { NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/jwt";

/**
 * Route-protection middleware.
 *
 * Rules:
 *  - /dashboard/* requires a valid session cookie → redirect to /login on failure.
 *  - /api/v1/* (except /api/v1/auth/login and /api/v1/auth/logout) requires
 *    a valid session cookie → 401 on failure.
 *  - /login redirects to /dashboard if already authenticated.
 */
export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // ── Verify session ──────────────────────────────────────────
  let session = null;
  if (token) {
    try {
      session = await verifyToken(token);
    } catch {
      // Expired or tampered — clear the cookie below.
    }
  }

  // ── Public API routes (no auth required) ───────────────────
  const isPublicApi =
    pathname === "/api/v1/auth/login" ||
    pathname === "/api/v1/auth/logout";

  // ── Protected API routes ────────────────────────────────────
  if (pathname.startsWith("/api/v1/") && !isPublicApi) {
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }
    // Attach decoded session to headers so route handlers can read it.
    const res = NextResponse.next();
    res.headers.set("x-session-user", JSON.stringify(session));
    return res;
  }

  // ── Protected dashboard routes ──────────────────────────────
  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      const res = NextResponse.redirect(loginUrl);
      // Clear stale / invalid cookie.
      if (token) {
        res.cookies.delete(COOKIE_NAME);
      }
      return res;
    }
    return NextResponse.next();
  }

  // ── Login page: redirect if already authenticated ───────────
  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/v1/:path*",
    "/login",
  ],
};

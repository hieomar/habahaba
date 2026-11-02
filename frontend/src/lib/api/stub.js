import { NextResponse, NextRequest } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/jwt";

/**
 * Shared helper for stub API route handlers.
 *
 * When BACKEND_API_URL is set every route proxies the request there,
 * forwarding the backend access token stored in the session cookie.
 * When not set (or backend returns 404/501), routes return structured
 * empty stub responses so the UI renders cleanly.
 */

/** Extract the backend JWT from the session cookie */
async function getBackendToken(request) {
  try {
    const sessionCookie = request.cookies.get(COOKIE_NAME)?.value;
    if (!sessionCookie) return null;
    const payload = await verifyToken(sessionCookie);
    return payload?.backendToken ?? null;
  } catch {
    return null;
  }
}

export async function proxyOrStub(request, backendPath, { stubData = [], stubMeta = {}, method } = {}) {
  const backendUrl = process.env.BACKEND_API_URL;

  if (backendUrl) {
    try {
      const backendToken = await getBackendToken(request);

      const url = new URL(backendPath, backendUrl);
      // Forward original query string
      const origSearch = new URL(request.url).search;
      if (origSearch) url.search = origSearch;

      const reqMethod = method ?? request.method;
      const upstream = await fetch(url.toString(), {
        method: reqMethod,
        headers: {
          "Content-Type": "application/json",
          ...(backendToken ? { Authorization: `Bearer ${backendToken}` } : {}),
        },
        body: ["GET", "HEAD"].includes(reqMethod)
          ? undefined
          : await request.text().catch(() => undefined),
      });

      // If backend doesn't implement this route, fall through to stub
      if (upstream.status === 404 || upstream.status === 501) {
        // fall through to stub below
      } else {
        const data = await upstream.json().catch(() => ({}));
        return NextResponse.json(data, { status: upstream.status });
      }
    } catch {
      // Network error — fall through to stub
    }
  }

  // Stub response
  const isArray = Array.isArray(stubData);
  return NextResponse.json({
    success: true,
    data: stubData,
    ...(isArray ? { total: stubData.length, page: 1, limit: 20 } : {}),
    ...stubMeta,
    _stub: true,
  });
}

/** Return 501 Not Implemented for write operations that need a real backend. */
export function notImplemented(operation = "This operation") {
  return NextResponse.json(
    {
      success: false,
      error: `${operation} requires a connected backend. Set BACKEND_API_URL in environment variables.`,
      code: "NOT_IMPLEMENTED",
    },
    { status: 501 }
  );
}

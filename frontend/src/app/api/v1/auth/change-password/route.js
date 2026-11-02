import { NextResponse } from "next/server";

/**
 * PUT /api/v1/auth/change-password
 *
 * Request body: { currentPassword: string, newPassword: string }
 *
 * Response 200: { success: true }
 * Response 400: { success: false, error: string }
 *
 * ── Backend implementation required ────────────────────────────
 * Validate currentPassword against stored hash.
 * Hash newPassword and persist.
 * Optionally rotate the session token.
 * ───────────────────────────────────────────────────────────────
 */
export async function PUT(request) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (backendUrl) {
    const body = await request.text();
    const session = request.headers.get("x-session-user");
    const upstream = await fetch(`${backendUrl}/auth/change-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(session ? { "x-session-user": session } : {}),
      },
      body,
    });
    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  }

  return NextResponse.json(
    { success: false, error: "Not implemented. Connect a backend to enable this feature.", code: "NOT_IMPLEMENTED" },
    { status: 501 }
  );
}

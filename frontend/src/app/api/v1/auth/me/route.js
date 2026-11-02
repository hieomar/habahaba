import { NextResponse } from "next/server";

/**
 * GET /api/v1/auth/me
 *
 * Returns the currently authenticated user from the session.
 * The middleware attaches the decoded session to x-session-user.
 *
 * Response 200: { success: true, user: { id, name, email, role, roleId, assignedIPC } }
 * Response 401: handled by middleware
 */
export async function GET(request) {
  const raw = request.headers.get("x-session-user");
  if (!raw) {
    return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
  }
  try {
    const user = JSON.parse(raw);
    return NextResponse.json({ success: true, user });
  } catch {
    return NextResponse.json({ success: false, error: "Malformed session." }, { status: 500 });
  }
}

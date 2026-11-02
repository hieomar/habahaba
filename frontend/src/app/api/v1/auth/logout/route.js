import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/jwt";

/**
 * POST /api/v1/auth/logout
 *
 * Clears the session cookie.
 * Response 200: { success: true }
 */
export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return res;
}

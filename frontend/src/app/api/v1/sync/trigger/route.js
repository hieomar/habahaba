import { NextResponse } from "next/server";
import { proxyOrStub, notImplemented } from "@/lib/api/stub";

/**
 * POST /api/v1/sync/trigger
 * Initiates a manual synchronisation job.
 * Response: { success, syncId }
 */
export async function POST(request) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (backendUrl) return proxyOrStub(request, "/sync/trigger");
  // Return a stub success so the UI trigger animation still works.
  return NextResponse.json({ success: true, syncId: null, _stub: true });
}

import { proxyOrStub, notImplemented } from "@/lib/api/stub";

/**
 * GET  /api/v1/farmers  — List farmers
 * POST /api/v1/farmers  — Register a farmer
 *
 * GET query params: { page, limit, search, district, status, association }
 * GET response:  { success, data: Farmer[], total, page, limit }
 * POST response: { success, data: Farmer }
 */
export async function GET(request) {
  return proxyOrStub(request, "/farmers");
}

export async function POST(request) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (backendUrl) return proxyOrStub(request, "/farmers");
  return notImplemented("Registering farmers");
}

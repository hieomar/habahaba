import { proxyOrStub, notImplemented } from "@/lib/api/stub";

/**
 * GET  /api/v1/farmer-groups  — List farmer groups
 * POST /api/v1/farmer-groups  — Create a farmer group
 *
 * GET query params: { page, limit, search, district, status }
 * GET response:  { success, data: Group[], total, page, limit }
 */
export async function GET(request) {
  return proxyOrStub(request, "/farmer-groups");
}

export async function POST(request) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (backendUrl) return proxyOrStub(request, "/farmer-groups");
  return notImplemented("Creating farmer groups");
}

import { proxyOrStub, notImplemented } from "@/lib/api/stub";

/**
 * GET  /api/v1/users   — List users
 * POST /api/v1/users   — Create a user
 *
 * GET query params: { page, limit, search, status, roleId }
 *
 * GET response:  { success, data: User[], total, page, limit }
 * POST request:  { name, email, phone, roleId, assignedIPC, status? }
 * POST response: { success, data: User }
 */
export async function GET(request) {
  return proxyOrStub(request, "/users");
}

export async function POST(request) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (backendUrl) return proxyOrStub(request, "/users");
  return notImplemented("Creating users");
}

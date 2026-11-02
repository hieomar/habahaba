import { proxyOrStub, notImplemented } from "@/lib/api/stub";
import { SEED_ROLES } from "@/auth/mockRoles";

/**
 * GET  /api/v1/roles  — List all roles
 * POST /api/v1/roles  — Create a custom role
 *
 * GET response:  { success, data: Role[] }
 * POST request:  { name, description, permissions?, mobilePermissions? }
 * POST response: { success, data: Role }
 */
export async function GET(request) {
  return proxyOrStub(request, "/roles", { stubData: SEED_ROLES ?? [] });
}

export async function POST(request) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (backendUrl) return proxyOrStub(request, "/roles");
  return notImplemented("Creating roles");
}

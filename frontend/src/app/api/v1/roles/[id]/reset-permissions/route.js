import { proxyOrStub, notImplemented } from "@/lib/api/stub";

/**
 * POST /api/v1/roles/:id/reset-permissions
 * Resets the role's permissions to system defaults.
 * Response: { success, data: Role }
 */
export async function POST(request, { params }) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (backendUrl) return proxyOrStub(request, `/roles/${params.id}/reset-permissions`);
  return notImplemented("Resetting role permissions");
}

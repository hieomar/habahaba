import { proxyOrStub, notImplemented } from "@/lib/api/stub";

/**
 * POST /api/v1/users/:id/reset-password
 * Resets a user's password (admin action).
 * Response: { success, temporaryPassword? }
 */
export async function POST(request, { params }) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (backendUrl) return proxyOrStub(request, `/users/${params.id}/reset-password`);
  return notImplemented("Resetting passwords");
}

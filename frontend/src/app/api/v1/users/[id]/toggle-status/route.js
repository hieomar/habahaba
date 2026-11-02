import { proxyOrStub, notImplemented } from "@/lib/api/stub";

/**
 * POST /api/v1/users/:id/toggle-status
 * Toggles user Active ↔ Inactive.
 * Response: { success, data: User }
 */
export async function POST(request, { params }) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (backendUrl) return proxyOrStub(request, `/users/${params.id}/toggle-status`);
  return notImplemented("Toggling user status");
}

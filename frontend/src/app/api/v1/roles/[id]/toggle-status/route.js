import { proxyOrStub, notImplemented } from "@/lib/api/stub";

/**
 * POST /api/v1/roles/:id/toggle-status
 * Toggles role Active ↔ Inactive.
 * The system administrator role cannot be deactivated.
 * Response: { success, data: Role }
 */
export async function POST(request, { params }) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (backendUrl) return proxyOrStub(request, `/roles/${params.id}/toggle-status`);
  return notImplemented("Toggling role status");
}

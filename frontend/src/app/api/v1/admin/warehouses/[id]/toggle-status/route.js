import { proxyOrStub, notImplemented } from "@/lib/api/stub";

/**
 * POST /api/v1/admin/warehouses/:id/toggle-status
 * Toggles warehouse Active ↔ Inactive.
 * Response: { success, data: Warehouse }
 */
export async function POST(request, { params }) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (backendUrl) return proxyOrStub(request, `/admin/warehouses/${params.id}/toggle-status`);
  return notImplemented("Toggling warehouse status");
}

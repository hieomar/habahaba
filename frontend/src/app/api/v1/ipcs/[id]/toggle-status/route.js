import { proxyOrStub, notImplemented } from "@/lib/api/stub";

/**
 * POST /api/v1/ipcs/:id/toggle-status
 * Response: { success, data: IPC }
 */
export async function POST(request, { params }) {
  const backendUrl = process.env.BACKEND_API_URL;
  if (backendUrl) return proxyOrStub(request, `/ipcs/${params.id}/toggle-status`);
  return notImplemented("Toggling IPC status");
}

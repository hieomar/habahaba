import { proxyOrStub } from "@/lib/api/stub";

/**
 * GET /api/v1/sync/devices
 * Returns registered mobile devices and their sync status.
 * Response: { success, data: Device[] }
 */
export async function GET(request) {
  return proxyOrStub(request, "/sync/devices");
}

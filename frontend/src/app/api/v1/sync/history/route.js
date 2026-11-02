import { proxyOrStub } from "@/lib/api/stub";

/**
 * GET /api/v1/sync/history
 * Returns the log of recent synchronisation events.
 * Response: { success, data: SyncHistoryEntry[] }
 */
export async function GET(request) {
  return proxyOrStub(request, "/sync/history");
}

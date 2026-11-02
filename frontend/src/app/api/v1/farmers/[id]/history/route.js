import { proxyOrStub } from "@/lib/api/stub";

/**
 * GET /api/v1/farmers/:id/history
 * Returns activity history entries for a specific farmer.
 * Response: { success, data: HistoryEntry[] }
 */
export async function GET(request, { params }) {
  return proxyOrStub(request, `/farmers/${params.id}/history`);
}

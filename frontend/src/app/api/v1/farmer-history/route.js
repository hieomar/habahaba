import { proxyOrStub } from "@/lib/api/stub";

/**
 * GET /api/v1/farmer-history
 * Returns activity history across all farmers.
 * Query params: { farmerId, officer, activityType, dateFrom, dateTo, search, page, limit }
 * Response: { success, data: HistoryEntry[], total, page, limit }
 */
export async function GET(request) {
  return proxyOrStub(request, "/farmer-history");
}

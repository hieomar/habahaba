import { proxyOrStub } from "@/lib/api/stub";

/**
 * GET /api/v1/warehouse-records
 * Returns warehouse stock records (GRN-based view).
 * Query params: { warehouse, grnStatus, commodity, page, limit }
 * Response: {
 *   success, data: WarehouseRecord[], total, page, limit,
 *   stats: { totalStored, totalWeight, pendingGRNs, activeWarehouses }
 * }
 */
export async function GET(request) {
  return proxyOrStub(request, "/warehouse-records", {
    stubMeta: { stats: { totalStored: 0, totalWeight: 0, pendingGRNs: 0, activeWarehouses: 0 } },
  });
}

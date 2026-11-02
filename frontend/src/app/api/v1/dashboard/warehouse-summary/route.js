import { proxyOrStub } from "@/lib/api/stub";

/**
 * GET /api/v1/dashboard/warehouse-summary
 * Proxied to: GET {BACKEND_API_URL}/dashboard/warehouse-summary
 */
export async function GET(request) {
  return proxyOrStub(request, "/dashboard/warehouse-summary", {
    stubData: {
      totalStockKg: 0,
      availableKg: 0,
      pendingDispatches: 0,
      deliveries: [],
    },
  });
}

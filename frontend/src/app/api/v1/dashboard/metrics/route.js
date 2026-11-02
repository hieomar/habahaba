import { proxyOrStub } from "@/lib/api/stub";

/**
 * GET /api/v1/dashboard/metrics
 * Returns aggregated KPIs for role-based dashboard cards.
 * Proxied to: GET {BACKEND_API_URL}/dashboard/metrics
 */
export async function GET(request) {
  return proxyOrStub(request, "/dashboard/metrics", {
    stubData: {
      totalFarmers: 0,
      activeFarmers: 0,
      totalPurchases: 0,
      totalUsers: 0,
      activeUsers: 0,
      totalWarehouses: 0,
      totalIPCs: 0,
      pendingSyncs: 0,
      totalRoles: 0,
      devicesSynced: 0,
      devicesOnline: 0,
      totalWarehouseWeight: 0,
      failedSyncs: 0,
    },
  });
}

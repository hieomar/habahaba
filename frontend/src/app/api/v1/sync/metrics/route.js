import { proxyOrStub } from "@/lib/api/stub";

/**
 * GET /api/v1/sync/metrics
 * Returns aggregated sync metrics for the dashboard.
 * Response: { success, data: SyncMetrics }
 */
export async function GET(request) {
  return proxyOrStub(request, "/sync/metrics", {
    stubData: {
      totalSyncedFarmers: 0,
      pendingSynchronizations: 0,
      failedSynchronizations: 0,
      lastSynchronizationTime: null,
      successRate: 0,
      devicesOnline: 0,
      devicesOffline: 0,
      totalDataSyncedToday: "0 MB",
      averageSyncTime: "—",
    },
  });
}

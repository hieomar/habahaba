import { api } from "./client";

/**
 * Sync Management Service
 *
 * Backend contract:
 *   GET    /api/v1/sync/devices                  → { data: Device[] }
 *   GET    /api/v1/sync/history                  → { data: SyncHistoryEntry[] }
 *   GET    /api/v1/sync/metrics                  → { data: SyncMetrics }
 *   POST   /api/v1/sync/trigger                  → { success, syncId }
 *
 * Device shape:
 *   { id, officerId, officerName, deviceModel, osVersion, appVersion,
 *     lastSync, recordsUploaded, pendingRecords, failedRecords,
 *     syncStatus, batteryLevel, connectivity }
 *
 * SyncMetrics shape:
 *   { totalSyncedFarmers, pendingSynchronizations, failedSynchronizations,
 *     lastSynchronizationTime, successRate, devicesOnline, devicesOffline,
 *     totalDataSyncedToday, averageSyncTime }
 */

export const syncService = {
  listDevices: () => api.get("/sync/devices"),

  listHistory: () => api.get("/sync/history"),

  getMetrics: () => api.get("/sync/metrics"),

  trigger: () => api.post("/sync/trigger", {}),
};

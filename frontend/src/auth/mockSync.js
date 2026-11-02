// ─────────────────────────────────────────────────────────────
// NASFAM GTMS — Mock Synchronization Data
// Tracks synchronization status between mobile and web
// ─────────────────────────────────────────────────────────────

export const SYNC_STATUSES = {
  SYNCED: "Synced",
  PENDING: "Pending",
  FAILED: "Failed",
  IN_PROGRESS: "In Progress",
};

// Device synchronization tracking
export const mockSyncDevices = [
  {
    id: "dev-001",
    officerId: "usr-101",
    officerName: "John Banda",
    deviceModel: "Samsung A12",
    osVersion: "Android 11",
    appVersion: "1.2.5",
    lastSync: "2024-07-13T14:32:00Z",
    recordsUploaded: 45,
    pendingRecords: 3,
    failedRecords: 1,
    syncStatus: "In Progress",
    batteryLevel: 87,
    connectivity: "WiFi",
  },
  {
    id: "dev-002",
    officerId: "usr-102",
    officerName: "Mary Mwale",
    deviceModel: "Tecno Pop 3",
    osVersion: "Android 10",
    appVersion: "1.2.4",
    lastSync: "2024-07-13T12:15:00Z",
    recordsUploaded: 28,
    pendingRecords: 0,
    failedRecords: 0,
    syncStatus: "Synced",
    batteryLevel: 42,
    connectivity: "Cellular",
  },
  {
    id: "dev-003",
    officerId: "usr-103",
    officerName: "Samuel Phiri",
    deviceModel: "Samsung A50",
    osVersion: "Android 12",
    appVersion: "1.2.5",
    lastSync: "2024-07-12T16:45:00Z",
    recordsUploaded: 67,
    pendingRecords: 8,
    failedRecords: 2,
    syncStatus: "Failed",
    batteryLevel: 15,
    connectivity: "No Connection",
  },
];

// Synchronization history for dashboard
export const mockSyncHistory = [
  {
    id: "sync-001",
    timestamp: "2024-07-13T14:32:00Z",
    officerId: "usr-101",
    officerName: "John Banda",
    action: "SYNC_STARTED",
    recordType: "Farmer Registration",
    recordsCount: 5,
    status: "In Progress",
    device: "Samsung A12",
  },
  {
    id: "sync-002",
    timestamp: "2024-07-13T13:15:00Z",
    officerId: "usr-102",
    officerName: "Mary Mwale",
    action: "SYNC_COMPLETED",
    recordType: "Purchase Records",
    recordsCount: 3,
    status: "Success",
    device: "Tecno Pop 3",
  },
  {
    id: "sync-003",
    timestamp: "2024-07-13T11:45:00Z",
    officerId: "usr-103",
    officerName: "Samuel Phiri",
    action: "SYNC_FAILED",
    recordType: "Farmer Registration",
    recordsCount: 2,
    status: "Failed",
    device: "Samsung A50",
    errorMessage: "Network timeout. Retrying...",
  },
  {
    id: "sync-004",
    timestamp: "2024-07-13T10:20:00Z",
    officerId: "usr-101",
    officerName: "John Banda",
    action: "SYNC_COMPLETED",
    recordType: "Farmer Registration",
    recordsCount: 8,
    status: "Success",
    device: "Samsung A12",
  },
];

// Farmer sync status tracking
export const mockFarmerSyncStatus = [
  {
    farmerId: "farmer-001",
    farmerName: "Kamchitanda Phiri",
    registrationDate: "2024-07-10",
    registeredBy: "John Banda",
    syncStatus: "Synced",
    lastSyncTime: "2024-07-10T14:32:00Z",
    dataHash: "abc123def456",
  },
  {
    farmerId: "farmer-002",
    farmerName: "Zione Mtalimanja",
    registrationDate: "2024-07-12",
    registeredBy: "Mary Mwale",
    syncStatus: "Pending",
    lastSyncTime: null,
    dataHash: null,
  },
  {
    farmerId: "farmer-003",
    farmerName: "Hastings Nyirongo",
    registrationDate: "2024-07-11",
    registeredBy: "Samuel Phiri",
    syncStatus: "Failed",
    lastSyncTime: "2024-07-11T15:22:00Z",
    dataHash: "xyz789uvw012",
    errorMessage: "Data validation error",
  },
];

// Purchase sync status
export const mockPurchaseSyncStatus = [
  {
    purchaseId: "purch-001",
    farmerName: "Kamchitanda Phiri",
    commodity: "Maize",
    weight: "50kg",
    purchaseDate: "2024-07-10",
    recordedBy: "John Banda",
    syncStatus: "Synced",
    lastSyncTime: "2024-07-10T15:45:00Z",
  },
  {
    purchaseId: "purch-002",
    farmerName: "Zione Mtalimanja",
    commodity: "Soybean",
    weight: "30kg",
    purchaseDate: "2024-07-13",
    recordedBy: "Mary Mwale",
    syncStatus: "Pending",
    lastSyncTime: null,
  },
];

// Summary metrics for dashboard
export const mockSyncMetrics = {
  totalSyncedFarmers: 1245,
  pendingSynchronizations: 23,
  failedSynchronizations: 5,
  lastSynchronizationTime: "2024-07-13T14:32:00Z",
  successRate: 98.2,
  devicesOnline: 2,
  devicesOffline: 1,
  totalDataSyncedToday: "2.5 MB",
  averageSyncTime: "2 minutes 15 seconds",
};

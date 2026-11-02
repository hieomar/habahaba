// ─────────────────────────────────────────────────────────────
// NASFAM GTMS — Mock Batches, Inventory, Dispatches & Master Data
// ─────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════
// BATCHES
// ═══════════════════════════════════════════════════════════════
export const mockBatches = [
  {
    id: "BATCH-2026-001",
    batchNumber: "BATCH-2026-001",
    warehouseId: "WH-001",
    warehouseName: "Lilongwe Warehouse",
    ipc: "Lilongwe IPC",
    commodity: "Maize",
    numberOfBags: 6,
    totalWeightKg: 543,
    storageLocation: "Section A, Row 1",
    status: "Active",
    grnIds: ["GRN-2026-001", "GRN-2026-005"],
    createdBy: "Warehouse Officer - Lilongwe",
    createdAt: "2026-04-06",
    notes: "Lilongwe Maize batch — 2026 season.",
  },
  {
    id: "BATCH-2026-002",
    batchNumber: "BATCH-2026-002",
    warehouseId: "WH-001",
    warehouseName: "Lilongwe Warehouse",
    ipc: "Lilongwe IPC",
    commodity: "Soya",
    numberOfBags: 2,
    totalWeightKg: 179,
    storageLocation: "Section B, Row 2",
    status: "Active",
    grnIds: ["GRN-2026-002"],
    createdBy: "Warehouse Officer - Lilongwe",
    createdAt: "2026-04-07",
    notes: "Soya batch from Mary Phiri.",
  },
  {
    id: "BATCH-2026-003",
    batchNumber: "BATCH-2026-003",
    warehouseId: "WH-003",
    warehouseName: "Kasungu Warehouse",
    ipc: "Kasungu IPC",
    commodity: "Soya",
    numberOfBags: 2,
    totalWeightKg: 176,
    storageLocation: "Section A, Row 1",
    status: "Dispatched",
    grnIds: ["GRN-2026-004"],
    createdBy: "Warehouse Officer - Kasungu",
    createdAt: "2026-04-11",
    notes: "Dispatched to ADMARC Kasungu.",
  },
  {
    id: "BATCH-2026-004",
    batchNumber: "BATCH-2026-004",
    warehouseId: "WH-003",
    warehouseName: "Kasungu Warehouse",
    ipc: "Kasungu IPC",
    commodity: "Maize",
    numberOfBags: 3,
    totalWeightKg: 271,
    storageLocation: "Section B, Row 3",
    status: "Active",
    grnIds: ["GRN-2026-006"],
    createdBy: "Warehouse Officer - Kasungu",
    createdAt: "2026-04-16",
    notes: "Samuel Lungu maize — aeration in progress.",
  },
];

// ── Batch helpers ────────────────────────────────────────────
export const getBatchById = (id) => mockBatches.find((b) => b.id === id) ?? null;
export const getBatchesByWarehouse = (warehouseId) => mockBatches.filter((b) => b.warehouseId === warehouseId);


// ═══════════════════════════════════════════════════════════════
// INVENTORY
// ═══════════════════════════════════════════════════════════════
export const mockInventory = [
  {
    id: "INV-001",
    warehouseId: "WH-001",
    warehouseName: "Lilongwe Warehouse",
    ipc: "Lilongwe IPC",
    commodity: "Maize",
    currentStockKg: 543,
    numberOfBags: 6,
    capacityKg: 5000,
    utilizationPercent: 10.9,
    lastUpdated: "2026-04-12",
    status: "Normal",
    pendingGRNs: 0,
    pendingDispatches: 0,
  },
  {
    id: "INV-002",
    warehouseId: "WH-001",
    warehouseName: "Lilongwe Warehouse",
    ipc: "Lilongwe IPC",
    commodity: "Soya",
    currentStockKg: 357,
    numberOfBags: 4,
    capacityKg: 3000,
    utilizationPercent: 11.9,
    lastUpdated: "2026-04-20",
    status: "Normal",
    pendingGRNs: 0,
    pendingDispatches: 0,
  },
  {
    id: "INV-003",
    warehouseId: "WH-002",
    warehouseName: "Mchinji Warehouse",
    ipc: "Mchinji IPC",
    commodity: "Maize",
    currentStockKg: 361,
    numberOfBags: 4,
    capacityKg: 4000,
    utilizationPercent: 9.0,
    lastUpdated: "2026-04-08",
    status: "Normal",
    pendingGRNs: 0,
    pendingDispatches: 0,
  },
  {
    id: "INV-004",
    warehouseId: "WH-002",
    warehouseName: "Mchinji Warehouse",
    ipc: "Mchinji IPC",
    commodity: "Groundnuts",
    currentStockKg: 48,
    numberOfBags: 1,
    capacityKg: 1000,
    utilizationPercent: 4.8,
    lastUpdated: "2026-05-02",
    status: "Low Stock",
    pendingGRNs: 1,
    pendingDispatches: 0,
  },
  {
    id: "INV-005",
    warehouseId: "WH-003",
    warehouseName: "Kasungu Warehouse",
    ipc: "Kasungu IPC",
    commodity: "Soya",
    currentStockKg: 0,
    numberOfBags: 0,
    capacityKg: 2000,
    utilizationPercent: 0,
    lastUpdated: "2026-04-25",
    status: "Empty",
    pendingGRNs: 0,
    pendingDispatches: 0,
  },
  {
    id: "INV-006",
    warehouseId: "WH-003",
    warehouseName: "Kasungu Warehouse",
    ipc: "Kasungu IPC",
    commodity: "Maize",
    currentStockKg: 271,
    numberOfBags: 3,
    capacityKg: 4000,
    utilizationPercent: 6.8,
    lastUpdated: "2026-04-15",
    status: "Normal",
    pendingGRNs: 0,
    pendingDispatches: 0,
  },
];

// ── Stock movement history ────────────────────────────────────
export const mockStockMovements = [
  { id: "MOV-001", type: "Inward",  warehouseId: "WH-001", commodity: "Maize",      quantityKg: 269,  reference: "GRN-2026-001", date: "2026-04-05", officer: "Warehouse Officer - Lilongwe" },
  { id: "MOV-002", type: "Inward",  warehouseId: "WH-001", commodity: "Soya",       quantityKg: 179,  reference: "GRN-2026-002", date: "2026-04-06", officer: "Warehouse Officer - Lilongwe" },
  { id: "MOV-003", type: "Inward",  warehouseId: "WH-002", commodity: "Maize",      quantityKg: 361,  reference: "GRN-2026-003", date: "2026-04-08", officer: "Warehouse Officer - Mchinji" },
  { id: "MOV-004", type: "Inward",  warehouseId: "WH-003", commodity: "Soya",       quantityKg: 176,  reference: "GRN-2026-004", date: "2026-04-10", officer: "Warehouse Officer - Kasungu" },
  { id: "MOV-005", type: "Inward",  warehouseId: "WH-001", commodity: "Maize",      quantityKg: 274,  reference: "GRN-2026-005", date: "2026-04-12", officer: "Warehouse Officer - Lilongwe" },
  { id: "MOV-006", type: "Outward", warehouseId: "WH-003", commodity: "Soya",       quantityKg: 176,  reference: "DSP-2026-001", date: "2026-04-25", officer: "Warehouse Officer - Kasungu" },
  { id: "MOV-007", type: "Inward",  warehouseId: "WH-003", commodity: "Maize",      quantityKg: 271,  reference: "GRN-2026-006", date: "2026-04-15", officer: "Warehouse Officer - Kasungu" },
  { id: "MOV-008", type: "Inward",  warehouseId: "WH-001", commodity: "Soya",       quantityKg: 178,  reference: "GRN-2026-007", date: "2026-04-20", officer: "Warehouse Officer - Lilongwe" },
  { id: "MOV-009", type: "Inward",  warehouseId: "WH-002", commodity: "Groundnuts", quantityKg: 48,   reference: "GRN-2026-008", date: "2026-05-02", officer: "Warehouse Officer - Mchinji" },
];

// ── Inventory helpers ────────────────────────────────────────
export const getInventoryByWarehouse = (warehouseId) =>
  mockInventory.filter((i) => i.warehouseId === warehouseId);
export const getTotalStock = () =>
  mockInventory.reduce((sum, i) => sum + i.currentStockKg, 0);


// ═══════════════════════════════════════════════════════════════
// DISPATCHES
// ═══════════════════════════════════════════════════════════════
export const mockDispatches = [
  {
    id: "DSP-2026-001",
    dispatchNumber: "DSP-2026-001",
    customerId: "CUST-001",
    customerName: "ADMARC Kasungu",
    customerContact: "+265 999 100 001",
    warehouseId: "WH-003",
    warehouseName: "Kasungu Warehouse",
    ipc: "Kasungu IPC",
    commodity: "Soya",
    batchId: "BATCH-2026-003",
    bagIds: ["F-000004-001", "F-000004-002"],
    numberOfBags: 2,
    quantityKg: 176,
    dispatchDate: "2026-04-25",
    deliveryAddress: "ADMARC Depot, Kasungu",
    vehicleReg: "MK 1234 A",
    driverName: "Joseph Banda",
    status: "Delivered",
    receivedBy: "ADMARC Store Officer",
    receivedDate: "2026-04-25",
    dispatchedBy: "Warehouse Officer - Kasungu",
    notes: "First soya dispatch of 2026 season.",
    createdAt: "2026-04-25T07:00:00Z",
  },
];

// ── Dispatch helpers ──────────────────────────────────────────
export const getDispatchById = (id) => mockDispatches.find((d) => d.id === id) ?? null;
export const getDispatchesByWarehouse = (warehouseId) =>
  mockDispatches.filter((d) => d.warehouseId === warehouseId);

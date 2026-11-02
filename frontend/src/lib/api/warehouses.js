import { api } from "./client";

/**
 * Warehouse Records Service
 *
 * Backend contract:
 *   GET    /api/v1/warehouse-records             → { data: WarehouseRecord[], total, stats }
 *   GET    /api/v1/warehouse-records/:id         → { data: WarehouseRecord }
 *
 * WarehouseRecord shape (derived from a Purchase + GRN):
 *   { id, grnNumber, grnStatus, receivingOfficer, receivingDate,
 *     acceptedQty, rejectedQty, warehouseName, warehouseCode, location,
 *     bin, stack, shelf, storageCondition, stockStatus,
 *     commodity, grade, bags, weight, batchNumber, batchStatus }
 *
 * stats shape: { totalStored, totalWeight, pendingGRNs, activeWarehouses }
 */

export const warehousesService = {
  listRecords: (params) => api.get("/warehouse-records", params),

  getRecord: (id) => api.get(`/warehouse-records/${id}`),
};

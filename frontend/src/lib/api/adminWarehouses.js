import { api } from "./client";

/**
 * Admin Warehouse Locations Service
 * (Manages physical warehouse buildings, not GRN stock records)
 *
 * Backend contract:
 *   GET    /api/v1/admin/warehouses             → { data: Warehouse[] }
 *   POST   /api/v1/admin/warehouses             → { data: Warehouse }
 *   GET    /api/v1/admin/warehouses/:id         → { data: Warehouse }
 *   PUT    /api/v1/admin/warehouses/:id         → { data: Warehouse }
 *   DELETE /api/v1/admin/warehouses/:id         → { success }
 *   POST   /api/v1/admin/warehouses/:id/toggle-status → { data: Warehouse }
 *
 * Warehouse shape: { id, code, name, location, capacity, manager, status, createdAt }
 */

export const adminWarehousesService = {
  list: (params) => api.get("/admin/warehouses", params),
  get: (id) => api.get(`/admin/warehouses/${id}`),
  create: (payload) => api.post("/admin/warehouses", payload),
  update: (id, payload) => api.put(`/admin/warehouses/${id}`, payload),
  remove: (id) => api.del(`/admin/warehouses/${id}`),
  toggleStatus: (id) => api.post(`/admin/warehouses/${id}/toggle-status`, {}),
};

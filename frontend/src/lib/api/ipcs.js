import { api } from "./client";

/**
 * IPCs Service
 *
 * Backend contract:
 *   GET    /api/v1/ipcs                          → { data: IPC[] }
 *   POST   /api/v1/ipcs                          → { data: IPC }
 *   GET    /api/v1/ipcs/:id                      → { data: IPC }
 *   PUT    /api/v1/ipcs/:id                      → { data: IPC }
 *   DELETE /api/v1/ipcs/:id                      → { success }
 *   POST   /api/v1/ipcs/:id/toggle-status        → { data: IPC }
 *
 * IPC shape:
 *   { id, name, district, manager, status, createdAt,
 *     region, registrationNumber, establishmentDate,
 *     chairperson, chairpersonPhone, secretaryName, secretaryPhone,
 *     address, totalFarmers, totalWarehouses, warehouseCapacity,
 *     lastActivityDate, contactEmail }
 */

export const ipcsService = {
  list: (params) => api.get("/ipcs", params),

  get: (id) => api.get(`/ipcs/${id}`),

  create: (payload) => api.post("/ipcs", payload),

  update: (id, payload) => api.put(`/ipcs/${id}`, payload),

  remove: (id) => api.del(`/ipcs/${id}`),

  toggleStatus: (id) => api.post(`/ipcs/${id}/toggle-status`, {}),
};

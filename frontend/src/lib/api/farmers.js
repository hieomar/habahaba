import { api } from "./client";

/**
 * Farmers Service
 */

export const farmersService = {
  // Farmer profiles
  list: (params) => api.get("/farmers", params),
  get: (id) => api.get(`/farmers/${id}`),
  create: (payload) => api.post("/farmers", payload),
  update: (id, payload) => api.put(`/farmers/${id}`, payload),
  remove: (id) => api.del(`/farmers/${id}`),

  // Per-farmer sub-resources
  getHistory: (id) => api.get(`/farmers/${id}/history`),
  getTraceability: (id) => api.get(`/farmers/${id}/traceability`),
  getDocuments: (id) => api.get(`/farmers/${id}/documents`),

  // Farmer groups
  listGroups: () => api.get("/farmers/groups"),

  // Global activity history
  listHistory: (params) => api.get("/farmers", params),
};

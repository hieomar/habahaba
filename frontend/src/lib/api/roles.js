import { api } from "./client";

/**
 * Roles Service
 *
 * Backend contract:
 *   GET    /api/v1/roles                         → { data: Role[] }
 *   POST   /api/v1/roles                         → { data: Role }
 *   GET    /api/v1/roles/:id                     → { data: Role }
 *   PUT    /api/v1/roles/:id                     → { data: Role }
 *   DELETE /api/v1/roles/:id                     → { success }
 *   POST   /api/v1/roles/:id/duplicate           → { data: Role }
 *   POST   /api/v1/roles/:id/toggle-status       → { data: Role }
 *   POST   /api/v1/roles/:id/reset-permissions   → { data: Role }
 *
 * Role shape:
 *   { id, name, type, platform, status, description, responsibilities,
 *     usersAssigned, lastModified, permissions?, mobilePermissions? }
 */

export const rolesService = {
  list: () => api.get("/roles"),

  get: (id) => api.get(`/roles/${id}`),

  create: (payload) => api.post("/roles", payload),

  update: (id, payload) => api.put(`/roles/${id}`, payload),

  remove: (id) => api.del(`/roles/${id}`),

  duplicate: (id) => api.post(`/roles/${id}/duplicate`, {}),

  toggleStatus: (id) => api.post(`/roles/${id}/toggle-status`, {}),

  resetPermissions: (id) => api.post(`/roles/${id}/reset-permissions`, {}),
};

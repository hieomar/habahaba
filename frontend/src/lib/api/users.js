import { api } from "./client";

/**
 * Users Service
 *
 * Backend contract:
 *   GET    /api/v1/users                         → { data: User[], total, page, limit }
 *   POST   /api/v1/users                         → { data: User }
 *   GET    /api/v1/users/:id                     → { data: User }
 *   PUT    /api/v1/users/:id                     → { data: User }
 *   DELETE /api/v1/users/:id                     → { success }
 *   POST   /api/v1/users/:id/toggle-status       → { data: User }
 *   POST   /api/v1/users/:id/reset-password      → { success, temporaryPassword? }
 *
 * User shape:
 *   { id, name, email, phone, roleId, role, assignedIPC, status, createdAt }
 */

export const usersService = {
  list: (params) => api.get("/users", params),

  get: (id) => api.get(`/users/${id}`),

  create: (payload) => api.post("/users", payload),

  update: (id, payload) => api.put(`/users/${id}`, payload),

  remove: (id) => api.del(`/users/${id}`),

  toggleStatus: (id) => api.post(`/users/${id}/toggle-status`, {}),

  resetPassword: (id) => api.post(`/users/${id}/reset-password`, {}),
};

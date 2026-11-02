import { api } from "./client";

/**
 * Notifications Service
 *
 * Backend contract:
 *   GET    /api/v1/notifications                 → { data: Notification[], unreadCount }
 *   PUT    /api/v1/notifications/:id/read        → { success }
 *   PUT    /api/v1/notifications/read-all        → { success }
 *
 * Notification shape:
 *   { id, title, message, type, read, createdAt, date }
 */

export const notificationsService = {
  list: () => api.get("/notifications"),

  markRead: (id) => api.put(`/notifications/${id}/read`, {}),

  markAllRead: () => api.put("/notifications/read-all", {}),
};

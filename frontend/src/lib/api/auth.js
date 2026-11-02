import { api } from "./client";

/**
 * Auth Service
 *
 * Backend contract:
 *   POST /api/v1/auth/login        → { user, token }  (sets httpOnly nasfam_session cookie)
 *   POST /api/v1/auth/logout       → { success }      (clears cookie)
 *   GET  /api/v1/auth/me           → { user }
 *   PUT  /api/v1/auth/change-password → { success }
 */

export const authService = {
  login: (email, password) =>
    api.post("/auth/login", { email, password }),

  logout: () =>
    api.post("/auth/logout", {}),

  me: () =>
    api.get("/auth/me"),

  changePassword: (currentPassword, newPassword) =>
    api.put("/auth/change-password", { currentPassword, newPassword }),
};

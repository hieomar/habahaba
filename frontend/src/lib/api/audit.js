import { api } from "./client";

/**
 * Audit Logs Service
 *
 * Backend contract:
 *   GET    /api/v1/audit-logs                    → { data: AuditLog[], total, page, limit }
 *   POST   /api/v1/audit-logs/export             → file download (Excel)
 *
 * Query params: { type, action, from, to, page, limit }
 *
 * AuditLog shape:
 *   { id, timestamp, userId, userName, action, module,
 *     description, ipAddress, severity }
 */

export const auditService = {
  list: (params) => api.get("/audit-logs", params),

  export: async (params) => {
    const url = `/api/v1/audit-logs/export?${new URLSearchParams(params)}`;
    const res = await fetch(url, { credentials: "same-origin" });
    if (!res.ok) throw new Error("Export failed");
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.xls`;
    a.click();
    URL.revokeObjectURL(a.href);
  },
};

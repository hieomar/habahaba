import { api } from "./client";

/**
 * Reports Service
 *
 * Backend contract:
 *   GET    /api/v1/reports/:type                 → { data: {...}, generatedAt }
 *
 * Supported types:
 *   farmer-statistics    — registration trends, gender split, crop breakdown
 *   ipc-performance      — per-IPC metrics, comparisons
 *   national             — org-wide KPIs and summaries
 *   warehouse-statistics — stock levels, utilisation per warehouse
 *   system-health        — uptime, sync rates, error rates
 *   traceability         — batch chain of custody records
 *   audit                — audit event summaries
 *   user                 — user activity reports
 *   notification         — notification delivery stats
 *
 * Query params (all optional): { from, to, ipc, district, commodity }
 */

export const reportsService = {
  get: (type, params) => api.get(`/reports/${type}`, params),
};

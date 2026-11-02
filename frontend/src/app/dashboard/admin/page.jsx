"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { dashboardService } from "@/lib/api/dashboard";
import { auditService } from "@/lib/api/audit";
import { PurchasingRevenueChart } from "../_components/Charts";

function MetricWidget({ icon, label, value, trend, trendUp = true }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-500">
          {icon}
          <p className="text-sm font-semibold text-gray-700">{label}</p>
        </div>
        {trend && (
          <div className="flex items-center gap-1">
            <svg className={`w-3.5 h-3.5 ${trendUp ? "text-[#1a5c2a]" : "text-red-500"}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={trendUp ? "M7 17L17 7M17 7H7M17 7v10" : "M7 7l10 10M17 17H7M17 17V7"} />
            </svg>
            <span className={`text-xs font-semibold ${trendUp ? "text-[#1a5c2a]" : "text-red-600"}`}>{trend}</span>
          </div>
        )}
      </div>
      <p className="text-xl font-bold text-gray-900">{value ?? "—"}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [metricsRes, logsRes] = await Promise.all([
        dashboardService.getMetrics(),
        auditService.list({ limit: 5 }),
      ]);

      // Backend: { success, data: { totalFarmers, ... } }
      // Stub:    { success, data: { totalFarmers, ... }, _stub: true }
      setMetrics(metricsRes.data ?? null);

      // Backend: { success, data: { data: AuditLog[], pagination: {} } }
      // Stub:    { success, data: [], _stub: true }
      const rawLogs = logsRes.data;
      const logsArray = Array.isArray(rawLogs)
        ? rawLogs
        : Array.isArray(rawLogs?.data)
          ? rawLogs.data
          : [];
      setRecentLogs(logsArray.slice(0, 5));
    } catch {
      /* non-critical — page still renders with empty stats */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const m = metrics ?? {};

  return (
    <div className="p-6 space-y-8 max-w-[1400px] mx-auto">

      {/* KPI strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricWidget
          icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 11c1.71 0 3-1.29 3-3s-1.29-3-3-3-3 1.29-3 3 1.29 3 3 3m0-4c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1m1 5h-2c-2.76 0-5 2.24-5 5v.5c0 .83.67 1.5 1.5 1.5h9c.83 0 1.5-.67 1.5-1.5V17c0-2.76-2.24-5-5-5m-5 5c0-1.65 1.35-3 3-3h2c1.65 0 3 1.35 3 3zm-1.5-6c.47 0 .9-.12 1.27-.33a5.03 5.03 0 0 1-.42-4.52C7.09 6.06 6.8 6 6.5 6 5.06 6 4 7.06 4 8.5S5.06 11 6.5 11m-.39 1H5.5C3.57 12 2 13.57 2 15.5v1c0 .28.22.5.5.5H4c0-1.96.81-3.73 2.11-5m11.39-1c1.44 0 2.5-1.06 2.5-2.5S18.94 6 17.5 6c-.31 0-.59.06-.85.15a5.03 5.03 0 0 1-.42 4.52c.37.21.79.33 1.27.33m1 1h-.61A6.97 6.97 0 0 1 20 17h1.5c.28 0 .5-.22.5-.5v-1c0-1.93-1.57-3.5-3.5-3.5" /></svg>}
          label="Total Farmers"
          value={loading ? "…" : (m.totalFarmers ?? 0).toLocaleString()}
        />
        <MetricWidget
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
          label="Total Purchases"
          value={loading ? "…" : (m.totalPurchases ?? 0).toLocaleString()}
        />
        <MetricWidget
          icon={<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3C6.49 3 2 7.49 2 13v6c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-6c0-5.51-4.49-10-10-10m4 12H8v-2h8zm-8 4v-2h8v2zm12 0h-2v-6c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v6H4v-6c0-4.41 3.59-8 8-8s8 3.59 8 8z" /></svg>}
          label="Total Warehouses"
          value={loading ? "…" : m.totalWarehouses ?? 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Purchasing Revenue chart — spans 2 columns */}
        <div className="lg:col-span-2">
          <PurchasingRevenueChart />
        </div>

        {/* Audit log — spans 1 column */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-gray-700">Recent Audit Logs</h3>
          <button onClick={() => router.push("/dashboard/admin/audit-logs")} className="text-xs text-[#1a5c2a] font-semibold hover:underline">View All</button>
        </div>
        <div className="flex flex-col gap-3 flex-1">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-start gap-3 border-b border-gray-50 pb-3 last:border-0">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))
          ) : recentLogs.length === 0 ? (
            <p className="text-xs text-gray-400 text-center pt-8">No audit logs available.<br />Connect a backend to stream events.</p>
          ) : (
            recentLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                <div className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0 bg-gray-300" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-800">
                    {(log.action ?? "").replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {/* Backend includes user.name; fallback to userName for stub data */}
                    {log.user?.name ?? log.userName ?? "System"}
                  </p>
                </div>
                <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                  {(log.createdAt ?? log.timestamp)
                    ? new Date(log.createdAt ?? log.timestamp).toLocaleTimeString()
                    : ""}
                </span>
              </div>
            ))
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { StatCard } from "./Charts";
import { Icons } from "./Icons";
import { useRouter } from "next/navigation";
import { dashboardService } from "@/lib/api/dashboard";

function timeAgo(isoString) {
  if (!isoString) return "";
  const diff  = Date.now() - new Date(isoString).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (days > 0)  return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${mins}m ago`;
}

function fmtTonnes(kg) {
  if (!kg) return "0 t";
  const t = Number(kg) / 1000;
  return t >= 1 ? `${t.toLocaleString(undefined, { maximumFractionDigits: 1 })} t` : `${Number(kg).toLocaleString()} kg`;
}

export default function WarehouseOfficerDashboard({ firstName }) {
  const router = useRouter();

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getWarehouseSummary();
      setSummary(res.data ?? null);
    } catch {
      /* non-critical */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const s = summary ?? {};
  const deliveries = Array.isArray(s.deliveries) ? s.deliveries : [];

  const kpis = [
    {
      title:   "Current Stock",
      value:   loading ? "…" : fmtTonnes(s.totalStockKg),
      trend:   null,
      trendUp: true,
      icon:    Icons.warehouse,
    },
    {
      title:   "Available Capacity",
      value:   loading ? "…" : fmtTonnes(s.availableKg),
      trend:   null,
      trendUp: true,
      icon:    Icons.data,
    },
    {
      title:   "Pending Dispatches",
      value:   loading ? "…" : (s.pendingDispatches ?? 0).toString(),
      trend:   null,
      trendUp: false,
      icon:    Icons.activity,
    },
  ];

  return (
    <div className="p-6 space-y-8 max-w-[1400px] mx-auto">

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpis.map((kpi, idx) => (
          <StatCard key={idx} {...kpi} />
        ))}
      </div>

      {/* ── Recent Deliveries ── */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Recent Activity</h2>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-sm font-semibold text-gray-700">Recent Goods Received</h3>
            <button
              onClick={() => router.push("/dashboard/warehouse")}
              className="flex items-center gap-1.5 bg-[#1a5c2a] hover:bg-[#134520] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Register
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 text-xs font-medium text-gray-500 font-normal pr-4">GRN #</th>
                  <th className="pb-3 text-xs font-medium text-gray-500 font-normal pr-4">Warehouse</th>
                  <th className="pb-3 text-xs font-medium text-gray-500 font-normal pr-4">Commodity</th>
                  <th className="pb-3 text-xs font-medium text-gray-500 font-normal pr-4">Weight</th>
                  <th className="pb-3 text-xs font-medium text-gray-500 font-normal pr-4">Received</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="py-3 pr-4">
                          <div className="animate-pulse h-3 bg-gray-200 rounded w-3/4" />
                        </td>
                      ))}
                      <td />
                    </tr>
                  ))
                ) : deliveries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm text-gray-400">
                      No recent goods received notes.
                    </td>
                  </tr>
                ) : (
                  deliveries.map((d, i) => (
                    <tr key={d.id ?? i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="py-3 pr-4 font-medium text-gray-900 text-sm">{d.id}</td>
                      <td className="py-3 pr-4 text-gray-500 text-sm">{d.origin}</td>
                      <td className="py-3 pr-4 text-gray-500 text-sm">{d.commodity}</td>
                      <td className="py-3 pr-4 text-gray-900 text-sm">{d.weight}</td>
                      <td className="py-3 pr-4 text-gray-400 text-xs">{timeAgo(d.time)}</td>
                      <td className="py-3 text-right">
                        <button className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md" aria-label="More options">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}

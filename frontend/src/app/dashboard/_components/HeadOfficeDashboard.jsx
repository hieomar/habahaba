"use client";

import React, { useState, useEffect, useCallback } from "react";
import { StatCard } from "./Charts";
import { PurchasingRevenueChart } from "./Charts";
import { useRouter } from "next/navigation";
import { dashboardService } from "@/lib/api/dashboard";
import { auditService } from "@/lib/api/audit";

// ── Farmer icon SVG ──────────────────────────────────────────
const FarmerIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 267 186" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M118.439 107.25C119.517 107.196 120.674 107.171 121.767 107.195C135.872 107.505 150.342 106.235 164.347 108.003C165.522 108.139 167.017 109.436 168.047 109.713C172.531 110.916 176.557 112.422 180.668 114.604C181.893 115.254 182.896 116.55 184.096 117.353C190.35 121.538 195.527 127.647 199.856 133.745C202.146 137.204 205.27 145.928 206.671 149.899C207.988 153.639 208.696 163.149 207.212 167.09C206.658 168.559 204.82 171.86 203.937 173.526C196.005 178.454 194.695 177.249 185.818 177.306L158.795 177.257C151.449 177.158 144.048 177.343 136.701 177.291C126.197 177.215 115.799 177.138 105.295 177.223L88.3703 177.303C85.2768 177.314 81.6707 177.453 78.6504 177.083C76.911 176.684 74.2583 174.739 73.0206 173.566C66.2232 167.126 68.5184 154.423 71.1537 146.51C71.7055 144.853 72.0759 143.028 72.7779 141.414C73.4218 139.934 74.3335 138.507 75.029 137.041C76.04 135.014 77.4174 132.325 78.739 130.513C80.4655 128.354 82.4623 126.4 84.3086 124.343C84.8806 123.705 85.5122 123.068 86.1221 122.472C87.0383 121.577 88.2769 120.902 89.2011 120.057C93.205 116.397 97.5864 113.381 102.596 111.276C103.916 110.721 106.177 110.709 107.57 110.173C108.585 109.781 109.828 109.207 110.831 108.749C113.52 107.52 115.527 107.349 118.439 107.25ZM149.536 163.538L181.704 163.513C185.117 163.514 188.537 163.569 191.947 163.403C192.614 163.37 193.253 163.309 193.919 163.378C194.653 149.898 186.134 134.361 174.402 127.674C173.335 127.043 171.96 125.624 170.86 125.167C166.502 123.356 163.19 121.043 158.313 121.091C148.135 121.191 137.639 120.602 127.482 120.878C123.691 121.179 120.082 120.986 116.368 121.454C114.714 121.662 113.606 122.565 112.083 123.118C110.591 123.66 107.576 124.325 106.227 124.982C102.465 126.816 96.2034 131.296 93.6317 134.43C90.9948 137.644 88.148 142.025 86.066 145.62C85.6473 146.343 85.1178 148.313 84.7885 149.162C83.025 153.711 82.5736 157.305 82.7028 162.173C82.7115 162.497 82.7945 162.797 82.9521 163.084C85.409 164.068 106.819 163.505 111.141 163.505L149.536 163.538Z" fill="currentColor"/>
    <path d="M133.203 8.33064C156.342 5.5567 177.344 22.0746 180.101 45.2149C182.858 68.3552 166.325 89.3458 143.183 92.0864C120.065 94.8241 99.1001 78.3115 96.3455 55.1948C93.5911 32.0781 110.089 11.1017 133.203 8.33064ZM118.136 70.4442C125.118 77.281 135.107 80.0806 144.626 77.869C160.087 74.2769 169.668 58.786 165.977 43.3487C162.287 27.9116 146.735 18.4291 131.322 22.2179C121.24 24.6961 113.292 32.4412 110.554 42.4554C107.816 52.4696 110.717 63.1813 118.136 70.4442Z" fill="currentColor"/>
  </svg>
);

const PurchaseIcon = () => (
  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
    <path d="M21 11h-3V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v13c0 1.65 1.35 3 3 3h14c1.65 0 3-1.35 3-3v-6c0-.55-.45-1-1-1M5 19c-.55 0-1-.45-1-1V5h12v13a3 3 0 0 0 .17 1zm15-1c0 .55-.45 1-1 1s-1-.45-1-1v-5h2z"/><path d="M6 7h8v2H6zm0 4h8v2H6zm5 4h3v2h-3z"/>
  </svg>
);

const WarehouseIcon = () => (
  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 3C6.49 3 2 7.49 2 13v6c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-6c0-5.51-4.49-10-10-10m4 12H8v-2h8zm-8 4v-2h8v2zm12 0h-2v-6c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v6H4v-6c0-4.41 3.59-8 8-8s8 3.59 8 8z" />
  </svg>
);

function timeAgo(isoString) {
  if (!isoString) return "";
  const diff = Date.now() - new Date(isoString).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (days > 0)  return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  return `${mins} min${mins !== 1 ? "s" : ""} ago`;
}

// ── Main Component ────────────────────────────────────────────
export default function HeadOfficeDashboard({ firstName }) {
  const router   = useRouter();
  const [metrics,    setMetrics]    = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading,    setLoading]    = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [metricsRes, logsRes] = await Promise.all([
        dashboardService.getMetrics(),
        auditService.list({ limit: 5 }),
      ]);

      setMetrics(metricsRes.data ?? null);

      // Normalise audit log shape (backend vs stub)
      const rawLogs = logsRes.data;
      const logsArr = Array.isArray(rawLogs)
        ? rawLogs
        : Array.isArray(rawLogs?.data)
          ? rawLogs.data
          : [];

      setActivities(
        logsArr.slice(0, 5).map((log) => ({
          action: (log.action ?? "").replace(/_/g, " "),
          detail: log.details ?? log.description ?? `By ${log.user?.name ?? log.userName ?? "System"}`,
          time:   timeAgo(log.createdAt ?? log.timestamp),
        }))
      );
    } catch {
      /* non-critical */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const m = metrics ?? {};

  const kpis = [
    {
      title:   "Farmers",
      value:   loading ? "…" : (m.totalFarmers ?? 0).toLocaleString(),
      trend:   null,
      trendUp: true,
      icon:    <FarmerIcon />,
    },
    {
      title:   "Total Purchases",
      value:   loading ? "…" : (m.totalPurchases ?? 0).toLocaleString(),
      trend:   null,
      trendUp: true,
      icon:    <PurchaseIcon />,
    },
    {
      title:   "Warehouses",
      value:   loading ? "…" : (m.totalWarehouses ?? 0).toLocaleString(),
      trend:   null,
      trendUp: true,
      icon:    <WarehouseIcon />,
    },
  ];

  return (
    <div className="p-6 space-y-8 max-w-[1400px] mx-auto">

      {/* ── KPI Metric Cards ── */}
      <div className="flex flex-wrap gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="flex-1 min-w-[180px]">
            <StatCard {...kpi} />
          </div>
        ))}
      </div>

      {/* ── National Procurement Chart (2/3) + Activity Feed (1/3) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Purchasing Revenue chart — spans 2 columns */}
        <div className="lg:col-span-2">
          <PurchasingRevenueChart />
        </div>

        {/* National Activity feed — spans 1 column */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">National Activity</h3>
            <button
              onClick={() => router.push("/dashboard/reports")}
              className="text-xs text-[#1a5c2a] font-semibold hover:underline"
            >
              View All
            </button>
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
            ) : activities.length === 0 ? (
              <p className="text-xs text-gray-400 text-center pt-8">No recent activity.<br />Connect a backend to stream events.</p>
            ) : (
              activities.map((activity, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 border-b border-gray-50 pb-3 last:border-0 last:pb-0"
                >
                  <div className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0 bg-gray-300" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 capitalize">{activity.action}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{activity.detail}</p>
                  </div>
                  <span className="text-xs text-gray-400 font-medium whitespace-nowrap">{activity.time}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

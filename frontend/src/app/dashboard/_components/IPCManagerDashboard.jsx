"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { StatCard, PeriodPicker } from "./Charts";
import { Icons } from "./Icons";
import { useRouter } from "next/navigation";
import { dashboardService } from "@/lib/api/dashboard";
import { purchasesService } from "@/lib/api/purchases";

const PERIOD_OPTIONS = [
  { value: "7D", label: "7D" },
  { value: "1M", label: "1M" },
  { value: "3M", label: "3M" },
  { value: "6M", label: "6M" },
  { value: "1Y", label: "1Y" },
];

function formatMWK(val) {
  if (val >= 1_000_000) return `MWK ${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000)    return `MWK ${(val / 1_000).toFixed(0)}K`;
  return `MWK ${val}`;
}

function timeAgo(isoString) {
  if (!isoString) return "";
  const diff  = Date.now() - new Date(isoString).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  if (hours > 0) return `${hours}h ago`;
  return `${mins}m ago`;
}

// ── Main Component ────────────────────────────────────────────
export default function IPCManagerDashboard({ firstName }) {
  const router = useRouter();

  const [period, setPeriod]             = useState("7D");
  const [hoveredBar, setHoveredBar]     = useState(null);
  const [chartData, setChartData]       = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [animatedValues, setAnimatedValues] = useState([]);
  const animRef = useRef(null);

  const [metrics,  setMetrics]  = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [kpiLoading, setKpiLoading] = useState(true);

  // Fetch KPIs + recent purchases once
  const fetchKPIs = useCallback(async () => {
    setKpiLoading(true);
    try {
      const [metricsRes, purchasesRes] = await Promise.all([
        dashboardService.getMetrics(),
        purchasesService.list({ limit: 5, sortBy: "createdAt", order: "desc" }),
      ]);

      setMetrics(metricsRes.data ?? null);

      // Normalise purchases shape (backend vs stub)
      const raw = purchasesRes.data;
      const arr = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
          ? raw.data
          : [];
      setPurchases(arr.slice(0, 5));
    } catch {
      /* non-critical */
    } finally {
      setKpiLoading(false);
    }
  }, []);

  useEffect(() => { fetchKPIs(); }, [fetchKPIs]);

  // Fetch chart data whenever period changes
  useEffect(() => {
    let cancelled = false;
    setChartLoading(true);

    dashboardService.getPurchaseTrend(period)
      .then((res) => {
        if (cancelled) return;
        const data = Array.isArray(res.data) ? res.data : [];
        setChartData(data);
      })
      .catch(() => { if (!cancelled) setChartData([]); })
      .finally(() => { if (!cancelled) setChartLoading(false); });

    return () => { cancelled = true; };
  }, [period]);

  // Animate chart bars whenever chartData changes
  useEffect(() => {
    if (!chartData.length) { setAnimatedValues([]); return; }
    const targets = chartData.map((d) => d.value);
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setAnimatedValues(new Array(targets.length).fill(0));
    const duration  = 550;
    const startTime = performance.now();
    function step(now) {
      const t     = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedValues(targets.map((v) => v * eased));
      if (t < 1) animRef.current = requestAnimationFrame(step);
    }
    animRef.current = requestAnimationFrame(step);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [chartData]);

  const m = metrics ?? {};

  // Derive "Today's purchases" as the first period (7D) total count if available
  const kpis = [
    {
      title:   "Total Farmers",
      value:   kpiLoading ? "…" : (m.totalFarmers ?? 0).toLocaleString(),
      trend:   null,
      trendUp: true,
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 267 186" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M118.439 107.25C119.517 107.196 120.674 107.171 121.767 107.195C135.872 107.505 150.342 106.235 164.347 108.003C165.522 108.139 167.017 109.436 168.047 109.713C172.531 110.916 176.557 112.422 180.668 114.604C181.893 115.254 182.896 116.55 184.096 117.353C190.35 121.538 195.527 127.647 199.856 133.745C202.146 137.204 205.27 145.928 206.671 149.899C207.988 153.639 208.696 163.149 207.212 167.09C206.658 168.559 204.82 171.86 203.937 173.526C196.005 178.454 194.695 177.249 185.818 177.306L158.795 177.257C151.449 177.158 144.048 177.343 136.701 177.291C126.197 177.215 115.799 177.138 105.295 177.223L88.3703 177.303C85.2768 177.314 81.6707 177.453 78.6504 177.083C76.911 176.684 74.2583 174.739 73.0206 173.566C66.2232 167.126 68.5184 154.423 71.1537 146.51C71.7055 144.853 72.0759 143.028 72.7779 141.414C73.4218 139.934 74.3335 138.507 75.029 137.041C76.04 135.014 77.4174 132.325 78.739 130.513C80.4655 128.354 82.4623 126.4 84.3086 124.343C84.8806 123.705 85.5122 123.068 86.1221 122.472C87.0383 121.577 88.2769 120.902 89.2011 120.057C93.205 116.397 97.5864 113.381 102.596 111.276C103.916 110.721 106.177 110.709 107.57 110.173C108.585 109.781 109.828 109.207 110.831 108.749C113.52 107.52 115.527 107.349 118.439 107.25Z" fill="currentColor"/>
          <path d="M133.203 8.33064C156.342 5.5567 177.344 22.0746 180.101 45.2149C182.858 68.3552 166.325 89.3458 143.183 92.0864C120.065 94.8241 99.1001 78.3115 96.3455 55.1948C93.5911 32.0781 110.089 11.1017 133.203 8.33064Z" fill="currentColor"/>
        </svg>
      ),
    },
    {
      title:   "Total Purchases",
      value:   kpiLoading ? "…" : (m.totalPurchases ?? 0).toLocaleString(),
      trend:   null,
      trendUp: true,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      title:   "Active IPCs",
      value:   kpiLoading ? "…" : (m.totalIPCs ?? 0).toLocaleString(),
      trend:   null,
      trendUp: true,
      icon: (
        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3C6.49 3 2 7.49 2 13v6c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-6c0-5.51-4.49-10-10-10m4 12H8v-2h8zm-8 4v-2h8v2zm12 0h-2v-6c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v6H4v-6c0-4.41 3.59-8 8-8s8 3.59 8 8z" />
        </svg>
      ),
    },
    {
      title:   "Pending Syncs",
      value:   kpiLoading ? "…" : (m.pendingSyncs ?? 0).toLocaleString(),
      trend:   null,
      trendUp: false,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  // Chart render
  const chartH    = 200;
  const paddingL  = 64;
  const paddingB  = 36;
  const paddingT  = 20;
  const viewBoxW  = 650;
  const n         = chartData.length || 1;
  const available = viewBoxW - paddingL - 10;
  const barW      = Math.max(Math.floor(available / (n + (n - 1) * 0.5)), 4);
  const gap       = Math.floor(barW * 0.5);
  const maxVal    = Math.max(...chartData.map((d) => d.value), 1);
  const yLabels   = [0, 25, 50, 75, 100];

  const periodLabel = PERIOD_OPTIONS.find((o) => o.value === period)?.label || period;

  return (
    <div className="p-6 space-y-8 max-w-[1400px] mx-auto">

      {/* 1. KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => <StatCard key={idx} {...kpi} />)}
      </div>

      {/* 2. Analytics & Workflow */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Analytics &amp; Flow</h2>
          <PeriodPicker value={period} onChange={setPeriod} options={PERIOD_OPTIONS} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ animation: "chartFadeIn 0.35s ease-out" }}>

          {/* Purchase Trend Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Purchase Trend</h3>
            <p className="text-xs text-gray-400 mb-5">
              Procurement count — <span className="font-medium text-gray-600">{periodLabel}</span>
            </p>

            {chartLoading ? (
              <div className="animate-pulse flex items-end gap-2 h-56">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="bg-slate-200 flex-1 rounded-t-md" style={{ height: `${Math.random() * 60 + 20}%` }} />
                ))}
              </div>
            ) : chartData.length === 0 ? (
              <div className="flex items-center justify-center h-56 text-sm text-gray-400">No data for this period.</div>
            ) : (
              <div className="w-full">
                <svg width="100%" viewBox={`0 0 ${viewBoxW} ${chartH + paddingB + paddingT}`} className="block">
                  {yLabels.map((pct) => {
                    const y = paddingT + chartH - (pct / 100) * chartH;
                    return (
                      <g key={pct}>
                        <line x1={paddingL} x2={viewBoxW - 10} y1={y} y2={y} stroke="#f0f0f0" strokeWidth="1" />
                        <text x={paddingL - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#9ca3af">{pct}%</text>
                      </g>
                    );
                  })}
                  {chartData.map((d, i) => {
                    const animVal  = animatedValues[i] ?? 0;
                    const barH     = Math.max((animVal / maxVal) * chartH, 0);
                    const x        = paddingL + i * (barW + gap);
                    const y        = paddingT + chartH - barH;
                    const isHov    = hoveredBar === i;
                    const isHigh   = d.value === maxVal;
                    const pid      = `diag-ipc-${period}-${i}`;
                    return (
                      <g key={d.label} onMouseEnter={() => setHoveredBar(i)} onMouseLeave={() => setHoveredBar(null)} style={{ cursor: "pointer" }}>
                        <defs>
                          <pattern id={pid} patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                            <rect width="8" height="8" fill="#1a5c2a" />
                            <line x1="0" y1="0" x2="0" y2="8" stroke="#134520" strokeWidth="3" />
                          </pattern>
                        </defs>
                        <rect x={x} y={y} width={barW} height={barH} rx="6" ry="6"
                          fill={isHov || isHigh ? `url(#${pid})` : "#e8f5e9"} />
                        {isHov && (
                          <g>
                            <rect x={x + barW / 2 - 22} y={y - 38} width={44} height={26} rx="6"
                              fill="white" stroke="#e5e7eb" strokeWidth="1"
                              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.08))" />
                            <text x={x + barW / 2} y={y - 20} textAnchor="middle" fontSize="11" fontWeight="600" fill="#111827">
                              {d.value}
                            </text>
                            <circle cx={x + barW / 2} cy={y} r={4} fill="white" stroke="#1a5c2a" strokeWidth="2" />
                          </g>
                        )}
                        <text x={x + barW / 2} y={paddingT + chartH + paddingB - 12} textAnchor="middle" fontSize="12"
                          fontWeight={isHov || isHigh ? "700" : "400"}
                          fill={isHov || isHigh ? "#1a5c2a" : "#9ca3af"}>
                          {d.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}
          </div>

          {/* Latest IPC Operations */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-gray-700">Latest IPC Operations</h3>
              <button onClick={() => router.push("/dashboard/purchasing")} className="text-xs font-semibold text-[#1a5c2a] hover:underline">
                View Full Logs →
              </button>
            </div>

            {kpiLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex gap-4 items-start border-b border-gray-50 pb-4">
                    <div className="w-9 h-9 rounded-lg bg-gray-200 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : purchases.length === 0 ? (
              <p className="text-xs text-gray-400 text-center pt-8">No recent purchases found.</p>
            ) : (
              <div className="space-y-4">
                {purchases.map((p, i) => {
                  const farmerName = p.farmer
                    ? `${p.farmer.firstName ?? ""} ${p.farmer.lastName ?? ""}`.trim()
                    : (p.farmerName ?? "Unknown Farmer");
                  const commodity  = p.commodity?.name ?? p.commodity ?? "—";
                  const weightKg   = Number(p.quantityKg ?? p.quantity_kg ?? 0);
                  const weightStr  = weightKg >= 1000
                    ? `${(weightKg / 1000).toFixed(1)} t`
                    : `${weightKg.toLocaleString()} kg`;

                  return (
                    <div key={p.id ?? i} className="flex gap-4 items-start border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                      <div className="w-9 h-9 rounded-lg bg-[#e8f1ea] flex items-center justify-center text-[#1a5c2a] flex-shrink-0 mt-0.5">
                        {Icons.purchase}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">Purchase: {commodity}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {farmerName} supplied {weightStr} ({p.purchaseRef ?? p.id ?? "—"})
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{timeAgo(p.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}

"use client";

import React from "react";
import { dashboardService } from "@/lib/api/dashboard";

// ── Period Picker ────────────────────────────────────────────
export function PeriodPicker({ value, onChange, options }) {
  return (
    <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={[
            "px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200",
            value === opt.value
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700",
          ].join(" ")}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── Bar Chart ────────────────────────────────────────────────
export function BarChart({ data, height = "h-56" }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={`flex items-end gap-2 sm:gap-4 ${height} w-full pt-6`}>
      {data.map((item, i) => {
        const percentage = (item.value / max) * 100;
        return (
          <div key={i} className="flex flex-col items-center flex-1 group h-full justify-end">
            <div className="relative w-full flex justify-center items-end h-full">
              <div
                className={`w-full max-w-[48px] rounded-t-md ${item.color || "bg-[#1a5c2a]"} group-hover:opacity-80 relative`}
                style={{
                  height: `${percentage}%`,
                  minHeight: "4px",
                  transformOrigin: "bottom center",
                  animation: `barGrowUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${i * 50}ms both`,
                }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-white border border-gray-200 text-gray-900 text-xs px-2 py-1 rounded-lg shadow-sm pointer-events-none transition-opacity whitespace-nowrap z-10">
                  {item.tooltip || item.value}
                </div>
              </div>
            </div>
            <span className="text-xs text-gray-500 mt-2 truncate w-full text-center font-medium">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Horizontal Bar Chart ─────────────────────────────────────
export function HorizontalBarChart({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-4">
      {data.map((item, i) => {
        const percentage = (item.value / max) * 100;
        return (
          <div key={i} className="group">
            <div className="flex justify-between items-end mb-1.5">
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
              <span className="text-sm font-bold text-gray-900">
                {item.displayValue || item.value}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className={`${item.color || "bg-[#1a5c2a]"} h-full rounded-full`}
                style={{
                  width: `${percentage}%`,
                  transformOrigin: "left center",
                  animation: `barSlideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${i * 80}ms both`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Progress Chart ───────────────────────────────────────────
export function ProgressChart({ label, value, max, color = "bg-[#1a5c2a]" }) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div className="mb-5">
      <div className="flex justify-between items-end mb-1.5">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <span className="text-sm font-bold text-gray-900">
          {value} / {max}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className={`${color} h-full rounded-full`}
          style={{
            width: `${percentage}%`,
            transformOrigin: "left center",
            animation: "barSlideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) both",
          }}
        />
      </div>
    </div>
  );
}

// ── Purchasing Revenue Chart (admin-style SVG bar chart) ──────
function formatMWK(val) {
  if (val >= 1000000) return `MWK ${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000)    return `MWK ${(val / 1000).toFixed(0)}K`;
  return `MWK ${val}`;
}

export function PurchasingRevenueChart() {
  const [hoveredIdx, setHoveredIdx] = React.useState(null);
  const [period, setPeriod]         = React.useState(new Date().getFullYear().toString());
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [yearlyData, setYearlyData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [animatedValues, setAnimatedValues] = React.useState([]);
  const animRef      = React.useRef(null);
  
  React.useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await dashboardService.getRevenue();
        const data = res.data || {};
        setYearlyData(data);
        const availableYears = Object.keys(data).sort((a, b) => b - a);
        if (availableYears.length > 0 && !availableYears.includes(period)) {
          setPeriod(availableYears[0]);
        }
      } catch (error) {
        console.error("Failed to fetch revenue data", error);
        setYearlyData({});
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const periodOptions = yearlyData ? Object.keys(yearlyData).sort((a, b) => b - a) : [];

  React.useEffect(() => {
    if (!yearlyData || !yearlyData[period]) return;
    const targets = yearlyData[period].map(d => d.value);
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setAnimatedValues(new Array(12).fill(0));
    const duration  = 550;
    const startTime = performance.now();
    function step(now) {
      const t     = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedValues(targets.map(v => v * eased));
      if (t < 1) animRef.current = requestAnimationFrame(step);
    }
    animRef.current = requestAnimationFrame(step);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [period, yearlyData]);

  if (loading || !yearlyData) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-center min-h-[300px]">
        <div className="animate-pulse flex flex-col space-y-4 w-full h-full justify-end">
          <div className="flex space-x-4 h-full items-end justify-between px-8">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-slate-200 w-8 rounded-t-md" style={{ height: `${Math.random() * 60 + 20}%` }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const targetData = yearlyData[period] || [];
  const maxVal     = Math.max(...targetData.map(d => d.value), 1);
  const chartH     = 200;
  const barW       = 36;
  const gap        = 18;
  const paddingL   = 64;
  const paddingB   = 36;
  const paddingT   = 20;
  const totalW     = paddingL + Math.max(targetData.length, 12) * (barW + gap) - gap + 20;
  const yLabels    = [0, 25, 50, 75, 100];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">Monthly Purchasing Revenue</h3>
          <p className="text-xs text-gray-400 mt-0.5">Total grain purchase spend per month</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg px-3 py-1.5 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
          >
            {period}
            <svg className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div className={`absolute right-0 mt-1 w-24 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden transition-all duration-200 origin-top z-10 ${dropdownOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}>
            {periodOptions.map(opt => (
              <button
                key={opt}
                onClick={() => { setPeriod(opt); setDropdownOpen(false); }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${period === opt ? "bg-[#e8f1ea] text-[#1a5c2a] font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full">
        <svg width="100%" viewBox={`0 0 ${totalW - 20} ${chartH + paddingB + paddingT}`} className="block">
          {yLabels.map((pct) => {
            const y = paddingT + chartH - (pct / 100) * chartH;
            return (
              <g key={pct}>
                <line x1={paddingL} x2={totalW - 10} y1={y} y2={y} stroke="#f0f0f0" strokeWidth="1" />
                <text x={paddingL - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#9ca3af">{pct}%</text>
              </g>
            );
          })}

          {targetData.map((d, i) => {
            const animVal  = animatedValues[i] ?? 0;
            const barH     = Math.max((animVal / maxVal) * chartH, 0);
            const x        = paddingL + i * (barW + gap);
            const y        = paddingT + chartH - barH;
            const isHovered  = hoveredIdx === i;
            const isHighest  = d.value === maxVal;
            const patternId  = `diag-${period}-${i}`;

            return (
              <g key={d.month} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)} style={{ cursor: "pointer" }}>
                <defs>
                  <pattern id={patternId} patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                    <rect width="8" height="8" fill="#1a5c2a" />
                    <line x1="0" y1="0" x2="0" y2="8" stroke="#134520" strokeWidth="3" />
                  </pattern>
                </defs>

                <rect
                  x={x} y={y} width={barW} height={barH}
                  rx="6" ry="6"
                  fill={isHovered || isHighest ? `url(#${patternId})` : "#e8f5e9"}
                />

                {isHovered && (
                  <g>
                    <rect x={x + barW / 2 - 52} y={y - 38} width={104} height={26} rx="6" fill="white" stroke="#e5e7eb" strokeWidth="1" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.08))" />
                    <text x={x + barW / 2} y={y - 20} textAnchor="middle" fontSize="11" fontWeight="600" fill="#111827">{formatMWK(d.value)}</text>
                    <circle cx={x + barW / 2} cy={y} r={4} fill="white" stroke="#1a5c2a" strokeWidth="2" />
                  </g>
                )}

                <text
                  x={x + barW / 2} y={paddingT + chartH + paddingB - 12}
                  textAnchor="middle" fontSize="12"
                  fontWeight={isHovered || isHighest ? "700" : "400"}
                  fill={isHovered || isHighest ? "#1a5c2a" : "#9ca3af"}
                >
                  {d.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ── Stat Card ────────────────────────────────────────────────
export function StatCard({ title, value, trend, icon, trendUp = true }) {
  return (
    <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-4 flex flex-col justify-between h-full min-h-[110px] gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 min-w-0">
          {icon}
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate">{title}</p>
        </div>
        {trend && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <svg className={`w-3.5 h-3.5 ${trendUp ? "text-[#1a5c2a]" : "text-red-500"}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={trendUp ? "M7 17L17 7M17 7H7M17 7v10" : "M7 7l10 10M17 17H7M17 17V7"} />
            </svg>
            <span className={`text-xs font-semibold ${trendUp ? "text-[#1a5c2a]" : "text-red-600"}`}>{trend}</span>
          </div>
        )}
      </div>
      <p className="text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap overflow-hidden text-ellipsis">{value}</p>
    </div>
  );
}

// ── Module Action Card ───────────────────────────────────────
export function ModuleActionCard({ icon, title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md text-left group flex flex-col h-full w-full"
    >
      <div className="flex items-start justify-between w-full mb-4">
        <div className="w-9 h-9 rounded-lg bg-[#e8f1ea] flex items-center justify-center text-[#1a5c2a] flex-shrink-0 transition-transform group-hover:scale-110 duration-300">
          {icon}
        </div>
        <div className="text-gray-300 group-hover:text-[#1a5c2a] transition-colors mt-0.5">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
      <div className="flex-1 w-full">
        <h3 className="font-semibold text-gray-900 text-sm group-hover:text-[#1a5c2a] transition-colors leading-tight">{title}</h3>
        <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{description}</p>
      </div>
    </button>
  );
}

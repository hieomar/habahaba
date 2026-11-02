"use client";

import { useState } from "react";

// ═══════════════════════════════════════════════════════════════
// 1. BAR CHART COMPONENT
// ═══════════════════════════════════════════════════════════════
export function BarChart({ title, subtitle, data, height = 220, barColor = "#1a5c2a" }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const chartHeight = height - 60; // Leave room for top values and bottom labels

  return (
    <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#1a5c2a] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
          Bar Trend
        </span>
      </div>

      {/* Chart Canvas */}
      <div className="relative w-full" style={{ height: `${chartHeight}px` }}>
        {/* Horizontal Background Gridlines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 dark:opacity-10">
          <div className="border-b border-gray-400 w-full" />
          <div className="border-b border-gray-400 w-full" />
          <div className="border-b border-gray-400 w-full" />
        </div>

        {/* Bars Container */}
        <div className="h-full flex items-end justify-between gap-2 pt-6">
          {data.map((item, idx) => {
            const barHeightPercent = Math.round((item.value / maxValue) * 100);
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Tooltip on Hover */}
                {isHovered && (
                  <div className="absolute -top-10 z-20 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-2 py-1 rounded text-[10px] font-bold shadow-lg whitespace-nowrap animate-fade-in">
                    {item.label}: {item.value.toLocaleString()} {item.unit ?? "kg"}
                  </div>
                )}

                {/* Value Label above Bar */}
                <span className={`text-[10px] font-semibold mb-1 transition-colors ${isHovered ? "text-[#1a5c2a] dark:text-emerald-400 font-bold" : "text-gray-400"}`}>
                  {item.value >= 1000 ? `${(item.value / 1000).toFixed(1)}k` : item.value}
                </span>

                {/* Animated SVG Bar */}
                <div className="w-full max-w-[40px] bg-gray-100 dark:bg-[#252525] rounded-t-lg overflow-hidden h-full flex items-end">
                  <div
                    className="w-full rounded-t-lg transition-all duration-500 ease-out"
                    style={{
                      height: `${barHeightPercent}%`,
                      backgroundColor: item.color ?? barColor,
                      opacity: hoveredIdx !== null && !isHovered ? 0.6 : 1,
                      transform: isHovered ? "scaleY(1.03)" : "scaleY(1)",
                      transformOrigin: "bottom",
                    }}
                  />
                </div>

                {/* Bottom X-Axis Label */}
                <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-2 truncate w-full text-center">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 2. SMOOTH AREA / LINE CHART COMPONENT
// ═══════════════════════════════════════════════════════════════
export function AreaLineChart({ title, subtitle, data, height = 220, lineColor = "#1a5c2a" }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const values = data.map((d) => d.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const width = 500;
  const h = 140;
  const padding = 20;

  // Convert data points to SVG coordinates
  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = h - padding - ((d.value - min) / range) * (h - padding * 2);
    return { x, y, ...d };
  });

  // Construct SVG Path
  const pathD = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x},${pt.y}`;
    const prev = arr[i - 1];
    const cx = (prev.x + pt.x) / 2;
    return `${acc} C ${cx},${prev.y} ${cx},${pt.y} ${pt.x},${pt.y}`;
  }, "");

  // Closed Path for Area Gradient Fill
  const areaD = `${pathD} L ${points[points.length - 1].x},${h} L ${points[0].x},${h} Z`;

  return (
    <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#1a5c2a] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
          Area Graph
        </span>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${h}`} className="w-full overflow-visible">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.35" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1={h - padding} x2={width} y2={h - padding} stroke="#e5e7eb" strokeDasharray="3,3" className="dark:stroke-[#333]" />
          <line x1="0" y1={h / 2} x2={width} y2={h / 2} stroke="#e5e7eb" strokeDasharray="3,3" className="dark:stroke-[#333]" />

          {/* Area Fill */}
          <path d={areaD} fill="url(#areaGradient)" />

          {/* Line Path */}
          <path d={pathD} fill="none" stroke={lineColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Interactive Points */}
          {points.map((pt, i) => (
            <g
              key={i}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredIdx === i ? "6" : "4"}
                fill={hoveredIdx === i ? "#ffffff" : lineColor}
                stroke={lineColor}
                strokeWidth="2.5"
                className="transition-all duration-200"
              />
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Popup */}
        {hoveredIdx !== null && (
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-1 rounded shadow-md text-xs font-bold pointer-events-none"
          >
            {data[hoveredIdx].label}: {data[hoveredIdx].value.toLocaleString()} {data[hoveredIdx].unit ?? "kg"}
          </div>
        )}

        {/* X-Axis Labels */}
        <div className="flex justify-between mt-2 px-1">
          {data.map((d, i) => (
            <span key={i} className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
              {d.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 3. DONUT / PIE ALLOCATION CHART COMPONENT
// ═══════════════════════════════════════════════════════════════
export function DonutChart({ title, subtitle, data, centerLabel = "Total", centerValue }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const total = data.reduce((acc, d) => acc + d.value, 0);
  const displayTotal = centerValue ?? total.toLocaleString();

  // Compute donut segment angles
  let accumulatedAngle = 0;
  const segments = data.map((d) => {
    const percentage = total > 0 ? d.value / total : 0;
    const strokeDasharray = `${percentage * 283} 283`;
    const strokeDashoffset = -accumulatedAngle * 283;
    accumulatedAngle += percentage;
    return { ...d, percentage: Math.round(percentage * 100), strokeDasharray, strokeDashoffset };
  });

  return (
    <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-5 flex flex-col justify-between">
      <div className="mb-3">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
        {/* SVG Donut Circle */}
        <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 transform">
            <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="10" className="dark:stroke-[#252525]" />
            {segments.map((seg, idx) => (
              <circle
                key={idx}
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={seg.color}
                strokeWidth={hoveredIdx === idx ? "12" : "10"}
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            ))}
          </svg>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{centerLabel}</span>
            <span className="text-base font-extrabold text-gray-900 dark:text-white">{displayTotal}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2 w-full max-w-[200px]">
          {segments.map((seg, idx) => (
            <div
              key={idx}
              className={`flex items-center justify-between p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                hoveredIdx === idx ? "bg-gray-50 dark:bg-[#252525] font-bold" : ""
              }`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="text-gray-700 dark:text-gray-300 truncate">{seg.label}</span>
              </div>
              <span className="font-mono font-semibold text-gray-900 dark:text-white ml-2">{seg.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 4. HORIZONTAL BAR RANKING CHART
// ═══════════════════════════════════════════════════════════════
export function HorizontalBarChart({ title, subtitle, data }) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-5">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="space-y-3">
        {data.map((item, idx) => {
          const widthPercent = Math.round((item.value / max) * 100);
          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-gray-800 dark:text-gray-200">{item.label}</span>
                <span className="font-mono text-[#1a5c2a] dark:text-emerald-400">
                  {item.value.toLocaleString()} {item.unit ?? "kg"}
                </span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 dark:bg-[#252525] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: item.color ?? "#1a5c2a",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

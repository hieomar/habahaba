"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { mockFarms } from "@/lib/mockFarms";

const CROPS = ["All", "Maize", "Soya", "Groundnuts", "Cotton", "Pigeon Peas"];
const DISTRICTS = ["All", "Lilongwe", "Mchinji", "Kasungu"];

function Badge({ label, color = "gray" }) {
  const c = {
    green:  "bg-emerald-50 text-emerald-800 border border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/40",
    blue:   "bg-gray-100 text-gray-800 border border-gray-200 dark:bg-[#282828] dark:text-gray-200 dark:border-[#383838]",
    amber:  "bg-gray-100 text-gray-700 border border-gray-200 dark:bg-[#282828] dark:text-gray-300 dark:border-[#383838]",
    gray:   "bg-gray-100 text-gray-600 dark:bg-[#252525] dark:text-gray-400 border border-gray-200 dark:border-[#333]",
    purple: "bg-gray-100 text-gray-700 dark:bg-[#252525] dark:text-gray-300 border border-gray-200 dark:border-[#333]",
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium ${c[color] ?? c.gray}`}>{label}</span>;
}

export default function FarmManagementPage() {
  const [search, setSearch] = useState("");
  const [cropFilter, setCropFilter] = useState("All");
  const [districtFilter, setDistrictFilter] = useState("All");
  const [selectedFarm, setSelectedFarm] = useState(null);

  const filtered = useMemo(() => {
    return mockFarms.filter((f) => {
      const matchSearch =
        !search ||
        f.farmerName.toLowerCase().includes(search.toLowerCase()) ||
        f.farmerId.toLowerCase().includes(search.toLowerCase()) ||
        f.village.toLowerCase().includes(search.toLowerCase());
      const matchCrop = cropFilter === "All" || f.primaryCrop === cropFilter || f.secondaryCrop === cropFilter;
      const matchDistrict = districtFilter === "All" || f.district === districtFilter;
      return matchSearch && matchCrop && matchDistrict;
    });
  }, [search, cropFilter, districtFilter]);

  const totalHectares = mockFarms.reduce((s, f) => s + f.sizeHectares, 0);
  const totalEstimate = mockFarms.reduce((s, f) => s + f.productionEstimateKg, 0);

  const tableRef = useRef(null);

  const exportCSV = () => {
    const esc = (v) => { const s = String(v ?? ""); return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s; };
    const headers = ["Farm ID", "Farmer", "Farmer ID", "District", "Village", "Primary Crop", "Secondary Crop", "Area (ha)", "Est. Production (kg)", "Irrigated", "Last Visit", "Status"];
    const rows = filtered.map((f) => [f.id, f.farmerName, f.farmerId, f.district, f.village, f.primaryCrop, f.secondaryCrop ?? "", f.sizeHectares, f.productionEstimateKg, f.irrigated ? "Yes" : "No", f.lastInspectionDate ?? "", f.status]);
    const csv = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `GTMS_Farm_Records_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const printTable = () => {
    if (!tableRef.current) return;
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head><title>Farm Records</title><style>*{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}body{padding:20px;color:#111}h2{font-size:13px;font-weight:700;margin-bottom:4px}p{font-size:10px;color:#555;margin-bottom:14px}table{width:100%;border-collapse:collapse;font-size:11px}th{text-align:left;padding:7px 10px;font-size:10px;font-weight:700;text-transform:uppercase;color:#555;border-bottom:1px solid #e5e7eb;background:#f3f4f6}td{padding:6px 10px;border-bottom:1px solid #f0f0f0;color:#333}</style></head><body><h2>Farm Management Records</h2><p>NASFAM GTMS — Printed: ${new Date().toLocaleString("en-GB")} — ${filtered.length} records</p>${tableRef.current.innerHTML}</body></html>`);
    doc.close(); iframe.contentWindow.focus(); iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Farm Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">View and manage registered farm records across all IPCs</p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <button onClick={printTable}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-[#333] rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1f1f1f] hover:bg-gray-50 dark:hover:bg-[#282828] hover:border-[#1a5c2a] dark:hover:border-emerald-600 hover:text-[#1a5c2a] dark:hover:text-emerald-400 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 group">
            <svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
          <button onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-[#333] rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1f1f1f] hover:bg-gray-50 dark:hover:bg-[#282828] hover:border-[#1a5c2a] dark:hover:border-emerald-600 hover:text-[#1a5c2a] dark:hover:text-emerald-400 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 group">
            <svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Farms",          value: mockFarms.length,             color: "green",  unit: ""   },
          { label: "Total Area",           value: totalHectares.toFixed(1),     color: "blue",   unit: " ha"},
          { label: "Production Estimate",  value: `${(totalEstimate/1000).toFixed(1)}MT`, color: "amber", unit: "" },
          { label: "Irrigated Farms",      value: mockFarms.filter(f=>f.irrigated).length, color: "purple", unit: "" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{s.value}{s.unit}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by farmer, ID or village…"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]/30"
          />
        </div>
        <select value={cropFilter} onChange={(e) => setCropFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-700 dark:text-gray-300 focus:outline-none">
          {CROPS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-700 dark:text-gray-300 focus:outline-none">
          {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <span className="self-center text-xs text-gray-400 dark:text-gray-500">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* ── Table ── */}
      <div ref={tableRef} className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#222]">
                {["Farm ID", "Farmer", "District / Village", "Primary Crop", "Area (ha)", "Est. Production", "Irrigated", "Last Visit", "Status", ""].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-sm text-gray-400">No farms match your filters.</td></tr>
              ) : filtered.map((farm) => (
                <tr
                  key={farm.id}
                  className="border-b border-gray-50 dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#222] transition-colors cursor-pointer"
                  onClick={() => setSelectedFarm(farm)}
                >
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{farm.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-800 dark:text-white">{farm.farmerName}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{farm.farmerId}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700 dark:text-gray-300">{farm.district}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{farm.village}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge label={farm.primaryCrop} color="green" />
                    {farm.secondaryCrop && <span className="ml-1"><Badge label={farm.secondaryCrop} color="blue" /></span>}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-medium">{farm.sizeHectares}</td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{farm.productionEstimateKg.toLocaleString()} kg</td>
                  <td className="px-4 py-3">
                    {farm.irrigated
                      ? <Badge label="Yes" color="blue" />
                      : <Badge label="No" color="gray" />}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">{farm.lastVisit}</td>
                  <td className="px-4 py-3"><Badge label={farm.status} color="green" /></td>
                  <td className="px-4 py-3">
                    <button onClick={(e) => { e.stopPropagation(); setSelectedFarm(farm); }}
                      className="text-xs text-[#1a5c2a] dark:text-emerald-400 font-semibold hover:underline whitespace-nowrap">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Detail Drawer/Modal ── */}
      {selectedFarm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end" onClick={() => setSelectedFarm(null)}>
          <div
            className="w-full max-w-lg bg-white dark:bg-[#1c1c1c] h-full overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#2a2a2a] sticky top-0 bg-white dark:bg-[#1c1c1c]">
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white">{selectedFarm.id}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{selectedFarm.farmerName}</p>
              </div>
              <button onClick={() => setSelectedFarm(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Farm Info */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Farm Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Farmer ID",   selectedFarm.farmerId],
                    ["District",    selectedFarm.district],
                    ["Village",     selectedFarm.village],
                    ["IPC",         selectedFarm.ipc],
                    ["Association", selectedFarm.association],
                    ["Club",        selectedFarm.club],
                    ["Area",        `${selectedFarm.sizeHectares} ha`],
                    ["Soil Type",   selectedFarm.soilType],
                    ["Irrigated",   selectedFarm.irrigated ? "Yes" : "No"],
                    ["Season",      selectedFarm.season],
                  ].map(([label, val]) => (
                    <div key={label} className="bg-gray-50 dark:bg-[#252525] rounded-lg p-3">
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white mt-0.5">{val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Crops */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Crops</h3>
                <div className="flex gap-2 flex-wrap">
                  <Badge label={selectedFarm.primaryCrop} color="green" />
                  {selectedFarm.secondaryCrop && <Badge label={selectedFarm.secondaryCrop} color="blue" />}
                </div>
              </div>

              {/* Production */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Production Estimate</h3>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{selectedFarm.productionEstimateKg.toLocaleString()} kg</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">{selectedFarm.season} Season</p>
                </div>
              </div>

              {/* GPS */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">GPS Coordinates</h3>
                <div className="flex gap-3">
                  <div className="flex-1 bg-gray-50 dark:bg-[#252525] rounded-lg p-3 text-center">
                    <p className="text-[10px] text-gray-400">Latitude</p>
                    <p className="font-mono text-sm font-semibold text-gray-800 dark:text-white mt-0.5">{selectedFarm.gpsLat}</p>
                  </div>
                  <div className="flex-1 bg-gray-50 dark:bg-[#252525] rounded-lg p-3 text-center">
                    <p className="text-[10px] text-gray-400">Longitude</p>
                    <p className="font-mono text-sm font-semibold text-gray-800 dark:text-white mt-0.5">{selectedFarm.gpsLng}</p>
                  </div>
                </div>
              </div>

              {/* Extension Notes */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">Extension Notes</h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-300">{selectedFarm.extensionNotes}</p>
                  <p className="text-xs text-blue-500 dark:text-blue-400 mt-2">Last visit: {selectedFarm.lastVisit}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

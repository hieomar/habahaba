"use client";

import { useState, useRef } from "react";
import {
  mockIPCs,
  mockWarehouses,
  mockAssociations,
  mockClubs,
  mockCommodities,
  mockDistricts,
  mockMarketingCentres,
} from "@/lib/mockMasterData";

const TABLES = {
  ipcs: { label: "IPCs", data: mockIPCs, headers: ["ID", "Name", "District", "Region", "Manager", "Status"] },
  warehouses: { label: "Warehouses", data: mockWarehouses, headers: ["ID", "Name", "IPC", "District", "Location", "Capacity (MT)", "Status"] },
  associations: { label: "Associations", data: mockAssociations, headers: ["ID", "Name", "IPC", "Chairperson", "Club Count", "Status"] },
  clubs: { label: "Clubs", data: mockClubs, headers: ["ID", "Name", "Association", "IPC", "Farmer Count", "Status"] },
  commodities: { label: "Commodities", data: mockCommodities, headers: ["ID", "Name", "Code", "Unit", "Min/Max Grade Kg", "Moisture %", "Status"] },
  districts: { label: "Districts", data: mockDistricts, headers: ["ID", "Name", "Region", "IPC Count"] },
  centres: { label: "Marketing Centres", data: mockMarketingCentres, headers: ["ID", "Name", "District", "IPC", "Officer", "Status"] },
};

function Badge({ label, color = "gray" }) {
  const c = {
    green:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    blue:   "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    amber:  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    gray:   "bg-gray-100 text-gray-600 dark:bg-[#2a2a2a] dark:text-gray-400",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${c[color] ?? c.gray}`}>
      {label}
    </span>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-4">
      <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
      <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
  );
}

export default function MasterDataPage() {
  const [activeTab, setActiveTab] = useState("ipcs");
  const current = TABLES[activeTab];
  const tableRef = useRef(null);

  // ── CSV Export ──
  const handleExportCSV = () => {
    const esc = (v) => { const s = String(v ?? ""); return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s; };
    const headers = current.headers;
    const rows = current.data.map((row) => Object.values(row));
    const csv = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `GTMS_MasterData_${current.label}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  // ── Targeted Print ──
  const handlePrint = () => {
    if (!tableRef.current) return;
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>NASFAM GTMS Master Data — ${current.label}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
            body { padding: 24px; color: #111; background: #fff; }
            h2 { font-size: 14px; font-weight: 700; margin-bottom: 4px; color: #1a5c2a; }
            p { font-size: 11px; color: #555; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th { text-align: left; padding: 8px 10px; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #555; border-bottom: 1px solid #e5e7eb; background: #f3f4f6; }
            td { padding: 7px 10px; border-bottom: 1px solid #f0f0f0; color: #333; }
          </style>
        </head>
        <body>
          <h2>NASFAM Master Reference Table — ${current.label}</h2>
          <p>Printed: ${new Date().toLocaleString("en-GB")} — ${current.data.length} records</p>
          ${tableRef.current.innerHTML}
        </body>
      </html>
    `);
    doc.close(); iframe.contentWindow.focus(); iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Master Data Module</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Reference lookup tables and baseline configuration data.</p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-[#333] rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1f1f1f] hover:bg-gray-50 dark:hover:bg-[#282828] hover:border-[#1a5c2a] dark:hover:border-emerald-600 hover:text-[#1a5c2a] dark:hover:text-emerald-400 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 group">
            <svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
          <button onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-[#333] rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1f1f1f] hover:bg-gray-50 dark:hover:bg-[#282828] hover:border-[#1a5c2a] dark:hover:border-emerald-600 hover:text-[#1a5c2a] dark:hover:text-emerald-400 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 group">
            <svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Master Data Tables" value={Object.keys(TABLES).length} />
        <StatCard label="Configured IPC Hubs" value={mockIPCs.length} />
        <StatCard label="Configured Warehouses" value={mockWarehouses.length} />
        <StatCard label="Marketing Intake Hubs" value={mockMarketingCentres.length} />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-gray-100 dark:bg-[#1c1c1c] border border-gray-200 dark:border-[#2a2a2a] p-1.5 rounded-xl">
        {Object.entries(TABLES).map(([key, value]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === key ? "bg-white dark:bg-[#252525] text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
          >
            {value.label} ({value.data.length})
          </button>
        ))}
      </div>

      {/* Table */}
      <div ref={tableRef} className="bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-[#2a2a2a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#222]">
                {current.headers.map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeTab === "ipcs" && current.data.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-[#1a5c2a] dark:text-emerald-400">{row.id}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white">{row.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.district}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.region}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{row.manager}</td>
                  <td className="px-4 py-3"><Badge label={row.status} color="green" /></td>
                </tr>
              ))}
              {activeTab === "warehouses" && current.data.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-[#1a5c2a] dark:text-emerald-400">{row.id}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white">{row.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.ipc}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.district}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{row.location}</td>
                  <td className="px-4 py-3 font-semibold font-mono text-gray-900 dark:text-white">{row.capacityMT} MT</td>
                  <td className="px-4 py-3"><Badge label={row.status} color="green" /></td>
                </tr>
              ))}
              {activeTab === "associations" && current.data.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-[#1a5c2a] dark:text-emerald-400">{row.id}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white">{row.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.ipc}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.chairperson}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{row.clubCount}</td>
                  <td className="px-4 py-3"><Badge label={row.status} color="green" /></td>
                </tr>
              ))}
              {activeTab === "clubs" && current.data.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-[#1a5c2a] dark:text-emerald-400">{row.id}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white">{row.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.association}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.ipc}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{row.farmerCount}</td>
                  <td className="px-4 py-3"><Badge label={row.status} color="green" /></td>
                </tr>
              ))}
              {activeTab === "commodities" && current.data.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-[#1a5c2a] dark:text-emerald-400">{row.id}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white">{row.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{row.code}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.unit}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{row.minGradeKg}kg - {row.maxGradeKg}kg</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">{row.moistureMaxPercent}%</td>
                  <td className="px-4 py-3"><Badge label={row.status} color="green" /></td>
                </tr>
              ))}
              {activeTab === "districts" && current.data.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-[#1a5c2a] dark:text-emerald-400">{row.id}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white">{row.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.region}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{row.ipcCount}</td>
                </tr>
              ))}
              {activeTab === "centres" && current.data.map((row) => (
                <tr key={row.id} className="border-b border-gray-50 dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-[#1a5c2a] dark:text-emerald-400">{row.id}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white">{row.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.district}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.ipc}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{row.marketingOfficer}</td>
                  <td className="px-4 py-3"><Badge label={row.status} color="green" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

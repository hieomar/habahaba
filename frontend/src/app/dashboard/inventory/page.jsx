"use client";

import { useState, useMemo, useRef } from "react";
import { mockInventory, mockStockMovements } from "@/lib/mockWarehouseOps";
import { useAuth } from "@/auth/authContext";

function Badge({ label, color = "gray" }) {
  const c = {
    green:  "bg-emerald-50 text-emerald-800 border border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/40",
    blue:   "bg-gray-100 text-gray-800 border border-gray-200 dark:bg-[#282828] dark:text-gray-200 dark:border-[#383838]",
    amber:  "bg-gray-100 text-gray-700 border border-gray-200 dark:bg-[#282828] dark:text-gray-300 dark:border-[#383838]",
    gray:   "bg-gray-100 text-gray-600 dark:bg-[#252525] dark:text-gray-400 border border-gray-200 dark:border-[#333]",
    purple: "bg-gray-100 text-gray-700 dark:bg-[#252525] dark:text-gray-300 border border-gray-200 dark:border-[#333]",
    red:    "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900/40",
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium ${c[color] ?? c.gray}`}>{label}</span>;
}

const statusColors = {
  "Normal": "green",
  "Low Stock": "amber",
  "Empty": "gray",
  "Overstock": "red"
};

/** Filter data array by user's assigned IPC scope */
function scopeByRole(data, user, ipcField = "ipc") {
  if (!user?.assignedIPC || user.role === "System Administrator" || user.role === "Head Office Manager") return data;
  const ipcName = user.assignedIPC;
  return data.filter((item) => item[ipcField] === ipcName || item.warehouseName?.includes(ipcName.replace(" IPC", "")));
}

export default function InventoryPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("stock"); // "stock" | "movements"
  const [search, setSearch] = useState("");

  // Scope data by role
  const scopedInventory = useMemo(() => scopeByRole(mockInventory, user), [user]);
  const scopedMovements = useMemo(() => {
    if (!user?.assignedIPC || user.role === "System Administrator" || user.role === "Head Office Manager") return mockStockMovements;
    const allowedWarehouses = new Set(scopedInventory.map((i) => i.warehouseId));
    return mockStockMovements.filter((m) => allowedWarehouses.has(m.warehouseId));
  }, [user, scopedInventory]);

  const filteredStock = useMemo(() => {
    return scopedInventory.filter((item) => {
      const s = search.toLowerCase();
      return !search || 
        item.warehouseName.toLowerCase().includes(s) || 
        item.commodity.toLowerCase().includes(s) ||
        item.status.toLowerCase().includes(s);
    });
  }, [search, scopedInventory]);

  const filteredMovements = useMemo(() => {
    return scopedMovements.filter((m) => {
      const s = search.toLowerCase();
      return !search || 
        m.commodity.toLowerCase().includes(s) || 
        m.reference.toLowerCase().includes(s) ||
        m.type.toLowerCase().includes(s);
    });
  }, [search, scopedMovements]);

  const totalBags = scopedInventory.reduce((acc, item) => acc + item.numberOfBags, 0);
  const totalWeight = scopedInventory.reduce((acc, item) => acc + item.currentStockKg, 0);
  const stockRef = useRef(null);
  const movementsRef = useRef(null);

  // ── CSV Export helper ────────────────────────────────
  const exportCSV = (headers, rows, filename) => {
    const esc = (v) => { const s = String(v ?? ""); return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s; };
    const csv = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── Targeted Print (iframe) ─────────────────────────
  const printTable = (ref, title) => {
    if (!ref.current) return;
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head><title>${title}</title><style>*{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}body{padding:20px;color:#111}h2{font-size:13px;font-weight:700;margin-bottom:12px}table{width:100%;border-collapse:collapse;font-size:11px}th{text-align:left;padding:7px 10px;font-size:10px;font-weight:700;text-transform:uppercase;color:#555;border-bottom:1px solid #e5e7eb;background:#f3f4f6}td{padding:6px 10px;border-bottom:1px solid #f0f0f0;color:#333}</style></head><body><h2>${title}</h2>${ref.current.innerHTML}</body></html>`);
    doc.close();
    iframe.contentWindow.focus(); iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  };

  const handleExportExcel = () => {
    const today = new Date().toISOString().slice(0, 10);
    if (activeTab === "stock") {
      exportCSV(
        ["Warehouse", "IPC", "Commodity", "Stock (kg)", "Bags", "Capacity (kg)", "Utilization %", "Status", "Last Updated"],
        filteredStock.map((i) => [i.warehouseName, i.ipc, i.commodity, i.currentStockKg, i.numberOfBags, i.capacityKg, i.utilizationPercent + "%", i.status, i.lastUpdated]),
        `GTMS_Inventory_Stock_${today}.csv`
      );
    } else {
      exportCSV(
        ["Movement ID", "Type", "Commodity", "Quantity (kg)", "Reference", "Date", "Officer"],
        filteredMovements.map((m) => [m.id, m.type, m.commodity, m.quantityKg, m.reference, m.date, m.officer]),
        `GTMS_Stock_Movements_${today}.csv`
      );
    }
  };

  const handlePrint = () => {
    const ref = activeTab === "stock" ? stockRef : movementsRef;
    const title = activeTab === "stock" ? "Warehouse Inventory — Stock Levels" : "Stock Movement History";
    printTable(ref, title);
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Inventory Module</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Real-time stock levels, warehouse capacity utilization, and movements history.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-[#333] rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1f1f1f] hover:bg-gray-50 dark:hover:bg-[#282828] hover:border-[#1a5c2a] dark:hover:border-emerald-600 hover:text-[#1a5c2a] dark:hover:text-emerald-400 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 group">
            <svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
          <button onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-[#333] rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1f1f1f] hover:bg-gray-50 dark:hover:bg-[#282828] hover:border-[#1a5c2a] dark:hover:border-emerald-600 hover:text-[#1a5c2a] dark:hover:text-emerald-400 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 group">
            <svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Stats Summary ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Stock Weight", value: `${totalWeight.toLocaleString()} kg` },
          { label: "Total Bag Count", value: totalBags.toLocaleString() },
          { label: "Active Warehouses", value: "3" },
          { label: "Alerts / Low Stock", value: mockInventory.filter(i => i.status === "Low Stock").length },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-[#2a2a2a] rounded-xl p-4">
            <p className="text-xs text-gray-400 dark:text-gray-500">{stat.label}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── Tabs & Search ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-[#2a2a2a] rounded-xl p-4">
        <div className="flex gap-1 bg-gray-100 dark:bg-[#252525] p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("stock")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${activeTab === "stock" ? "bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
          >
            Current Stock Levels
          </button>
          <button
            onClick={() => setActiveTab("movements")}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${activeTab === "movements" ? "bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white shadow-sm" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}
          >
            Stock Movement History
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stock record or movement..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]/30"
          />
        </div>
      </div>

      {/* ── Content View ── */}
      {activeTab === "stock" ? (
        <div ref={stockRef} className="bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-[#2a2a2a] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#222]">
                  {["Warehouse Name", "IPC", "Commodity", "Current Stock (kg)", "Bag Count", "Capacity (kg)", "Utilization %", "Status", "Last Updated"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStock.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-8 text-gray-400">No inventory records matching filters.</td></tr>
                ) : filteredStock.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50 dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white">{item.warehouseName}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.ipc}</td>
                    <td className="px-4 py-3"><Badge label={item.commodity} color="blue" /></td>
                    <td className="px-4 py-3 font-mono font-semibold text-gray-900 dark:text-white">{item.currentStockKg.toLocaleString()} kg</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.numberOfBags} bags</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-500 font-mono">{item.capacityKg.toLocaleString()} kg</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-100 dark:bg-[#252525] rounded-full overflow-hidden flex-shrink-0">
                          <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${Math.min(item.utilizationPercent, 100)}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{item.utilizationPercent}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge label={item.status} color={statusColors[item.status] ?? "gray"} /></td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{item.lastUpdated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div ref={movementsRef} className="bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-[#2a2a2a] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#222]">
                  {["Movement ID", "Type", "Commodity", "Quantity (kg)", "Reference Code", "Date", "Responsible Officer"].map((h) => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredMovements.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-400">No stock movements history found.</td></tr>
                ) : filteredMovements.map((move) => (
                  <tr key={move.id} className="border-b border-gray-50 dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{move.id}</td>
                    <td className="px-4 py-3">
                      <Badge label={move.type} color={move.type === "Inward" ? "green" : "red"} />
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white">{move.commodity}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-gray-900 dark:text-white">
                      {move.type === "Inward" ? "+" : "-"}{move.quantityKg.toLocaleString()} kg
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">{move.reference}</td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{move.date}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{move.officer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

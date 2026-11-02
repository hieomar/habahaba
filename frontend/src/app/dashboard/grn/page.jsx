"use client";

import { useState, useMemo, useRef } from "react";
import { mockGRNs, getGRNStats, GRN_STATUS, COMMODITY_CONDITION } from "@/lib/mockGRNs";
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

const statusColor = { [GRN_STATUS.CONFIRMED]: "green", [GRN_STATUS.PENDING]: "amber", [GRN_STATUS.PARTIAL]: "blue" };
const conditionColor = { [COMMODITY_CONDITION.GOOD]: "green", [COMMODITY_CONDITION.FAIR]: "amber", [COMMODITY_CONDITION.DAMAGED]: "red", [COMMODITY_CONDITION.REJECTED]: "red" };

const COMMODITY_OPTIONS = ["All", "Maize", "Soya", "Groundnuts"];
const STATUS_OPTIONS    = ["All", ...Object.values(GRN_STATUS)];

export default function GRNPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [commodityFilter, setCommodity] = useState("All");
  const [statusFilter, setStatus] = useState("All");
  const [selectedGRN, setSelectedGRN] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({ warehouseName: "", commodity: "Maize", numberOfBags: "", quantityKg: "", condition: "Good", remarks: "" });

  // Scope GRNs by user role
  const scopedGRNs = useMemo(() => {
    if (!user?.assignedIPC || user.role === "System Administrator" || user.role === "Head Office Manager") return mockGRNs;
    return mockGRNs.filter((g) => g.ipc === user.assignedIPC || g.warehouseName?.includes(user.assignedIPC.replace(" IPC", "")));
  }, [user]);

  const stats = useMemo(() => {
    const total = scopedGRNs.length;
    const confirmed = scopedGRNs.filter((g) => g.status === GRN_STATUS.CONFIRMED).length;
    const pending = scopedGRNs.filter((g) => g.status === GRN_STATUS.PENDING).length;
    const totalKg = scopedGRNs.reduce((acc, g) => acc + g.quantityKg, 0);
    return { total, confirmed, pending, totalKg };
  }, [scopedGRNs]);

  const filtered = useMemo(() => scopedGRNs.filter((g) => {
    const s = search.toLowerCase();
    const matchSearch = !search || g.grnNumber.toLowerCase().includes(s) || g.warehouseName.toLowerCase().includes(s) || g.commodity.toLowerCase().includes(s) || g.farmerNames.some((f) => f.toLowerCase().includes(s));
    const matchCommodity = commodityFilter === "All" || g.commodity === commodityFilter;
    const matchStatus    = statusFilter === "All" || g.status === statusFilter;
    return matchSearch && matchCommodity && matchStatus;
  }), [search, commodityFilter, statusFilter, scopedGRNs]);

  const tableRef = useRef(null);

  const exportCSV = () => {
    const esc = (v) => { const s = String(v ?? ""); return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s; };
    const headers = ["GRN Number", "Warehouse", "IPC", "Commodity", "Qty (kg)", "Bags", "Condition", "Received By", "Date", "Status"];
    const rows = filtered.map((g) => [g.grnNumber, g.warehouseName, g.ipc, g.commodity, g.quantityKg, g.numberOfBags, g.condition, g.receivingOfficer, g.dateReceived, g.status]);
    const csv = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `GTMS_GRN_Records_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const printTable = () => {
    if (!tableRef.current) return;
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head><title>GRN Records</title><style>*{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}body{padding:20px;color:#111}h2{font-size:13px;font-weight:700;margin-bottom:4px}p{font-size:10px;color:#555;margin-bottom:14px}table{width:100%;border-collapse:collapse;font-size:11px}th{text-align:left;padding:7px 10px;font-size:10px;font-weight:700;text-transform:uppercase;color:#555;border-bottom:1px solid #e5e7eb;background:#f3f4f6}td{padding:6px 10px;border-bottom:1px solid #f0f0f0;color:#333}</style></head><body><h2>Goods Received Notes (GRN) Records</h2><p>NASFAM GTMS — Printed: ${new Date().toLocaleString("en-GB")} — ${filtered.length} records</p>${tableRef.current.innerHTML}</body></html>`);
    doc.close(); iframe.contentWindow.focus(); iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">GRN Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Goods Received Notes — confirm commodities entering the warehouse</p>
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
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a5c2a] text-white text-sm font-semibold hover:bg-[#134520] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            Create GRN
          </button>
        </div>
      </div>

      {/* ── Summary ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total GRNs",     value: stats.total           },
          { label: "Confirmed",      value: stats.confirmed        },
          { label: "Pending",        value: stats.pending          },
          { label: "Total Weight",   value: `${stats.totalKg.toLocaleString()} kg` },
          { label: "Total Bags",     value: stats.totalBags        },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-4">
            <p className="text-xs text-gray-400 dark:text-gray-500">{s.label}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search GRN number, warehouse, farmer…"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]/30" />
        </div>
        <select value={commodityFilter} onChange={(e) => setCommodity(e.target.value)}
          className="px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-700 dark:text-gray-300 focus:outline-none">
          {COMMODITY_OPTIONS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-700 dark:text-gray-300 focus:outline-none">
          {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <span className="self-center text-xs text-gray-400">{filtered.length} GRN{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* ── Table ── */}
      <div ref={tableRef} className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#222]">
                {["GRN Number", "Warehouse / IPC", "Commodity", "Qty (kg)", "Bags", "Condition", "Received By", "Date", "Status", ""].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-sm text-gray-400">No GRNs found.</td></tr>
              ) : filtered.map((grn) => (
                <tr key={grn.id} className="border-b border-gray-50 dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#222] transition-colors cursor-pointer" onClick={() => setSelectedGRN(grn)}>
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-[#1a5c2a] dark:text-emerald-400 whitespace-nowrap">{grn.grnNumber}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800 dark:text-gray-200">{grn.warehouseName}</p>
                    <p className="text-xs text-gray-400">{grn.ipc}</p>
                  </td>
                  <td className="px-4 py-3"><Badge label={grn.commodity} color="green" /></td>
                  <td className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">{grn.quantityKg.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{grn.numberOfBags}</td>
                  <td className="px-4 py-3"><Badge label={grn.condition} color={conditionColor[grn.condition] ?? "gray"} /></td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 max-w-[130px] truncate">{grn.receivingOfficer}</td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{grn.dateReceived}</td>
                  <td className="px-4 py-3"><Badge label={grn.status} color={statusColor[grn.status] ?? "gray"} /></td>
                  <td className="px-4 py-3">
                    <button className="text-xs text-[#1a5c2a] dark:text-emerald-400 font-semibold hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Create GRN Modal ── */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#1c1c1c] rounded-2xl border border-gray-200 dark:border-[#2a2a2a] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#2a2a2a]">
              <h2 className="font-bold text-gray-900 dark:text-white">Create Goods Received Note</h2>
              <button onClick={() => setShowCreateForm(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); alert("GRN created! (Mock)"); setShowCreateForm(false); }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Warehouse</label>
                  <select value={form.warehouseName} onChange={(e) => setForm({...form, warehouseName: e.target.value})} required
                    className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]/30">
                    <option value="">Select warehouse…</option>
                    <option>Lilongwe Warehouse</option>
                    <option>Mchinji Warehouse</option>
                    <option>Kasungu Warehouse</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Commodity</label>
                  <select value={form.commodity} onChange={(e) => setForm({...form, commodity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]/30">
                    {["Maize","Soya","Groundnuts","Cotton","Pigeon Peas"].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Number of Bags</label>
                  <input type="number" min="1" value={form.numberOfBags} onChange={(e) => setForm({...form, numberOfBags: e.target.value})} required placeholder="e.g. 10"
                    className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]/30" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Total Quantity (kg)</label>
                  <input type="number" min="1" value={form.quantityKg} onChange={(e) => setForm({...form, quantityKg: e.target.value})} required placeholder="e.g. 900"
                    className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]/30" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Condition</label>
                  <select value={form.condition} onChange={(e) => setForm({...form, condition: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]/30">
                    {["Good","Fair","Damaged","Rejected"].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Remarks</label>
                <textarea value={form.remarks} onChange={(e) => setForm({...form, remarks: e.target.value})} rows={3} placeholder="Any observations or notes…"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]/30 resize-none" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-[#333] text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]">
                  Cancel
                </button>
                <button type="submit"
                  className="px-4 py-2 rounded-lg bg-[#1a5c2a] text-white text-sm font-semibold hover:bg-[#134520] transition-colors">
                  Confirm GRN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── GRN Detail Drawer ── */}
      {selectedGRN && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end" onClick={() => setSelectedGRN(null)}>
          <div className="w-full max-w-md bg-white dark:bg-[#1c1c1c] h-full overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#2a2a2a] sticky top-0 bg-white dark:bg-[#1c1c1c]">
              <div>
                <h2 className="font-mono font-bold text-[#1a5c2a] dark:text-emerald-400">{selectedGRN.grnNumber}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{selectedGRN.dateReceived}</p>
              </div>
              <button onClick={() => setSelectedGRN(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex gap-2 flex-wrap">
                <Badge label={selectedGRN.status} color={statusColor[selectedGRN.status] ?? "gray"} />
                <Badge label={selectedGRN.condition} color={conditionColor[selectedGRN.condition] ?? "gray"} />
                <Badge label={selectedGRN.commodity} color="green" />
              </div>
              {[
                ["Warehouse",        selectedGRN.warehouseName],
                ["IPC",             selectedGRN.ipc],
                ["Quantity",        `${selectedGRN.quantityKg} kg`],
                ["Number of Bags",  selectedGRN.numberOfBags],
                ["Delivery Ref",    selectedGRN.deliveryRef],
                ["Receiving Officer", selectedGRN.receivingOfficer],
                ["Farmers",         selectedGRN.farmerNames.join(", ")],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-[#2a2a2a]">
                  <span className="text-xs text-gray-400">{label}</span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-white text-right max-w-[60%]">{val}</span>
                </div>
              ))}
              {selectedGRN.remarks && (
                <div className="bg-gray-50 dark:bg-[#252525] rounded-lg p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Remarks</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selectedGRN.remarks}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

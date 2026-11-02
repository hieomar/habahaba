"use client";

import { useState, useMemo, useRef } from "react";
import { mockDispatches, mockBatches } from "@/lib/mockWarehouseOps";
import { mockCustomers } from "@/lib/mockMasterData";
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

export default function DispatchPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState(null);

  const [form, setForm] = useState({
    customerName: "",
    commodity: "Maize",
    batchId: "",
    quantityKg: "",
    vehicleReg: "",
    driverName: "",
    deliveryAddress: "",
  });

  // Scope dispatches by user role
  const scopedDispatches = useMemo(() => {
    if (!user?.assignedIPC || user.role === "System Administrator" || user.role === "Head Office Manager") return mockDispatches;
    return mockDispatches.filter((d) => d.ipc === user.assignedIPC || d.warehouseName?.includes(user.assignedIPC.replace(" IPC", "")));
  }, [user]);

  const filtered = useMemo(() => {
    return scopedDispatches.filter((d) => {
      const s = search.toLowerCase();
      return !search || 
        d.dispatchNumber.toLowerCase().includes(s) || 
        d.customerName.toLowerCase().includes(s) || 
        d.commodity.toLowerCase().includes(s);
    });
  }, [search, scopedDispatches]);

  const tableRef = useRef(null);

  const exportCSV = () => {
    const esc = (v) => { const s = String(v ?? ""); return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s; };
    const headers = ["Dispatch Number", "Customer", "Commodity", "Bags", "Qty (kg)", "Vehicle", "Driver", "Delivery Address", "Date", "Status"];
    const rows = filtered.map((d) => [d.dispatchNumber, d.customerName, d.commodity, d.numberOfBags, d.quantityKg, d.vehicleReg, d.driverName, d.deliveryAddress ?? "", d.dispatchDate, d.status]);
    const csv = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `GTMS_Dispatch_Records_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const printTable = () => {
    if (!tableRef.current) return;
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head><title>Dispatch Records</title><style>*{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}body{padding:20px;color:#111}h2{font-size:13px;font-weight:700;margin-bottom:4px}p{font-size:10px;color:#555;margin-bottom:14px}table{width:100%;border-collapse:collapse;font-size:11px}th{text-align:left;padding:7px 10px;font-size:10px;font-weight:700;text-transform:uppercase;color:#555;border-bottom:1px solid #e5e7eb;background:#f3f4f6}td{padding:6px 10px;border-bottom:1px solid #f0f0f0;color:#333}</style></head><body><h2>Commodity Dispatch Records</h2><p>NASFAM GTMS — Printed: ${new Date().toLocaleString("en-GB")} — ${filtered.length} records</p>${tableRef.current.innerHTML}</body></html>`);
    doc.close(); iframe.contentWindow.focus(); iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  };

  const activeBatches = mockBatches.filter((b) => b.status === "Active");

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dispatch Module</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Record and monitor commodities dispatched from the warehouse to customers.</p>
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
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a5c2a] text-white text-sm font-semibold hover:bg-[#134520] transition-colors"
          >
            New Dispatch Order
          </button>
        </div>
      </div>

      {/* ── Filter & Search ── */}
      <div className="bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-[#2a2a2a] rounded-xl p-4">
        <div className="relative max-w-md">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dispatches by number or customer..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]/30"
          />
        </div>
      </div>

      {/* ── Dispatch List ── */}
      <div ref={tableRef} className="bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-[#2a2a2a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#222]">
                {["Dispatch #", "Customer", "Commodity", "Bags", "Qty (kg)", "Vehicle", "Driver", "Date", "Status", ""].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-b border-gray-50 dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#222] transition-colors cursor-pointer" onClick={() => setSelectedDispatch(d)}>
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-[#1a5c2a] dark:text-emerald-400 whitespace-nowrap">{d.dispatchNumber}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white">{d.customerName}</td>
                  <td className="px-4 py-3"><Badge label={d.commodity} color="blue" /></td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{d.numberOfBags} bags</td>
                  <td className="px-4 py-3 font-mono font-semibold text-gray-900 dark:text-white">{d.quantityKg.toLocaleString()} kg</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{d.vehicleReg}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{d.driverName}</td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{d.dispatchDate}</td>
                  <td className="px-4 py-3"><Badge label={d.status} color="green" /></td>
                  <td className="px-4 py-3">
                    <button className="text-xs text-[#1a5c2a] dark:text-emerald-400 font-semibold hover:underline">Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── New Dispatch Modal Form ── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#1c1c1c] rounded-2xl border border-gray-200 dark:border-[#2a2a2a] shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#2a2a2a]">
              <h2 className="font-bold text-gray-900 dark:text-white">Create Commodity Dispatch</h2>
              <button onClick={() => setShowCreate(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Dispatch registered successfully! (Mock)"); setShowCreate(false); }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Customer Name</label>
                  <input
                    type="text"
                    list="customer-suggestions"
                    value={form.customerName}
                    onChange={(e) => setForm({...form, customerName: e.target.value})}
                    placeholder="Enter customer name..."
                    required
                    className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]/30"
                  />
                  <datalist id="customer-suggestions">
                    {mockCustomers.map(c => <option key={c.id} value={c.name} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Commodity Type</label>
                  <select
                    value={form.commodity}
                    onChange={(e) => setForm({...form, commodity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none"
                  >
                    {["Maize","Soya","Groundnuts"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Select Batch</label>
                  <select
                    value={form.batchId}
                    onChange={(e) => setForm({...form, batchId: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none"
                  >
                    <option value="">Select Batch...</option>
                    {activeBatches.map(b => <option key={b.id} value={b.id}>{b.batchNumber} ({b.totalWeightKg} kg)</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Dispatch Qty (kg)</label>
                  <input
                    type="number"
                    value={form.quantityKg}
                    onChange={(e) => setForm({...form, quantityKg: e.target.value})}
                    placeholder="Enter Kg quantity..."
                    required
                    className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Vehicle Reg Number</label>
                  <input
                    type="text"
                    value={form.vehicleReg}
                    onChange={(e) => setForm({...form, vehicleReg: e.target.value})}
                    placeholder="e.g. MH 1234"
                    required
                    className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Driver Full Name</label>
                  <input
                    type="text"
                    value={form.driverName}
                    onChange={(e) => setForm({...form, driverName: e.target.value})}
                    placeholder="Driver name..."
                    required
                    className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Delivery Address</label>
                <input
                  type="text"
                  value={form.deliveryAddress}
                  onChange={(e) => setForm({...form, deliveryAddress: e.target.value})}
                  placeholder="Street / Warehouse address..."
                  required
                  className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-[#333] text-sm font-semibold text-gray-700 dark:text-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-[#1a5c2a] text-white text-sm font-semibold hover:bg-[#134520] transition-colors">Confirm Dispatch</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Detail View Modal ── */}
      {selectedDispatch && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setSelectedDispatch(null)}>
          <div className="w-full max-w-md bg-white dark:bg-[#1c1c1c] rounded-2xl border border-gray-200 dark:border-[#2a2a2a] shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2a2a2a] pb-3 mb-4">
              <h2 className="font-bold text-gray-900 dark:text-white font-mono">{selectedDispatch.dispatchNumber}</h2>
              <Badge label={selectedDispatch.status} color="green" />
            </div>
            <div className="space-y-3">
              {[
                ["Customer Name", selectedDispatch.customerName],
                ["Customer Contact", selectedDispatch.customerContact],
                ["Commodity", selectedDispatch.commodity],
                ["Total Bags", `${selectedDispatch.numberOfBags} bags`],
                ["Weight", `${selectedDispatch.quantityKg} kg`],
                ["Dispatch Date", selectedDispatch.dispatchDate],
                ["Vehicle Reg", selectedDispatch.vehicleReg],
                ["Driver Name", selectedDispatch.driverName],
                ["Dispatched By", selectedDispatch.dispatchedBy],
                ["Destination Depot", selectedDispatch.deliveryAddress],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-sm py-1 border-b border-gray-50 dark:border-[#2a2a2a]">
                  <span className="text-gray-400">{label}</span>
                  <span className="font-semibold text-gray-800 dark:text-white">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

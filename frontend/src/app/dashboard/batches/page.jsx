"use client";

import { useState, useMemo, useRef } from "react";
import { mockBatches, mockInventory, mockStockMovements } from "@/lib/mockWarehouseOps";
import { mockGRNs } from "@/lib/mockGRNs";
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

const statusColor = { Active: "green", Dispatched: "gray", Quarantine: "amber" };

export default function BatchManagementPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  
  const [form, setForm] = useState({
    batchNumber: "",
    warehouseName: "Lilongwe Warehouse",
    commodity: "Maize",
    storageLocation: "",
    notes: "",
    selectedGrnIds: ["GRN-2026-001"],
  });

  // Scope batches by user role
  const scopedBatches = useMemo(() => {
    if (!user?.assignedIPC || user.role === "System Administrator" || user.role === "Head Office Manager") return mockBatches;
    return mockBatches.filter((b) => b.ipc === user.assignedIPC || b.warehouseName?.includes(user.assignedIPC.replace(" IPC", "")));
  }, [user]);

  const filtered = useMemo(() => scopedBatches.filter((b) => {
    const s = search.toLowerCase();
    return !search || b.batchNumber.toLowerCase().includes(s) || b.warehouseName.toLowerCase().includes(s) || b.commodity.toLowerCase().includes(s);
  }), [search, scopedBatches]);

  // Available GRNs matching selected warehouse and commodity for batch assignment
  const availableGRNs = useMemo(() => {
    return mockGRNs.filter(g => 
      g.warehouseName === form.warehouseName && 
      g.commodity === form.commodity
    );
  }, [form.warehouseName, form.commodity]);

  // Auto-calculated totals based on checked GRNs
  const calculatedTotals = useMemo(() => {
    const selected = availableGRNs.filter(g => form.selectedGrnIds.includes(g.id));
    const totalBags = selected.reduce((sum, g) => sum + g.numberOfBags, 0);
    const totalKg = selected.reduce((sum, g) => sum + g.quantityKg, 0);
    return { count: selected.length, totalBags, totalKg };
  }, [availableGRNs, form.selectedGrnIds]);

  const toggleGRNSelection = (grnId) => {
    setForm(prev => {
      const exists = prev.selectedGrnIds.includes(grnId);
      const updated = exists 
        ? prev.selectedGrnIds.filter(id => id !== grnId)
        : [...prev.selectedGrnIds, grnId];
      return { ...prev, selectedGrnIds: updated };
    });
  };

  const tableRef = useRef(null);

  const exportCSV = () => {
    const esc = (v) => { const s = String(v ?? ""); return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s; };
    const headers = ["Batch Number", "Warehouse", "IPC", "Commodity", "Bags", "Weight (kg)", "Storage Location", "Created By", "Created", "Status"];
    const rows = filtered.map((b) => [b.batchNumber, b.warehouseName, b.ipc, b.commodity, b.numberOfBags, b.totalWeightKg, b.storageLocation, b.createdBy, b.createdAt, b.status]);
    const csv = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `GTMS_Batch_Records_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const printTable = () => {
    if (!tableRef.current) return;
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head><title>Batch Records</title><style>*{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}body{padding:20px;color:#111}h2{font-size:13px;font-weight:700;margin-bottom:4px}p{font-size:10px;color:#555;margin-bottom:14px}table{width:100%;border-collapse:collapse;font-size:11px}th{text-align:left;padding:7px 10px;font-size:10px;font-weight:700;text-transform:uppercase;color:#555;border-bottom:1px solid #e5e7eb;background:#f3f4f6}td{padding:6px 10px;border-bottom:1px solid #f0f0f0;color:#333}</style></head><body><h2>Batch Management Records</h2><p>NASFAM GTMS — Printed: ${new Date().toLocaleString("en-GB")} — ${filtered.length} records</p>${tableRef.current.innerHTML}</body></html>`);
    doc.close(); iframe.contentWindow.focus(); iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Batch Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Assign received GRN bag lots into warehouse stacks for tracking and customer dispatch</p>
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
          <button onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a5c2a] text-white text-sm font-semibold hover:bg-[#134520] transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            New Batch
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Batches",    value: mockBatches.length },
          { label: "Active Stacks",    value: mockBatches.filter((b) => b.status === "Active").length },
          { label: "Dispatched",       value: mockBatches.filter((b) => b.status === "Dispatched").length },
          { label: "Total Bags",       value: mockBatches.reduce((s, b) => s + b.numberOfBags, 0) },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-4">
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-4">
        <div className="relative max-w-md">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search batches by number, warehouse, commodity…"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]/30" />
        </div>
      </div>

      {/* Table */}
      <div ref={tableRef} className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#222]">
                {["Batch Number", "Warehouse / IPC", "Commodity", "Bags", "Weight (kg)", "Storage Location", "Linked GRNs", "Created", "Status", ""].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((batch) => (
                <tr key={batch.id} className="border-b border-gray-50 dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#222] transition-colors cursor-pointer" onClick={() => setSelectedBatch(batch)}>
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-[#1a5c2a] dark:text-emerald-400 whitespace-nowrap">{batch.batchNumber}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800 dark:text-gray-200">{batch.warehouseName}</p>
                    <p className="text-xs text-gray-400">{batch.ipc}</p>
                  </td>
                  <td className="px-4 py-3"><Badge label={batch.commodity} color="green" /></td>
                  <td className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">{batch.numberOfBags} bags</td>
                  <td className="px-4 py-3 font-mono text-gray-900 dark:text-white font-semibold">{batch.totalWeightKg.toLocaleString()} kg</td>
                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400 font-semibold">{batch.storageLocation}</td>
                  <td className="px-4 py-3 text-xs font-mono text-blue-600 dark:text-blue-400">
                    {batch.grnIds ? batch.grnIds.join(", ") : "GRN-2026-001"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{batch.createdAt}</td>
                  <td className="px-4 py-3"><Badge label={batch.status} color={statusColor[batch.status] ?? "gray"} /></td>
                  <td className="px-4 py-3"><button className="text-xs text-[#1a5c2a] dark:text-emerald-400 font-semibold hover:underline">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Create Batch Modal with Explicit GRN Selection ── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white dark:bg-[#1c1c1c] rounded-2xl border border-gray-200 dark:border-[#2a2a2a] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#2a2a2a]">
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white">Create New Warehouse Batch</h2>
                <p className="text-xs text-gray-500">Group received GRN bag lots into a warehouse stack</p>
              </div>
              <button onClick={() => setShowCreate(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <form className="p-6 space-y-4 max-h-[85vh] overflow-y-auto" onSubmit={(e) => { e.preventDefault(); alert(`Batch created successfully with ${calculatedTotals.totalBags} bags (${calculatedTotals.totalKg} kg)! (Mock)`); setShowCreate(false); }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Warehouse</label>
                  <select 
                    value={form.warehouseName} 
                    onChange={(e) => setForm({...form, warehouseName: e.target.value, selectedGrnIds: []})}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none"
                  >
                    <option>Lilongwe Warehouse</option>
                    <option>Mchinji Warehouse</option>
                    <option>Kasungu Warehouse</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Commodity Type</label>
                  <select 
                    value={form.commodity} 
                    onChange={(e) => setForm({...form, commodity: e.target.value, selectedGrnIds: []})}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none"
                  >
                    {["Maize","Soya","Groundnuts","Cotton","Pigeon Peas"].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* ── Interactive GRN Bag Lots Assignment Section ── */}
              <div className="space-y-2 border border-gray-200 dark:border-[#333] rounded-xl p-3.5 bg-gray-50/50 dark:bg-[#222]/50">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                    Select Received GRNs / Bag Lots to Assign
                  </label>
                  <span className="text-[11px] font-semibold text-[#1a5c2a] dark:text-emerald-400">
                    {availableGRNs.length} available at {form.warehouseName}
                  </span>
                </div>
                
                {availableGRNs.length === 0 ? (
                  <p className="text-xs text-gray-400 py-3 text-center">No unassigned GRNs found for {form.commodity} at {form.warehouseName}.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {availableGRNs.map((grn) => {
                      const isChecked = form.selectedGrnIds.includes(grn.id);
                      return (
                        <label
                          key={grn.id}
                          onClick={() => toggleGRNSelection(grn.id)}
                          className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                            isChecked
                              ? "bg-emerald-50 dark:bg-emerald-950/30 border-[#1a5c2a] dark:border-emerald-700"
                              : "bg-white dark:bg-[#252525] border-gray-200 dark:border-[#333] hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}} // handled by parent label click
                              className="w-4 h-4 text-[#1a5c2a] rounded focus:ring-[#1a5c2a]"
                            />
                            <div>
                              <p className="font-mono font-bold text-gray-900 dark:text-white">{grn.grnNumber}</p>
                              <p className="text-[11px] text-gray-500">Farmers: {grn.farmerNames.join(", ")} · Recv: {grn.dateReceived}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-[#1a5c2a] dark:text-emerald-400">{grn.numberOfBags} bags</p>
                            <p className="text-[11px] text-gray-500 font-mono">{grn.quantityKg} kg</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}

                {/* Calculated Batch Totals Summary */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-[#333] text-xs">
                  <span className="text-gray-500">Auto-Calculated Stack Totals:</span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#1a5c2a]/10 text-[#1a5c2a] dark:text-emerald-400 rounded font-bold">
                      {calculatedTotals.totalBags} bags
                    </span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 rounded font-bold font-mono">
                      {calculatedTotals.totalKg.toLocaleString()} kg
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Storage Location / Stack Bay</label>
                <input 
                  value={form.storageLocation} 
                  onChange={(e) => setForm({...form, storageLocation: e.target.value})} 
                  required 
                  placeholder="e.g. Section A — Stack Row 04"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]/30" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Notes / Observations</label>
                <textarea 
                  value={form.notes} 
                  onChange={(e) => setForm({...form, notes: e.target.value})} 
                  rows={2} 
                  placeholder="Optional batch notes (e.g. Export Grade A quality batch)…"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]/30 resize-none" 
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-[#333] text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={calculatedTotals.totalBags === 0}
                  className="px-4 py-2 rounded-lg bg-[#1a5c2a] text-white text-sm font-semibold hover:bg-[#134520] transition-colors disabled:opacity-50"
                >
                  Create Batch ({calculatedTotals.totalBags} bags)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Batch Detail Modal ── */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setSelectedBatch(null)}>
          <div className="w-full max-w-md bg-white dark:bg-[#1c1c1c] rounded-2xl border border-gray-200 dark:border-[#2a2a2a] shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2a2a2a] pb-3">
              <div>
                <h2 className="font-mono font-bold text-[#1a5c2a] dark:text-emerald-400">{selectedBatch.batchNumber}</h2>
                <p className="text-xs text-gray-500">{selectedBatch.warehouseName} ({selectedBatch.ipc})</p>
              </div>
              <Badge label={selectedBatch.status} color={statusColor[selectedBatch.status] ?? "gray"} />
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                ["Commodity", selectedBatch.commodity],
                ["Storage Location", selectedBatch.storageLocation],
                ["Total Bags", `${selectedBatch.numberOfBags} bags`],
                ["Total Net Weight", `${selectedBatch.totalWeightKg.toLocaleString()} kg`],
                ["Created By", selectedBatch.createdBy],
                ["Created Date", selectedBatch.createdAt],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between py-1 border-b border-gray-50 dark:border-[#2a2a2a]">
                  <span className="text-gray-400">{label}</span>
                  <span className="font-semibold text-gray-800 dark:text-white">{val}</span>
                </div>
              ))}
            </div>

            {/* Linked GRN Lots */}
            <div className="pt-2">
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Assigned GRN Bag Lots:</p>
              <div className="space-y-1.5">
                {(selectedBatch.grnIds ?? ["GRN-2026-001"]).map((grnId) => {
                  const grn = mockGRNs.find(g => g.id === grnId);
                  return (
                    <div key={grnId} className="p-2.5 bg-gray-50 dark:bg-[#252525] rounded-lg flex items-center justify-between text-xs border border-gray-100 dark:border-[#333]">
                      <div>
                        <span className="font-mono font-bold text-[#1a5c2a] dark:text-emerald-400">{grnId}</span>
                        {grn && <p className="text-[11px] text-gray-500">Farmers: {grn.farmerNames.join(", ")}</p>}
                      </div>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {grn ? `${grn.numberOfBags} bags (${grn.quantityKg} kg)` : "Assigned"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedBatch.notes && (
              <div className="p-3 bg-gray-50 dark:bg-[#252525] rounded-lg text-xs">
                <p className="font-bold text-gray-400 uppercase tracking-wider text-[10px] mb-1">Notes</p>
                <p className="text-gray-700 dark:text-gray-300">{selectedBatch.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";

const MOCK_WAREHOUSES = [
  { id: "WH-001", code: "WH-LLW-01", name: "Lilongwe Central Depot", location: "Lilongwe, Area 18", district: "Lilongwe", capacity: "500 MT", manager: "James Phiri", status: "Active", createdAt: "2024-03-15" },
  { id: "WH-002", code: "WH-MZU-01", name: "Mzuzu Northern Hub", location: "Mzuzu, Industrial Area", district: "Mzimba", capacity: "350 MT", manager: "Grace Banda", status: "Active", createdAt: "2024-04-02" },
  { id: "WH-003", code: "WH-BLT-01", name: "Blantyre Southern Store", location: "Blantyre, Makata", district: "Blantyre", capacity: "420 MT", manager: "Peter Kamanga", status: "Active", createdAt: "2024-04-20" },
  { id: "WH-004", code: "WH-ZBA-01", name: "Zomba Regional Depot", location: "Zomba, Chancellor College Rd", district: "Zomba", capacity: "280 MT", manager: "Mary Chirwa", status: "Inactive", createdAt: "2024-05-10" },
  { id: "WH-005", code: "WH-MNG-01", name: "Mangochi Lakeshore Depot", location: "Mangochi, Town Centre", district: "Mangochi", capacity: "200 MT", manager: "John Mwale", status: "Active", createdAt: "2024-06-01" },
  { id: "WH-006", code: "WH-KSG-01", name: "Kasungu Central Store", location: "Kasungu, M1 Highway", district: "Kasungu", capacity: "380 MT", manager: "Agnes Tembo", status: "Active", createdAt: "2024-07-12" },
  { id: "WH-007", code: "WH-SLM-01", name: "Salima Lakeshore Hub", location: "Salima, Trading Centre", district: "Salima", capacity: "150 MT", manager: "Unassigned", status: "Inactive", createdAt: "2025-01-08" },
];

const emptyForm = { id: "", code: "", name: "", location: "", district: "", capacity: "", manager: "", status: "Active" };

// ── Skeleton ───────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100 dark:border-[#2a2a2a] animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3"><div className="h-3.5 bg-gray-200 dark:bg-[#333] rounded w-3/4" /></td>
      ))}
    </tr>
  );
}

export default function WarehouseManagementPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [openMenu, setOpenMenu] = useState(null);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchWarehouses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/warehouses");
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setWarehouses(json.data);
      } else {
        setWarehouses(MOCK_WAREHOUSES);
      }
    } catch {
      setWarehouses(MOCK_WAREHOUSES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWarehouses(); }, [fetchWarehouses]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Warehouse name is required";
    if (!form.code.trim()) e.code = "Warehouse code is required";
    if (!form.location.trim()) e.location = "Location is required";
    if (!form.district.trim()) e.district = "District is required";
    if (!form.capacity.trim()) e.capacity = "Capacity is required";
    return e;
  };

  const getNextWarehouseCode = (whList = warehouses) => {
    const nums = whList.map((wh) => {
      const m = (wh.code || wh.id)?.match(/\d+/);
      return m ? parseInt(m[0], 10) : 0;
    });
    const maxNum = nums.length > 0 ? Math.max(...nums, 0) : 0;
    return `WH-${String(maxNum + 1).padStart(3, "0")}`;
  };

  const openAdd = () => {
    setForm({ ...emptyForm, code: getNextWarehouseCode() });
    setErrors({});
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (wh) => {
    setForm({ id: wh.id, code: wh.code || wh.id, name: wh.name, location: wh.location, district: wh.district, capacity: wh.capacity, manager: wh.manager || "", status: wh.status });
    setErrors({});
    setEditingId(wh.id);
    setShowForm(true);
    setOpenMenu(null);
  };

  const handleToggleStatus = (whId) => {
    setWarehouses((prev) => prev.map((wh) => wh.id === whId ? { ...wh, status: wh.status === "Active" ? "Inactive" : "Active" } : wh));
    showToast("Warehouse status updated.");
    setOpenMenu(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    setTimeout(() => {
      if (editingId) {
        setWarehouses((prev) => prev.map((wh) => wh.id === editingId ? { ...wh, ...form } : wh));
        showToast("Warehouse updated successfully.");
      } else {
        const generatedCode = form.code || getNextWarehouseCode();
        const newWh = { ...form, id: generatedCode, code: generatedCode, createdAt: new Date().toISOString().split("T")[0] };
        setWarehouses((prev) => [...prev, newWh]);
        showToast("Warehouse registered successfully.");
      }
      setShowForm(false);
      setEditingId(null);
      setSaving(false);
    }, 400);
  };

  const filtered = warehouses
    .filter((wh) => statusFilter === "All" || wh.status === statusFilter)
    .filter((wh) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return wh.name.toLowerCase().includes(q) || wh.code.toLowerCase().includes(q) || wh.district.toLowerCase().includes(q) || wh.location.toLowerCase().includes(q);
    });

  const activeCount = warehouses.filter((wh) => wh.status === "Active").length;
  const inactiveCount = warehouses.filter((wh) => wh.status === "Inactive").length;
  const totalCapacity = warehouses.reduce((sum, wh) => sum + parseInt(wh.capacity) || 0, 0);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Warehouse Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Register and manage physical warehouse locations, capacity, and assigned managers.</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1a5c2a] text-white rounded-lg text-sm font-semibold hover:bg-[#134520] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Register Warehouse
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-[#2a2a2a] rounded-xl p-4">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Warehouses</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{warehouses.length}</p>
        </div>
        <div className="bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-[#2a2a2a] rounded-xl p-4">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Active</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{activeCount}</p>
        </div>
        <div className="bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-[#2a2a2a] rounded-xl p-4">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Inactive</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{inactiveCount}</p>
        </div>
        <div className="bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-[#2a2a2a] rounded-xl p-4">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Capacity</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalCapacity} MT</p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
          <input
            type="text"
            placeholder="Search by name, code, district, or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#1c1c1c] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]/30"
          />
        </div>
        <div className="flex gap-1">
          {["All", "Active", "Inactive"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${statusFilter === s ? "bg-[#1a5c2a] text-white" : "bg-gray-100 dark:bg-[#252525] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#333]"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-[#2a2a2a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#181818]">
                <th className="px-4 py-3 text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Code</th>
                <th className="px-4 py-3 text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">District</th>
                <th className="px-4 py-3 text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Capacity</th>
                <th className="px-4 py-3 text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Manager</th>
                <th className="px-4 py-3 text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider w-16">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-sm text-gray-400 dark:text-gray-500">
                    No warehouses found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((wh) => (
                  <tr key={wh.id} className="border-b border-gray-100 dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
                    <td className="px-4 py-3 text-xs font-mono font-semibold text-[#1a5c2a] dark:text-emerald-400">{wh.code}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{wh.name}</p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{wh.location}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{wh.district}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-gray-800 dark:text-gray-200">{wh.capacity}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{wh.manager}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${wh.status === "Active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"}`}>
                        {wh.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === wh.id ? null : wh.id)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#333] transition-colors"
                      >
                        <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" /></svg>
                      </button>
                      {openMenu === wh.id && (
                        <div className="absolute right-4 top-full mt-1 w-40 bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-[#333] rounded-lg shadow-xl z-30 py-1">
                          <button onClick={() => openEdit(wh)} className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525]">
                            Edit Warehouse
                          </button>
                          <button onClick={() => handleToggleStatus(wh.id)} className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525]">
                            {wh.status === "Active" ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-200 dark:border-[#2a2a2a] text-xs text-gray-400 dark:text-gray-500 flex items-center justify-between">
          <span>Showing {filtered.length} of {warehouses.length} warehouses</span>
          <span className="text-[10px]">Last synced: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-xs font-semibold ${toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
          {toast.msg}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-[#2a2a2a] flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">{editingId ? "Edit Warehouse" : "Register New Warehouse"}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{editingId ? "Update warehouse details below." : "Enter the physical warehouse details."}</p>
              </div>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-[#333]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 flex justify-between">
                    <span>Warehouse Code *</span>
                    <span className="text-[10px] text-[#1a5c2a] dark:text-emerald-400 font-semibold">(Auto-generated)</span>
                  </label>
                  <input value={form.code} disabled readOnly className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 dark:bg-[#222] text-gray-700 dark:text-gray-300 font-mono font-bold cursor-not-allowed border-gray-200 dark:border-[#333]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]/30">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Warehouse Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Lilongwe Central Depot" className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]/30" />
                {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Location / Address</label>
                  <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Lilongwe, Area 18" className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]/30" />
                  {errors.location && <p className="text-[11px] text-red-500 mt-1">{errors.location}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">District</label>
                  <input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} placeholder="Lilongwe" className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]/30" />
                  {errors.district && <p className="text-[11px] text-red-500 mt-1">{errors.district}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Storage Capacity</label>
                  <input value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="500 MT" className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]/30" />
                  {errors.capacity && <p className="text-[11px] text-red-500 mt-1">{errors.capacity}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Assigned Manager</label>
                  <input value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} placeholder="James Phiri" className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]/30" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-[#2a2a2a]">
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-[#333] text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1a5c2a] text-white rounded-lg text-xs font-semibold hover:bg-[#134520] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 disabled:opacity-50">
                  {saving ? "Saving…" : editingId ? "Update Warehouse" : "Register Warehouse"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

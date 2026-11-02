"use client";

import { useState, useEffect, useCallback } from "react";
import { ipcsService } from "@/lib/api/ipcs";

const emptyForm = { id: "", name: "", district: "", manager: "", status: "Active" };

// ── Skeleton ───────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-3/4" /></td>
      ))}
    </tr>
  );
}

export default function IPCManagementPage() {
  const [ipcs, setIpcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [openMenu, setOpenMenu] = useState(null);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchIPCs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await ipcsService.list({ search: "" });
      setIpcs(data ?? []);
    } catch (err) {
      setError(err.message ?? "Failed to load IPCs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchIPCs(); }, [fetchIPCs]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "IPC name is required";
    if (!form.district.trim()) e.district = "District is required";
    if (!editingId && !form.id.trim()) e.id = "IPC code is required";
    return e;
  };

  const getNextIPCId = (ipcList = ipcs) => {
    const nums = ipcList.map((ipc) => {
      const m = ipc.id?.match(/\d+/);
      return m ? parseInt(m[0], 10) : 0;
    });
    const maxNum = nums.length > 0 ? Math.max(...nums, 0) : 0;
    return `IPC${String(maxNum + 1).padStart(3, "0")}`;
  };

  const openAdd = () => {
    setForm({ ...emptyForm, id: getNextIPCId() });
    setErrors({});
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (ipc) => {
    setForm({ id: ipc.id, name: ipc.name, district: ipc.district, manager: ipc.manager || "", status: ipc.status });
    setErrors({});
    setEditingId(ipc.id);
    setShowForm(true);
    setOpenMenu(null);
  };

  const handleToggleStatus = async (ipcId) => {
    try {
      const { data } = await ipcsService.toggleStatus(ipcId);
      setIpcs((prev) => prev.map((ipc) => (ipc.id === ipcId ? data : ipc)));
      showToast("IPC status updated.");
    } catch (err) {
      showToast(err.message ?? "Failed to update status.", "error");
    }
    setOpenMenu(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      if (editingId) {
        const { data } = await ipcsService.update(editingId, {
          name: form.name.trim(),
          district: form.district.trim(),
          manager: form.manager.trim(),
          status: form.status,
        });
        setIpcs((prev) => prev.map((ipc) => (ipc.id === editingId ? data : ipc)));
        showToast("IPC updated successfully.");
      } else {
        const { data } = await ipcsService.create({
          id: form.id.trim(),
          name: form.name.trim(),
          district: form.district.trim(),
          manager: form.manager.trim(),
          status: form.status,
        });
        setIpcs((prev) => [...prev, data]);
        showToast("IPC added successfully.");
      }
      setShowForm(false);
    } catch (err) {
      showToast(err.message ?? "Operation failed.", "error");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors ${errors[field] ? "border-red-400 focus:border-red-400 bg-red-50" : "border-gray-200 focus:border-[#1a5c2a]"
    }`;

  const filtered = ipcs.filter((ipc) =>
    `${ipc.id} ${ipc.name} ${ipc.district}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-md shadow-lg text-sm font-semibold text-white ${toast.type === "error" ? "bg-red-600" : "bg-gray-900"}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Administration</p>
          <h1 className="text-xl font-bold text-gray-900">IPC Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage Innovation and Productivity Centre master records.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1a5c2a] text-white text-sm font-semibold rounded-lg hover:bg-[#134520] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add IPC
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search IPCs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#1a5c2a] bg-white"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error} — <button onClick={fetchIPCs} className="underline font-semibold">Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["IPC Code", "Name", "District", "Manager", "Status", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                  {search ? "No IPCs match your search." : "No IPCs found. Connect a backend or add your first IPC."}
                </td>
              </tr>
            ) : (
              filtered.map((ipc) => (
                <tr key={ipc.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">{ipc.id}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{ipc.name}</td>
                  <td className="px-4 py-3 text-gray-600">{ipc.district}</td>
                  <td className="px-4 py-3 text-gray-500">{ipc.manager || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${ipc.status === "Active" ? "text-[#1a5c2a]" : "text-gray-400"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${ipc.status === "Active" ? "bg-[#1a5c2a]" : "bg-gray-300"}`} />
                      {ipc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === ipc.id ? null : ipc.id)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
                        </svg>
                      </button>
                      {openMenu === ipc.id && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
                          <button onClick={() => openEdit(ipc)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Edit</button>
                          <button onClick={() => handleToggleStatus(ipc.id)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                            {ipc.status === "Active" ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">{editingId ? "Edit IPC" : "Add New IPC"}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1 flex justify-between">
                  <span>IPC Code *</span>
                  <span className="text-[10px] text-[#1a5c2a] font-semibold">(Auto-generated)</span>
                </label>
                <input className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none bg-gray-50 text-gray-700 font-mono font-bold cursor-not-allowed" value={form.id} disabled readOnly />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">IPC Name *</label>
                <input className={inputClass("name")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Dedza IPC" />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">District *</label>
                <input className={inputClass("district")} value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} placeholder="e.g. Dedza" />
                {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Manager</label>
                <input className={inputClass("manager")} value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} placeholder="Manager name" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                <select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#1a5c2a]" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-[#1a5c2a] rounded-lg hover:bg-[#134520] transition-colors disabled:opacity-60">
                  {saving ? "Saving…" : editingId ? "Save Changes" : "Add IPC"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

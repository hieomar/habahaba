"use client";

import { useState, useMemo, useRef } from "react";
import { DEFAULT_PERMISSIONS, MODULES, ACTIONS } from "@/auth/mockRoles";

const MOCK_ROLES_LIST = [
  { id: "role-sysadmin",          name: "System Administrator", platform: "Web Application", type: "System", status: "Active", usersAssigned: 1, description: "Full platform access across all 23 modules and governance controls." },
  { id: "role-warehouse-officer",  name: "Warehouse Officer",   platform: "Web Application", type: "System", status: "Active", usersAssigned: 3, description: "Granular receiving dock operations, GRNs, batching, inventory, and dispatch." },
  { id: "role-ipc-manager",        name: "IPC Manager",         platform: "Web Application", type: "System", status: "Active", usersAssigned: 2, description: "Regional IPC oversight, farmer registration, purchasing logs, and inventory." },
  { id: "role-head-office",        name: "Head Office Manager", platform: "Web Application", type: "System", status: "Active", usersAssigned: 1, description: "National procurement oversight, traceability audit, and executive reporting." },
];

function Badge({ label, color = "gray" }) {
  const c = {
    green:  "bg-emerald-50 text-emerald-800 border border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/40",
    blue:   "bg-gray-100 text-gray-800 border border-gray-200 dark:bg-[#282828] dark:text-gray-200 dark:border-[#383838]",
    amber:  "bg-gray-100 text-gray-700 border border-gray-200 dark:bg-[#282828] dark:text-gray-300 dark:border-[#383838]",
    purple: "bg-gray-100 text-gray-700 dark:bg-[#252525] dark:text-gray-300 border border-gray-200 dark:border-[#333]",
    gray:   "bg-gray-100 text-gray-600 dark:bg-[#252525] dark:text-gray-400 border border-gray-200 dark:border-[#333]",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium ${c[color] ?? c.gray}`}>
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

export default function RolesPermissionsPage() {
  const [rolesList, setRolesList]     = useState(MOCK_ROLES_LIST);
  const [selectedId, setSelectedId]   = useState("role-warehouse-officer");
  const [search, setSearch]           = useState("");
  const [filterType, setFilterType]   = useState("All");
  const [showCreate, setShowCreate]   = useState(false);
  const [toast, setToast]             = useState(null);

  const [newRoleForm, setNewRoleForm] = useState({ name: "", description: "" });
  const tableRef = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const filteredRoles = useMemo(() => {
    return rolesList.filter((r) => {
      const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase());
      const matchType   = filterType === "All" || r.type === filterType;
      return matchSearch && matchType;
    });
  }, [rolesList, search, filterType]);

  const selectedRole = useMemo(
    () => rolesList.find((r) => r.id === selectedId) ?? rolesList[0],
    [rolesList, selectedId]
  );

  const rolePerms = DEFAULT_PERMISSIONS[selectedRole?.id] ?? {};

  const handleCreateRole = (e) => {
    e.preventDefault();
    if (!newRoleForm.name.trim()) return;
    const newEntry = {
      id: `role-${Date.now()}`,
      name: newRoleForm.name.trim(),
      platform: "Web Application",
      type: "Custom",
      status: "Active",
      usersAssigned: 0,
      description: newRoleForm.description.trim() || "Custom security profile.",
    };
    setRolesList((prev) => [...prev, newEntry]);
    setSelectedId(newEntry.id);
    setShowCreate(false);
    setNewRoleForm({ name: "", description: "" });
    showToast(`Role "${newEntry.name}" created successfully!`);
  };

  const handleToggleStatus = (id) => {
    setRolesList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: r.status === "Active" ? "Inactive" : "Active" } : r))
    );
    showToast("Role status updated.");
  };

  // ── CSV Export ──
  const handleExportCSV = () => {
    const esc = (v) => { const s = String(v ?? ""); return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s; };
    const headers = ["Role ID", "Role Name", "Platform", "Type", "Assigned Users", "Status", "Description"];
    const rows = filteredRoles.map((r) => [r.id, r.name, r.platform, r.type, r.usersAssigned, r.status, r.description]);
    const csv = [headers.map(esc).join(","), ...rows.map((row) => row.map(esc).join(","))].join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `GTMS_System_Roles_${new Date().toISOString().slice(0, 10)}.csv`;
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
          <title>NASFAM GTMS System Roles Registry</title>
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
          <h2>NASFAM Platform Security Roles Registry</h2>
          <p>Printed: ${new Date().toLocaleString("en-GB")}</p>
          ${tableRef.current.innerHTML}
        </body>
      </html>
    `);
    doc.close(); iframe.contentWindow.focus(); iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-[#1a5c2a] text-white rounded-xl shadow-xl text-xs font-bold">
          {toast}
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Role Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Configure system roles, user assignments, and access privileges across the NASFAM GTMS platform.
          </p>
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
          <button onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a5c2a] text-white text-sm font-semibold hover:bg-[#134520] transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            Create Custom Role
          </button>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Platform Roles" value={rolesList.length} />
        <StatCard label="Active Roles" value={rolesList.filter((r) => r.status === "Active").length} />
        <StatCard label="System Built-In Roles" value={rolesList.filter((r) => r.type === "System").length} />
        <StatCard label="Custom Created Roles" value={rolesList.filter((r) => r.type === "Custom").length} />
      </div>

      {/* ── Main Roles Grid Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Roles Registry List */}
        <div className="space-y-3">
          <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-3 space-y-3">
            <input
              type="text"
              placeholder="Search roles…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-200 dark:border-[#333] rounded-lg outline-none bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1a5c2a]/30"
            />
            <div className="flex gap-1">
              {["All", "System", "Custom"].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`flex-1 py-1 text-xs font-semibold rounded-md transition-colors ${filterType === t ? "bg-[#1a5c2a] text-white" : "bg-gray-100 dark:bg-[#252525] text-gray-600 dark:text-gray-400 hover:bg-gray-200"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {filteredRoles.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedId(r.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${selectedId === r.id ? "border-[#1a5c2a] bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800" : "border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1c1c1c] hover:border-gray-300 dark:hover:border-[#333]"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{r.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{r.platform}</p>
                  </div>
                  <Badge label={r.status} color={r.status === "Active" ? "green" : "gray"} />
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 truncate">{r.description}</p>
                <div className="flex items-center gap-2 mt-2 text-xs font-mono font-semibold text-[#1a5c2a] dark:text-emerald-400">
                  <span>{r.type} Role</span>
                  <span>·</span>
                  <span>{r.usersAssigned} assigned user{r.usersAssigned !== 1 ? "s" : ""}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Selected Role Details & Granted Permissions Preview */}
        <div className="lg:col-span-2">
          <div ref={tableRef} className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-[#2a2a2a]">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">{selectedRole.name} Details</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{selectedRole.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleStatus(selectedRole.id)}
                  className="px-3 py-1.5 border border-gray-200 dark:border-[#333] rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#252525]"
                >
                  {selectedRole.status === "Active" ? "Deactivate Role" : "Activate Role"}
                </button>
              </div>
            </div>

            {/* Granted Modules Table Summary */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3">
                Module Permission Summary for {selectedRole.name}
              </h4>

              <div className="border border-gray-200 dark:border-[#2a2a2a] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#222]">
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-2.5">Module</th>
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-2.5">Granted Actions</th>
                      <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-2.5">Access Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MODULES.slice(0, 10).map((mod) => {
                      const modGrants = rolePerms[mod] ?? {};
                      const grantedActions = ACTIONS.filter((a) => modGrants[a]);
                      const hasAccess = grantedActions.length > 0;

                      return (
                        <tr key={mod} className="border-b border-gray-50 dark:border-[#2a2a2a]">
                          <td className="px-4 py-2.5 text-xs font-medium text-gray-800 dark:text-gray-200">{mod}</td>
                          <td className="px-4 py-2.5 text-xs">
                            {hasAccess ? (
                              <span className="font-mono text-[11px] text-gray-600 dark:text-gray-400">
                                {grantedActions.join(", ")}
                              </span>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-600 italic">No Access</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <Badge label={hasAccess ? "Access Granted" : "Restricted"} color={hasAccess ? "green" : "gray"} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Create Role Modal ── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-[#2a2a2a] rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-[#2a2a2a] pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Create Custom Role Profile</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-500 font-semibold mb-1">Role Name *</label>
                <input
                  type="text"
                  required
                  value={newRoleForm.name}
                  onChange={(e) => setNewRoleForm({ ...newRoleForm, name: e.target.value })}
                  placeholder="e.g. Finance Officer"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-gray-500 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newRoleForm.description}
                  onChange={(e) => setNewRoleForm({ ...newRoleForm, description: e.target.value })}
                  placeholder="Describe the operational responsibilities of this custom role…"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-[#2a2a2a]">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-[#333] rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1a5c2a] text-white rounded-lg font-semibold hover:bg-[#134520]"
                >
                  Create Custom Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

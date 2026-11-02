"use client";

import { useState, useMemo, useRef } from "react";
import { mockIPCs } from "@/lib/mockMasterData";

// ── Web & Mobile Role Options ──────────────────────────────────
const WEB_ROLES = [
  "System Administrator",
  "Warehouse Officer",
  "IPC Manager",
  "Head Office Manager",
];

const MOBILE_ROLES = [
  "Registration Officer",
  "Extension Officer",
  "Marketing Officer",
];

// ── Marketing Centres per IPC ──────────────────────────────────
const MARKETING_CENTRES_BY_IPC = {
  "Lilongwe IPC": [
    "Chifunga Marketing Centre",
    "Mbwatalika Marketing Centre",
    "Nsundwe Marketing Centre",
  ],
  "Mchinji IPC": [
    "Kapiri Marketing Centre",
    "Mkanda Marketing Centre",
  ],
  "Kasungu IPC": [
    "Central Marketing Centre",
  ],
  "Dedza IPC": [
    "Dedza Boma Marketing Centre",
  ],
};

// Initial Users List with Web & Mobile Users and Multi-Role Support
const INITIAL_USERS = [
  { id: "USR-001", name: "System Administrator",   email: "admin@nasfam.mw",        roles: ["System Administrator"],               assignedIPC: "National Head Office", assignedMarketingCentre: "None (IPC Only)", status: "Active", createdAt: "2024-01-15", platform: "Web Platform" },
  { id: "USR-002", name: "WH Officer - Lilongwe",  email: "wh.lilongwe@nasfam.mw",  roles: ["Warehouse Officer", "Marketing Officer"], assignedIPC: "Lilongwe IPC", assignedMarketingCentre: "Chifunga Marketing Centre", status: "Active", createdAt: "2024-02-01", platform: "Web & Mobile" },
  { id: "USR-003", name: "IPC Manager - Lilongwe", email: "ipc.lilongwe@nasfam.mw", roles: ["IPC Manager"],          assignedIPC: "Lilongwe IPC",   assignedMarketingCentre: "None (IPC Only)", status: "Active", createdAt: "2024-02-01", platform: "Web Platform" },
  { id: "USR-004", name: "WH Officer - Mchinji",   email: "wh.mchinji@nasfam.mw",   roles: ["Warehouse Officer"],    assignedIPC: "Mchinji IPC",    assignedMarketingCentre: "Kapiri Marketing Centre", status: "Active", createdAt: "2024-03-10", platform: "Web Platform" },
  { id: "USR-005", name: "Chikondi Phiri",         email: "c.phiri@nasfam.mw",      roles: ["Registration Officer", "Extension Officer"], assignedIPC: "Lilongwe IPC", assignedMarketingCentre: "Chifunga Marketing Centre", status: "Active", createdAt: "2024-03-15", platform: "Mobile App" },
  { id: "USR-006", name: "Gift Chisi",             email: "g.chisi@nasfam.mw",      roles: ["Extension Officer"],    assignedIPC: "Mchinji IPC",    assignedMarketingCentre: "Mkanda Marketing Centre", status: "Active", createdAt: "2024-04-01", platform: "Mobile App" },
  { id: "USR-007", name: "Banda Mvula",            email: "b.mvula@nasfam.mw",      roles: ["Marketing Officer"],    assignedIPC: "Kasungu IPC",    assignedMarketingCentre: "Central Marketing Centre", status: "Active", createdAt: "2024-04-12", platform: "Mobile App" },
  { id: "USR-008", name: "Head Office Manager",     email: "headoffice@nasfam.mw",   roles: ["Head Office Manager"],  assignedIPC: "National Head Office", assignedMarketingCentre: "None (IPC Only)", status: "Active", createdAt: "2024-01-20", platform: "Web Platform" },
  { id: "USR-009", name: "WH Officer - Kasungu",   email: "wh.kasungu@nasfam.mw",   roles: ["Warehouse Officer"],    assignedIPC: "Kasungu IPC",    assignedMarketingCentre: "None (IPC Only)", status: "Active", createdAt: "2024-06-15", platform: "Web Platform" },
];

function Badge({ label, color = "blue" }) {
  const c = {
    green:  "bg-emerald-50 text-emerald-800 border border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/40",
    blue:   "bg-gray-100 text-gray-800 border border-gray-200 dark:bg-[#282828] dark:text-gray-200 dark:border-[#383838]",
    amber:  "bg-gray-100 text-gray-700 border border-gray-200 dark:bg-[#282828] dark:text-gray-300 dark:border-[#383838]",
    purple: "bg-gray-100 text-gray-700 dark:bg-[#252525] dark:text-gray-300 border border-gray-200 dark:border-[#333]",
    gray:   "bg-gray-100 text-gray-600 dark:bg-[#252525] dark:text-gray-400 border border-gray-200 dark:border-[#333]",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium ${c[color] ?? c.blue}`}>
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

export default function UsersManagementPage() {
  const [usersList, setUsersList]   = useState(INITIAL_USERS);
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showModal, setShowModal]   = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [toast, setToast]           = useState(null);

  const [form, setForm] = useState({
    id: "",
    name: "",
    email: "",
    roles: ["Warehouse Officer"],
    assignedIPC: "Lilongwe IPC",
    assignedMarketingCentre: "None (IPC Only)",
    status: "Active",
  });

  const tableRef = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // ── Filtered Users ──
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const s = search.toLowerCase();
      const userRolesStr = (u.roles || []).join(" ").toLowerCase();
      const matchSearch =
        !search ||
        u.name.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s) ||
        userRolesStr.includes(s) ||
        (u.assignedIPC ?? "").toLowerCase().includes(s) ||
        (u.assignedMarketingCentre ?? "").toLowerCase().includes(s);
      const matchRole = roleFilter === "All" || (u.roles && u.roles.includes(roleFilter));
      return matchSearch && matchRole;
    });
  }, [usersList, search, roleFilter]);

  // ── Handlers ──
  const handleOpenAdd = () => {
    setEditingUser(null);
    setForm({
      id: `USR-00${usersList.length + 1}`,
      name: "",
      email: "",
      roles: ["Warehouse Officer"],
      assignedIPC: "Lilongwe IPC",
      assignedMarketingCentre: "None (IPC Only)",
      status: "Active",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (u) => {
    setEditingUser(u);
    setForm({
      id: u.id,
      name: u.name,
      email: u.email,
      roles: u.roles ? [...u.roles] : [u.role || "Warehouse Officer"],
      assignedIPC: u.assignedIPC ?? "National Head Office",
      assignedMarketingCentre: u.assignedMarketingCentre ?? "None (IPC Only)",
      status: u.status,
    });
    setShowModal(true);
  };

  const handleToggleRoleInForm = (roleName) => {
    setForm((prev) => {
      const current = prev.roles || [];
      const updated = current.includes(roleName)
        ? current.filter((r) => r !== roleName)
        : [...current, roleName];
      return { ...prev, roles: updated.length === 0 ? ["Warehouse Officer"] : updated };
    });
  };

  const handleToggleStatus = (id) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" } : u))
    );
    showToast("User account status updated.");
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      showToast("Please fill in all required fields.");
      return;
    }

    const hasWeb = (form.roles || []).some((r) => WEB_ROLES.includes(r));
    const hasMobile = (form.roles || []).some((r) => MOBILE_ROLES.includes(r));
    const platform = hasWeb && hasMobile ? "Web & Mobile" : hasMobile ? "Mobile App" : "Web Platform";

    if (editingUser) {
      setUsersList((prev) => prev.map((u) => (u.id === editingUser.id ? { ...u, ...form, platform } : u)));
      showToast("User account updated successfully.");
    } else {
      setUsersList((prev) => [...prev, { ...form, platform, createdAt: new Date().toISOString().slice(0, 10) }]);
      showToast("New user account registered successfully.");
    }
    setShowModal(false);
  };

  // ── CSV Export ──
  const handleExportCSV = () => {
    const esc = (v) => { const s = String(v ?? ""); return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s; };
    const headers = ["User ID", "Full Name", "Email Address", "Assigned Roles", "Platform Access", "Assigned IPC", "Assigned Marketing Centre", "Status", "Created Date"];
    const rows = filteredUsers.map((u) => [
      u.id,
      u.name,
      u.email,
      (u.roles || []).join(" | "),
      u.platform ?? "Web",
      u.assignedIPC ?? "Head Office",
      u.assignedMarketingCentre ?? "None (IPC Only)",
      u.status,
      u.createdAt,
    ]);

    const csv = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `GTMS_User_Accounts_${new Date().toISOString().slice(0, 10)}.csv`;
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
          <title>NASFAM GTMS — System User Accounts</title>
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
          <h2>NASFAM Grain Traceability System — User Accounts & Roles</h2>
          <p>Printed on: ${new Date().toLocaleString("en-GB")} — ${filteredUsers.length} user records</p>
          ${tableRef.current.innerHTML}
        </body>
      </html>
    `);
    doc.close(); iframe.contentWindow.focus(); iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold bg-[#1a5c2a] text-white border-emerald-600 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">User Accounts &amp; Multi-Role Assignment</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage Web Platform accounts and Mobile Field Officers with multi-role permissions and location assignments.</p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-[#333] rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1f1f1f] hover:bg-gray-50 dark:hover:bg-[#282828] hover:border-[#1a5c2a] dark:hover:border-emerald-600 hover:text-[#1a5c2a] dark:hover:text-emerald-400 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 whitespace-nowrap">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
          <button onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-[#333] rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1f1f1f] hover:bg-gray-50 dark:hover:bg-[#282828] hover:border-[#1a5c2a] dark:hover:border-emerald-600 hover:text-[#1a5c2a] dark:hover:text-emerald-400 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 whitespace-nowrap">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
          <button onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a5c2a] text-white text-xs font-semibold whitespace-nowrap hover:bg-[#134520] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
            Add New User
          </button>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Total Registered Users" value={usersList.length} />
        <StatCard label="Active Accounts" value={usersList.filter((u) => u.status === "Active").length} />
        <StatCard label="Mobile App Officers" value={usersList.filter((u) => u.platform === "Mobile App" || u.platform === "Web & Mobile").length} />
      </div>

      {/* ── Filter Controls ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-[#2a2a2a] rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-3 w-full">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-xs bg-white dark:bg-[#252525] text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            <option value="All">All System &amp; Mobile Roles</option>
            <optgroup label="Web Platform Roles">
              <option value="System Administrator">System Administrator</option>
              <option value="Warehouse Officer">Warehouse Officer</option>
              <option value="IPC Manager">IPC Manager</option>
              <option value="Head Office Manager">Head Office Manager</option>
            </optgroup>
            <optgroup label="Mobile App Roles">
              <option value="Registration Officer">Registration Officer</option>
              <option value="Extension Officer">Extension Officer</option>
              <option value="Marketing Officer">Marketing Officer</option>
            </optgroup>
          </select>

          <div className="relative flex-1 sm:w-64">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user name, email, or role…"
              className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-xs bg-white dark:bg-[#252525] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]/30"
            />
          </div>
        </div>
      </div>

      {/* ── Table View ── */}
      <div ref={tableRef} className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#222]">
                {["User ID", "Full Name", "Email Address", "Assigned System & Mobile Roles", "Platform", "Assigned Location (IPC / Centre)", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-sm text-gray-400">No users found matching your search.</td></tr>
              ) : filteredUsers.map((u) => (
                <tr key={u.id} className="border-b border-gray-50 dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-[#1a5c2a] dark:text-emerald-400 whitespace-nowrap">{u.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-mono text-xs">{u.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(u.roles || [u.role]).map((r) => (
                        <Badge
                          key={r}
                          label={r}
                          color={MOBILE_ROLES.includes(r) ? "purple" : r === "System Administrator" ? "emerald" : "blue"}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 font-medium whitespace-nowrap">{u.platform ?? "Web Platform"}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">
                    <div className="font-semibold text-gray-800 dark:text-gray-200">{u.assignedIPC ?? "National Head Office"}</div>
                    {u.assignedMarketingCentre && u.assignedMarketingCentre !== "None (IPC Only)" && (
                      <div className="text-[11px] text-[#1a5c2a] dark:text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                        <span>• {u.assignedMarketingCentre}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3"><Badge label={u.status} color={u.status === "Active" ? "green" : "gray"} /></td>
                  <td className="px-4 py-3 text-xs space-x-2 whitespace-nowrap">
                    <button onClick={() => handleOpenEdit(u)} className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Edit Roles</button>
                    <button onClick={() => handleToggleStatus(u.id)} className="text-gray-500 dark:text-gray-400 font-semibold hover:underline">
                      {u.status === "Active" ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Multi-Role Assignment Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-[#2a2a2a] pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {editingUser ? "Edit Account & Role Assignments" : "Register New System User"}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Assign single or multiple Web and Mobile application roles.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-gray-500 font-semibold mb-1">User ID</label>
                <input type="text" disabled value={form.id} className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg bg-gray-50 dark:bg-[#252525] text-gray-900 dark:text-white font-mono" />
              </div>

              <div>
                <label className="block text-gray-500 font-semibold mb-1">Full Name *</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. John Banda" className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]/30" />
              </div>

              <div>
                <label className="block text-gray-500 font-semibold mb-1">Email Address *</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. j.banda@nasfam.mw" className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]/30" />
              </div>

              {/* Multi-Role Selection Checkboxes */}
              <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-[#2a2a2a]">
                <div>
                  <label className="block text-gray-700 dark:text-gray-200 font-bold mb-1.5">Assign Web Platform Roles</label>
                  <div className="grid grid-cols-2 gap-2">
                    {WEB_ROLES.map((r) => {
                      const checked = (form.roles || []).includes(r);
                      return (
                        <label
                          key={r}
                          className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${checked ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 text-blue-900 dark:text-blue-200 font-semibold" : "bg-white dark:bg-[#252525] border-gray-200 dark:border-[#333] text-gray-600 dark:text-gray-300"}`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleToggleRoleInForm(r)}
                            className="rounded border-gray-300 text-[#1a5c2a] focus:ring-[#1a5c2a]"
                          />
                          <span className="text-xs">{r}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-200 font-bold mb-1.5">Assign Mobile App Field Roles</label>
                  <div className="grid grid-cols-2 gap-2">
                    {MOBILE_ROLES.map((r) => {
                      const checked = (form.roles || []).includes(r);
                      return (
                        <label
                          key={r}
                          className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${checked ? "bg-purple-50/80 dark:bg-purple-950/40 border-purple-400 text-purple-900 dark:text-purple-200 font-semibold" : "bg-white dark:bg-[#252525] border-gray-200 dark:border-[#333] text-gray-600 dark:text-gray-300"}`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleToggleRoleInForm(r)}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-xs">{r}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Location & Marketing Centre Dropdowns */}
              <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-[#2a2a2a]">
                <div>
                  <label className="block text-gray-700 dark:text-gray-200 font-bold mb-1">Step 1: Assigned IPC / Hub Location *</label>
                  <select
                    value={form.assignedIPC}
                    onChange={(e) => {
                      const newIPC = e.target.value;
                      setForm({
                        ...form,
                        assignedIPC: newIPC,
                        assignedMarketingCentre: "None (IPC Only)",
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]/30"
                  >
                    <option value="National Head Office">National Head Office</option>
                    {mockIPCs.map((ipc) => (
                      <option key={ipc.id} value={ipc.name}>
                        {ipc.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dependent Marketing Centre Dropdown */}
                {form.assignedIPC !== "National Head Office" && (
                  <div>
                    <label className="block text-gray-700 dark:text-gray-200 font-bold mb-1">
                      Step 2: Assigned Marketing Centre <span className="text-gray-400 font-normal">(Optional &mdash; select &quot;None (IPC Only)&quot; if user is IPC-level only)</span>
                    </label>
                    <select
                      value={form.assignedMarketingCentre || "None (IPC Only)"}
                      onChange={(e) => setForm({ ...form, assignedMarketingCentre: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]/30"
                    >
                      <option value="None (IPC Only)">None (IPC Only)</option>
                      {(MARKETING_CENTRES_BY_IPC[form.assignedIPC] || []).map((mc) => (
                        <option key={mc} value={mc}>
                          {mc}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-[#2a2a2a]">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-[#333] rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-[#1a5c2a] text-white rounded-lg font-semibold hover:bg-[#134520] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200">
                  Save User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

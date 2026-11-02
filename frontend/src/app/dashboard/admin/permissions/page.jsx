"use client";

import { useState, useMemo, useRef } from "react";
import { useAuth } from "@/auth/authContext";
import { MODULES, ACTIONS, DEFAULT_PERMISSIONS } from "@/auth/mockRoles";

// ── Role Metadata ─────────────────────────────────────────────
const ROLES_LIST = [
  { id: "role-sysadmin",          name: "System Administrator", scope: "National",  description: "Full platform access across all 23 modules and governance controls." },
  { id: "role-warehouse-officer",  name: "Warehouse Officer",   scope: "Depot Level",description: "Granular receiving dock operations, GRNs, batching, inventory, and dispatch." },
  { id: "role-ipc-manager",        name: "IPC Manager",         scope: "IPC Regional",description: "Regional IPC oversight, farmer registration, purchasing logs, and inventory." },
  { id: "role-head-office",        name: "Head Office Manager", scope: "Executive",   description: "National procurement oversight, traceability audit, and executive reporting." },
];

// ── Categorized Modules ───────────────────────────────────────
const MODULE_CATEGORIES = [
  {
    category: "Main & Core",
    modules: ["Dashboard"],
  },
  {
    category: "Operations",
    modules: [
      "Farmer Management",
      "Farm Management",
      "Commodity Purchases",
      "Bag Identification",
      "Warehouse",
      "GRN Management",
      "Batch Management",
      "Inventory",
      "Dispatch",
    ],
  },
  {
    category: "Intelligence",
    modules: ["Traceability", "Reports", "IPC Management"],
  },
  {
    category: "Administration",
    modules: [
      "User Management",
      "Role Management",
      "Permission Management",
      "Master Data",
      "Audit Logs",
      "Notifications",
      "Settings",
      "Profile",
    ],
  },
];

function Badge({ label, color = "gray" }) {
  const c = {
    green:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    blue:   "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    amber:  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    gray:   "bg-gray-100 text-gray-600 dark:bg-[#2a2a2a] dark:text-gray-400",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${c[color] ?? c.gray}`}>
      {label}
    </span>
  );
}

export default function PermissionManagementPage() {
  const { user } = useAuth();
  const [selectedRoleId, setSelectedRoleId] = useState("role-warehouse-officer");
  const [permissionsMap, setPermissionsMap] = useState(() => structuredClone(DEFAULT_PERMISSIONS));
  const [search, setSearch]                 = useState("");
  const [toast, setToast]                   = useState(null);

  const printRef = useRef(null);

  const currentRole = useMemo(
    () => ROLES_LIST.find((r) => r.id === selectedRoleId) ?? ROLES_LIST[0],
    [selectedRoleId]
  );

  const currentPerms = permissionsMap[selectedRoleId] ?? {};

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Single Action Toggle ──
  const togglePermission = (moduleName, actionName) => {
    setPermissionsMap((prev) => {
      const roleState = structuredClone(prev[selectedRoleId] ?? {});
      if (!roleState[moduleName]) {
        roleState[moduleName] = Object.fromEntries(ACTIONS.map((a) => [a, false]));
      }
      roleState[moduleName][actionName] = !roleState[moduleName][actionName];
      return { ...prev, [selectedRoleId]: roleState };
    });
  };

  // ── Row (Module) Toggle All ──
  const toggleRowAll = (moduleName) => {
    const modPerms = currentPerms[moduleName] ?? {};
    const allChecked = ACTIONS.every((a) => modPerms[a]);
    setPermissionsMap((prev) => {
      const roleState = structuredClone(prev[selectedRoleId] ?? {});
      roleState[moduleName] = Object.fromEntries(ACTIONS.map((a) => [a, !allChecked]));
      return { ...prev, [selectedRoleId]: roleState };
    });
  };

  // ── Presets ──
  const handleSelectAll = () => {
    setPermissionsMap((prev) => {
      const full = Object.fromEntries(
        MODULES.map((m) => [m, Object.fromEntries(ACTIONS.map((a) => [a, true]))])
      );
      return { ...prev, [selectedRoleId]: full };
    });
    showToast(`Granted full access permissions to ${currentRole.name}.`);
  };

  const handleReadOnly = () => {
    setPermissionsMap((prev) => {
      const ro = Object.fromEntries(
        MODULES.map((m) => [
          m,
          Object.fromEntries(ACTIONS.map((a) => [a, a === "View" || a === "Export"])),
        ])
      );
      return { ...prev, [selectedRoleId]: ro };
    });
    showToast(`Applied Read-Only preset to ${currentRole.name}.`);
  };

  const handleResetDefault = () => {
    setPermissionsMap((prev) => ({
      ...prev,
      [selectedRoleId]: structuredClone(DEFAULT_PERMISSIONS[selectedRoleId] ?? {}),
    }));
    showToast(`Reset ${currentRole.name} permissions to default system template.`);
  };

  const handleClearAll = () => {
    setPermissionsMap((prev) => {
      const empty = Object.fromEntries(
        MODULES.map((m) => [m, Object.fromEntries(ACTIONS.map((a) => [a, false]))])
      );
      return { ...prev, [selectedRoleId]: empty };
    });
    showToast(`Cleared all permissions for ${currentRole.name}.`, "warning");
  };

  const handleSavePermissions = () => {
    showToast(`Permission Matrix saved successfully for ${currentRole.name}!`);
  };

  // ── CSV Export ──
  const handleExportCSV = () => {
    const esc = (v) => { const s = String(v ?? ""); return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s; };
    const headers = ["Module", "Category", ...ACTIONS];
    const rows = [];
    MODULE_CATEGORIES.forEach((cat) => {
      cat.modules.forEach((mod) => {
        const modPerms = currentPerms[mod] ?? {};
        rows.push([mod, cat.category, ...ACTIONS.map((a) => (modPerms[a] ? "ALLOWED" : "DENIED"))]);
      });
    });
    const csv = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GTMS_Permissions_${selectedRoleId}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── Targeted Print ──
  const handlePrint = () => {
    if (!printRef.current) return;
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>NASFAM GTMS Permission Matrix — ${currentRole.name}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
            body { padding: 24px; color: #111; background: #fff; }
            h2 { font-size: 14px; font-weight: 700; margin-bottom: 4px; color: #1a5c2a; }
            p { font-size: 11px; color: #555; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th { text-align: left; padding: 7px 10px; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #555; border-bottom: 1px solid #e5e7eb; background: #f3f4f6; }
            td { padding: 6px 10px; border-bottom: 1px solid #f0f0f0; color: #333; }
            .allowed { color: #16a34a; font-weight: 700; }
            .denied { color: #dc2626; font-weight: 400; opacity: 0.6; }
          </style>
        </head>
        <body>
          <h2>NASFAM GTMS Role &amp; Permission Access Control Matrix</h2>
          <p>Target Role: <strong>${currentRole.name}</strong> (${currentRole.scope}) — Printed: ${new Date().toLocaleString("en-GB")}</p>
          ${printRef.current.innerHTML}
        </body>
      </html>
    `);
    doc.close();
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">

      {/* Toast notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl text-xs font-bold text-white transition-all ${toast.type === "warning" ? "bg-amber-600" : "bg-[#1a5c2a]"}`}>
          {toast.msg}
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Permission Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Role-Based Access Control (RBAC) Matrix — configure module-level action permissions per system role.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-[#333] rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1f1f1f] hover:bg-gray-50 dark:hover:bg-[#282828] hover:border-[#1a5c2a] dark:hover:border-emerald-600 hover:text-[#1a5c2a] dark:hover:text-emerald-400 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 group"
          >
            <svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-[#333] rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1f1f1f] hover:bg-gray-50 dark:hover:bg-[#282828] hover:border-[#1a5c2a] dark:hover:border-emerald-600 hover:text-[#1a5c2a] dark:hover:text-emerald-400 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 group"
          >
            <svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={handleSavePermissions}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a5c2a] text-white text-sm font-semibold hover:bg-[#134520] transition-colors"
          >
            Save Permission Matrix
          </button>
        </div>
      </div>

      {/* ── Role Selector Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ROLES_LIST.map((r) => {
          const isSelected = selectedRoleId === r.id;
          const rolePerms = permissionsMap[r.id] ?? {};
          const grantedCount = MODULES.reduce((acc, m) => {
            const count = ACTIONS.filter((a) => rolePerms[m]?.[a]).length;
            return acc + count;
          }, 0);

          return (
            <button
              key={r.id}
              onClick={() => setSelectedRoleId(r.id)}
              className={`p-4 text-left rounded-xl border transition-all ${isSelected ? "border-[#1a5c2a] dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20 ring-1 ring-[#1a5c2a]/30" : "border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1c1c1c] hover:border-gray-300 dark:hover:border-[#333]"}`}
            >
              <div className="flex justify-between items-start">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{r.name}</p>
                <Badge label={r.scope} color={isSelected ? "green" : "gray"} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{r.description}</p>
              <p className="text-[10px] font-mono font-semibold text-[#1a5c2a] dark:text-emerald-400 mt-2">
                {grantedCount} active permission grants
              </p>
            </button>
          );
        })}
      </div>

      {/* ── Quick Presets & Search Bar ── */}
      <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-4 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mr-1">Presets:</span>
          <button
            onClick={handleSelectAll}
            className="px-3 py-1.5 bg-gray-100 dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:border-[#1a5c2a] transition-colors"
          >
            Grant Full Access
          </button>
          <button
            onClick={handleReadOnly}
            className="px-3 py-1.5 bg-gray-100 dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:border-[#1a5c2a] transition-colors"
          >
            Read-Only (View &amp; Export)
          </button>
          <button
            onClick={handleResetDefault}
            className="px-3 py-1.5 bg-gray-100 dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:border-[#1a5c2a] transition-colors"
          >
            Reset to Role Template
          </button>
          <button
            onClick={handleClearAll}
            className="px-3 py-1.5 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
          >
            Clear All
          </button>
        </div>

        <div className="relative min-w-[200px]">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search modules…"
            className="w-full pl-9 pr-4 py-1.5 border border-gray-200 dark:border-[#333] rounded-lg text-xs bg-white dark:bg-[#252525] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]/30"
          />
        </div>
      </div>

      {/* ── Interactive Permission Matrix Table ── */}
      <div ref={printRef} className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#222] flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-800 dark:text-white uppercase tracking-wider">
            Permission Matrix for {currentRole.name}
          </h3>
          <Badge label={`${currentRole.scope} Scope`} color="green" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#222]">
                <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-3 w-64">
                  Module Name
                </th>
                <th className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-3 w-16">
                  All
                </th>
                {ACTIONS.map((act) => (
                  <th key={act} className="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-3">
                    {act}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULE_CATEGORIES.map((catGroup) => {
                const categoryModules = catGroup.modules.filter((m) =>
                  !search || m.toLowerCase().includes(search.toLowerCase())
                );

                if (categoryModules.length === 0) return null;

                return (
                  <tr key={catGroup.category} className="contents">
                    {/* Category Divider Header */}
                    <td colSpan={2 + ACTIONS.length} className="bg-gray-100/70 dark:bg-[#222] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-[#333]">
                      📁 {catGroup.category}
                    </td>

                    {categoryModules.map((modName) => {
                      const modPerms = currentPerms[modName] ?? {};
                      const grantedInRow = ACTIONS.filter((a) => modPerms[a]).length;
                      const allInRowChecked = grantedInRow === ACTIONS.length;

                      return (
                        <tr
                          key={modName}
                          className="border-b border-gray-50 dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#222] transition-colors"
                        >
                          {/* Module Label */}
                          <td className="px-4 py-3 font-medium text-gray-900 dark:text-white text-xs">
                            <div className="flex items-center justify-between">
                              <span>{modName}</span>
                              <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 ml-2">
                                {grantedInRow}/{ACTIONS.length}
                              </span>
                            </div>
                          </td>

                          {/* Row All Toggle */}
                          <td className="px-2 py-3 text-center">
                            <input
                              type="checkbox"
                              checked={allInRowChecked}
                              onChange={() => toggleRowAll(modName)}
                              className="w-4 h-4 rounded text-[#1a5c2a] focus:ring-[#1a5c2a] cursor-pointer"
                              title={`Toggle all actions for ${modName}`}
                            />
                          </td>

                          {/* Action Checkboxes */}
                          {ACTIONS.map((actName) => {
                            const isChecked = !!modPerms[actName];
                            return (
                              <td key={actName} className="px-3 py-3 text-center">
                                <label className="inline-flex items-center justify-center w-full cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => togglePermission(modName, actName)}
                                    className="w-4 h-4 rounded text-[#1a5c2a] focus:ring-[#1a5c2a] cursor-pointer"
                                  />
                                </label>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

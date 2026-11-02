"use client";

import { useState, useRef } from "react";
import { mockAuditLogs, AUDIT_SEVERITY } from "@/lib/mockAuditLogs";

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

const severityColor = {
  [AUDIT_SEVERITY.INFO]: "blue",
  [AUDIT_SEVERITY.WARNING]: "amber",
  [AUDIT_SEVERITY.CRITICAL]: "red"
};

function StatCard({ label, value }) {
  return (
    <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-4">
      <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
      <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
  );
}

export default function AuditLogsPage() {
  const [search, setSearch] = useState("");
  const tableRef = useRef(null);

  const filtered = mockAuditLogs.filter((log) => {
    const s = search.toLowerCase();
    return !search ||
      (log.userName ?? "").toLowerCase().includes(s) ||
      (log.description ?? "").toLowerCase().includes(s) ||
      (log.module ?? "").toLowerCase().includes(s) ||
      (log.action ?? "").toLowerCase().includes(s);
  });

  const criticalCount = mockAuditLogs.filter((a) => a.severity === AUDIT_SEVERITY.CRITICAL).length;
  const warningCount  = mockAuditLogs.filter((a) => a.severity === AUDIT_SEVERITY.WARNING).length;

  // ── CSV Export ──
  const handleExportCSV = () => {
    const esc = (v) => { const s = String(v ?? ""); return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s; };
    const headers = ["Log ID", "Action", "Module", "User", "Description", "Severity", "Timestamp"];
    const rows = filtered.map((l) => [l.id, l.action, l.module, l.userName ?? "System", l.description, l.severity, l.timestamp]);
    const csv = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `GTMS_Security_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`;
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
          <title>NASFAM GTMS System Security Audit Logs</title>
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
          <h2>NASFAM Security Audit Trail &amp; Activity Registry</h2>
          <p>Printed: ${new Date().toLocaleString("en-GB")} — ${filtered.length} audit records</p>
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
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">System Audit Logs</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Chronological records of all system activities, user logins, data edits, and security events.
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
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Audit Events Logged" value={mockAuditLogs.length} />
        <StatCard label="Critical Security Alerts" value={criticalCount} />
        <StatCard label="Warning Notifications" value={warningCount} />
        <StatCard label="Active Audit Modules" value="12 Modules" />
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-[#2a2a2a] rounded-xl p-4 flex flex-wrap justify-between items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user, description, module, or action..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]/30"
          />
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500">{filtered.length} audit records</span>
      </div>

      {/* Logs Table */}
      <div ref={tableRef} className="bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-[#2a2a2a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#222]">
                {["Log ID", "Action", "Module", "User", "Description", "Severity", "Timestamp"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">No security audit logs match your search.</td>
                </tr>
              ) : filtered.map((log) => (
                <tr key={log.id} className="border-b border-gray-50 dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-[#1a5c2a] dark:text-emerald-400 whitespace-nowrap">{log.id}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white text-xs">{log.action}</td>
                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{log.module}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{log.userName ?? "System"}</td>
                  <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-300 max-w-[300px] truncate">{log.description}</td>
                  <td className="px-4 py-3">
                    <Badge label={log.severity} color={severityColor[log.severity] ?? "gray"} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{log.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

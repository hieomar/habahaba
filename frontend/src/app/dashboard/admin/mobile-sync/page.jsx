"use client";

import { useState, useMemo, useRef } from "react";
import { mockSyncDevices, mockSyncHistory, mockSyncMetrics, SYNC_STATUSES } from "@/auth/mockSync";

function Badge({ label, color = "gray" }) {
  const c = {
    green:  "bg-emerald-50 text-emerald-800 border border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/40",
    blue:   "bg-gray-100 text-gray-800 border border-gray-200 dark:bg-[#282828] dark:text-gray-200 dark:border-[#383838]",
    amber:  "bg-gray-100 text-gray-700 border border-gray-200 dark:bg-[#282828] dark:text-gray-300 dark:border-[#383838]",
    gray:   "bg-gray-100 text-gray-600 dark:bg-[#252525] dark:text-gray-400 border border-gray-200 dark:border-[#333]",
    red:    "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900/40",
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium ${c[color] ?? c.gray}`}>{label}</span>;
}

const statusColor = {
  [SYNC_STATUSES.SYNCED]: "green",
  [SYNC_STATUSES.IN_PROGRESS]: "blue",
  [SYNC_STATUSES.PENDING]: "amber",
  [SYNC_STATUSES.FAILED]: "red",
};

export default function MobileSyncPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [connectivityFilter, setConnectivityFilter] = useState("All");
  const [devices, setDevices] = useState(mockSyncDevices);
  const [history, setHistory] = useState(mockSyncHistory);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [syncingDeviceId, setSyncingDeviceId] = useState(null);

  const filteredDevices = useMemo(() => {
    return devices.filter((d) => {
      const s = search.toLowerCase();
      const matchSearch = !search || d.officerName.toLowerCase().includes(s) || d.deviceModel.toLowerCase().includes(s) || d.id.toLowerCase().includes(s);
      const matchStatus = statusFilter === "All" || d.syncStatus === statusFilter;
      const matchConnectivity = connectivityFilter === "All" || d.connectivity === connectivityFilter;
      return matchSearch && matchStatus && matchConnectivity;
    });
  }, [devices, search, statusFilter, connectivityFilter]);

  const triggerSync = (deviceId) => {
    setSyncingDeviceId(deviceId);
    setTimeout(() => {
      setDevices((prev) =>
        prev.map((d) =>
          d.id === deviceId
            ? {
                ...d,
                syncStatus: SYNC_STATUSES.SYNCED,
                recordsUploaded: d.recordsUploaded + d.pendingRecords,
                pendingRecords: 0,
                failedRecords: 0,
                lastSync: new Date().toISOString(),
              }
            : d
        )
      );
      setHistory((prev) => [
        {
          id: `sync-${Date.now()}`,
          timestamp: new Date().toISOString(),
          officerId: devices.find((d) => d.id === deviceId)?.officerId ?? "usr-unknown",
          officerName: devices.find((d) => d.id === deviceId)?.officerName ?? "Officer",
          action: "MANUAL_SYNC_COMPLETED",
          recordType: "Field Records",
          recordsCount: devices.find((d) => d.id === deviceId)?.pendingRecords ?? 1,
          status: "Success",
          device: devices.find((d) => d.id === deviceId)?.deviceModel ?? "Mobile Device",
        },
        ...prev,
      ]);
      setSyncingDeviceId(null);
    }, 1200);
  };

  const triggerSyncAll = () => {
    setSyncingDeviceId("ALL");
    setTimeout(() => {
      setDevices((prev) =>
        prev.map((d) => ({
          ...d,
          syncStatus: SYNC_STATUSES.SYNCED,
          recordsUploaded: d.recordsUploaded + d.pendingRecords,
          pendingRecords: 0,
          failedRecords: 0,
          lastSync: new Date().toISOString(),
        }))
      );
      setSyncingDeviceId(null);
    }, 1500);
  };

  const tableRef = useRef(null);

  const exportCSV = () => {
    const esc = (v) => { const s = String(v ?? ""); return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s; };
    const headers = ["Device ID", "Officer Name", "Device Model", "OS Version", "App Version", "Uploaded Records", "Pending Records", "Failed Records", "Connectivity", "Last Sync", "Sync Status"];
    const rows = filteredDevices.map((d) => [d.id, d.officerName, d.deviceModel, d.osVersion, d.appVersion, d.recordsUploaded, d.pendingRecords, d.failedRecords, d.connectivity, d.lastSync, d.syncStatus]);
    const csv = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `GTMS_Mobile_Sync_Devices_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const printTable = () => {
    if (!tableRef.current) return;
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`<!DOCTYPE html><html><head><title>Mobile Sync Status</title><style>*{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}body{padding:20px;color:#111}h2{font-size:13px;font-weight:700;margin-bottom:4px}p{font-size:10px;color:#555;margin-bottom:14px}table{width:100%;border-collapse:collapse;font-size:11px}th{text-align:left;padding:7px 10px;font-size:10px;font-weight:700;text-transform:uppercase;color:#555;border-bottom:1px solid #e5e7eb;background:#f3f4f6}td{padding:6px 10px;border-bottom:1px solid #f0f0f0;color:#333}</style></head><body><h2>Mobile Device Synchronization Status</h2><p>NASFAM GTMS — Printed: ${new Date().toLocaleString("en-GB")} — ${filteredDevices.length} registered devices</p>${tableRef.current.innerHTML}</body></html>`);
    doc.close(); iframe.contentWindow.focus(); iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mobile Data Synchronization &amp; Device Health</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Monitor real-time offline data sync queues, device health, and field officer sync activity.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <button onClick={printTable}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-[#333] rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1f1f1f] hover:bg-gray-50 dark:hover:bg-[#282828] hover:border-[#1a5c2a] dark:hover:border-emerald-600 hover:text-[#1a5c2a] dark:hover:text-emerald-400 hover:shadow-md transition-all duration-200 group">
            <svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Status
          </button>
          <button onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-[#333] rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1f1f1f] hover:bg-gray-50 dark:hover:bg-[#282828] hover:border-[#1a5c2a] dark:hover:border-emerald-600 hover:text-[#1a5c2a] dark:hover:text-emerald-400 hover:shadow-md transition-all duration-200 group">
            <svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={triggerSyncAll}
            disabled={syncingDeviceId === "ALL"}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a5c2a] text-white text-sm font-semibold hover:bg-[#134520] transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            <svg className={`w-4 h-4 ${syncingDeviceId === "ALL" ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {syncingDeviceId === "ALL" ? "Syncing Devices…" : "Sync All Devices"}
          </button>
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Field Devices", value: devices.length, sub: "Registered Field Phones", color: "emerald" },
          { label: "Fully Synced", value: devices.filter((d) => d.syncStatus === SYNC_STATUSES.SYNCED).length, sub: "Up-to-date queues", color: "green" },
          { label: "Syncing / Pending", value: devices.filter((d) => d.syncStatus === SYNC_STATUSES.IN_PROGRESS || d.syncStatus === SYNC_STATUSES.PENDING).length, sub: "Records queued offline", color: "blue" },
          { label: "Failed / Retrying", value: devices.filter((d) => d.syncStatus === SYNC_STATUSES.FAILED).length, sub: "Network timeouts", color: "red" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-4">
            <p className="text-xs text-gray-400 dark:text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{s.value}</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by officer name, device model, or ID…"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]/30"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-700 dark:text-gray-300 focus:outline-none"
        >
          <option value="All">All Sync Statuses</option>
          {Object.values(SYNC_STATUSES).map((st) => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>
        <select
          value={connectivityFilter}
          onChange={(e) => setConnectivityFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-700 dark:text-gray-300 focus:outline-none"
        >
          <option value="All">All Connections</option>
          <option value="WiFi">Wi-Fi</option>
          <option value="Cellular">Cellular (3G/4G)</option>
          <option value="No Connection">No Connection / Offline</option>
        </select>
        <span className="self-center text-xs text-gray-400">{filteredDevices.length} device{filteredDevices.length !== 1 ? "s" : ""}</span>
      </div>

      {/* ── Registered Field Devices Table ── */}
      <div ref={tableRef} className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#222] flex items-center justify-between">
          <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Field Officer Mobile Devices &amp; Sync Queues
          </h3>
          <span className="text-xs text-gray-400">Success Rate: {mockSyncMetrics.successRate}%</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#222]">
                {["Officer Name", "Device & App Version", "Connectivity", "Uploaded", "Pending Queue", "Last Sync", "Sync Status", "Actions"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-sm text-gray-400">No mobile devices match the filters.</td>
                </tr>
              ) : (
                filteredDevices.map((d) => {
                  const isSyncing = syncingDeviceId === d.id;
                  return (
                    <tr key={d.id} className="border-b border-gray-50 dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#222] transition-colors cursor-pointer" onClick={() => setSelectedDevice(d)}>
                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-900 dark:text-white">{d.officerName}</p>
                        <p className="text-xs text-gray-400 font-mono">{d.officerId}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800 dark:text-gray-200 text-xs">{d.deviceModel}</p>
                        <p className="text-[11px] text-gray-400">{d.osVersion} · App v{d.appVersion}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700 dark:bg-[#2a2a2a] dark:text-gray-300 border border-gray-200 dark:border-[#333]">
                          {d.connectivity}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 font-mono text-xs">{d.recordsUploaded} recs</td>
                      <td className="px-4 py-3 font-mono text-xs">
                        <span className="font-semibold text-gray-600 dark:text-gray-400">
                          {d.pendingRecords} pending
                        </span>
                        {d.failedRecords > 0 && <span className="text-red-600 dark:text-red-400 text-[10px] block font-semibold">{d.failedRecords} failed</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(d.lastSync).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}
                      </td>
                      <td className="px-4 py-3">
                        <Badge label={d.syncStatus} color={statusColor[d.syncStatus] ?? "gray"} />
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => triggerSync(d.id)}
                          disabled={isSyncing}
                          className="px-2.5 py-1 rounded border border-gray-200 dark:border-[#333] hover:border-[#1a5c2a] text-xs font-semibold text-[#1a5c2a] dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors whitespace-nowrap disabled:opacity-50"
                        >
                          {isSyncing ? "Syncing…" : "Trigger Sync"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Recent Synchronization Log & Diagnostics ── */}
      <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2a2a2a] pb-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Recent Mobile Sync Activity Log</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Live feed of offline record uploads and synchronization diagnostics</p>
          </div>
          <span className="text-xs text-gray-400 font-mono">Avg Sync Time: {mockSyncMetrics.averageSyncTime}</span>
        </div>

        <div className="space-y-2.5">
          {history.map((log) => (
            <div key={log.id} className="p-3 bg-gray-50 dark:bg-[#222] rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-gray-100 dark:border-[#2a2a2a] text-xs">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 opacity-60" />
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{log.officerName} — <span className="font-normal text-gray-500">{log.action}</span></p>
                  <p className="text-[11px] text-gray-500">{log.recordType} ({log.recordsCount} records) · Device: {log.device}</p>
                  {log.errorMessage && <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold mt-0.5">⚠️ {log.errorMessage}</p>}
                </div>
              </div>
              <div className="text-right self-end sm:self-auto text-gray-400 font-mono text-[11px]">
                {new Date(log.timestamp).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "medium" })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Device Detail Drawer ── */}
      {selectedDevice && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setSelectedDevice(null)}>
          <div className="w-full max-w-md bg-white dark:bg-[#1c1c1c] rounded-2xl border border-gray-200 dark:border-[#2a2a2a] shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2a2a2a] pb-3">
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white">{selectedDevice.officerName}</h2>
                <p className="text-xs text-gray-500 font-mono">{selectedDevice.id} · {selectedDevice.deviceModel}</p>
              </div>
              <Badge label={selectedDevice.syncStatus} color={statusColor[selectedDevice.syncStatus] ?? "gray"} />
            </div>

            <div className="space-y-2 text-xs">
              {[
                ["Field Officer", selectedDevice.officerName],
                ["Device Model", selectedDevice.deviceModel],
                ["Android Version", selectedDevice.osVersion],
                ["App Build Version", `v${selectedDevice.appVersion}`],

                ["Network Connection", selectedDevice.connectivity],
                ["Uploaded Records", `${selectedDevice.recordsUploaded} records`],
                ["Pending Offline Queue", `${selectedDevice.pendingRecords} records`],
                ["Failed Sync Attempts", `${selectedDevice.failedRecords} records`],
                ["Last Successful Sync", new Date(selectedDevice.lastSync).toLocaleString("en-GB")],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between py-1 border-b border-gray-50 dark:border-[#2a2a2a]">
                  <span className="text-gray-400">{label}</span>
                  <span className="font-semibold text-gray-800 dark:text-white">{val}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setSelectedDevice(null)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-[#333] text-sm font-semibold text-gray-700 dark:text-gray-300">
                Close
              </button>
              <button
                onClick={() => { triggerSync(selectedDevice.id); setSelectedDevice(null); }}
                className="px-4 py-2 rounded-lg bg-[#1a5c2a] text-white text-sm font-semibold hover:bg-[#134520] transition-colors"
              >
                Force Sync Device
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useMemo, useRef } from "react";
import { useAuth } from "@/auth/authContext";
import { mockGRNs } from "@/lib/mockGRNs";
import { mockInventory, mockDispatches, mockBatches } from "@/lib/mockWarehouseOps";
import { SEED_FARMERS } from "@/lib/mockFarmers";
import { SEED_PURCHASES } from "@/lib/mockPurchases";
import { mockIPCs } from "@/lib/mockMasterData";
import { mockAuditLogs } from "@/lib/mockAuditLogs";

// ── Inline mock users ─────────────────────────────────────────
const mockUsers = [
  { id: "USR-001", name: "System Administrator",   email: "admin@nasfam.mw",        role: "System Admin",         assignedIPC: null,             status: "Active", createdAt: "2024-01-15" },
  { id: "USR-002", name: "WH Officer - Lilongwe",  email: "wh.lilongwe@nasfam.mw",  role: "Warehouse Officer",    assignedIPC: "Lilongwe IPC",   status: "Active", createdAt: "2024-02-01" },
  { id: "USR-003", name: "IPC Manager - Lilongwe", email: "ipc.lilongwe@nasfam.mw", role: "IPC Manager",          assignedIPC: "Lilongwe IPC",   status: "Active", createdAt: "2024-02-01" },
  { id: "USR-004", name: "WH Officer - Mchinji",   email: "wh.mchinji@nasfam.mw",   role: "Warehouse Officer",    assignedIPC: "Mchinji IPC",    status: "Active", createdAt: "2024-03-10" },
  { id: "USR-005", name: "IPC Manager - Mchinji",  email: "ipc.mchinji@nasfam.mw",  role: "IPC Manager",          assignedIPC: "Mchinji IPC",    status: "Active", createdAt: "2024-03-10" },
  { id: "USR-006", name: "Head Office Manager",     email: "headoffice@nasfam.mw",   role: "Head Office Manager",  assignedIPC: null,             status: "Active", createdAt: "2024-01-20" },
  { id: "USR-007", name: "WH Officer - Kasungu",   email: "wh.kasungu@nasfam.mw",   role: "Warehouse Officer",    assignedIPC: "Kasungu IPC",    status: "Active", createdAt: "2024-06-15" },
];

// ── Role-Specific Report Definitions ──────────────────────────
const ROLE_REPORT_DEFINITIONS = {
  "role-warehouse-officer": [
    { id: "grn-summary",       title: "Commodity Goods Received (GRN) Summary Report",        category: "Warehouse",   description: "Official GRNs, commodities, moisture levels, and quality status." },
    { id: "warehouse-inventory",title: "Warehouse Inventory & Stock Balance Report",           category: "Warehouse",   description: "Real-time stock balance, bag counts, and capacity utilization." },
    { id: "commodity-dispatch", title: "Commodity Dispatch & Outbound Delivery Report",        category: "Dispatch",    description: "Outbound dispatches, destination customers, vehicle registrations." },
    { id: "bag-verification",   title: "Bag Identification & Quality Inspection Log",          category: "Quality",     description: "Bag tracking records, individual weights, moisture tests, remarks." },
  ],
  "role-ipc-manager": [
    { id: "ipc-farmers",        title: "IPC Farmer Registration & Demographics Report",        category: "Farmers",     description: "Registered farmers, associations, clubs, and landholding in the IPC." },
    { id: "ipc-purchases",      title: "IPC Commodity Purchase & Buying Centre Report",        category: "Purchases",   description: "Procurement volumes, prices, buying centre performance, daily logs." },
    { id: "ipc-seed-loans",     title: "IPC Seed Loan Disbursement & Recovery Report",         category: "Loans",       description: "Seed input loans issued to farmers, deductions, and recovery." },
    { id: "ipc-warehouse-stock",title: "IPC Warehouse Utilization & Capacity Report",          category: "Inventory",   description: "Warehouse stock levels, bin allocations, and storage capacity." },
    { id: "ipc-staff-activity", title: "IPC Staff Field Visit & Activity Log",                 category: "Operations",  description: "Field officer visit logs, crop inspections, and marketing activities." },
  ],
  "role-head-office": [
    { id: "national-procurement",title: "National Grain Procurement & Volume Summary Report",  category: "Executive",   description: "National procurement totals across all IPCs, commodity breakdown." },
    { id: "ipc-rankings",        title: "IPC Comparative Performance & Ranking Scorecard",     category: "Executive",   description: "Side-by-side benchmarking across Lilongwe, Mchinji, and Kasungu IPCs." },
    { id: "national-seed-loans", title: "National Seed Loan Recovery & Financial Summary",     category: "Financial",   description: "National loan recovery rates, outstanding balances, repayments." },
    { id: "national-stock",      title: "National Warehouse Stock & Capacity Health Report",   category: "Inventory",   description: "National warehouse inventory, MT stored, capacity, stock health." },
    { id: "provenance-audit",    title: "National Provenance & Traceability Audit Trail",      category: "Traceability",description: "Complete grain chain of custody from farmer origin to dispatch." },
  ],
  "role-sysadmin": [
    { id: "user-access",        title: "User Accounts & Access Privilege Audit Report",        category: "Administration",description: "Active users, assigned roles, permissions, and status registry." },
    { id: "security-audit",     title: "System Security Audit Log & Activity Trail Report",    category: "Security",    description: "Logins, password changes, data edits, role modifications, activity logs." },
    { id: "sync-health",        title: "Mobile Device Data Sync & System Health Report",       category: "Infrastructure",description: "Sync logs from field devices, sync failures, offline queue, uptime." },
  ],
};

// ── Brand Badge (matches all other pages) ─────────────────────
function Badge({ label, color = "gray" }) {
  const c = {
    green:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    blue:   "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    amber:  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    gray:   "bg-gray-100 text-gray-600 dark:bg-[#2a2a2a] dark:text-gray-400",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    red:    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${c[color] ?? c.gray}`}>
      {label}
    </span>
  );
}

// ── Generate table data for selected report ───────────────────
function buildReportData(selectedReportId) {
  switch (selectedReportId) {
    case "grn-summary":
      return {
        headers: ["GRN Number", "Warehouse", "IPC", "Commodity", "Bags", "Weight (kg)", "Moisture %", "Condition", "Date"],
        rows: mockGRNs.map((g) => [g.grnNumber, g.warehouseName, g.ipc, g.commodity, g.numberOfBags, `${g.quantityKg} kg`, `${g.moistureContent}%`, g.condition, g.dateReceived]),
      };
    case "warehouse-inventory":
    case "ipc-warehouse-stock":
    case "national-stock":
      return {
        headers: ["Warehouse", "IPC", "Commodity", "Current Stock (kg)", "Bag Count", "Capacity (kg)", "Utilization %", "Status"],
        rows: mockInventory.map((i) => [i.warehouseName, i.ipc, i.commodity, `${i.currentStockKg.toLocaleString()} kg`, `${i.numberOfBags} bags`, `${i.capacityKg.toLocaleString()} kg`, `${i.utilizationPercent}%`, i.status]),
      };
    case "commodity-dispatch":
      return {
        headers: ["Dispatch #", "Customer", "Commodity", "Bags", "Weight (kg)", "Vehicle", "Driver", "Date", "Status"],
        rows: mockDispatches.map((d) => [d.dispatchNumber, d.customerName, d.commodity, `${d.numberOfBags} bags`, `${d.quantityKg} kg`, d.vehicleReg, d.driverName, d.dispatchDate, d.status]),
      };
    case "ipc-farmers":
    case "national-farmers":
      return {
        headers: ["Farmer ID", "Full Name", "District", "Village", "Association", "Club", "Status"],
        rows: SEED_FARMERS.map((f) => [f.id, f.fullName, f.district, f.village, f.association || "—", f.club || "—", "Active"]),
      };
    case "ipc-purchases":
    case "national-procurement":
      return {
        headers: ["Receipt #", "Farmer Name", "IPC", "Commodity", "Weight (kg)", "Purchase Date", "Status"],
        rows: SEED_PURCHASES.map((p) => [p.receiptNumber, p.farmerName, p.ipc, p.commodity, `${p.totalWeight} kg`, p.purchaseDate, p.status]),
      };
    case "user-access":
      return {
        headers: ["User ID", "Name", "Email", "Role", "Assigned IPC", "Status", "Created"],
        rows: mockUsers.map((u) => [u.id, u.name, u.email, u.role, u.assignedIPC ?? "Head Office", u.status, u.createdAt]),
      };
    case "security-audit":
      return {
        headers: ["Log ID", "Action", "Module", "User", "Description", "Severity", "Timestamp"],
        rows: mockAuditLogs.map((a) => [a.id, a.action, a.module, a.userName ?? "System", a.description, a.severity, a.timestamp?.slice(0, 10)]),
      };
    default:
      return {
        headers: ["IPC Name", "District", "Region", "Farmers", "Warehouses", "Status"],
        rows: mockIPCs.map((ipc) => [ipc.name, ipc.district, ipc.region, ipc.farmerCount.toString(), ipc.warehouseCount.toString(), ipc.status]),
      };
  }
}

export default function ReportsHubPage() {
  const { user } = useAuth();
  const role = user?.roleId ?? "role-sysadmin";

  const availableReports = ROLE_REPORT_DEFINITIONS[role] ?? ROLE_REPORT_DEFINITIONS["role-sysadmin"];
  const [selectedReportId, setSelectedReportId] = useState(availableReports[0]?.id);
  const [ipcFilter, setIpcFilter]           = useState("All");
  const [commodityFilter, setCommodityFilter] = useState("All");
  const [startDate, setStartDate]           = useState("");
  const [endDate, setEndDate]               = useState("");

  const [appliedFilters, setAppliedFilters] = useState({
    startDate: "",
    endDate: "",
    ipc: "All",
    commodity: "All",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [dateError, setDateError] = useState("");

  const currentReport = useMemo(
    () => availableReports.find((r) => r.id === selectedReportId) ?? availableReports[0],
    [availableReports, selectedReportId]
  );

  const rawReportData = useMemo(() => buildReportData(selectedReportId), [selectedReportId]);

  const handleGenerateReport = () => {
    const today = new Date().toISOString().slice(0, 10);

    if (startDate && startDate > today) {
      setDateError("Starting date cannot be in the future.");
      return;
    }
    const effectiveEndDate = endDate || today;
    if (startDate && effectiveEndDate < startDate) {
      setDateError("End date cannot be earlier than starting date.");
      return;
    }
    setDateError("");
    setIsGenerating(true);
    setTimeout(() => {
      setAppliedFilters({ startDate, endDate: effectiveEndDate, ipc: ipcFilter, commodity: commodityFilter });
      setIsGenerating(false);
    }, 200);
  };

  const filteredRows = useMemo(() => {
    const { startDate: sDate, endDate: eDate, ipc, commodity } = appliedFilters;
    return rawReportData.rows.filter((row) => {
      const rowString = row.join(" ").toLowerCase();

      // IPC Filter
      if (ipc !== "All" && !rowString.includes(ipc.toLowerCase())) return false;

      // Commodity Filter
      if (commodity !== "All" && !rowString.includes(commodity.toLowerCase())) return false;

      // Date Range Filter
      if (sDate || eDate) {
        const dateVal = row.find((val) => typeof val === "string" && /^\d{4}[-/]\d{2}[-/]\d{2}/.test(val));
        if (dateVal) {
          const rowDate = new Date(dateVal.slice(0, 10));
          if (sDate && rowDate < new Date(sDate)) return false;
          if (eDate && rowDate > new Date(`${eDate}T23:59:59`)) return false;
        }
      }
      return true;
    });
  }, [rawReportData, appliedFilters]);

  const reportData = useMemo(() => ({
    headers: rawReportData.headers,
    rows: filteredRows,
  }), [rawReportData.headers, filteredRows]);

  const printRef = useRef(null);

  // ── CSV Export with UTF-8 BOM (opens cleanly in Excel) ───────
  const handleExport = () => {
    const escape = (v) => {
      const s = String(v ?? "");
      return s.includes(",") || s.includes('"') || s.includes("\n")
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    };
    const csvLines = [
      reportData.headers.map(escape).join(","),
      ...reportData.rows.map((r) => r.map(escape).join(",")),
    ];
    // UTF-8 BOM prefix so Excel opens with correct encoding
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvLines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `GTMS_${currentReport.id}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── Targeted Print — only the report table, not the whole page ─
  const handlePrint = () => {
    if (!printRef.current) return;
    const tableHTML = printRef.current.innerHTML;
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>GTMS Report — ${currentReport.title}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
            body { padding: 24px; color: #111; background: #fff; }
            h2 { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
            p  { font-size: 11px; color: #555; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            thead tr { background: #f3f4f6; }
            th { text-align: left; padding: 8px 10px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #555; border-bottom: 1px solid #e5e7eb; white-space: nowrap; }
            td { padding: 7px 10px; border-bottom: 1px solid #f0f0f0; color: #333; white-space: nowrap; }
            tr:last-child td { border-bottom: none; }
            .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
            .meta { font-size: 10px; color: #888; text-align: right; }
          </style>
        </head>
        <body>
          <div class="header-row">
            <div>
              <h2>${currentReport.title}</h2>
              <p>NASFAM Grain Traceability Management System</p>
            </div>
            <div class="meta">
              Printed: ${new Date().toLocaleString("en-GB")}<br/>
              Records: ${reportData.rows.length}
            </div>
          </div>
          ${tableHTML}
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

      {/* ── Header (matches all other pages) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Reports &amp; Intelligence Hub</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Role-tailored reports — {availableReports.length} report{availableReports.length !== 1 ? "s" : ""} available for your role.
          </p>
        </div>
        <div className="flex gap-2 self-start">
          <button onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-[#333] rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1f1f1f] hover:bg-gray-50 dark:hover:bg-[#282828] hover:border-[#1a5c2a] dark:hover:border-emerald-600 hover:text-[#1a5c2a] dark:hover:text-emerald-400 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 group">
            <svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Report
          </button>
          <button onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-[#333] rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1f1f1f] hover:bg-gray-50 dark:hover:bg-[#282828] hover:border-[#1a5c2a] dark:hover:border-emerald-600 hover:text-[#1a5c2a] dark:hover:text-emerald-400 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 group">
            <svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Report Selector ── */}
      <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
              Select Report
            </label>
            <select
              value={selectedReportId}
              onChange={(e) => setSelectedReportId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]/30"
            >
              {availableReports.map((r) => (
                <option key={r.id} value={r.id}>[{r.category}] {r.title}</option>
              ))}
            </select>
          </div>
          <Badge label={currentReport.category} color="green" />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          {currentReport.description}
        </p>
      </div>

      {/* ── Filter Bar (matches existing filter pattern) ── */}
      <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-4 space-y-3">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] font-semibold uppercase text-gray-400 dark:text-gray-500 mb-1">IPC Filter</label>
            <select value={ipcFilter} onChange={(e) => setIpcFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-700 dark:text-gray-300 focus:outline-none">
              <option value="All">All IPCs</option>
              <option>Lilongwe IPC</option>
              <option>Mchinji IPC</option>
              <option>Kasungu IPC</option>
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] font-semibold uppercase text-gray-400 dark:text-gray-500 mb-1">Commodity</label>
            <select value={commodityFilter} onChange={(e) => setCommodityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-700 dark:text-gray-300 focus:outline-none">
              <option value="All">All Commodities</option>
              <option>Maize</option>
              <option>Soya</option>
              <option>Groundnuts</option>
              <option>Cotton</option>
            </select>
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] font-semibold uppercase text-gray-400 dark:text-gray-500 mb-1">Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]/30" />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-[10px] font-semibold uppercase text-gray-400 dark:text-gray-500 mb-1">End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]/30" />
          </div>
          <div>
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a5c2a] text-white text-sm font-semibold hover:bg-[#134520] transition-all duration-200 disabled:opacity-50 whitespace-nowrap shadow-sm hover:shadow"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {isGenerating ? "Generating…" : "Generate Report"}
            </button>
          </div>
        </div>
        {dateError && (
          <p className="text-xs font-semibold text-red-600 dark:text-red-400">{dateError}</p>
        )}
      </div>

      {/* ── Report Data Table (same pattern as GRN/batches/inventory) ── */}
      <div ref={printRef} className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#222] flex items-center justify-between">
          <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            {currentReport.title}
          </h3>
          <span className="text-xs text-gray-400">{reportData.rows.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#222]">
                {reportData.headers.map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reportData.rows.length === 0 ? (
                <tr>
                  <td colSpan={reportData.headers.length} className="text-center py-12 text-sm text-gray-400">
                    No records found.
                  </td>
                </tr>
              ) : reportData.rows.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-50 dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
                  {row.map((val, cellIdx) => (
                    <td key={cellIdx} className={`px-4 py-3 text-sm whitespace-nowrap ${cellIdx === 0 ? "font-mono text-xs font-semibold text-[#1a5c2a] dark:text-emerald-400" : "text-gray-700 dark:text-gray-300"}`}>
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

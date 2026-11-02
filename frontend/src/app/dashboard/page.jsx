"use client";

import { useAuth } from "@/auth/authContext";
import Link from "next/link";
import { mockGRNs } from "@/lib/mockGRNs";
import { mockInventory, mockDispatches, mockBatches } from "@/lib/mockWarehouseOps";
import { mockAuditLogs, getRecentAuditLogs } from "@/lib/mockAuditLogs";
import { SEED_FARMERS } from "@/lib/mockFarmers";
import { SEED_PURCHASES } from "@/lib/mockPurchases";
import { mockIPCs } from "@/lib/mockMasterData";
import { BarChart, AreaLineChart, DonutChart, HorizontalBarChart } from "@/components/Charts";

// ── Brand Badge ───────────────────────────────────────────────
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

// ── Simple Stat Card ──────────────────────────────────────────
function StatCard({ label, value, trend }) {
  return (
    <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-4">
      <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
      <div className="flex items-baseline justify-between mt-1">
        <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
        {trend && (
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Card Container ────────────────────────────────────────────
function Card({ children, className = "" }) {
  return (
    <div className={`bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] ${className}`}>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 1. WAREHOUSE OFFICER DASHBOARD
// ═══════════════════════════════════════════════════════════════
function WarehouseOfficerDashboard() {
  const pendingGRNs   = mockGRNs.filter((g) => g.status === "Pending").length;
  const activeBatches = mockBatches.filter((b) => b.status === "Active").length;
  const stockKg       = mockInventory.reduce((s, i) => s + i.currentStockKg, 0);

  // Chart Data
  const intakeMonthlyData = [
    { label: "Feb", value: 1200, color: "#1a5c2a" },
    { label: "Mar", value: 2400, color: "#1a5c2a" },
    { label: "Apr", value: 4100, color: "#1a5c2a" },
    { label: "May", value: 6800, color: "#1a5c2a" },
    { label: "Jun", value: 8900, color: "#1a5c2a" },
    { label: "Jul", value: 10450, color: "#166534" },
  ];

  const commodityAllocationData = [
    { label: "Maize", value: 900, color: "#1a5c2a" },
    { label: "Soya", value: 400, color: "#2563eb" },
    { label: "Groundnuts", value: 300, color: "#d97706" },
  ];

  return (
    <div className="space-y-6">
      {/* Action Required Banner */}
      {pendingGRNs > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
          </svg>
          <div className="flex-1 flex justify-between items-center gap-4">
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Action Required: GRN Verification</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                {pendingGRNs} delivery receipt(s) require moisture &amp; condition verification to generate official GRNs.
              </p>
            </div>
            <Link href="/dashboard/grn"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a5c2a] text-white text-sm font-semibold hover:bg-[#134520] transition-colors whitespace-nowrap">
              Verify GRNs
            </Link>
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Today's Pending Deliveries" value="3" trend="+2 today" />
        <StatCard label="Pending GRNs" value={pendingGRNs} trend="Action req." />
        <StatCard label="Active Batches" value={activeBatches} trend="In Stack" />
        <StatCard label="Warehouse Stock" value={`${stockKg.toLocaleString()} kg`} trend="Capacity 72%" />
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BarChart
            title="Monthly Commodity Intake Volume (2026)"
            subtitle="Total tonnage received into Lilongwe Warehouse via GRN receipts"
            data={intakeMonthlyData}
            height={240}
            barColor="#1a5c2a"
          />
        </div>
        <div>
          <DonutChart
            title="Warehouse Stock Allocation"
            subtitle="Stock breakdown by commodity type"
            data={commodityAllocationData}
            centerLabel="Total Stock"
            centerValue={`${(stockKg / 1000).toFixed(1)} MT`}
          />
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { step: "Step 1", title: "Receive Delivery", desc: "Log arrival of bags from buying centres", href: "/dashboard/warehouse" },
          { step: "Step 2", title: "Create GRN",       desc: "Inspect moisture and issue Goods Received Note", href: "/dashboard/grn" },
          { step: "Step 3", title: "Batch & Storage",  desc: "Group verified bags into warehouse stack batches", href: "/dashboard/batches" },
          { step: "Step 4", title: "Dispatch Commodity",desc: "Generate dispatch documentation for buyers", href: "/dashboard/dispatch" },
        ].map(({ step, title, desc, href }) => (
          <Link key={href} href={href}
            className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-4 hover:border-[#1a5c2a] dark:hover:border-[#1a5c2a] hover:shadow-md transition-all group">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{step}</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white mt-1 group-hover:text-[#1a5c2a] dark:group-hover:text-emerald-400 transition-colors">{title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent GRNs Table */}
      <Card>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#222] rounded-t-xl">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Recent Goods Received Notes</h3>
          <Link href="/dashboard/grn" className="text-xs font-semibold text-[#1a5c2a] dark:text-emerald-400 hover:underline">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#222]">
                {["GRN Number", "Commodity", "Bags", "Weight (kg)", "Condition", "Status"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockGRNs.slice(0, 5).map((grn) => (
                <tr key={grn.id} className="border-b border-gray-50 dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-[#1a5c2a] dark:text-emerald-400 whitespace-nowrap">{grn.grnNumber}</td>
                  <td className="px-4 py-3"><Badge label={grn.commodity} color="green" /></td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{grn.numberOfBags}</td>
                  <td className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">{grn.quantityKg.toLocaleString()}</td>
                  <td className="px-4 py-3"><Badge label={grn.condition} color={grn.condition === "Good" ? "green" : grn.condition === "Fair" ? "amber" : "red"} /></td>
                  <td className="px-4 py-3"><Badge label={grn.status} color={grn.status === "Confirmed" ? "green" : "amber"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 2. IPC MANAGER DASHBOARD
// ═══════════════════════════════════════════════════════════════
function IPCManagerDashboard() {
  const purchaseTrendData = [
    { label: "W1 (Jun)", value: 180 },
    { label: "W2 (Jun)", value: 340 },
    { label: "W3 (Jun)", value: 520 },
    { label: "W4 (Jun)", value: 890 },
    { label: "W1 (Jul)", value: 1150 },
    { label: "W2 (Jul)", value: 1450 },
  ];

  const buyingCentreRankingData = [
    { label: "Nsundwe Marketing Centre", value: 274, color: "#1a5c2a" },
    { label: "Chifunga Marketing Centre", value: 269, color: "#2563eb" },
    { label: "Mbwatalika Marketing Centre", value: 179, color: "#d97706" },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="IPC Registered Farmers" value="450" trend="+12 this wk" />
        <StatCard label="IPC Purchase Volume" value="1,450 kg" trend="+18% vs May" />
        <StatCard label="IPC Warehouse Stock" value="900 kg" trend="Capacity 60%" />
        <StatCard label="Active Farmer Clubs" value="7 Clubs" trend="Active" />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AreaLineChart
          title="IPC Weekly Procurement Trajectory"
          subtitle="Cumulative grain volume purchased across Lilongwe IPC marketing centres"
          data={purchaseTrendData}
          height={220}
          lineColor="#1a5c2a"
        />
        <HorizontalBarChart
          title="IPC Buying Centre Volume Ranking"
          subtitle="Total grain volume procured per marketing centre"
          data={buyingCentreRankingData}
        />
      </div>

      {/* IPC Buying Centres Table */}
      <Card>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#222] rounded-t-xl">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white">IPC Buying Centres — Operational Status</h3>
          <Link href="/dashboard/admin/master-data" className="text-xs font-semibold text-[#1a5c2a] dark:text-emerald-400 hover:underline">Manage</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#222]">
                {["Marketing Centre", "District", "Marketing Officer", "Purchases (kg)", "Status"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Chifunga Marketing Centre",   district: "Lilongwe", officer: "Marketing Officer 1", purchases: "269 kg", status: "Active" },
                { name: "Mbwatalika Marketing Centre", district: "Lilongwe", officer: "Marketing Officer 2", purchases: "179 kg", status: "Active" },
                { name: "Nsundwe Marketing Centre",    district: "Lilongwe", officer: "Marketing Officer 3", purchases: "274 kg", status: "Active" },
              ].map((mc, i) => (
                <tr key={i} className="border-b border-gray-50 dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{mc.name}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{mc.district}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{mc.officer}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-[#1a5c2a] dark:text-emerald-400">{mc.purchases}</td>
                  <td className="px-4 py-3"><Badge label={mc.status} color="green" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 3. HEAD OFFICE MANAGER DASHBOARD
// ═══════════════════════════════════════════════════════════════
function HeadOfficeDashboard() {
  const nationalMonthlyData = [
    { label: "Feb", value: 1800, color: "#1a5c2a" },
    { label: "Mar", value: 3900, color: "#1a5c2a" },
    { label: "Apr", value: 6800, color: "#1a5c2a" },
    { label: "May", value: 11200, color: "#1a5c2a" },
    { label: "Jun", value: 15600, color: "#1a5c2a" },
    { label: "Jul", value: 19890, color: "#166534" },
  ];

  const nationalIpcRanking = [
    { label: "Lilongwe IPC", value: 1450, color: "#1a5c2a" },
    { label: "Kasungu IPC", value: 1240, color: "#2563eb" },
    { label: "Mchinji IPC", value: 1200, color: "#7c3aed" },
    { label: "Dedza IPC", value: 0, color: "#9ca3af" },
  ];

  const nationalStockDistribution = [
    { label: "Lilongwe WH", value: 900, color: "#1a5c2a" },
    { label: "Mchinji WH", value: 409, color: "#2563eb" },
    { label: "Kasungu WH", value: 271, color: "#d97706" },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="National Registered Farmers" value="1,240" trend="+45 this mo" />
        <StatCard label="National Procurement" value="3,890 kg" trend="+24% vs 2025" />
        <StatCard label="National Inventory" value="1.6 MT" trend="Stock Active" />
        <StatCard label="Active IPC Hubs" value="3 of 4" trend="75% Active" />
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BarChart
            title="National Monthly Procurement Trajectory"
            subtitle="Total cumulative grain volume purchased nationwide across all IPCs"
            data={nationalMonthlyData}
            height={240}
            barColor="#1a5c2a"
          />
        </div>
        <div>
          <DonutChart
            title="National Inventory Allocation"
            subtitle="Warehouse stock distribution across regions"
            data={nationalStockDistribution}
            centerLabel="National Stock"
            centerValue="1,580 kg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#222] rounded-t-xl">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white">National IPC Comparative Performance Ranking</h3>
              <Link href="/dashboard/reports" className="text-xs font-semibold text-[#1a5c2a] dark:text-emerald-400 hover:underline">Full Report</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#222]">
                    {["IPC Name", "District", "Farmers", "Purchases (kg)", "Stock (kg)", "Status"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Lilongwe IPC", district: "Lilongwe", farmers: "450", purchases: "1,450 kg", stock: "900 kg",  status: "Active" },
                    { name: "Mchinji IPC",  district: "Mchinji",  farmers: "410", purchases: "1,200 kg", stock: "409 kg",  status: "Active" },
                    { name: "Kasungu IPC",  district: "Kasungu",  farmers: "380", purchases: "1,240 kg", stock: "271 kg",  status: "Active" },
                    { name: "Dedza IPC",    district: "Dedza",    farmers: "—",   purchases: "—",         stock: "—",       status: "Pending" },
                  ].map((ipc, i) => (
                    <tr key={i} className="border-b border-gray-50 dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{ipc.name}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{ipc.district}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{ipc.farmers}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-[#1a5c2a] dark:text-emerald-400">{ipc.purchases}</td>
                      <td className="px-4 py-3 font-mono text-gray-700 dark:text-gray-300">{ipc.stock}</td>
                      <td className="px-4 py-3"><Badge label={ipc.status} color={ipc.status === "Active" ? "green" : "amber"} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
        <div>
          <HorizontalBarChart
            title="IPC Procurement Volume Comparison"
            subtitle="Regional ranking of total purchasing volume"
            data={nationalIpcRanking}
          />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// 4. SYSTEM ADMINISTRATOR DASHBOARD
// ═══════════════════════════════════════════════════════════════
function SysAdminDashboard() {
  const recentLogs = getRecentAuditLogs(6);

  const totalPurchasesMonthlyBarData = [
    { label: "Jan", value: 1250, color: "#1a5c2a", unit: "kg" },
    { label: "Feb", value: 2400, color: "#1a5c2a", unit: "kg" },
    { label: "Mar", value: 4800, color: "#1a5c2a", unit: "kg" },
    { label: "Apr", value: 7200, color: "#1a5c2a", unit: "kg" },
    { label: "May", value: 11500, color: "#1a5c2a", unit: "kg" },
    { label: "Jun", value: 16800, color: "#1a5c2a", unit: "kg" },
    { label: "Jul", value: 21450, color: "#166534", unit: "kg" },
  ];

  const auditSeverityData = [
    { label: "Informational", value: 18, color: "#2563eb" },
    { label: "Warning Alerts", value: 5, color: "#d97706" },
    { label: "Critical Alerts", value: 2, color: "#dc2626" },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="System User Accounts" value="7 Users" trend="Active" />
        <StatCard label="Configured Roles" value="7 Roles" trend="RBAC Active" />
        <StatCard label="Audit Trail Events" value={mockAuditLogs.length} trend="Logged" />
        <StatCard label="Master Data Tables" value="8 Tables" trend="Verified" />
      </div>

      {/* Visual System Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BarChart
            title="Total System Purchases Volume by Month (2026)"
            subtitle="Aggregated monthly grain purchasing volume (kg) recorded across all buying centres"
            data={totalPurchasesMonthlyBarData}
            height={240}
            barColor="#1a5c2a"
          />
        </div>
        <div>
          <DonutChart
            title="Security Audit Severity Distribution"
            subtitle="Event breakdown by security priority"
            data={auditSeverityData}
            centerLabel="Audit Events"
            centerValue={mockAuditLogs.length}
          />
        </div>
      </div>

      {/* Audit Log Table + Admin Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#222] rounded-t-xl">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Recent Security Audit Logs</h3>
              <Link href="/dashboard/admin/audit-logs" className="text-xs font-semibold text-[#1a5c2a] dark:text-emerald-400 hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#222]">
                    {["Action", "User", "Module", "Severity", "Timestamp"].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-50 dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
                      <td className="px-4 py-3 text-xs font-semibold text-gray-800 dark:text-gray-200">{log.action}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{log.userName ?? "System"}</td>
                      <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{log.module}</td>
                      <td className="px-4 py-3">
                        <Badge label={log.severity} color={log.severity === "Critical" ? "red" : log.severity === "Warning" ? "amber" : "blue"} />
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{log.timestamp?.slice(0, 10)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Admin Shortcuts */}
        <Card className="p-4 flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-1">Administration Shortcuts</h3>
          {[
            { label: "Manage User Accounts",       href: "/dashboard/admin/users" },
            { label: "Role & Permission Management", href: "/dashboard/admin/roles" },
            { label: "Master Data Configuration",  href: "/dashboard/admin/master-data" },
            { label: "Audit Trail Logs",           href: "/dashboard/admin/audit-logs" },
            { label: "System Settings",            href: "/dashboard/admin/settings" },
          ].map((s) => (
            <Link key={s.href} href={s.href}
              className="block px-3 py-2.5 border border-gray-200 dark:border-[#333] rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:border-[#1a5c2a] dark:hover:border-emerald-700 hover:text-[#1a5c2a] dark:hover:text-emerald-400 hover:shadow-sm transition-all">
              {s.label}
            </Link>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN DASHBOARD PAGE WRAPPER
// ═══════════════════════════════════════════════════════════════
export default function DashboardPage() {
  const { user } = useAuth();
  const role = user?.roleId ?? "role-sysadmin";

  const ROLE_TITLES = {
    "role-sysadmin":           "System Administrator Dashboard",
    "role-warehouse-officer":  "Warehouse Operations Dashboard",
    "role-ipc-manager":        "IPC Management Dashboard",
    "role-head-office":        "Head Office Executive Dashboard",
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {ROLE_TITLES[role] ?? "GTMS Dashboard"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {new Date().toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <span className="self-start px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          {user?.name ?? "User"}
        </span>
      </div>

      {/* ── Role-Specific Content ── */}
      {role === "role-warehouse-officer" && <WarehouseOfficerDashboard />}
      {role === "role-ipc-manager"       && <IPCManagerDashboard />}
      {role === "role-head-office"       && <HeadOfficeDashboard />}
      {role === "role-sysadmin"          && <SysAdminDashboard />}
    </div>
  );
}

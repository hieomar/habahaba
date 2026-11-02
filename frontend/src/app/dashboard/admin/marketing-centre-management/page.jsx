"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { mockMarketingCentres, mockIPCs } from "@/lib/mockMasterData";

const MOCK_MARKETING_OFFICERS = [
  { id: "OFF-001", name: "Chikondi Phiri", phone: "+265 999 11 22 33" },
  { id: "OFF-002", name: "Limbani Banda", phone: "+265 888 44 55 66" },
  { id: "OFF-003", name: "Mercy Kanyama", phone: "+265 991 77 88 99" },
  { id: "OFF-004", name: "Blessings Mwale", phone: "+265 999 22 33 44" },
  { id: "OFF-005", name: "Tadala Tembo", phone: "+265 888 55 66 77" },
  { id: "OFF-006", name: "Yamikani Chifunga", phone: "+265 991 88 99 00" },
];

const INITIAL_CENTRES = [
  {
    id: "MC-001",
    code: "MC-LLW-01",
    name: "Chifunga Marketing Centre",
    district: "Lilongwe",
    ipc: "Lilongwe IPC",
    marketingOfficer: "Chikondi Phiri",
    gpsLat: -13.9526,
    gpsLng: 33.7641,
    status: "Active",
    establishedDate: "2021-04-12",
  },
  {
    id: "MC-002",
    code: "MC-LLW-02",
    name: "Mbwatalika Marketing Centre",
    district: "Lilongwe",
    ipc: "Lilongwe IPC",
    marketingOfficer: "Mercy Kanyama",
    gpsLat: -14.0123,
    gpsLng: 33.8012,
    status: "Active",
    establishedDate: "2021-05-20",
  },
  {
    id: "MC-003",
    code: "MC-MCH-01",
    name: "Kapiri Marketing Centre",
    district: "Mchinji",
    ipc: "Mchinji IPC",
    marketingOfficer: "Limbani Banda",
    gpsLat: -13.7818,
    gpsLng: 32.8717,
    status: "Active",
    establishedDate: "2020-09-15",
  },
  {
    id: "MC-004",
    code: "MC-MCH-02",
    name: "Mkanda Marketing Centre",
    district: "Mchinji",
    ipc: "Mchinji IPC",
    marketingOfficer: "Unassigned",
    gpsLat: -13.6101,
    gpsLng: 32.6818,
    status: "Active",
    establishedDate: "2022-01-10",
  },
  {
    id: "MC-005",
    code: "MC-KAS-01",
    name: "Central Marketing Centre",
    district: "Kasungu",
    ipc: "Kasungu IPC",
    marketingOfficer: "Limbani Banda",
    gpsLat: -13.0016,
    gpsLng: 33.4751,
    status: "Active",
    establishedDate: "2021-11-05",
  },
  {
    id: "MC-006",
    code: "MC-LLW-03",
    name: "Nsundwe Marketing Centre",
    district: "Lilongwe",
    ipc: "Lilongwe IPC",
    marketingOfficer: "Chikondi Phiri",
    gpsLat: -13.8841,
    gpsLng: 33.6421,
    status: "Inactive",
    establishedDate: "2023-02-18",
  },
];

function Badge({ label, color = "gray" }) {
  const colors = {
    green: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    gray: "bg-gray-100 text-gray-700 dark:bg-[#252525] dark:text-gray-400 border-gray-200 dark:border-[#333]",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${colors[color] ?? colors.gray}`}>
      {label}
    </span>
  );
}

function StatCard({ label, value, subtext }) {
  return (
    <div className="bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-[#2a2a2a] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{value}</p>
      {subtext && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtext}</p>}
    </div>
  );
}

export default function MarketingCentreManagementPage() {
  const [centres, setCentres] = useState(INITIAL_CENTRES);
  const [search, setSearch] = useState("");
  const [ipcFilter, setIpcFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editingCentre, setEditingCentre] = useState(null);
  const [toast, setToast] = useState(null);

  const tableRef = useRef(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Form State
  const [form, setForm] = useState({
    id: "",
    code: "",
    name: "",
    district: "Lilongwe",
    ipc: "Lilongwe IPC",
    marketingOfficer: "Unassigned",
    status: "Active",
  });

  // Filtered List
  const filteredCentres = useMemo(() => {
    return centres.filter((c) => {
      const matchSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase()) ||
        c.district.toLowerCase().includes(search.toLowerCase()) ||
        c.marketingOfficer.toLowerCase().includes(search.toLowerCase());
      const matchIpc = ipcFilter === "All" || c.ipc === ipcFilter;
      const matchStatus = statusFilter === "All" || c.status === statusFilter;
      return matchSearch && matchIpc && matchStatus;
    });
  }, [centres, search, ipcFilter, statusFilter]);

  // Statistics
  const activeCount = useMemo(() => centres.filter((c) => c.status === "Active").length, [centres]);
  const assignedOfficersCount = useMemo(() => {
    const assigned = new Set();
    centres.forEach((c) => {
      if (c.marketingOfficer !== "Unassigned") assigned.add(c.marketingOfficer);
    });
    return assigned.size;
  }, [centres]);
  const districtsCount = useMemo(() => new Set(centres.map((c) => c.district)).size, [centres]);

  const getNextCentreCode = (centreList = centres) => {
    const nums = centreList.map((c) => {
      const m = (c.code || c.id)?.match(/\d+/);
      return m ? parseInt(m[0], 10) : 0;
    });
    const maxNum = nums.length > 0 ? Math.max(...nums, 0) : 0;
    return `MC-${(maxNum + 1).toString().padStart(3, "0")}`;
  };

  // Open Modal - Add
  const handleOpenAdd = () => {
    setEditingCentre(null);
    const autoCode = getNextCentreCode();
    setForm({
      id: autoCode,
      code: autoCode,
      name: "",
      district: "Lilongwe",
      ipc: "Lilongwe IPC",
      marketingOfficer: "Unassigned",
      status: "Active",
    });
    setShowModal(true);
  };

  // Open Modal - Edit
  const handleOpenEdit = (c) => {
    setEditingCentre(c);
    setForm({
      id: c.id,
      code: c.code,
      name: c.name,
      district: c.district,
      ipc: c.ipc,
      marketingOfficer: c.marketingOfficer,
      status: c.status,
    });
    setShowModal(true);
  };

  // Toggle Status
  const handleToggleStatus = (id) => {
    setCentres((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const next = c.status === "Active" ? "Inactive" : "Active";
          showToast(`Marketing Centre "${c.name}" status updated to ${next}.`, "info");
          return { ...c, status: next };
        }
        return c;
      })
    );
  };

  // Save Centre
  const handleSaveCentre = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast("Marketing Centre name is required.", "error");
      return;
    }

    if (editingCentre) {
      setCentres((prev) =>
        prev.map((c) => (c.id === editingCentre.id ? { ...c, ...form } : c))
      );
      showToast(`Marketing Centre "${form.name}" updated successfully.`);
    } else {
      const newCentre = {
        ...form,
        establishedDate: new Date().toISOString().slice(0, 10),
      };
      setCentres((prev) => [newCentre, ...prev]);
      showToast(`New Marketing Centre "${form.name}" registered successfully.`);
    }
    setShowModal(false);
  };

  // CSV Export
  const handleExportCSV = () => {
    const esc = (v) => {
      const s = String(v ?? "");
      return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const headers = [
      "Centre ID",
      "Centre Code",
      "Centre Name",
      "District",
      "Parent IPC",
      "Assigned Marketing Officer",
      "Status",
      "Established Date",
    ];
    const rows = filteredCentres.map((c) => [
      c.id,
      c.code,
      c.name,
      c.district,
      c.ipc,
      c.marketingOfficer,
      c.status,
      c.establishedDate,
    ]);

    const csv = [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GTMS_Marketing_Centres_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Print
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
          <title>NASFAM GTMS — Marketing Centre Registry</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
            body { padding: 24px; color: #111; background: #fff; }
            h2 { font-size: 16px; font-weight: 700; margin-bottom: 4px; color: #1a5c2a; }
            p { font-size: 11px; color: #555; margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th { text-align: left; padding: 8px 10px; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #555; border-bottom: 1px solid #e5e7eb; background: #f3f4f6; }
            td { padding: 7px 10px; border-bottom: 1px solid #f0f0f0; color: #333; }
          </style>
        </head>
        <body>
          <h2>NASFAM Grain Traceability — Marketing Centre Registry</h2>
          <p>Printed on: ${new Date().toLocaleString("en-GB")} — Total: ${filteredCentres.length} Centres</p>
          ${tableRef.current.innerHTML}
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
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl border text-xs font-semibold flex items-center gap-2 transition-all ${
            toast.type === "error"
              ? "bg-red-900 text-red-100 border-red-700"
              : toast.type === "info"
              ? "bg-blue-900 text-blue-100 border-blue-700"
              : "bg-[#1a5c2a] text-white border-emerald-600"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-[#1a5c2a]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM12 4c2.76 0 5 2.24 5 5 0 2.88-2.88 7.19-5 9.88C9.92 16.21 7 11.85 7 9c0-2.76 2.24-5 5-5z" />
            </svg>
            Marketing Centre Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Configure primary grain intake hubs and assign marketing officers.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-[#333] rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1f1f1f] hover:bg-gray-50 dark:hover:bg-[#282828] hover:border-[#1a5c2a] dark:hover:border-emerald-600 hover:text-[#1a5c2a] dark:hover:text-emerald-400 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 whitespace-nowrap"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-[#333] rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1f1f1f] hover:bg-gray-50 dark:hover:bg-[#282828] hover:border-[#1a5c2a] dark:hover:border-emerald-600 hover:text-[#1a5c2a] dark:hover:text-emerald-400 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 whitespace-nowrap"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a5c2a] text-white text-xs font-semibold whitespace-nowrap hover:bg-[#134520] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200"
          >
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Marketing Centre
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Marketing Centres" value={centres.length} subtext="Registered intake hubs" />
        <StatCard label="Active Operational Centres" value={activeCount} subtext={`${centres.length - activeCount} inactive`} />
        <StatCard label="Assigned Marketing Officers" value={assignedOfficersCount} subtext="Assigned to centres" />
        <StatCard label="Districts Covered" value={districtsCount} subtext="Across IPC zones" />
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-[#2a2a2a] rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={ipcFilter}
            onChange={(e) => setIpcFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-xs bg-white dark:bg-[#252525] text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            <option value="All">All Parent IPCs</option>
            {mockIPCs.map((ipc) => (
              <option key={ipc.id} value={ipc.name}>
                {ipc.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-xs bg-white dark:bg-[#252525] text-gray-700 dark:text-gray-300 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>

        <div className="relative flex-1 sm:w-72 w-full">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search centre name, code, or officer…"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-xs bg-white dark:bg-[#252525] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]/30"
          />
        </div>
      </div>

      {/* Table */}
      <div ref={tableRef} className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#222]">
                {["Code", "Marketing Centre Name", "District", "Parent IPC", "Assigned Marketing Officer", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredCentres.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-sm text-gray-400">
                    No marketing centres match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredCentres.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 dark:border-[#2a2a2a] hover:bg-gray-50/80 dark:hover:bg-[#222] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-[#1a5c2a] dark:text-emerald-400 whitespace-nowrap">{c.code}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white whitespace-nowrap">{c.name}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">{c.district}</td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">{c.ipc}</td>
                    <td className="px-4 py-3 text-xs">
                      {c.marketingOfficer === "Unassigned" ? (
                        <span className="text-gray-400 italic">Unassigned</span>
                      ) : (
                        <Badge label={c.marketingOfficer} color="blue" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={c.status} color={c.status === "Active" ? "green" : "gray"} />
                    </td>
                    <td className="px-4 py-3 text-xs space-x-2 whitespace-nowrap">
                      <button onClick={() => handleOpenEdit(c)} className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                        Edit
                      </button>
                      <button onClick={() => handleToggleStatus(c.id)} className="text-gray-500 dark:text-gray-400 font-semibold hover:underline">
                        {c.status === "Active" ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Add / Edit Centre */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-[#2a2a2a] pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {editingCentre ? "Edit Marketing Centre Details" : "Register New Marketing Centre"}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Configure intake hub location and assign a marketing officer.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCentre} className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1 flex justify-between">
                  <span>Centre Code *</span>
                  <span className="text-[10px] text-[#1a5c2a] dark:text-emerald-400 font-semibold">(Auto-generated)</span>
                </label>
                <input
                  type="text"
                  disabled
                  value={form.code}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg bg-gray-50 dark:bg-[#252525] text-gray-500 dark:text-gray-400 font-mono cursor-not-allowed text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-500 font-semibold mb-1">Marketing Centre Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Chifunga Marketing Centre"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-500 font-semibold mb-1">Parent IPC *</label>
                  <select
                    value={form.ipc}
                    onChange={(e) => setForm({ ...form, ipc: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none"
                  >
                    {mockIPCs.map((ipc) => (
                      <option key={ipc.id} value={ipc.name}>
                        {ipc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-500 font-semibold mb-1">District *</label>
                  <select
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none"
                  >
                    <option>Lilongwe</option>
                    <option>Mchinji</option>
                    <option>Kasungu</option>
                    <option>Dedza</option>
                    <option>Salima</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-500 font-semibold mb-1">Assigned Marketing Officer</label>
                <select
                  value={form.marketingOfficer}
                  onChange={(e) => setForm({ ...form, marketingOfficer: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none"
                >
                  <option value="Unassigned">Unassigned</option>
                  {MOCK_MARKETING_OFFICERS.map((o) => (
                    <option key={o.id} value={o.name}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-500 font-semibold mb-1">Operating Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-[#2a2a2a]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-200 dark:border-[#333] rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1a5c2a] text-white rounded-lg font-semibold hover:bg-[#134520] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200"
                >
                  Save Marketing Centre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

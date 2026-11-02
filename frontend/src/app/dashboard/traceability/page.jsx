"use client";

import { useState, useMemo, useRef } from "react";
import { mockGRNs } from "@/lib/mockGRNs";
import { mockDispatches, mockBatches } from "@/lib/mockWarehouseOps";
import { SEED_FARMERS } from "@/lib/mockFarmers";
import { SEED_PURCHASES } from "@/lib/mockPurchases";
import { mockFarms } from "@/lib/mockFarms";

// ── Badge Component (Standard System Tokens) ──────────────────
function Badge({ label, color = "gray" }) {
  const c = {
    green:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    blue:   "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    amber:  "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    gray:   "bg-gray-100 text-gray-600 dark:bg-[#2a2a2a] dark:text-gray-400",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${c[color] ?? c.gray}`}>
      {label}
    </span>
  );
}

// ── Rich Traceability Records Dataset (stitching all supply chain steps) ──
const TRACEABILITY_RECORDS = [
  {
    id: "TRC-2026-001",
    batchNumber: "BATCH-2026-001",
    commodity: "Maize",
    status: "Verified",
    date: "2026-04-05",

    // Step 1: Farmer & Farm Origin
    farmer: {
      farmerId: "F-000001",
      name: "James Banda",
      gender: "Male",
      village: "Chifunga Village",
      district: "Lilongwe",
      ipc: "Lilongwe IPC",
      association: "Chifunga Farmer Association",
      club: "Sunrise Farmer Club",
      farmSize: "1.8 ha",
      gpsLat: -13.9526,
      gpsLng: 33.7641,
      seedVariety: "DKC 8033 Hybrid Maize",
    },

    // Step 2: Buying Centre Purchase
    purchase: {
      receiptNumber: "PUR-001",
      buyingCentre: "Chifunga Marketing Centre",
      purchaseDate: "2026-04-05 09:30 AM",
      purchasingOfficer: "Marketing Officer - Lilongwe",
      weightKg: 269,
      bagsCount: 3,
      pricePerKg: "MWK 450",
      totalPaid: "MWK 121,050",
      bagTags: ["F-000001-001", "F-000001-002", "F-000001-003", "BAG-MW-LL-2026-00101", "BAG-MW-LL-2026-00102", "BAG-MW-LL-2026-00103"],
    },

    // Step 3: Transit & Transport
    transit: {
      vehicleReg: "MN 4821 / Trailer 02",
      driverName: "Kondwani Phiri",
      transporter: "NASFAM Logistics Fleet",
      dispatchedFromHub: "2026-04-05 02:15 PM",
      arrivedAtWarehouse: "2026-04-05 04:45 PM",
      transitStatus: "Delivered Intact",
    },

    // Step 4: Warehouse Receiving & GRN
    grn: {
      grnNumber: "GRN-2026-001",
      warehouseName: "Lilongwe Central Warehouse",
      storageLocation: "Section A — Stack Row 04",
      receivingOfficer: "Warehouse Officer - Lilongwe",
      condition: "Good",
      qualityGrade: "Grade A Export Quality",
      grnDate: "2026-04-05 05:10 PM",
    },

    // Step 5: Batching & Customer Dispatch
    dispatch: {
      batchId: "BATCH-2026-001",
      customerName: "ADMARC National Depot",
      dispatchNumber: "DSP-2026-089",
      deliveryAddress: "Kanengo ADMARC Depot, Lilongwe",
      dispatchDate: "2026-04-12",
      certificateStatus: "Certified Provenance — Passed Audit",
    },
  },
  {
    id: "TRC-2026-002",
    batchNumber: "BATCH-2026-002",
    commodity: "Soya",
    status: "Verified",
    date: "2026-04-06",

    farmer: {
      farmerId: "F-000002",
      name: "Mary Phiri",
      gender: "Female",
      village: "Mbwatalika Village",
      district: "Lilongwe",
      ipc: "Lilongwe IPC",
      association: "Mbwatalika Farmer Association",
      club: "Green Valley Club",
      farmSize: "2.1 ha",
      gpsLat: -14.0123,
      gpsLng: 33.8012,
      seedVariety: "Tikani Soya Bean",
    },

    purchase: {
      receiptNumber: "PUR-002",
      buyingCentre: "Mbwatalika Marketing Centre",
      purchaseDate: "2026-04-06 10:15 AM",
      purchasingOfficer: "Marketing Officer - Lilongwe",
      weightKg: 179,
      bagsCount: 2,
      pricePerKg: "MWK 650",
      totalPaid: "MWK 116,350",
      bagTags: ["F-000002-001", "F-000002-002", "BAG-MW-LL-2026-00201", "BAG-MW-LL-2026-00202"],
    },

    transit: {
      vehicleReg: "ZA 9102",
      driverName: "Patrick Lungu",
      transporter: "NASFAM Logistics Fleet",
      dispatchedFromHub: "2026-04-06 01:30 PM",
      arrivedAtWarehouse: "2026-04-06 03:20 PM",
      transitStatus: "Delivered Intact",
    },

    grn: {
      grnNumber: "GRN-2026-002",
      warehouseName: "Lilongwe Central Warehouse",
      storageLocation: "Section B — Stack Row 02",
      receivingOfficer: "Warehouse Officer - Lilongwe",
      condition: "Good",
      qualityGrade: "Grade A",
      grnDate: "2026-04-06 03:45 PM",
    },

    dispatch: {
      batchId: "BATCH-2026-002",
      customerName: "Rab Processors Ltd",
      dispatchNumber: "DSP-2026-092",
      deliveryAddress: "Industrial Area, Lilongwe",
      dispatchDate: "2026-04-14",
      certificateStatus: "Certified Provenance — Passed Audit",
    },
  },
  {
    id: "TRC-2026-003",
    batchNumber: "BATCH-2026-003",
    commodity: "Groundnuts",
    status: "Verified",
    date: "2026-04-08",

    farmer: {
      farmerId: "F-000003",
      name: "Chifundo Moyo",
      gender: "Male",
      village: "Kapiri Village",
      district: "Mchinji",
      ipc: "Mchinji IPC",
      association: "Kapiri Association",
      club: "Unity Club",
      farmSize: "1.2 ha",
      gpsLat: -13.7818,
      gpsLng: 32.8717,
      seedVariety: "CG7 Groundnut",
    },

    purchase: {
      receiptNumber: "PUR-003",
      buyingCentre: "Kapiri Marketing Centre",
      purchaseDate: "2026-04-08 08:45 AM",
      purchasingOfficer: "Marketing Officer - Mchinji",
      weightKg: 409,
      bagsCount: 5,
      pricePerKg: "MWK 900",
      totalPaid: "MWK 368,100",
      bagTags: ["F-000003-001", "F-000003-002", "F-000003-003", "F-000003-004", "F-000003-005", "BAG-MW-MC-2026-00301", "BAG-MW-MC-2026-00302", "BAG-MW-MC-2026-00303", "BAG-MW-MC-2026-00304", "BAG-MW-MC-2026-00305"],
    },

    transit: {
      vehicleReg: "MC 3310",
      driverName: "Gomezgani Nyirenda",
      transporter: "Mchinji Local Transporters",
      dispatchedFromHub: "2026-04-08 11:00 AM",
      arrivedAtWarehouse: "2026-04-08 02:00 PM",
      transitStatus: "Delivered Intact",
    },

    grn: {
      grnNumber: "GRN-2026-003",
      warehouseName: "Mchinji Regional Warehouse",
      storageLocation: "Bay 1 — Stack 01",
      receivingOfficer: "Warehouse Officer - Mchinji",
      condition: "Good",
      qualityGrade: "Grade A Premium",
      grnDate: "2026-04-08 02:30 PM",
    },

    dispatch: {
      batchId: "BATCH-2026-003",
      customerName: "National Food Reserve Agency (NFRA)",
      dispatchNumber: "DSP-2026-095",
      deliveryAddress: "NFRA Silos, Kanengo",
      dispatchDate: "2026-04-18",
      certificateStatus: "Certified Provenance — Passed Audit",
    },
  },
];

export default function TraceabilityPage() {
  const [search, setSearch] = useState("");

  const [commodityFilter, setCommodityFilter] = useState("All");
  const [selectedId, setSelectedId] = useState(TRACEABILITY_RECORDS[0].id);
  const [activeStep, setActiveStep] = useState(1);

  const printRef = useRef(null);

  const filteredRecords = useMemo(() => {
    return TRACEABILITY_RECORDS.filter((r) => {
      const s = search.toLowerCase();
      const matchSearch =
        !search ||
        r.batchNumber.toLowerCase().includes(s) ||
        r.farmer.name.toLowerCase().includes(s) ||
        r.farmer.farmerId.toLowerCase().includes(s) ||
        r.grn.grnNumber.toLowerCase().includes(s) ||
        r.purchase.receiptNumber.toLowerCase().includes(s) ||
        r.purchase.bagTags.some((tag) => tag.toLowerCase().includes(s));
      const matchCommodity = commodityFilter === "All" || r.commodity === commodityFilter;
      return matchSearch && matchCommodity;
    });
  }, [search, commodityFilter]);

  const selectedRecord = useMemo(
    () => TRACEABILITY_RECORDS.find((r) => r.id === selectedId) ?? TRACEABILITY_RECORDS[0],
    [selectedId]
  );

  // ── CSV Export Handler ──
  const handleExportCSV = () => {
    const esc = (v) => { const s = String(v ?? ""); return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s; };
    const headers = [
      "Traceability ID", "Batch ID", "Commodity", "Farmer Name", "Farmer ID", "Association", "Village", "District",
      "Buying Centre", "Purchase Date", "Weight (kg)", "Bags", "GRN Number", "Warehouse", "Customer/Buyer", "Status"
    ];
    const rows = filteredRecords.map((r) => [
      r.id, r.batchNumber, r.commodity, r.farmer.name, r.farmer.farmerId, r.farmer.association, r.farmer.village, r.farmer.district,
      r.purchase.buyingCentre, r.purchase.purchaseDate, r.purchase.weightKg, r.purchase.bagsCount, r.grn.grnNumber, r.grn.warehouseName, r.dispatch.customerName, r.status
    ]);
    const csv = [headers.map(esc).join(","), ...rows.map((row) => row.map(esc).join(","))].join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GTMS_Grain_Traceability_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── Targeted Certificate Print Handler ──
  const handlePrintCertificate = () => {
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
          <title>NASFAM Provenance Certificate — ${selectedRecord.batchNumber}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
            body { padding: 32px; color: #111; background: #fff; line-height: 1.5; }
            .cert-box { border: 3px double #1a5c2a; padding: 24px; border-radius: 8px; }
            .header { text-align: center; border-bottom: 2px solid #1a5c2a; padding-bottom: 16px; margin-bottom: 20px; }
            .header h1 { font-size: 20px; color: #1a5c2a; text-transform: uppercase; letter-spacing: 1px; }
            .header p { font-size: 11px; color: #555; font-weight: 600; }
            .cert-title { text-align: center; font-size: 16px; font-weight: 700; margin-bottom: 20px; color: #222; text-transform: uppercase; text-decoration: underline; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 11px; margin-bottom: 20px; }
            .box { background: #f9fafb; border: 1px solid #e5e7eb; padding: 12px; rounded: 6px; }
            .box h3 { font-size: 12px; color: #1a5c2a; margin-bottom: 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
            .label { font-weight: 600; color: #555; }
            .val { font-weight: 700; color: #111; }
            .footer { margin-top: 30px; border-top: 1px solid #ddd; pt: 16px; display: flex; justify-content: space-between; font-size: 10px; color: #666; }
            .seal { border: 2px solid #1a5c2a; color: #1a5c2a; padding: 8px 14px; font-weight: 800; border-radius: 50px; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="cert-box">
            <div class="header">
              <h1>NASFAM Grain Traceability Management System</h1>
              <p>National Association of Smallholder Farmers of Malawi (NASFAM)</p>
            </div>
            <div class="cert-title">Official Commodity Provenance Certificate</div>
            <div class="grid">
              <div class="box">
                <h3>1. Farm & Farmer Origin</h3>
                <div class="row"><span class="label">Farmer Name:</span><span class="val">${selectedRecord.farmer.name} (${selectedRecord.farmer.farmerId})</span></div>
                <div class="row"><span class="label">Association:</span><span class="val">${selectedRecord.farmer.association}</span></div>
                <div class="row"><span class="label">Club & Village:</span><span class="val">${selectedRecord.farmer.club}, ${selectedRecord.farmer.village}</span></div>
                <div class="row"><span class="label">GPS Coordinates:</span><span class="val">${selectedRecord.farmer.gpsLat}, ${selectedRecord.farmer.gpsLng}</span></div>
              </div>
              <div class="box">
                <h3>2. Quality & Warehouse Receiving</h3>
                <div class="row"><span class="label">Commodity:</span><span class="val">${selectedRecord.commodity} (${selectedRecord.grn.qualityGrade})</span></div>
                <div class="row"><span class="label">GRN Number:</span><span class="val">${selectedRecord.grn.grnNumber}</span></div>
                <div class="row"><span class="label">Warehouse:</span><span class="val">${selectedRecord.grn.warehouseName}</span></div>
              </div>
              <div class="box">
                <h3>3. Purchase & Scanned Bags</h3>
                <div class="row"><span class="label">Purchase Receipt:</span><span class="val">${selectedRecord.purchase.receiptNumber}</span></div>
                <div class="row"><span class="label">Weight / Bags:</span><span class="val">${selectedRecord.purchase.weightKg} kg (${selectedRecord.purchase.bagsCount} bags)</span></div>
                <div class="row"><span class="label">Bag Barcode Tags:</span><span class="val">${selectedRecord.purchase.bagTags.join(", ")}</span></div>
              </div>
              <div class="box">
                <h3>4. Batch & Destination Buyer</h3>
                <div class="row"><span class="label">Batch Number:</span><span class="val">${selectedRecord.batchNumber}</span></div>
                <div class="row"><span class="label">Customer Buyer:</span><span class="val">${selectedRecord.dispatch.customerName}</span></div>
                <div class="row"><span class="label">Dispatch Date:</span><span class="val">${selectedRecord.dispatch.dispatchDate}</span></div>
              </div>
            </div>
            <div class="footer">
              <div>
                Certificate ID: <strong>CERT-${selectedRecord.id}</strong><br/>
                Issued Date: ${new Date().toLocaleDateString("en-GB")}<br/>
                Verification Code: ${Math.random().toString(36).substring(2, 10).toUpperCase()}
              </div>
              <div class="seal">VERIFIED PROVENANCE</div>
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 1000);
  };

  const stepsList = [
    { num: 1, title: "Farmer & Farm Origin", desc: selectedRecord.farmer.name },
    { num: 2, title: "Buying Centre Purchase", desc: selectedRecord.purchase.buyingCentre },
    { num: 3, title: "Warehouse Receiving & GRN", desc: selectedRecord.grn.grnNumber },
    { num: 4, title: "Batching & Customer Dispatch", desc: selectedRecord.dispatch.customerName },
  ];

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Batch &amp; Grain Traceability</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Complete 4-step provenance audit chain from farmer soil to final buyer dispatch.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start">

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
            onClick={handlePrintCertificate}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1a5c2a] text-white rounded-lg text-xs font-semibold hover:bg-[#134520] hover:shadow-md hover:shadow-[#1a5c2a]/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 group"
          >
            <svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Print Certificate
          </button>
        </div>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Bag Number (e.g. F-000001-001), Bag Tag, Batch ID, GRN #, or Farmer Name…"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a5c2a]/30"
          />
        </div>
        <select
          value={commodityFilter}
          onChange={(e) => setCommodityFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm bg-white dark:bg-[#252525] text-gray-700 dark:text-gray-300 focus:outline-none"
        >
          <option value="All">All Commodities</option>
          <option>Maize</option>
          <option>Soya</option>
          <option>Groundnuts</option>
        </select>
        <span className="self-center text-xs text-gray-400 dark:text-gray-500">
          {filteredRecords.length} traceability record{filteredRecords.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Main Traceability Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Traceable Batches List */}
        <div className="space-y-3">
          <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Select Batch to Trace ({filteredRecords.length})
            </h3>
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredRecords.map((r) => (
              <button
                key={r.id}
                onClick={() => { setSelectedId(r.id); setActiveStep(1); }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all ${selectedId === r.id ? "border-[#1a5c2a] bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800" : "border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1c1c1c] hover:border-gray-300 dark:hover:border-[#333]"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#1a5c2a] dark:text-emerald-400">{r.batchNumber}</span>
                  <Badge label={r.status} color="green" />
                </div>
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-1">{r.farmer.name} ({r.farmer.association})</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{r.commodity} · {r.purchase.weightKg} kg · {r.grn.grnNumber}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Visual 5-Step Stepper & Step Detail Cards */}
        <div className="lg:col-span-2 space-y-5">

          {/* 4-Step Visual Stepper Bar */}
          <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {stepsList.map((s) => (
                <button
                  key={s.num}
                  onClick={() => setActiveStep(s.num)}
                  className={`p-2.5 rounded-lg text-left transition-all ${activeStep === s.num ? "bg-[#1a5c2a] text-white" : "bg-gray-50 dark:bg-[#252525] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"}`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Step {s.num}</p>
                  <p className="text-xs font-bold truncate mt-0.5">{s.title}</p>
                  <p className={`text-[10px] truncate mt-0.5 ${activeStep === s.num ? "text-emerald-100" : "text-gray-400 dark:text-gray-500"}`}>
                    {s.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Step Detail Panel Container */}
          <div ref={printRef} className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-6 space-y-4">

            {/* Step 1 Detail: Farmer & Farm Origin */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#2a2a2a]">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Step 1: Farmer &amp; Farm Origin</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Agricultural provenance and producer metadata</p>
                  </div>
                  <Badge label="Verified Origin" color="green" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-gray-50 dark:bg-[#222] rounded-lg space-y-2">
                    <p className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-[10px]">Farmer Profile</p>
                    <p><span className="text-gray-400">Full Name:</span> <strong className="text-gray-900 dark:text-white">{selectedRecord.farmer.name}</strong></p>
                    <p><span className="text-gray-400">Farmer ID:</span> <span className="font-mono font-semibold text-[#1a5c2a] dark:text-emerald-400">{selectedRecord.farmer.farmerId}</span></p>
                    <p><span className="text-gray-400">Gender:</span> {selectedRecord.farmer.gender}</p>
                    <p><span className="text-gray-400">Seed Variety:</span> {selectedRecord.farmer.seedVariety}</p>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-[#222] rounded-lg space-y-2">
                    <p className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-[10px]">Location &amp; Group</p>
                    <p><span className="text-gray-400">Association:</span> {selectedRecord.farmer.association}</p>
                    <p><span className="text-gray-400">Club Name:</span> {selectedRecord.farmer.club}</p>
                    <p><span className="text-gray-400">Village / IPC:</span> {selectedRecord.farmer.village}, {selectedRecord.farmer.ipc}</p>
                    <p><span className="text-gray-400">GPS Location:</span> <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{selectedRecord.farmer.gpsLat}, {selectedRecord.farmer.gpsLng}</span></p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 Detail: Buying Centre Purchase */}
            {activeStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#2a2a2a]">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Step 2: Buying Centre Purchase</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Field intake log and individual bag barcode tags</p>
                  </div>
                  <Badge label="Purchased &amp; Tagged" color="blue" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-gray-50 dark:bg-[#222] rounded-lg space-y-2">
                    <p className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-[10px]">Intake Summary</p>
                    <p><span className="text-gray-400">Receipt Number:</span> <span className="font-mono font-bold text-[#1a5c2a] dark:text-emerald-400">{selectedRecord.purchase.receiptNumber}</span></p>
                    <p><span className="text-gray-400">Buying Centre:</span> {selectedRecord.purchase.buyingCentre}</p>
                    <p><span className="text-gray-400">Purchase Date:</span> {selectedRecord.purchase.purchaseDate}</p>
                    <p><span className="text-gray-400">Officer:</span> {selectedRecord.purchase.purchasingOfficer}</p>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-[#222] rounded-lg space-y-2">
                    <p className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-[10px]">Financial &amp; Weight</p>
                    <p><span className="text-gray-400">Total Net Weight:</span> <strong>{selectedRecord.purchase.weightKg} kg</strong></p>
                    <p><span className="text-gray-400">Number of Bags:</span> {selectedRecord.purchase.bagsCount} bags</p>
                    <p><span className="text-gray-400">Price Paid per kg:</span> {selectedRecord.purchase.pricePerKg}</p>
                    <p><span className="text-gray-400">Total Amount Paid:</span> <strong className="text-emerald-700 dark:text-emerald-400">{selectedRecord.purchase.totalPaid}</strong></p>
                  </div>
                </div>

                {/* Scanned Bag Barcode Tags List */}
                <div className="pt-2">
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Individual Scanned Bag Barcode Tags ({selectedRecord.purchase.bagTags.length}):</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecord.purchase.bagTags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 bg-gray-100 dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded font-mono text-xs text-[#1a5c2a] dark:text-emerald-400 font-semibold">
                        🏷️ {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 Detail: Warehouse Receiving & GRN */}
            {activeStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#2a2a2a]">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Step 3: Warehouse Receiving &amp; GRN</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Official Goods Received Note and quality inspection</p>
                  </div>
                  <Badge label={selectedRecord.grn.grnNumber} color="green" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-gray-50 dark:bg-[#222] rounded-lg space-y-2">
                    <p className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-[10px]">Receiving &amp; Location</p>
                    <p><span className="text-gray-400">GRN Number:</span> <span className="font-mono font-bold text-[#1a5c2a] dark:text-emerald-400">{selectedRecord.grn.grnNumber}</span></p>
                    <p><span className="text-gray-400">Warehouse:</span> {selectedRecord.grn.warehouseName}</p>
                    <p><span className="text-gray-400">Storage Location:</span> {selectedRecord.grn.storageLocation}</p>
                    <p><span className="text-gray-400">Receiving Officer:</span> {selectedRecord.grn.receivingOfficer}</p>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-[#222] rounded-lg space-y-2">
                    <p className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-[10px]">Quality &amp; Condition Inspection</p>
                    <p><span className="text-gray-400">Physical Condition:</span> {selectedRecord.grn.condition}</p>
                    <p><span className="text-gray-400">Assigned Grade:</span> <span className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedRecord.grn.qualityGrade}</span></p>
                    <p><span className="text-gray-400">GRN Stamp Date:</span> {selectedRecord.grn.grnDate}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4 Detail: Batching & Customer Dispatch */}
            {activeStep === 4 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#2a2a2a]">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Step 4: Batching &amp; Customer Dispatch</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Stack batch assignment and destination customer delivery</p>
                  </div>
                  <Badge label="Dispatched &amp; Certified" color="green" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-gray-50 dark:bg-[#222] rounded-lg space-y-2">
                    <p className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-[10px]">Batch &amp; Dispatch Order</p>
                    <p><span className="text-gray-400">Stack Batch ID:</span> <span className="font-mono font-bold text-[#1a5c2a] dark:text-emerald-400">{selectedRecord.dispatch.batchId}</span></p>
                    <p><span className="text-gray-400">Dispatch Order #:</span> {selectedRecord.dispatch.dispatchNumber}</p>
                    <p><span className="text-gray-400">Dispatch Date:</span> {selectedRecord.dispatch.dispatchDate}</p>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-[#222] rounded-lg space-y-2">
                    <p className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-[10px]">Buyer Destination</p>
                    <p><span className="text-gray-400">Customer Name:</span> <strong className="text-gray-900 dark:text-white">{selectedRecord.dispatch.customerName}</strong></p>
                    <p><span className="text-gray-400">Delivery Address:</span> {selectedRecord.dispatch.deliveryAddress}</p>
                    <p><span className="text-gray-400">Certificate Status:</span> <span className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedRecord.dispatch.certificateStatus}</span></p>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

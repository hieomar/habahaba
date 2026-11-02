"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import WorkspaceLayout from "@/components/WorkspaceLayout";
import { warehousesService } from "@/lib/api/warehouses";

const ICON = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

function SectionCard({ title, children }) {
  return (
    <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#222]">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function DataRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{value || "—"}</span>
    </div>
  );
}

function SkeletonPage() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48" />
      <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl" />
    </div>
  );
}

export default function WarehouseDetailPage() {
  const { id }   = useParams();
  const router   = useRouter();

  const [record, setRecord]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchRecord = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await warehousesService.getRecord(id);
      setRecord(data ?? null);
    } catch (err) {
      setError(err.message ?? "Failed to load record.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchRecord(); }, [fetchRecord]);

  if (loading) return <SkeletonPage />;

  if (error || !record) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {error ? "Error" : "Record Not Found"}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">{error ?? `No warehouse record found for ID ${id}.`}</p>
        <button onClick={() => router.push("/dashboard/warehouse")} className="mt-6 px-4 py-2 bg-[#1a5c2a] text-white rounded-lg hover:bg-[#134520]">
          Back to Warehouse
        </button>
      </div>
    );
  }

  return (
    <WorkspaceLayout
      icon={ICON}
      module="Warehouse"
      moduleHref="/dashboard/warehouse"
      title="Warehouse Stock Details"
      description={`Inventory & batch tracking details for ${record.batchNumber ?? id}`}
      tabs={[]}
      hideTitleBlock
      hideHeader
    >
      <div className="space-y-6 p-6 max-w-5xl mx-auto pb-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
          <Link href="/dashboard/warehouse" className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">Warehouse</Link>
          <span>/</span>
          <span className="text-gray-700 dark:text-gray-200">{record.grnNumber ?? id}</span>
        </div>

        {/* Header card */}
        <div className="bg-white dark:bg-[#1c1c1c] rounded-xl border border-gray-200 dark:border-[#2a2a2a] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">{record.warehouseName}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{record.location}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 font-mono">{record.warehouseCode}</p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${record.stockStatus === "Stored" ? "bg-green-50 dark:bg-emerald-950/40 text-green-700 dark:text-emerald-300" : "bg-gray-100 dark:bg-[#252525] text-gray-600 dark:text-gray-400"}`}>
              {record.stockStatus}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard title="Commodity">
            <div className="grid grid-cols-2 gap-4">
              <DataRow label="Commodity"        value={record.commodity} />
              <DataRow label="Grade"            value={record.grade} />
              <DataRow label="Number of Bags"   value={record.bags} />
              <DataRow label="Total Weight"     value={record.weight ? `${record.weight.toLocaleString()} kg` : "—"} />
              <DataRow label="Storage Location" value={[record.bin, record.stack, record.shelf].filter(Boolean).join(" / ")} />
              <DataRow label="Condition"        value={record.storageCondition} />
            </div>
          </SectionCard>

          <SectionCard title="GRN & Batch">
            <div className="grid grid-cols-2 gap-4">
              <DataRow label="GRN Number"        value={record.grnNumber} />
              <DataRow label="GRN Status"        value={record.grnStatus} />
              <DataRow label="Receiving Officer" value={record.receivingOfficer} />
              <DataRow label="Receiving Date"    value={record.receivingDate} />
              <DataRow label="Batch Number"      value={record.batchNumber} />
              <DataRow label="Batch Status"      value={record.batchStatus} />
            </div>
          </SectionCard>
        </div>

        {record.farmerName && (
          <SectionCard title="Farmer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{record.farmerName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Purchase date: {record.purchaseDate}</p>
              </div>
              {record.farmerId && (
                <Link href={`/dashboard/farmers/profiles/${record.farmerId}`} className="px-4 py-2 bg-[#1a5c2a] text-white text-xs font-semibold rounded-lg hover:bg-[#134520] transition-colors">
                  View Farmer Profile
                </Link>
              )}
            </div>
          </SectionCard>
        )}
      </div>
    </WorkspaceLayout>
  );
}

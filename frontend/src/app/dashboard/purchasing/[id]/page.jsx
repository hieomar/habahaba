"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { purchasesService } from "@/lib/api/purchases";

function Field({ label, value, mono }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-gray-400">{label}</span>
      <span className={`text-sm font-medium text-gray-900 ${mono ? "font-mono" : ""}`}>{value || "—"}</span>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100"><h2 className="text-sm font-semibold text-gray-700">{title}</h2></div>
      <div className="p-5">{children}</div>
    </div>
  );
}

const STAGES = ["Purchased", "Goods Received", "Warehoused", "Payment Settled"];

function SkeletonPage() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-32" />
      <div className="h-24 bg-gray-200 rounded-xl" />
      <div className="grid grid-cols-4 gap-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-gray-200 rounded-xl" />)}</div>
      <div className="h-48 bg-gray-200 rounded-xl" />
    </div>
  );
}

export default function PurchaseDetailPage({ params }) {
  const { id } = use(params);
  const router  = useRouter();

  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetchPurchase = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await purchasesService.get(id);
      setPurchase(data ?? null);
    } catch (err) {
      setError(err.message ?? "Failed to load purchase.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchPurchase(); }, [fetchPurchase]);

  if (loading) return <SkeletonPage />;

  if (error || !purchase) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <p className="text-sm font-semibold text-gray-900">{error ? "Error loading purchase" : "Purchase not found"}</p>
        <p className="text-xs text-gray-500">{error ?? `No record found for ID ${id}.`}</p>
        <button onClick={() => router.push("/dashboard/purchasing")} className="mt-2 px-4 py-2 bg-[#1a5c2a] text-white text-sm font-semibold rounded-lg hover:bg-[#134520] transition-colors">
          Back to Purchasing
        </button>
      </div>
    );
  }

  const { receiptNumber, status, purchaseDate, buyingCentre, purchasingOfficer, farmerId, farmerName, farmerPhone, farmerDistrict, commodity, variety, numberOfBags, totalWeight, unitPrice, grossAmount, seedLoanDeduction, otherDeductions, netPayable, paymentStatus, paymentMethod, grn, warehouse } = purchase;

  const stageIndex = paymentStatus === "Paid" ? 3 : warehouse?.inventoryStatus === "Stored" ? 2 : grn?.grnNumber ? 1 : 0;

  return (
    <div className="space-y-5 pb-12 max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
        <Link href="/dashboard/purchasing" className="hover:text-gray-700 transition-colors">Purchasing</Link>
        <span>/</span>
        <span className="text-gray-700">{id}</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 px-6 py-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-base font-bold text-gray-900">{receiptNumber}</h1>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500">
              <span className={`w-1.5 h-1.5 rounded-full ${status === "Completed" ? "bg-[#1a5c2a]" : "bg-gray-300"}`} />
              {status}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{purchaseDate} · {buyingCentre} · {purchasingOfficer}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {farmerId && (
            <Link href={`/dashboard/farmers/profiles/${farmerId}`} className="px-3.5 py-2 bg-[#1a5c2a] text-white text-xs font-semibold rounded-lg hover:bg-[#134520] transition-colors">
              View Farmer
            </Link>
          )}
          <button onClick={() => window.print()} className="px-3.5 py-2 bg-white text-gray-600 text-xs font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            Print
          </button>
        </div>
      </div>

      {/* Stage progress */}
      <div className="bg-white rounded-xl border border-gray-200 px-6 py-5">
        <div className="flex items-center justify-between">
          {STAGES.map((stage, idx) => (
            <div key={stage} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${idx <= stageIndex ? "bg-[#1a5c2a] text-white" : "bg-gray-100 text-gray-400"}`}>
                  {idx + 1}
                </div>
                <p className="text-[10px] font-semibold text-gray-500 mt-1 text-center">{stage}</p>
              </div>
              {idx < STAGES.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${idx < stageIndex ? "bg-[#1a5c2a]" : "bg-gray-100"}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Key numbers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Weight", value: `${(totalWeight ?? 0).toLocaleString()} kg` },
          { label: "Bags", value: numberOfBags ?? "—" },
          { label: "Unit Price", value: unitPrice ? `MWK ${unitPrice.toLocaleString()}/kg` : "—" },
          { label: "Gross Amount", value: grossAmount ? `MWK ${grossAmount.toLocaleString()}` : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-500 font-semibold">{label}</p>
            <p className="text-base font-bold text-gray-900 mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Farmer */}
        <Card title="Farmer">
          <div className="space-y-3">
            <Field label="Name"     value={farmerName} />
            <Field label="Phone"    value={farmerPhone} />
            <Field label="District" value={farmerDistrict} />
          </div>
        </Card>

        {/* Commodity */}
        <Card title="Commodity">
          <div className="space-y-3">
            <Field label="Commodity" value={commodity} />
            <Field label="Variety"   value={variety} />
            <Field label="Grade"     value={purchase.grade} />
            <Field label="Moisture"  value={purchase.moistureContent} />
          </div>
        </Card>

        {/* Financials */}
        <Card title="Financials">
          <div className="space-y-3">
            <Field label="Gross Amount"     value={grossAmount     ? `MWK ${grossAmount.toLocaleString()}`     : "—"} />
            <Field label="Seed Loan Deduction" value={seedLoanDeduction ? `MWK ${seedLoanDeduction.toLocaleString()}` : "—"} />
            <Field label="Other Deductions" value={otherDeductions ? `MWK ${otherDeductions.toLocaleString()}` : "—"} />
            <Field label="Net Payable"      value={netPayable      ? `MWK ${netPayable.toLocaleString()}`      : "—"} />
            <Field label="Payment Method"   value={paymentMethod} />
            <Field label="Payment Status"   value={paymentStatus} />
          </div>
        </Card>

        {/* GRN */}
        {grn && (
          <Card title="Goods Received Note">
            <div className="space-y-3">
              <Field label="GRN Number"        value={grn.grnNumber} mono />
              <Field label="Warehouse"         value={grn.warehouse} />
              <Field label="Receiving Officer" value={grn.receivingOfficer} />
              <Field label="Date"              value={grn.receivingDate} />
              <Field label="Status"            value={grn.grnStatus} />
            </div>
          </Card>
        )}
      </div>

      {/* Timeline */}
      {(purchase.timeline ?? []).length > 0 && (
        <Card title="Activity Timeline">
          <div className="space-y-4">
            {purchase.timeline.map((t) => (
              <div key={t.id} className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-[#1a5c2a] mt-1.5 flex-shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">{t.activity}</p>
                    <span className="text-xs text-gray-400">{t.date} {t.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{t.details}</p>
                  <p className="text-xs text-gray-400 mt-0.5">By {t.performedBy}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

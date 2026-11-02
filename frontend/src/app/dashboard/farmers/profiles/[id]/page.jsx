"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { farmersService } from "@/lib/api/farmers";

function StatWidget({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3">
      <p className="text-sm font-semibold text-gray-700">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value ?? "—"}</p>
    </div>
  );
}

function SectionCard({ title, children, action }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
        {action && <div>{action}</div>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900">{value || "—"}</span>
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs font-semibold text-gray-400">{label}</span>
      <span className={`text-sm font-medium text-gray-900 text-right ${mono ? "font-mono text-[#1a5c2a]" : ""}`}>{value || "—"}</span>
    </div>
  );
}

function SkeletonPage() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
      </div>
      <div className="h-48 bg-gray-200 rounded-xl" />
      <div className="h-48 bg-gray-200 rounded-xl" />
    </div>
  );
}

export default function FarmerProfilePage() {
  const { id } = useParams();
  const router = useRouter();

  const [farmer, setFarmer]           = useState(null);
  const [traceability, setTraceability] = useState([]);
  const [documents, setDocuments]     = useState([]);
  const [history, setHistory]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [farmerRes, histRes, traceRes, docsRes] = await Promise.all([
        farmersService.get(id),
        farmersService.getHistory(id),
        farmersService.getTraceability(id),
        farmersService.getDocuments(id),
      ]);
      setFarmer(farmerRes.data ?? null);
      setHistory((histRes.data ?? []).sort((a, b) => new Date(b.date) - new Date(a.date)));
      setTraceability(traceRes.data ?? []);
      setDocuments(docsRes.data ?? []);
    } catch (err) {
      setError(err.message ?? "Failed to load farmer profile.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) return <SkeletonPage />;

  if (error || !farmer) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <p className="text-sm font-semibold text-gray-900">{error ? "Error loading profile" : "Farmer not found"}</p>
        <p className="text-xs text-gray-500">{error ?? `No record found for ID ${id}.`}</p>
        <button
          onClick={() => router.push("/dashboard/farmers/profiles")}
          className="mt-2 px-4 py-2 bg-[#1a5c2a] text-white text-sm font-semibold rounded-lg hover:bg-[#134520] transition-colors"
        >
          Back to Profiles
        </button>
      </div>
    );
  }

  const totalVolume = traceability.reduce((s, t) => s + (t.quantity ?? 0), 0);
  const totalValue  = traceability.reduce((s, t) => s + (t.purchaseValue ?? 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
        <Link href="/dashboard/farmers/profiles" className="hover:text-gray-700 transition-colors">Farmers</Link>
        <span>/</span>
        <span className="text-gray-700">{farmer.fullName}</span>
      </div>

      {/* Stat widgets */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatWidget label="Farm Size" value={`${farmer.farmSize ?? 0} ${farmer.unit ?? "Ha"}`} />
        <StatWidget label="Total Volume" value={`${totalVolume.toLocaleString()} kg`} />
        <StatWidget label="Total Value" value={totalValue > 0 ? `MWK ${totalValue.toLocaleString()}` : "—"} />
        <StatWidget label="Activity Events" value={history.length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Personal Information">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full Name"    value={farmer.fullName} />
              <Field label="Gender"       value={farmer.gender} />
              <Field label="Date of Birth" value={farmer.dob} />
              <Field label="National ID"  value={farmer.nationalId} />
              <Field label="Phone"        value={farmer.phone} />
              <Field label="Alt. Phone"   value={farmer.altPhone} />
            </div>
          </SectionCard>

          <SectionCard title="Location">
            <div className="grid grid-cols-2 gap-4">
              <Field label="District" value={farmer.district} />
              <Field label="T/A"      value={farmer.ta} />
              <Field label="EPA"      value={farmer.epa} />
              <Field label="Section"  value={farmer.section} />
              <Field label="Village"  value={farmer.village} />
              <Field label="GPS"      value={farmer.gps} />
            </div>
          </SectionCard>

          <SectionCard title="Farm Details">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Farm Size"         value={`${farmer.farmSize} ${farmer.unit}`} />
              <Field label="Primary Crops"     value={(farmer.primaryCrops ?? []).join(", ")} />
              <Field label="Secondary Crops"   value={(farmer.secondaryCrops ?? []).join(", ") || "—"} />
              <Field label="Production Season" value={farmer.productionSeason} />
            </div>
          </SectionCard>

          {/* Activity history */}
          <SectionCard title="Activity History">
            {history.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No activity recorded yet.</p>
            ) : (
              <div className="space-y-4">
                {history.map((h) => (
                  <div key={h.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#1a5c2a] mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-900">{h.type}</p>
                        <span className="text-xs text-gray-400">{h.date ? new Date(h.date).toLocaleDateString() : ""}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{h.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">By {h.officer} · {h.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <SectionCard title="Organisation">
            <Row label="Association" value={farmer.association} />
            <Row label="Club"        value={farmer.club} />
            <Row label="Group"       value={farmer.group} />
            <Row label="Member No."  value={farmer.memberNo} mono />
          </SectionCard>

          <SectionCard title="Registration">
            <Row label="Date"    value={farmer.registrationDate} />
            <Row label="Officer" value={farmer.registrationOfficer} />
            <Row label="Status"  value={farmer.status} />
          </SectionCard>

          {traceability.length > 0 && (
            <SectionCard title="Traceability">
              {traceability.slice(0, 3).map((t) => (
                <div key={t.id} className="py-2 border-b border-gray-50 last:border-0">
                  <p className="text-xs font-semibold text-gray-700">{t.batchNumber}</p>
                  <p className="text-xs text-gray-500">{t.commodity} · {t.quantity} kg</p>
                </div>
              ))}
            </SectionCard>
          )}

          {documents.length > 0 && (
            <SectionCard title="Documents">
              {documents.map((d) => (
                <div key={d.id} className="py-2 border-b border-gray-50 last:border-0">
                  <p className="text-xs font-semibold text-gray-700">{d.name}</p>
                  <p className="text-xs text-gray-400">{d.type} · {d.status}</p>
                </div>
              ))}
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}

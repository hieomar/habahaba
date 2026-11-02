"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { farmersService } from "@/lib/api/farmers";

function Avatar({ name }) {
  const initials = (name ?? "?").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
      <span className="text-xs font-semibold text-gray-600">{initials}</span>
    </div>
  );
}

function StatusDot({ status }) {
  const dot = { Active: "bg-green-500", Inactive: "bg-gray-400", "Pending Verification": "bg-amber-400" }[status] || "bg-gray-400";
  return (
    <span className="flex items-center gap-1.5 text-sm text-gray-600 whitespace-nowrap">
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
      {status}
    </span>
  );
}

function RowMenu({ farmer }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((p) => !p)} className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1">
          <Link href={`/dashboard/farmers/profiles/${farmer.id}`} className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setOpen(false)}>
            View profile
          </Link>
        </div>
      )}
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100 animate-pulse">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-3/4" /></td>
      ))}
    </tr>
  );
}

export default function FarmerProfilesPage() {
  const [farmers, setFarmers]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState("");
  const [filters, setFilters]   = useState({ district: "", status: "" });

  const fetchFarmers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { limit: 500 };
      if (filters.district) params.district = filters.district;
      if (filters.status)   params.status   = filters.status;
      const { data } = await farmersService.list(params);
      setFarmers(data ?? []);
    } catch (err) {
      setError(err.message ?? "Failed to load farmers.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchFarmers(); }, [fetchFarmers]);

  const districts     = [...new Set(farmers.map((f) => f.district).filter(Boolean))].sort();
  const associations  = [...new Set(farmers.map((f) => f.association).filter(Boolean))].sort();

  const filtered = useMemo(() =>
    farmers.filter((f) => {
      const q = search.toLowerCase();
      return (
        (!q || `${f.fullName} ${f.memberNo ?? ""} ${f.nationalId ?? ""}`.toLowerCase().includes(q)) &&
        (!filters.district || f.district === filters.district) &&
        (!filters.status   || f.status   === filters.status)
      );
    }),
  [farmers, search, filters]);

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Farmer Profiles</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Browse and manage registered farmer records.</p>
        </div>
        <Link
          href="/dashboard/farmers/registration"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1a5c2a] text-white text-sm font-semibold rounded-lg hover:bg-[#134520] transition-colors self-start"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Register Farmer
        </Link>
      </div>

      {/* Search + filters */}
      <div className="bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-[#2a2a2a] rounded-xl p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search farmers by name, ID, National ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-[#333] rounded-lg outline-none bg-white dark:bg-[#252525] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#1a5c2a]/30"
          />
        </div>
        <select
          value={filters.district}
          onChange={(e) => setFilters((f) => ({ ...f, district: e.target.value }))}
          className="px-3 py-2 text-sm border border-gray-200 dark:border-[#333] rounded-lg outline-none bg-white dark:bg-[#252525] text-gray-700 dark:text-gray-300"
        >
          <option value="">All Districts</option>
          {districts.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className="px-3 py-2 text-sm border border-gray-200 dark:border-[#333] rounded-lg outline-none bg-white dark:bg-[#252525] text-gray-700 dark:text-gray-300"
        >
          <option value="">All Statuses</option>
          {["Active", "Inactive", "Pending Verification"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {(filters.district || filters.status) && (
          <button onClick={() => setFilters({ district: "", status: "" })} className="px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
            Clear filters
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900 rounded-xl p-4 text-sm text-red-700 dark:text-red-400">
          {error} — <button onClick={fetchFarmers} className="underline font-semibold">Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-[#1c1c1c] border border-gray-200 dark:border-[#2a2a2a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#222]">
                {["", "Farmer ID", "Name", "District", "Association", "Crops", "Status", ""].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{search || filters.district || filters.status ? "No farmers match your filters." : "No farmer records found."}</p>
                  </td>
                </tr>
              ) : (
                filtered.map((f) => (
                  <tr key={f.id} className="border-b border-gray-50 dark:border-[#2a2a2a] hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
                    <td className="px-4 py-3"><Avatar name={f.fullName} /></td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{f.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800 dark:text-white">{f.fullName}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{f.memberNo}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{f.district}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{f.association || "—"}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{(f.primaryCrops ?? []).join(", ") || "—"}</td>
                    <td className="px-4 py-3"><StatusDot status={f.status} /></td>
                    <td className="px-4 py-3"><RowMenu farmer={f} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 dark:border-[#2a2a2a] text-xs text-gray-500 dark:text-gray-400">
            {filtered.length} {filtered.length !== farmers.length ? `of ${farmers.length} ` : ""}farmers
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { farmersService } from "@/lib/api/farmers";

function ActivityIcon({ type }) {
  const styles = {
    Registration: "bg-blue-50 text-blue-600",
    "Farm Visit": "bg-green-50 text-green-600",
    "Seed Loan": "bg-orange-50 text-orange-600",
    "Commodity Purchases": "bg-purple-50 text-purple-600",
    "Warehouse Deliveries": "bg-indigo-50 text-indigo-600",
  };
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${styles[type] || "bg-gray-100 text-gray-600"}`}>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    </div>
  );
}

function SkeletonEntry() {
  return (
    <div className="flex gap-4 animate-pulse">
      <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-3.5 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
      </div>
    </div>
  );
}

export default function FarmerHistoryPage() {
  const [history, setHistory]   = useState([]);
  const [farmers, setFarmers]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState("");
  const [filters, setFilters]   = useState({ farmerId: "", officer: "", activityType: "", dateFrom: "", dateTo: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [histRes, farmersRes] = await Promise.all([
        farmersService.listHistory({ limit: 500 }),
        farmersService.list({ limit: 500 }),
      ]);
      setHistory(histRes.data ?? []);
      setFarmers(farmersRes.data ?? []);
    } catch (err) {
      setError(err.message ?? "Failed to load history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const officers      = [...new Set(history.map((h) => h.officer).filter(Boolean))];
  const activityTypes = [...new Set(history.map((h) => h.type).filter(Boolean))];

  const filtered = useMemo(() =>
    history.filter((h) => {
      const q = search.toLowerCase();
      return (
        (!q || `${h.farmerName ?? ""} ${h.description ?? ""} ${h.officer ?? ""}`.toLowerCase().includes(q)) &&
        (!filters.farmerId    || h.farmerId    === filters.farmerId) &&
        (!filters.officer     || h.officer     === filters.officer) &&
        (!filters.activityType || h.type       === filters.activityType) &&
        (!filters.dateFrom    || new Date(h.date) >= new Date(filters.dateFrom)) &&
        (!filters.dateTo      || new Date(h.date) <= new Date(filters.dateTo))
      );
    }).sort((a, b) => new Date(b.date) - new Date(a.date)),
  [history, search, filters]);

  const clearFilters = () => {
    setFilters({ farmerId: "", officer: "", activityType: "", dateFrom: "", dateTo: "" });
    setSearch("");
  };

  const hasFilters = Object.values(filters).some((v) => v) || search;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Farmers</p>
        <h1 className="text-xl font-bold text-gray-900">Activity History</h1>
        <p className="text-sm text-gray-500 mt-0.5">Full activity trail across all registered farmers.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search history…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#1a5c2a] bg-white"
          />
        </div>
        <select value={filters.farmerId} onChange={(e) => setFilters((f) => ({ ...f, farmerId: e.target.value }))}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#1a5c2a] bg-white">
          <option value="">All Farmers</option>
          {farmers.map((f) => <option key={f.id} value={f.id}>{f.fullName}</option>)}
        </select>
        <select value={filters.activityType} onChange={(e) => setFilters((f) => ({ ...f, activityType: e.target.value }))}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#1a5c2a] bg-white">
          <option value="">All Types</option>
          {activityTypes.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filters.officer} onChange={(e) => setFilters((f) => ({ ...f, officer: e.target.value }))}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#1a5c2a] bg-white">
          <option value="">All Officers</option>
          {officers.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <input type="date" value={filters.dateFrom} onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#1a5c2a] bg-white" />
        <input type="date" value={filters.dateTo} onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#1a5c2a] bg-white" />
        {hasFilters && (
          <button onClick={clearFilters} className="px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors">
            Clear filters
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error} — <button onClick={fetchData} className="underline font-semibold">Retry</button>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonEntry key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-gray-500">{hasFilters ? "No activity matches your filters." : "No activity history found. Connect a backend to load farmer activity data."}</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-[18px] top-0 bottom-0 w-0.5 bg-gray-100" />
            <div className="space-y-6">
              {filtered.map((h) => (
                <div key={h.id} className="flex gap-4 relative">
                  <ActivityIcon type={h.type} />
                  <div className="flex-1 pb-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{h.type}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{h.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {h.officer && `By ${h.officer}`}{h.location && ` · ${h.location}`}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-semibold text-gray-700">{h.farmerName}</p>
                        <p className="text-xs text-gray-400">{h.date ? new Date(h.date).toLocaleDateString() : ""}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <p className="text-xs text-gray-400 mt-6 text-center">{filtered.length} activity record{filtered.length !== 1 ? "s" : ""}</p>
        )}
      </div>
    </div>
  );
}

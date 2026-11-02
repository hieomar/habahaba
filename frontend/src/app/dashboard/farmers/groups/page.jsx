"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { farmersService } from "@/lib/api/farmers";

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${status === "Active" ? "bg-gray-100 text-gray-600" : "bg-gray-50 text-gray-400"}`}>
      {status}
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-4 py-3"><div className="h-3.5 bg-gray-200 rounded w-3/4" /></td>
      ))}
    </tr>
  );
}

export default function FarmerGroupsPage() {
  const [groups, setGroups]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await farmersService.listGroups({ limit: 200 });
      setGroups(data ?? []);
    } catch (err) {
      setError(err.message ?? "Failed to load farmer groups.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  const filtered = useMemo(() =>
    groups.filter((g) =>
      `${g.name} ${g.district} ${g.association} ${g.chairperson ?? ""}`.toLowerCase().includes(search.toLowerCase())
    ),
  [groups, search]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Farmers</p>
        <h1 className="text-xl font-bold text-gray-900">Farmer Groups</h1>
        <p className="text-sm text-gray-500 mt-0.5">View and manage farmer groups and their members.</p>
      </div>

      <div className="relative w-full max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search groups…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#1a5c2a] bg-white"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error} — <button onClick={fetchGroups} className="underline font-semibold">Retry</button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["Group Name", "Association", "District", "Members", "Chairperson", "Status"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                  {search ? "No groups match your search." : "No farmer groups found. Connect a backend to load group data."}
                </td>
              </tr>
            ) : (
              filtered.map((g) => (
                <tr
                  key={g.id}
                  onClick={() => setSelected(g)}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 font-semibold text-gray-900">{g.name}</td>
                  <td className="px-4 py-3 text-gray-600">{g.association}</td>
                  <td className="px-4 py-3 text-gray-600">{g.district}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">{g.members ?? 0}</td>
                  <td className="px-4 py-3 text-gray-500">{g.chairperson || "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={g.status} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-gray-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selected.name}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{selected.association} · {selected.district}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  ["Members", selected.members ?? 0],
                  ["Status", selected.status],
                  ["Chairperson", selected.chairperson || "—"],
                  ["Created", selected.createdAt || "—"],
                ].map(([label, value]) => (
                  <div key={label} className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-sm font-bold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>
              {selected.village && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Village</span>
                  <span className="font-medium text-gray-900">{selected.village}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

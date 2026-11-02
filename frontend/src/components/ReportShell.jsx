"use client";

import { useState } from "react";

const DATE_FILTERS = [
  { key: "startDate", label: "Starting Date", type: "date" },
  { key: "endDate", label: "End Date", type: "date" },
];

function formatExcel(rows, columns) {
  if (!rows || rows.length === 0) return "";
  const lines = [columns.map((c) => c.title).join("\t")];
  for (const row of rows) {
    lines.push(
      columns
        .map((c) => String(row[c.key] ?? "").replace(/\r?\n/g, " ").replace(/\t/g, " "))
        .join("\t")
    );
  }
  return lines.join("\n");
}

function parseDateValue(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const normalized = String(value).trim();
  if (!normalized) return null;
  const parsed = new Date(normalized.includes("T") ? normalized : `${normalized}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function rowMatchesDateRange(row, startDate, endDate) {
  if (!startDate && !endDate) return true;
  const candidateKeys = ["date", "createdAt", "timestamp", "time", "updated", "enrollment", "lastSeen", "lastLogin", "when", "generatedAt"];
  for (const key of candidateKeys) {
    const parsed = parseDateValue(row[key]);
    if (!parsed) continue;
    const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
    const end = endDate ? new Date(`${endDate}T23:59:59`) : null;
    if (start && parsed < start) return false;
    if (end && parsed > end) return false;
    return true;
  }
  return true;
}

export default function ReportShell({
  title,
  description,
  filters = [],
  columns = [],
  generateFn,
}) {
  const [filterValues, setFilterValues] = useState(
    Object.fromEntries([...DATE_FILTERS, ...filters].map((f) => [f.key, f.default ?? ""]))
  );
  const [rows, setRows] = useState([]);
  const [reportHistory, setReportHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateError, setDateError] = useState("");
  const [generatedRange, setGeneratedRange] = useState("");

  const update = (key, value) => setFilterValues((s) => ({ ...s, [key]: value }));

  const validateDateRange = (values) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (values.startDate) {
      const startDate = new Date(`${values.startDate}T00:00:00`);
      if (startDate > today) return "Starting date cannot be in the future.";
    }

    if (values.endDate) {
      const endDate = new Date(`${values.endDate}T00:00:00`);
      if (endDate > today) return "End date cannot be in the future.";
    }

    if (values.startDate && values.endDate) {
      const startDate = new Date(`${values.startDate}T00:00:00`);
      const endDate = new Date(`${values.endDate}T00:00:00`);
      if (endDate < startDate) return "End date must be on or after the starting date.";
    }

    return "";
  };

  const generate = async () => {
    if (!generateFn) return;

    const validationError = validateDateRange(filterValues);
    if (validationError) {
      setDateError(validationError);
      setRows([]);
      return;
    }

    // Default end date to today if not specified
    const todayStr = new Date().toISOString().slice(0, 10);
    const effectiveEndDate = filterValues.endDate || todayStr;

    setDateError("");
    setLoading(true);
    try {
      const data = await generateFn(filterValues);
      const nextRows = (data || []).filter((row) => rowMatchesDateRange(row, filterValues.startDate, effectiveEndDate));
      const snapshot = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        range: filterValues.startDate && effectiveEndDate
          ? `${filterValues.startDate} to ${effectiveEndDate}`
          : filterValues.startDate || effectiveEndDate || "all available data",
        rows: nextRows,
        generatedAt: new Date().toISOString(),
      };
      setRows(nextRows);
      setGeneratedRange(snapshot.range);
      setReportHistory((prev) => [snapshot, ...prev].slice(0, 5));
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = () => {
    if (!rows.length) return;
    const excel = formatExcel(rows, columns);
    const blob = new Blob([excel], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replaceAll(" ", "_").toLowerCase()}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    if (!rows.length) return;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;

    const rowsMarkup = rows
      .map((row) => {
        const cells = columns
          .map((column) => `<td style="border:1px solid #d1d5db;padding:8px;text-align:left;">${String(row[column.key] ?? "")}</td>`)
          .join("");
        return `<tr>${cells}</tr>`;
      })
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
            h1 { font-size: 20px; margin: 0 0 8px; }
            p { margin: 0 0 12px; color: #4b5563; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
            th { background: #f3f4f6; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <p>${description || "Generated report"}</p>
          <p>Generated range: ${generatedRange || "all available data"}</p>
          <table>
            <thead>
              <tr>${columns.map((column) => `<th>${column.title}</th>`).join("")}</tr>
            </thead>
            <tbody>${rowsMarkup}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const allFilters = [...DATE_FILTERS, ...filters];

  return (
    <div className="p-6 space-y-4 max-w-[1400px] mx-auto">
      <div className="rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1c1c1c] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{title}</p>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-1">{title}</h1>
            {description && <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 max-w-2xl">{description}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={generate} disabled={loading} className="bg-[#1a5c2a] text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-[#134520] transition-colors disabled:opacity-50">
              {loading ? "Generating…" : "Generate Report"}
            </button>
            <button onClick={exportExcel} disabled={!rows.length} className="bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#333] text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#2e2e2e] transition-colors disabled:opacity-40">
              Export Excel
            </button>
            <button onClick={printReport} disabled={!rows.length} className="bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#333] text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-[#2e2e2e] transition-colors disabled:opacity-40">
              Print Report
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1c1c1c] p-5 space-y-3">
        <div className="grid gap-3 md:grid-cols-3">
          {allFilters.map((f) => (
            <div key={f.key} className="flex flex-col">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{f.label}</label>
              {f.type === "select" ? (
                <select value={filterValues[f.key]} onChange={(e) => update(f.key, e.target.value)} className="px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none bg-white dark:bg-[#252525]">
                  <option value="">All</option>
                  {f.options?.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={f.type === "date" ? "date" : "text"}
                  value={filterValues[f.key]}
                  onChange={(e) => update(f.key, e.target.value)}
                  placeholder={f.placeholder || ""}
                  className="px-3 py-2 border border-gray-200 dark:border-[#333] rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none bg-white dark:bg-[#252525]"
                />
              )}
            </div>
          ))}
        </div>
        {dateError && <p className="text-sm text-red-600 dark:text-red-400">{dateError}</p>}
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1c1c1c] p-5">
        {rows.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No results. Use the filters and click "Generate Report".</p>
        ) : (
          <div className="space-y-4">
            <div className="overflow-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-[#2a2a2a]">
                    {columns.map((c) => (
                      <th key={c.key} className="px-3 py-2 text-gray-600 dark:text-gray-400 font-semibold">{c.title}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white dark:bg-[#1c1c1c]" : "bg-gray-50 dark:bg-[#222]"}>
                      {columns.map((c) => (
                        <td key={c.key} className="px-3 py-2 align-top text-gray-700 dark:text-gray-300">{String(r[c.key] ?? "")}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {reportHistory.length > 1 && (
              <div className="border-t border-gray-100 dark:border-[#2a2a2a] pt-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent generations</h3>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {reportHistory.slice(1).map((snapshot) => (
                    <div key={snapshot.id} className="rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#222] p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{snapshot.range}</span>
                        <span className="text-gray-500 dark:text-gray-400">{snapshot.rows.length} rows</span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Generated {new Date(snapshot.generatedAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

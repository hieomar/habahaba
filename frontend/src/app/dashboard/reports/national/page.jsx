"use client";

import ReportShell from "../../../../components/ReportShell";

const filters = [
  { key: "region", label: "Region", type: "select", options: [
    { value: "north", label: "North" },
    { value: "south", label: "South" },
    { value: "east", label: "East" },
    { value: "west", label: "West" },
  ] },
  { key: "year", label: "Year", type: "text", placeholder: "YYYY" },
];

const columns = [
  { key: "region", title: "Region" },
  { key: "year", title: "Year" },
  { key: "growth", title: "Growth" },
  { key: "trend", title: "Trend" },
];

async function generateMock(filters) {
  const data = [
    { region: "north", year: "2025", growth: "8%", trend: "Up" },
    { region: "south", year: "2025", growth: "6%", trend: "Stable" },
    { region: "east", year: "2025", growth: "10%", trend: "Up" },
    { region: "west", year: "2025", growth: "4%", trend: "Down" },
  ];

  return data.filter((row) =>
    (!filters.region || row.region === filters.region) &&
    (!filters.year || row.year === filters.year)
  );
}

export default function NationalReportsPage() {
  return (
    <ReportShell
      title="National Reports"
      description="Country-level summaries, regional performance, and national trends."
      filters={filters}
      columns={columns}
      generateFn={generateMock}
    />
  );
}

"use client";

import ReportShell from "../../../../components/ReportShell";

const filters = [
  { key: "region", label: "Region", type: "select", options: [
    { value: "north", label: "North" },
    { value: "south", label: "South" },
    { value: "east", label: "East" },
    { value: "west", label: "West" },
  ] },
  { key: "status", label: "Status", type: "select", options: [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ] },
];

const columns = [
  { key: "farmer", title: "Farmer" },
  { key: "region", title: "Region" },
  { key: "status", title: "Status" },
  { key: "enrollment", title: "Enrollment" },
];

async function generateMock(filters) {
  const data = [
    { farmer: "Alice", region: "north", status: "active", enrollment: "2024-03-01" },
    { farmer: "Bob", region: "south", status: "inactive", enrollment: "2023-11-12" },
    { farmer: "Carol", region: "east", status: "active", enrollment: "2024-02-15" },
  ];

  return data.filter((row) =>
    (!filters.region || row.region === filters.region) &&
    (!filters.status || row.status === filters.status)
  );
}

export default function FarmerStatisticsPage() {
  return (
    <ReportShell
      title="Farmer Statistics"
      description="Farmer participation, segmentation, adoption rates, and retention metrics across the organization."
      filters={filters}
      columns={columns}
      generateFn={generateMock}
    />
  );
}

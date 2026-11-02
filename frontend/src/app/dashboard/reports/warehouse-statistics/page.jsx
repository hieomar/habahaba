"use client";

import ReportShell from "../../../../components/ReportShell";

const filters = [
  { key: "warehouse", label: "Warehouse", type: "text", placeholder: "Warehouse name" },
  { key: "status", label: "Status", type: "select", options: [
    { value: "healthy", label: "Healthy" },
    { value: "risky", label: "Risky" },
    { value: "critical", label: "Critical" },
  ] },
];

const columns = [
  { key: "warehouse", title: "Warehouse" },
  { key: "utilization", title: "Utilization" },
  { key: "throughput", title: "Throughput" },
  { key: "health", title: "Health" },
];

async function generateMock(filters) {
  const data = [
    { warehouse: "Warehouse A", utilization: "82%", throughput: "1,200 units", health: "Healthy" },
    { warehouse: "Warehouse B", utilization: "68%", throughput: "900 units", health: "Risky" },
    { warehouse: "Warehouse C", utilization: "93%", throughput: "1,500 units", health: "Critical" },
  ];

  return data.filter((row) =>
    (!filters.warehouse || row.warehouse.toLowerCase().includes(filters.warehouse.toLowerCase())) &&
    (!filters.status || row.health.toLowerCase() === filters.status)
  );
}

export default function WarehouseStatisticsPage() {
  return (
    <ReportShell
      title="Warehouse Statistics"
      description="Warehouse utilization, throughput, capacity, and stock health statistics across all locations."
      filters={filters}
      columns={columns}
      generateFn={generateMock}
    />
  );
}

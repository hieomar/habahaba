"use client";

import ReportShell from "../../../../components/ReportShell";

const filters = [
  { key: "batch", label: "Batch", type: "text", placeholder: "Batch number" },
  { key: "status", label: "Status", type: "select", options: [
    { value: "complete", label: "Complete" },
    { value: "pending", label: "Pending" },
    { value: "review", label: "Review" },
  ] },
];

const columns = [
  { key: "batch", title: "Batch" },
  { key: "origin", title: "Origin" },
  { key: "status", title: "Status" },
  { key: "lastSeen", title: "Last Seen" },
];

async function generateMock(filters) {
  const data = [
    { batch: "BATCH-001", origin: "Farm A", status: "complete", lastSeen: "2026-07-10" },
    { batch: "BATCH-002", origin: "Farm B", status: "pending", lastSeen: "2026-07-12" },
    { batch: "BATCH-003", origin: "Farm C", status: "review", lastSeen: "2026-07-11" },
  ];

  return data.filter((row) =>
    (!filters.batch || row.batch.toLowerCase().includes(filters.batch.toLowerCase())) &&
    (!filters.status || row.status === filters.status)
  );
}

export default function TraceabilityReportsPage() {
  return (
    <ReportShell
      title="Traceability Reports"
      description="Supply chain visibility, provenance, batch reconciliation, and trace history."
      filters={filters}
      columns={columns}
      generateFn={generateMock}
    />
  );
}

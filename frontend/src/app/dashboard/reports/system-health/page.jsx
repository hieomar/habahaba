"use client";

import ReportShell from "../../../../components/ReportShell";

const filters = [
  { key: "since", label: "Since", type: "text", placeholder: "YYYY-MM-DD" },
];

const columns = [
  { key: "metric", title: "Metric" },
  { key: "value", title: "Value" },
  { key: "updated", title: "Updated" },
];

async function generateMock() {
  return [
    { metric: "uptime", value: "99.99%", updated: "2026-07-11T12:00:00Z" },
    { metric: "avg_response_ms", value: "120ms", updated: "2026-07-11T12:00:00Z" },
  ];
}

export default function SystemHealthPage() {
  return (
    <ReportShell
      title="System Health"
      description="Platform uptime, availability, performance metrics, and operational stability trends."
      filters={filters}
      columns={columns}
      generateFn={generateMock}
    />
  );
}

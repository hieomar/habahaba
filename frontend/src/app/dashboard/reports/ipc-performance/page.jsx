"use client";

import ReportShell from "../../../../components/ReportShell";

const filters = [
  { key: "ipc", label: "IPC", type: "text", placeholder: "IPC name" },
  { key: "status", label: "Status", type: "select", options: [
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ] },
];

const columns = [
  { key: "ipc", title: "IPC" },
  { key: "benchmark", title: "Benchmark" },
  { key: "utilization", title: "Utilization" },
  { key: "performance", title: "Performance" },
];

async function generateMock(filters) {
  const data = [
    { ipc: "IPC A", benchmark: "92%", utilization: "88%", performance: "High" },
    { ipc: "IPC B", benchmark: "85%", utilization: "76%", performance: "Medium" },
    { ipc: "IPC C", benchmark: "93%", utilization: "90%", performance: "High" },
  ];

  return data.filter((row) =>
    (!filters.ipc || row.ipc.toLowerCase().includes(filters.ipc.toLowerCase())) &&
    (!filters.status || row.performance.toLowerCase() === filters.status)
  );
}

export default function IPCPerformancePage() {
  return (
    <ReportShell
      title="IPC Performance"
      description="Performance scorecards for IPCs with benchmarking, utilization, and operational efficiency metrics."
      filters={filters}
      columns={columns}
      generateFn={generateMock}
    />
  );
}

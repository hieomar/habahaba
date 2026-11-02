"use client";

import ReportShell from "../../../../components/ReportShell";

const filters = [
  { key: "type", label: "Type", type: "select", options: [
    { value: "email", label: "Email" },
    { value: "sms", label: "SMS" },
    { value: "push", label: "Push" },
  ] },
  { key: "status", label: "Status", type: "select", options: [
    { value: "sent", label: "Sent" },
    { value: "delivered", label: "Delivered" },
    { value: "failed", label: "Failed" },
  ] },
];

const columns = [
  { key: "time", title: "Time" },
  { key: "recipient", title: "Recipient" },
  { key: "channel", title: "Channel" },
  { key: "status", title: "Status" },
];

async function generateMock(filters) {
  const all = [
    { time: "2026-07-11T09:00:00Z", recipient: "farmer1@example.com", channel: "email", status: "delivered" },
    { time: "2026-07-11T09:05:00Z", recipient: "farmer2@example.com", channel: "sms", status: "failed" },
  ];
  return all.filter((r) => (filters.type ? r.channel === filters.type : true)).filter((r) => (filters.status ? r.status === filters.status : true));
}

export default function NotificationReportsPage() {
  return (
    <ReportShell
      title="Notification Reports"
      description="Review message delivery history, alert activity, and communication performance."
      filters={filters}
      columns={columns}
      generateFn={generateMock}
    />
  );
}

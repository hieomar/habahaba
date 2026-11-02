"use client";

import ReportShell from "../../../../components/ReportShell";

const filters = [
  { key: "query", label: "Search", type: "text", placeholder: "search by name or email" },
  { key: "role", label: "Role", type: "select", options: [
    { value: "role-sysadmin", label: "System Administrator" },
    { value: "role-head-office", label: "Head Office" },
    { value: "role-ipc-manager", label: "IPC Manager" },
  ] },
];

const columns = [
  { key: "id", title: "ID" },
  { key: "name", title: "Name" },
  { key: "email", title: "Email" },
  { key: "role", title: "Role" },
  { key: "lastLogin", title: "Last Login" },
];

async function generateMock(filters) {
  const all = [
    { id: 1, name: "Alice Admin", email: "alice@example.com", role: "role-sysadmin", lastLogin: "2026-07-10" },
    { id: 2, name: "Bob Office", email: "bob@example.com", role: "role-head-office", lastLogin: "2026-07-11" },
  ];
  return all.filter((r) => {
    if (filters.role && r.role !== filters.role) return false;
    if (filters.query && !`${r.name} ${r.email}`.toLowerCase().includes(filters.query.toLowerCase())) return false;
    return true;
  });
}

export default function UserReportsPage() {
  return (
    <ReportShell
      title="User Reports"
      description="Active users, role assignment breakdown, login history, and system access trends."
      filters={filters}
      columns={columns}
      generateFn={generateMock}
    />
  );
}

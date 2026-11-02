"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/auth/authContext";
import ReportShell from "../../../../components/ReportShell";

const filters = [
  { key: "actor", label: "Actor", type: "text", placeholder: "username or id" },
  { key: "type", label: "Type", type: "select", options: [
    { value: "config", label: "Configuration" },
    { value: "role", label: "Role Change" },
    { value: "security", label: "Security Event" },
  ] },
];

const columns = [
  { key: "time", title: "Time" },
  { key: "actor", title: "Actor" },
  { key: "action", title: "Action" },
  { key: "details", title: "Details" },
];

async function generateMock(filters) {
  return [
    { time: "2026-07-10T08:00:00Z", actor: "alice", action: "updated role", details: "promoted bob to admin" },
    { time: "2026-07-11T09:30:00Z", actor: "system", action: "config change", details: "updated sync interval" },
  ].filter((r) => (filters.type ? r.action.toLowerCase().includes(filters.type) || r.details.toLowerCase().includes(filters.type) : true));
}

export default function AuditReportsPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.roleId === "role-sysadmin") {
      router.replace("/dashboard/admin/audit-logs");
    }
  }, [router, user?.roleId]);

  if (user?.roleId === "role-sysadmin") return null;

  return (
    <ReportShell
      title="Audit Reports"
      description="Track system audit trails, configuration changes, admin actions, and security events."
      filters={filters}
      columns={columns}
      generateFn={generateMock}
    />
  );
}

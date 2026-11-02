"use client";

import { useAuth } from "@/auth/authContext";
import WorkspaceLayout from "@/components/WorkspaceLayout";

const REPORTS_ICON = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const REPORT_TABS = {
  "role-sysadmin": [
    { label: "User Reports", href: "/dashboard/reports/user-reports" },
    { label: "System Health", href: "/dashboard/reports/system-health" },
  ],
  "role-head-office": [
    { label: "National Reports", href: "/dashboard/reports/national" },
    { label: "IPC Performance", href: "/dashboard/reports/ipc-performance" },
    { label: "Farmer Statistics", href: "/dashboard/reports/farmer-statistics" },
    { label: "Warehouse Statistics", href: "/dashboard/reports/warehouse-statistics" },
    { label: "Traceability Reports", href: "/dashboard/reports/traceability-reports" },
  ],
  default: [
    { label: "National Reports", href: "/dashboard/reports/national" },
    { label: "IPC Performance", href: "/dashboard/reports/ipc-performance" },
    { label: "Farmer Statistics", href: "/dashboard/reports/farmer-statistics" },
    { label: "Warehouse Statistics", href: "/dashboard/reports/warehouse-statistics" },
    { label: "Traceability Reports", href: "/dashboard/reports/traceability-reports" },
  ],
};

export default function ReportsLayout({ children }) {
  const { user } = useAuth();
  const roleId = user?.roleId || "default";
  const tabs = REPORT_TABS[roleId] || REPORT_TABS.default;

  return (
    <WorkspaceLayout
      icon={REPORTS_ICON}
      module="Reports"
      moduleHref="/dashboard/reports"
      title="Reports"
      description="Access report dashboards and specialized report categories."
      tabs={tabs}
      hideTitleBlock={true}
      hideHeader={true}
    >
      {children}
    </WorkspaceLayout>
  );
}

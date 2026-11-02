"use client";

import { usePathname } from "next/navigation";
import WorkspaceLayout from "@/components/WorkspaceLayout";

const ICON = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const TABS = [
  { label: "Purchase Console", href: "/dashboard/purchasing" },
  { label: "Purchase Orders", href: "/dashboard/purchasing/orders" },
  { label: "Goods Receiving", href: "/dashboard/purchasing/receiving" },
  { label: "Purchase History", href: "/dashboard/purchasing/history" },
  { label: "Suppliers", href: "/dashboard/purchasing/suppliers" },
];

export default function PurchasingLayout({ children }) {
  const pathname = usePathname();

  // Detail page — render without tabs, just with padding
  const isDetailPage =
    pathname.startsWith("/dashboard/purchasing/") &&
    pathname !== "/dashboard/purchasing" &&
    !TABS.some((t) => t.href === pathname);

  if (isDetailPage) {
    return <div className="p-6">{children}</div>;
  }

  return (
    <WorkspaceLayout
      icon={ICON}
      module="Purchasing"
      moduleHref="/dashboard/purchasing"
      title="Purchasing"
      description="Manage commodity purchases, purchase orders, goods receiving, and supplier records."
      tabs={TABS}
      hideTitleBlock={true}
      hideHeader={true}
    >
      {children}
    </WorkspaceLayout>
  );
}

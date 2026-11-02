"use client";

import { usePathname, useRouter } from "next/navigation";
import WorkspaceLayout from "@/components/WorkspaceLayout";

const FARMERS_ICON = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SECTIONS = [
  { label: "Farmer Profiles",      href: "/dashboard/farmers/profiles" },
  { label: "Farmer Registration",  href: "/dashboard/farmers/registration" },
  { label: "Farmer Groups",        href: "/dashboard/farmers/groups" },
  { label: "Farmer History",       href: "/dashboard/farmers/history" },
];

export default function FarmersLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const isDetailPage =
    pathname.startsWith("/dashboard/farmers/profiles/") &&
    pathname !== "/dashboard/farmers/profiles";

  if (isDetailPage) {
    return <div className="p-6">{children}</div>;
  }

  const currentHref =
    SECTIONS.find(s => pathname.startsWith(s.href))?.href ||
    SECTIONS[0].href;

  return (
    <WorkspaceLayout
      icon={FARMERS_ICON}
      module="Farmers"
      moduleHref="/dashboard/farmers/profiles"
      title="Farmers"
      description="Manage farmer profiles, registrations, groups, and activity history."
      tabs={[]}
      hideTitleBlock={true}
      hideHeader={true}
    >
      {/* Section selector */}
      <div className="border-b border-gray-200 bg-white px-6 py-3 flex items-center gap-3">
        <select
          value={currentHref}
          onChange={e => router.push(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm font-medium text-gray-700 focus:ring-2 focus:ring-gray-100 focus:border-gray-400 outline-none"
        >
          {SECTIONS.map(s => (
            <option key={s.href} value={s.href}>{s.label}</option>
          ))}
        </select>
      </div>

      {children}
    </WorkspaceLayout>
  );
}

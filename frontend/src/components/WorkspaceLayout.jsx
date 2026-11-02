"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * WorkspaceLayout
 * ────────────────────────────────────────────────────────────
 * Shared enterprise workspace frame used by every GTMS module.
 *
 * Props
 *   icon        – JSX SVG element for the module icon
 *   module      – Parent module name, e.g. "Farmers"
 *   moduleHref  – Href for the breadcrumb module link
 *   title       – Page/workspace title shown in the header
 *   description – Short descriptive subtitle
 *   tabs        – Array of { label: string, href: string }
 *   children    – The page-level content rendered below the tabs
 */
export default function WorkspaceLayout({
  icon,
  module,
  moduleHref,
  title,
  description,
  tabs = [],
  hideHeader = false,
  hideTitleBlock = false,
  children,
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Sticky workspace header (breadcrumb + title + tabs) ── */}
      {!hideHeader && (
        <div className="sticky top-0 z-20 bg-[#f8fafc] dark:bg-[#121212] border-b border-gray-100 dark:border-[#222]">

        {!hideTitleBlock && (
          <>
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 px-6 pt-5 pb-1">
              <Link
                href="/dashboard"
                className="text-xs font-medium text-gray-400 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                Dashboard
              </Link>
              <svg className="w-3 h-3 text-gray-300 dark:text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              {moduleHref ? (
                <Link
                  href={moduleHref}
                  className="text-xs font-medium text-gray-400 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  {module}
                </Link>
              ) : (
                <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{module}</span>
              )}
              {title !== module && (
                <>
                  <svg className="w-3 h-3 text-gray-300 dark:text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{title}</span>
                </>
              )}
            </div>

            {/* Module header */}
            <div className="flex items-center gap-4 px-6 py-4">
              {icon && (
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#1f1f1f] text-gray-500 dark:text-gray-400 flex items-center justify-center flex-shrink-0 border border-gray-200/50 dark:border-[#2e2e2e]">
                  {icon}
                </div>
              )}
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{title}</h1>
                {description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{description}</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Context tabs */}
        {tabs.length > 0 && (
          <div className="border-b border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#181818]">
            <div
              className="flex items-center gap-1 px-6 py-2 overflow-x-auto"
              role="tablist"
              aria-label={`${module} navigation`}
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {tabs.map((tab) => {
                const isActive =
                  pathname === tab.href ||
                  (tab.exact === false && pathname.startsWith(tab.href + "/"));

                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    role="tab"
                    aria-selected={isActive}
                    className={[
                      "flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a5c2a] focus-visible:ring-offset-1",
                      isActive
                        ? "bg-[#1a5c2a] text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#252525]",
                    ].join(" ")}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
        </div>
      )}

      {/* ── Page content ── */}
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  );
}

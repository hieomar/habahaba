"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/auth/authContext";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useMemo } from "react";
import { useNotifications } from "@/auth/notificationContext";
import { createPortal } from "react-dom";

// ── Persistence key ──────────────────────────────────────────
const SIDEBAR_STATE_KEY = "gtms_sidebar_collapsed";

// ── Role-based access to navigation items ───────────────────
const RBAC_NAV_ITEMS = {
  "role-sysadmin": [
    "Dashboard",
    // Operations
    "Farmer Management",
    "Farm Management",
    "Commodity Purchases",
    "Warehouse",
    "GRN Management",
    "Batch Management",
    "Inventory",
    "Dispatch",
    // Intelligence
    "Traceability",
    "Reports",
    "IPC Management",
    "Warehouse Management",
    "Marketing Centre Management",
    // Administration
    "User Management",
    "Role Management",
    "Permission Management",
    "Master Data",
    "Mobile Data Sync",
    "Audit Logs",
    "Notifications",
    "Settings",
  ],
  "role-warehouse-officer": [
    "Dashboard",
    // Operations (Warehouse Ops)
    "Commodity Purchases",
    "Warehouse",
    "GRN Management",
    "Batch Management",
    "Inventory",
    "Dispatch",
    // Intelligence
    "Traceability",
    "Reports",
    // Administration
    "Notifications",
  ],
  "role-ipc-manager": [
    "Dashboard",
    // Operations (IPC Supervisory)
    "Farmer Management",
    "Farm Management",
    "Commodity Purchases",
    "Warehouse",
    "Inventory",
    // Intelligence
    "Traceability",
    "Reports",
    // Administration
    "Notifications",
  ],
  "role-head-office": [
    "Dashboard",
    // Operations (Executive Oversight)
    "Farmer Management",
    "Commodity Purchases",
    "Inventory",
    // Intelligence
    "Traceability",
    "Reports",
    // Administration
    "Notifications",
  ],
};

// ── SVG Icons ────────────────────────────────────────────────
const icons = {
  dashboard: (
    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
      <path d="M4 13h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1zm-1 7a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v4zm10 0a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v7zm1-10h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1z" />
    </svg>
  ),
  farmers: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0-7.6c1.6 0 2.8 1.3 2.8 2.8S13.6 10 12 10 9.2 8.7 9.2 7.2 10.4 4.4 12 4.4zM12 14c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4C21.6 15.6 15.2 14 12 14zm7.6 5.2H4.4v-.4c.3-1.4 3.9-2.8 7.6-2.8s7.3 1.4 7.6 2.8v.4z" />
    </svg>
  ),
  farm: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 9.3V4h-3v2.6L12 3 2 12h3v9h6v-5h2v5h6v-9h3l-3-2.7zM17 19h-2v-5H9v5H7v-7.81l5-4.5 5 4.5V19z" />
    </svg>
  ),
  purchase: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96C5 16.1 6.9 18 9 18h12v-2H9.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63H19c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 23.45 5H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
    </svg>
  ),

  warehouse: (
    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
      <path d="M4 21V11.08l8-6.96 8 6.96V21h-5v-6h-6v6H4zm2-2h2v-6h8v6h2v-8.92L12 5.1 6 10.08V19zm4-6h4v2h-4v-2z" />
    </svg>
  ),
  grn: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM11 7V3.5L14.5 7H11zm-1 7H9v-1h1v1zm0 2H9v-1h1v1zm0 2H9v-1h1v1zm5-4h-4v-1h4v1zm0 2h-4v-1h4v1zm0 2h-4v-1h4v1z" />
    </svg>
  ),
  batch: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12zM10 9h8v2h-8zm0 3h4v2h-4zm0-6h8v2h-8z" />
    </svg>
  ),
  inventory: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 2H4c-1 0-2 .9-2 2v3.01c0 .72.43 1.34 1 1.72V20c0 1.1 1.1 2 2 2h14c.9 0 2-.9 2-2V8.72c.57-.38 1-.99 1-1.71V4c0-1.1-1-2-2-2zm-5 12H9v-2h6v2zm5-7H4V4l16-.02V7z" />
    </svg>
  ),
  dispatch: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zm-.5 1.5l1.96 2.5H17V9.5h2.5zM6 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm11 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
    </svg>
  ),
  traceability: (
    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
      <path d="M16 10c0-2.21-1.79-4-4-4s-4 1.79-4 4 1.79 4 4 4 4-1.79 4-4m-6 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2" />
      <path d="M11.42 21.81c.17.12.38.19.58.19s.41-.06.58-.19c.3-.22 7.45-5.37 7.42-11.82 0-4.41-3.59-8-8-8s-8 3.59-8 8c-.03 6.44 7.12 11.6 7.42 11.82M12 4c3.31 0 6 2.69 6 6 .02 4.44-4.39 8.43-6 9.74-1.61-1.31-6.02-5.29-6-9.74 0-3.31 2.69-6 6-6" />
    </svg>
  ),
  reports: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z" />
    </svg>
  ),
  ipc: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  ),
  headoffice: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 11c1.71 0 3-1.29 3-3s-1.29-3-3-3-3 1.29-3 3 1.29 3 3 3m0-4c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1m1 5h-2c-2.76 0-5 2.24-5 5v.5c0 .83.67 1.5 1.5 1.5h9c.83 0 1.5-.67 1.5-1.5V17c0-2.76-2.24-5-5-5m-5 5c0-1.65 1.35-3 3-3h2c1.65 0 3 1.35 3 3zm-1.5-6c.47 0 .9-.12 1.27-.33a5.03 5.03 0 0 1-.42-4.52C7.09 6.06 6.8 6 6.5 6 5.06 6 4 7.06 4 8.5S5.06 11 6.5 11m-.39 1H5.5C3.57 12 2 13.57 2 15.5v1c0 .28.22.5.5.5H4c0-1.96.81-3.73 2.11-5m11.39-1c1.44 0 2.5-1.06 2.5-2.5S18.94 6 17.5 6c-.31 0-.59.06-.85.15a5.03 5.03 0 0 1-.42 4.52c.37.21.79.33 1.27.33m1 1h-.61A6.97 6.97 0 0 1 20 17h1.5c.28 0 .5-.22.5-.5v-1c0-1.93-1.57-3.5-3.5-3.5" />
    </svg>
  ),
  roles: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
    </svg>
  ),
  permissions: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
    </svg>
  ),
  masterdata: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-1 14H5c-.55 0-1-.45-1-1V7c0-.55.45-1 1-1h14c.55 0 1 .45 1 1v10c-.45.55-1 1-1 1zM7 14l1.41-1.41L9.83 14 14.17 9.66 15.58 11.07z" />
    </svg>
  ),
  auditlogs: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z" />
    </svg>
  ),
  notifications: (
    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 12.59V10c0-3.22-2.18-5.93-5.14-6.74C13.57 2.52 12.85 2 12 2s-1.56.52-1.86 1.26C7.18 4.08 5 6.79 5 10v2.59L3.29 14.3a1 1 0 0 0-.29.71v2c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-2c0-.27-.11-.52-.29-.71zM19 16H5v-.59l1.71-1.71a1 1 0 0 0 .29-.71v-3c0-2.76 2.24-5 5-5s5 2.24 5 5v3c0 .27.11.52.29.71L19 15.41zm-4.18 4H9.18c.41 1.17 1.51 2 2.82 2s2.41-.83 2.82-2" />
    </svg>
  ),
  settings: (
    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
      <path d="M22 12.5v-1h-1.03c-.04-.78-.18-1.54-.41-2.26l.95-.37-.36-.93-.95.37c-.38-.85-.89-1.62-1.5-2.3l.73-.73-.71-.71-.73.73c-.57-.51-1.2-.95-1.89-1.3l.42-.93-.91-.41-.42.94a8.9 8.9 0 0 0-2.69-.57V2h-1v1.03c-.78.04-1.54.18-2.26.41l-.37-.95-.93.36.37.95c-.85.38-1.62.89-2.3 1.5l-.73-.73-.71.71.73.73c-.51.57-.95 1.2-1.3 1.89l-.93-.42-.41.91.94.42a8.9 8.9 0 0 0-.57 2.69H2v1h1.03c.04.78.18 1.54.41 2.26l-.95.37.36.93.95-.37c.38.85.89 1.62 1.5 2.3l-.73.73.71.71.73-.73c.57.51 1.2.95 1.89 1.3l-.42.93.91.41.42-.94a8.9 8.9 0 0 0 2.69.57V22h1v-1.03c.78-.04 1.54-.18 2.26-.41l.37.95.93-.36-.37-.95c.85-.38 1.62-.89 2.3-1.5l.73.73.71-.71-.73-.73c.51-.57.95-1.2 1.3-1.89l.93.42.41-.91-.94-.42a8.9 8.9 0 0 0 .57-2.69zM12 5c3.1 0 5.72 2.02 6.65 4.81l-4.05.71c-.52-.91-1.48-1.53-2.6-1.53-.37 0-.72.08-1.05.2L8.31 6.05A6.9 6.9 0 0 1 12 5zm1 7c0 .55-.45 1-1 1s-1-.45-1-1 .45-1 1-1 1 .45 1 1m-4.31 6.17a6.99 6.99 0 0 1-1.9-10.83l2.64 3.14c-.26.45-.42.96-.42 1.51 0 .93.43 1.75 1.1 2.3L8.7 18.15ZM12 19c-.49 0-.97-.05-1.43-.15l1.4-3.85H12a2.99 2.99 0 0 0 2.95-2.5l4.04-.71c0 .07.01.14.01.22 0 3.86-3.14 7-7 7Z" />
    </svg>
  ),
  sync: (
    <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  profile: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
    </svg>
  ),
  signout: (
    <svg className="h-4 w-4 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
      <path d="m14.29 6.71 4.3 4.29H9v2h9.59l-4.3 4.29 1.42 1.42 6.7-6.71-6.7-6.71z" />
      <path d="M11 5V3c-4.96 0-9 4.04-9 9s4.04 9 9 9v-2c-3.86 0-7-3.14-7-7s3.14-7 7-7" />
    </svg>
  ),
  warehouseAdmin: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 21V7L12 2 2 7v14h5v-8h10v8h5zm-11 0v-4h2v4h-2zm4 0v-6H9v6H4V7.82l8-4.45 8 4.45V21h-5z" />
    </svg>
  ),
  marketingCentreAdmin: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM12 4c2.76 0 5 2.24 5 5 0 2.88-2.88 7.19-5 9.88C9.92 16.21 7 11.85 7 9c0-2.76 2.24-5 5-5z" />
    </svg>
  ),
};

// ── Navigation groups ordered for display ────────────────────
const NAV_GROUPS = [
  // ── MAIN ────────────────────────────────────────────────────
  {
    category: null,
    items: [
      { name: "Dashboard", href: "/dashboard", exact: true, icon: icons.dashboard },
    ],
  },
  // ── OPERATIONS ──────────────────────────────────────────────
  {
    category: "Operations",
    items: [
      { name: "Farmer Management", href: "/dashboard/farmers/profiles", matchPrefix: "/dashboard/farmers", icon: icons.farmers },
      { name: "Farm Management",   href: "/dashboard/farms",             matchPrefix: "/dashboard/farms",   icon: icons.farm    },
      { name: "Commodity Purchases",href: "/dashboard/purchasing",       matchPrefix: "/dashboard/purchasing", icon: icons.purchase },

      { name: "Warehouse",          href: "/dashboard/warehouse",        matchPrefix: "/dashboard/warehouse", icon: icons.warehouse },
      { name: "GRN Management",     href: "/dashboard/grn",              matchPrefix: "/dashboard/grn",     icon: icons.grn     },
      { name: "Batch Management",   href: "/dashboard/batches",          matchPrefix: "/dashboard/batches", icon: icons.batch   },
      { name: "Inventory",          href: "/dashboard/inventory",        matchPrefix: "/dashboard/inventory", icon: icons.inventory },
      { name: "Dispatch",           href: "/dashboard/dispatch",         matchPrefix: "/dashboard/dispatch", icon: icons.dispatch },
    ],
  },
  // ── INTELLIGENCE ────────────────────────────────────────────
  {
    category: "Intelligence",
    items: [
      { name: "Traceability",       href: "/dashboard/traceability",     matchPrefix: "/dashboard/traceability", icon: icons.traceability },
      { name: "Reports",            href: "/dashboard/reports",          matchPrefix: "/dashboard/reports",      icon: icons.reports      },
      { name: "IPC Management",     href: "/dashboard/admin/ipc-management",   matchPrefix: "/dashboard/admin/ipc-management", icon: icons.ipc       },
      { name: "Warehouse Management", href: "/dashboard/admin/warehouse-management", matchPrefix: "/dashboard/admin/warehouse-management", icon: icons.warehouseAdmin },
      { name: "Marketing Centre Management", href: "/dashboard/admin/marketing-centre-management", matchPrefix: "/dashboard/admin/marketing-centre-management", icon: icons.marketingCentreAdmin },
    ],
  },
  // ── ADMINISTRATION ──────────────────────────────────────────
  {
    category: "Administration",
    items: [
      { name: "User Management",    href: "/dashboard/admin/users",           matchPrefix: "/dashboard/admin/users",             icon: icons.users       },
      { name: "Role Management",    href: "/dashboard/admin/roles",           matchPrefix: "/dashboard/admin/roles",             icon: icons.roles       },
      { name: "Permission Management", href: "/dashboard/admin/permissions",  matchPrefix: "/dashboard/admin/permissions",       icon: icons.permissions },
      { name: "Master Data",        href: "/dashboard/admin/master-data",     matchPrefix: "/dashboard/admin/master-data",       icon: icons.masterdata  },
      { name: "Mobile Data Sync",   href: "/dashboard/admin/mobile-sync",     matchPrefix: "/dashboard/admin/mobile-sync",       icon: icons.sync        },
      { name: "Audit Logs",         href: "/dashboard/admin/audit-logs",      matchPrefix: "/dashboard/admin/audit-logs",        icon: icons.auditlogs   },
      { name: "Notifications",      href: "/dashboard/notifications",          matchPrefix: "/dashboard/notifications",           icon: icons.notifications },
      { name: "Settings",           href: "/dashboard/admin/settings",         matchPrefix: "/dashboard/admin/settings",          icon: icons.settings    },
    ],
  },
];

// ── Portal Tooltip ───────────────────────────────────────────
function SidebarTooltip({ label, anchorRef, visible }) {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  useEffect(() => {
    if (visible && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({ top: rect.top + rect.height / 2, left: rect.right + 10 });
    }
  }, [visible, anchorRef]);
  if (typeof document === "undefined" || !visible) return null;
  return createPortal(
    <div
      role="tooltip"
      style={{ top: pos.top, left: pos.left, transform: "translateY(-50%)" }}
      className="fixed z-[9999] pointer-events-none"
    >
      <span className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-gray-600 dark:border-r-gray-500" />
      <div className="bg-gray-700 dark:bg-gray-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
        {label}
      </div>
    </div>,
    document.body
  );
}

// ── NavItem ──────────────────────────────────────────────────
function NavItem({ item, pathname, collapsed }) {
  const isActive =
    item.exact
      ? pathname === item.href
      : pathname === item.href || (item.matchPrefix && pathname.startsWith(item.matchPrefix));

  const [hovered, setHovered] = useState(false);
  const anchorRef = useRef(null);

  return (
    <div
      ref={anchorRef}
      className="relative"
      onMouseEnter={() => collapsed && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center">
        <Link
          href={item.href}
          aria-label={item.name}
          className={[
            "flex-1 flex items-center gap-3 rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a5c2a]/50",
            collapsed ? "px-[13px] py-2.5 justify-center" : "px-3 py-2",
            isActive
              ? "bg-[#1a5c2a]/10 dark:bg-[#1a5c2a]/20 text-[#1a5c2a] dark:text-[#4ade80]"
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#222222] hover:text-gray-700 dark:hover:text-gray-200",
          ].join(" ")}
        >
          <span
            className={[
              "flex-shrink-0 transition-colors",
              isActive ? "text-[#1a5c2a] dark:text-[#4ade80]" : "text-gray-400 dark:text-gray-500",
            ].join(" ")}
          >
            {item.icon}
          </span>
          {!collapsed && (
            <span className="text-sm font-medium truncate leading-none">{item.name}</span>
          )}
          {isActive && !collapsed && (
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#1a5c2a] dark:bg-[#4ade80] flex-shrink-0" />
          )}
        </Link>
      </div>

      <SidebarTooltip label={item.name} anchorRef={anchorRef} visible={collapsed && hovered} />
    </div>
  );
}

// ── Category Header ───────────────────────────────────────────
function CategoryHeader({ label, collapsed }) {
  if (collapsed) {
    return <div className="mx-3 my-1 border-t border-gray-200 dark:border-[#333333]" />;
  }
  return (
    <div className="px-3 pt-4 pb-1">
      <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400 dark:text-gray-500">
        {label}
      </span>
    </div>
  );
}

// ── Sidebar ──────────────────────────────────────────────────
export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { unreadCount } = useNotifications();

  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(SIDEBAR_STATE_KEY) === "true";
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [signoutHovered, setSignoutHovered] = useState(false);
  const signoutRef = useRef(null);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_STATE_KEY, String(next));
      return next;
    });
  };

  const handleConfirmLogout = () => {
    setConfirmOpen(false);
    logout();
    router.push("/login");
  };

  const userRole = user?.roleId ?? "role-sysadmin";
  const allowedItems = useMemo(() => {
    if (user?.permissions) {
      return Object.keys(user.permissions).filter((m) => user.permissions[m]?.View);
    }
    return RBAC_NAV_ITEMS[userRole] ?? RBAC_NAV_ITEMS["role-sysadmin"];
  }, [userRole, user?.permissions]);

  const ROLE_LABELS = {
    "role-sysadmin": "System Admin",
    "role-warehouse-officer": "Warehouse",
    "role-ipc-manager": "IPC Manager",
    "role-head-office": "Head Office",
  };
  const roleLabel = ROLE_LABELS[userRole] ?? "User";
  const sidebarWidth = collapsed ? "w-[60px]" : "w-60";

  return (
    <aside
      className={[
        "relative z-50 flex flex-col h-screen flex-shrink-0",
        "bg-white dark:bg-[#161616] border-r border-gray-200 dark:border-[#2a2a2a]",
        "transition-[width] duration-[250ms] ease-in-out",
        sidebarWidth,
      ].join(" ")}
      aria-label="Main navigation"
    >
      {/* ── Header ── */}
      <div
        className={[
          "flex items-center flex-shrink-0 h-14 border-b border-gray-200 dark:border-[#2a2a2a]",
          collapsed ? "px-3 justify-center" : "px-4 justify-between",
        ].join(" ")}
      >
        {collapsed ? (
          <button
            onClick={toggleCollapsed}
            aria-label="Expand sidebar"
            className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#222222] shadow-sm flex items-center justify-center hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-all duration-150 p-1 flex-shrink-0"
          >
            <Image
              src="/branding/nasfam-logo.png"
              alt="NASFAM Logo"
              width={22}
              height={22}
              className="object-contain"
            />
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
              <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                <Image
                  src="/branding/nasfam-logo.png"
                  alt="NASFAM Logo"
                  width={28}
                  height={28}
                  className="object-contain"
                  style={{ width: "auto", height: "auto" }}
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate leading-tight">
                  NASFAM IPC
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate leading-tight">
                  Grain Traceability System
                </p>
              </div>
            </div>
            <button
              onClick={toggleCollapsed}
              aria-label="Collapse sidebar"
              className="w-7 h-7 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#222222] shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-all duration-150 flex-shrink-0 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav
        className={[
          "flex-1 overflow-y-auto overflow-x-hidden py-2",
          collapsed ? "px-2" : "px-2",
        ].join(" ")}
        aria-label="Module navigation"
      >
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter((item) => allowedItems.includes(item.name));
          if (visibleItems.length === 0) return null;

          // Add notification badge to Notifications item
          const itemsWithBadges = visibleItems.map((item) => ({
            ...item,
            badge: item.name === "Notifications" && unreadCount > 0 ? unreadCount : null,
          }));

          return (
            <div key={group.category ?? "main"} className="mb-1">
              {group.category && (
                <CategoryHeader label={group.category} collapsed={collapsed} />
              )}
              <div className="space-y-0.5">
                {itemsWithBadges.map((item) => (
                  <div key={item.name} className="relative">
                    <NavItem item={item} pathname={pathname} collapsed={collapsed} userRole={userRole} />
                    {item.badge && !collapsed && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 min-w-[18px] h-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full px-1 pointer-events-none">
                        {item.badge > 9 ? "9+" : item.badge}
                      </span>
                    )}
                    {item.badge && collapsed && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full pointer-events-none" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* ── User Footer ── */}
      <div
        className={[
          "flex-shrink-0 border-t border-gray-200 dark:border-[#2a2a2a] p-2",
        ].join(" ")}
      >
        {/* User info row */}
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-2 py-1.5 mb-1">
            <div className="w-7 h-7 rounded-full bg-[#1a5c2a] flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              {user?.name ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate leading-tight">{user?.name ?? "User"}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{user?.email ?? ""}</p>
            </div>
          </div>
        )}

        {/* Sign out button */}
        <div
          ref={signoutRef}
          className="relative"
          onMouseEnter={() => collapsed && setSignoutHovered(true)}
          onMouseLeave={() => setSignoutHovered(false)}
        >
          <button
            onClick={() => setConfirmOpen(true)}
            className={[
              "flex items-center justify-center rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-[#222222] hover:text-red-600 dark:hover:text-red-400",
              collapsed ? "h-9 w-full p-0 flex-shrink-0" : "w-full gap-2 px-3 py-2",
            ].join(" ")}
            aria-label="Sign out"
          >
            {icons.signout}
            {!collapsed && <span>Sign out</span>}
          </button>
          <SidebarTooltip label="Sign out" anchorRef={signoutRef} visible={collapsed && signoutHovered} />
        </div>
      </div>

      {/* ── Confirm Logout Modal ── */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-[#333333] bg-white dark:bg-[#1c1c1c] p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600">
                {icons.signout}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sign out of your account?</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">You'll need to sign in again to continue using the dashboard.</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="rounded-lg border border-gray-200 dark:border-[#333333] bg-white dark:bg-[#252525] px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
